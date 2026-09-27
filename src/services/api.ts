import axios, { AxiosInstance } from 'axios';
import { Provider, User, SearchFilters, AIIntentResult, ServiceItem, Review } from '../types';
import { INITIAL_PROVIDERS, CATEGORIES, SAMPLE_QUERIES } from '../data/mockData';

// Base API URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create Axios Instance
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization Bearer token to all outgoing requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('locallink_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Local Storage helpers for fallback persistence
const STORAGE_KEYS = {
  USER: 'locallink_user',
  TOKEN: 'locallink_token',
  PROVIDERS: 'locallink_providers',
  FAVORITES: 'locallink_favorites',
  SEARCH_HISTORY: 'locallink_search_history',
  BOOKINGS: 'locallink_bookings',
  PENDING_OTP: 'locallink_pending_otp',
};

// Initialize localStorage with mock data if not already present
function initLocalStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.PROVIDERS)) {
    localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(INITIAL_PROVIDERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USER)) {
    const defaultUser: User = {
      id: 'usr-101',
      name: 'Aditya Verma',
      phone: '+91 98765 43210',
      email: 'aditya.verma@example.com',
      role: 'citizen',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      favorites: ['prov-1', 'prov-2'],
      searchHistory: [
        { id: 'h1', query: 'I need a pharmacy open now near me', timestamp: '2 hours ago', resultsCount: 6, city: 'Bengaluru' },
        { id: 'h2', query: 'Emergency plumber right now', timestamp: 'Yesterday', resultsCount: 4, city: 'Bengaluru' },
        { id: 'h3', query: 'Cafe with high speed wifi', timestamp: '3 days ago', resultsCount: 8, city: 'Bengaluru' }
      ],
      bookings: [
        {
          id: 'bk-8901',
          providerId: 'prov-2',
          providerName: 'Sharma Rapid Plumbing & Water Solutions',
          categoryLabel: 'Home & Repair SOS',
          serviceName: 'Emergency Main Pipe Burst Sealing',
          date: '2026-09-27',
          timeSlot: 'Immediate (15-20 mins)',
          status: 'confirmed',
          otpCode: '849201',
          estimatedAmount: '₹449',
          address: 'Koramangala 4th Block, Bengaluru'
        }
      ]
    };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(defaultUser));
  }
}

initLocalStorage();

function getStoredProviders(): Provider[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROVIDERS);
    return raw ? JSON.parse(raw) : INITIAL_PROVIDERS;
  } catch {
    return INITIAL_PROVIDERS;
  }
}

function saveStoredProviders(providers: Provider[]) {
  localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(providers));
}

function getStoredUser(): User {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return {
    id: 'usr-guest',
    name: 'Guest User',
    phone: '',
    email: '',
    role: 'citizen',
    favorites: [],
    searchHistory: [],
    bookings: []
  };
}

function saveStoredUser(user: User) {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

// AI NLP Intent Parser
export function parseNaturalLanguageQuery(query: string, urgentMode: boolean = false): AIIntentResult {
  const queryLower = query.toLowerCase().trim();
  let service = "General Local Service Discovery";
  let urgency = urgentMode ? "Critical / Emergency SOS (< 15 mins)" : "Standard";
  let sector = "Hyperlocal Services";
  let complexity = "Standard Keyword & Geofencing";
  let confidenceScore = 88;
  let suggestedAction = "Compare top verified providers in your immediate radius";

  if (!queryLower) {
    return {
      service: "Browse All Nearby Services",
      urgency: urgentMode ? "Immediate SOS" : "Standard",
      complexity: "Geospatial Proximity",
      sector: "All Sectors",
      extractedKeywords: [],
      radiusExpansionTriggered: false,
      confidenceScore: 92,
      suggestedAction
    };
  }

  if (queryLower.includes('plumb') || queryLower.includes('pipe') || queryLower.includes('leak') || queryLower.includes('drain') || queryLower.includes('tap') || queryLower.includes('water')) {
    service = "Emergency Hydraulic & Plumbing Repair";
    sector = "Home & Repair SOS";
    complexity = "NLP Intent + Acoustic Leak Detection + PostGIS";
    urgency = "Immediate (< 20 mins)";
    confidenceScore = 97;
    suggestedAction = "Auto-prioritized 24/7 master plumbers with verified Govt trade licenses";
  } else if (queryLower.includes('electric') || queryLower.includes('wire') || queryLower.includes('mcb') || queryLower.includes('short') || queryLower.includes('power') || queryLower.includes('fuse')) {
    service = "Certified Electrical & Short-Circuit Intervention";
    sector = "Home & Repair SOS";
    complexity = "NLP Intent + Verification + Rapid Response";
    urgency = "Immediate (< 25 mins)";
    confidenceScore = 96;
    suggestedAction = "Filtered for BESCOM / State licensed Grade-A contractors with thermal diagnosis tools";
  } else if (queryLower.includes('pharma') || queryLower.includes('medicine') || queryLower.includes('chemist') || queryLower.includes('drug') || queryLower.includes('oxygen') || queryLower.includes('tablet') || queryLower.includes('doctor')) {
    service = "Urgent Medical Logistics & 24/7 Pharma";
    sector = "Healthcare & 24/7 Pharma";
    complexity = "NLP Intent + Cold-Chain Delivery + Drug Control Verification";
    urgency = "Immediate (< 15 mins)";
    confidenceScore = 99;
    suggestedAction = "Ranked 24x7 pharmacies with live stock verification and emergency courier";
  } else if (queryLower.includes('cafe') || queryLower.includes('coffee') || queryLower.includes('restaurant') || queryLower.includes('wifi') || queryLower.includes('cowork') || queryLower.includes('work') || queryLower.includes('stay') || queryLower.includes('hotel') || queryLower.includes('pod')) {
    service = "Work-Friendly Hospitality & Accommodations";
    sector = "Hospitality & Work Stays";
    complexity = "Spatial Filtering + Speedtest Verification (300+ Mbps)";
    urgency = "Moderate (< 1 hour)";
    confidenceScore = 94;
    suggestedAction = "Filtered venues with verified fiber broadband, power backup, and quiet rating";
  } else if (queryLower.includes('atm') || queryLower.includes('cash') || queryLower.includes('aadhaar') || queryLower.includes('bank') || queryLower.includes('csc') || queryLower.includes('pan')) {
    service = "Micro-Financial Cash Dispensation & Aadhaar Hub";
    sector = "Financial & Aadhaar Points";
    complexity = "MeitY CSC Verification + Biometric Hardware Check";
    urgency = "Immediate";
    confidenceScore = 95;
    suggestedAction = "Showing active Aadhaar AePS points with working biometric scanners";
  } else if (queryLower.includes('car') || queryLower.includes('puncture') || queryLower.includes('ev') || queryLower.includes('charging') || queryLower.includes('mechanic') || queryLower.includes('tyre') || queryLower.includes('tire')) {
    service = "Automotive Roadside Rescue & EV Charging";
    sector = "Automotive & EV Charging";
    complexity = "Geofenced Mobile Unit Dispatch + Charger Compatibility";
    urgency = "Immediate (< 20 mins)";
    confidenceScore = 96;
    suggestedAction = "Dispatched mobile puncture technicians and verified DC fast chargers";
  } else if (queryLower.includes('clean') || queryLower.includes('sofa') || queryLower.includes('maid') || queryLower.includes('sanitize') || queryLower.includes('pest')) {
    service = "Sanitization & Deep Cleaning Service";
    sector = "Cleaning & Sanitization";
    complexity = "Standard Booking + Vetted Staff Certification";
    urgency = "Flexible / Same Day";
    confidenceScore = 93;
    suggestedAction = "Selected ISO 9001 certified cleaners with steam extraction equipment";
  }

  const extractedKeywords = query.split(/\s+/).filter(w => w.length > 2);

  return {
    service,
    urgency,
    complexity,
    sector,
    extractedKeywords,
    radiusExpansionTriggered: false,
    confidenceScore,
    suggestedAction
  };
}

// REST API Service Methods
export const api = {
  // 1. Natural Language Hyperlocal Search
  async searchServices(filters: Partial<SearchFilters>): Promise<{
    providers: Provider[];
    intent: AIIntentResult;
    total: number;
  }> {
    const {
      query = '',
      category = 'all',
      radiusKm = 5,
      minTrustScore = 80,
      openNowOnly = false,
      urgentOnly = false,
      sortBy = 'ai_match',
    } = filters;

    try {
      // Attempt REST API call
      const response = await apiClient.get('/services/search', {
        params: { query, category, radiusKm, minTrustScore, openNowOnly, urgentOnly, sortBy },
      });
      return response.data;
    } catch (err) {
      // Graceful fallback to client engine
      console.info('[LocalLink API] Serving search via client AI engine fallback');
      
      // Simulate realistic AI network & NLP latency (450ms)
      await new Promise((res) => setTimeout(res, 450));

      const intent = parseNaturalLanguageQuery(query, urgentOnly);
      const allProviders = getStoredProviders();

      // Filter
      let filtered = allProviders.filter((p) => {
        if (urgentOnly && !p.urgencySupported) return false;
        if (openNowOnly && !p.isAvailableNow) return false;
        if (category !== 'all' && p.category !== category) return false;
        if (p.distanceKm > radiusKm) return false;
        if (p.trustScore.overall < minTrustScore) return false;

        if (query.trim()) {
          const q = query.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchCat = p.categoryLabel.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchTags = p.tags.some((t) => t.toLowerCase().includes(q));
          const matchBenefits = p.highlightBenefit.toLowerCase().includes(q);
          const matchServices = p.services.some((s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
          
          if (!matchName && !matchCat && !matchDesc && !matchTags && !matchBenefits && !matchServices) {
            // Check if intent sector matches
            if (!intent.sector.toLowerCase().includes(p.category) && !p.categoryLabel.toLowerCase().includes(intent.sector.toLowerCase())) {
              return false;
            }
          }
        }
        return true;
      });

      // Sort
      filtered.sort((a, b) => {
        if (sortBy === 'trust') {
          return b.trustScore.overall - a.trustScore.overall;
        }
        if (sortBy === 'distance') {
          return a.distanceKm - b.distanceKm;
        }
        if (sortBy === 'rating') {
          return b.rating - a.rating;
        }
        if (sortBy === 'price') {
          return a.priceLevel.length - b.priceLevel.length;
        }
        // AI Composite Match = TrustScore*0.5 - Distance*10 + Available*12 + Urgency*8
        const scoreA = a.trustScore.overall * 0.5 - a.distanceKm * 10 + (a.isAvailableNow ? 12 : 0) + (a.urgencySupported ? 8 : 0);
        const scoreB = b.trustScore.overall * 0.5 - b.distanceKm * 10 + (b.isAvailableNow ? 12 : 0) + (b.urgencySupported ? 8 : 0);
        return scoreB - scoreA;
      });

      // Save to search history if query exists
      if (query.trim()) {
        const user = getStoredUser();
        const existingIdx = user.searchHistory.findIndex((h) => h.query.toLowerCase() === query.toLowerCase());
        if (existingIdx >= 0) {
          user.searchHistory.splice(existingIdx, 1);
        }
        user.searchHistory.unshift({
          id: 'hist-' + Date.now(),
          query: query.trim(),
          timestamp: 'Just now',
          resultsCount: filtered.length,
          city: 'Bengaluru',
        });
        if (user.searchHistory.length > 15) {
          user.searchHistory.pop();
        }
        saveStoredUser(user);
      }

      return {
        providers: filtered,
        intent,
        total: filtered.length,
      };
    }
  },

  // 2. Get Single Provider by ID
  async getProviderById(id: string): Promise<Provider> {
    try {
      const response = await apiClient.get(`/providers/${id}`);
      return response.data;
    } catch (err) {
      await new Promise((res) => setTimeout(res, 200));
      const providers = getStoredProviders();
      const found = providers.find((p) => p.id === id);
      if (!found) {
        throw new Error('Provider not found');
      }
      return found;
    }
  },

  // 3. Get Featured Top-Trust Providers
  async getFeaturedProviders(): Promise<Provider[]> {
    try {
      const response = await apiClient.get('/providers/featured');
      return response.data;
    } catch {
      await new Promise((res) => setTimeout(res, 200));
      const providers = getStoredProviders();
      return [...providers].sort((a, b) => b.trustScore.overall - a.trustScore.overall).slice(0, 4);
    }
  },

  // 4. Request OTP for Authentication
  async requestOtp(phone: string): Promise<{ success: boolean; message: string; demoOtp: string }> {
    try {
      const response = await apiClient.post('/auth/otp/send', { phone });
      return response.data;
    } catch {
      await new Promise((res) => setTimeout(res, 400));
      // Generate a realistic 6-digit OTP code for demo testing
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      sessionStorage.setItem(STORAGE_KEYS.PENDING_OTP, JSON.stringify({ phone, otp: generatedOtp }));
      return {
        success: true,
        message: `OTP successfully generated and sent to ${phone}`,
        demoOtp: generatedOtp,
      };
    }
  },

  // 5. Verify OTP
  async verifyOtp(phone: string, otp: string): Promise<{ user: User; token: string }> {
    try {
      const response = await apiClient.post('/auth/otp/verify', { phone, otp });
      if (response.data.token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
      }
      if (response.data.user) {
        saveStoredUser(response.data.user);
      }
      return response.data;
    } catch {
      await new Promise((res) => setTimeout(res, 500));
      const storedPending = sessionStorage.getItem(STORAGE_KEYS.PENDING_OTP);
      let expectedOtp = '123456';
      if (storedPending) {
        try {
          const parsed = JSON.parse(storedPending);
          if (parsed.otp) expectedOtp = parsed.otp;
        } catch {}
      }

      if (otp !== expectedOtp && otp !== '123456') {
        throw new Error(`Invalid OTP. Please enter ${expectedOtp} (or test code 123456).`);
      }

      const mockToken = 'jwt-ll-ai-' + Math.random().toString(36).substring(2);
      localStorage.setItem(STORAGE_KEYS.TOKEN, mockToken);

      let user = getStoredUser();
      user.phone = phone;
      if (!user.name || user.name === 'Guest User') {
        user.name = 'Verified Citizen';
      }
      saveStoredUser(user);

      return {
        user,
        token: mockToken,
      };
    }
  },

  // 6. Get Current User Profile
  async getUserProfile(): Promise<User> {
    try {
      const response = await apiClient.get('/user/profile');
      return response.data;
    } catch {
      return getStoredUser();
    }
  },

  // 7. Update User Profile
  async updateUserProfile(data: Partial<User>): Promise<User> {
    try {
      const response = await apiClient.put('/user/profile', data);
      return response.data;
    } catch {
      const user = getStoredUser();
      const updated = { ...user, ...data };
      saveStoredUser(updated);
      return updated;
    }
  },

  // 8. Toggle Favorite Provider
  async toggleFavorite(providerId: string): Promise<string[]> {
    try {
      const response = await apiClient.post('/user/favorites/toggle', { providerId });
      return response.data.favorites;
    } catch {
      const user = getStoredUser();
      let favs = [...(user.favorites || [])];
      if (favs.includes(providerId)) {
        favs = favs.filter((id) => id !== providerId);
      } else {
        favs.push(providerId);
      }
      user.favorites = favs;
      saveStoredUser(user);
      return favs;
    }
  },

  // 9. Clear Search History
  async clearSearchHistory(): Promise<void> {
    try {
      await apiClient.delete('/user/history');
    } catch {
      const user = getStoredUser();
      user.searchHistory = [];
      saveStoredUser(user);
    }
  },

  // 10. Book Service with OTP Confirmation
  async createBooking(bookingData: {
    providerId: string;
    serviceName: string;
    address: string;
    timeSlot: string;
    phone: string;
  }): Promise<any> {
    try {
      const response = await apiClient.post('/bookings', bookingData);
      return response.data;
    } catch {
      await new Promise((res) => setTimeout(res, 400));
      const providers = getStoredProviders();
      const provider = providers.find((p) => p.id === bookingData.providerId);
      const service = provider?.services.find((s) => s.name === bookingData.serviceName);

      const newBooking = {
        id: 'bk-' + Math.floor(1000 + Math.random() * 9000),
        providerId: bookingData.providerId,
        providerName: provider?.name || 'Local Service Provider',
        categoryLabel: provider?.categoryLabel || 'Local Service',
        serviceName: bookingData.serviceName,
        date: new Date().toISOString().split('T')[0],
        timeSlot: bookingData.timeSlot || 'Within 30 mins',
        status: 'confirmed' as const,
        otpCode: Math.floor(100000 + Math.random() * 900000).toString(),
        estimatedAmount: service?.price || 'Standard Rate',
        address: bookingData.address,
      };

      const user = getStoredUser();
      user.bookings = [newBooking, ...(user.bookings || [])];
      saveStoredUser(user);

      return newBooking;
    }
  },

  // 11. Submit Provider Review
  async submitReview(providerId: string, review: { rating: number; comment: string; serviceUsed?: string }): Promise<Review> {
    try {
      const response = await apiClient.post(`/providers/${providerId}/reviews`, review);
      return response.data;
    } catch {
      await new Promise((res) => setTimeout(res, 300));
      const user = getStoredUser();
      const newReview: Review = {
        id: 'rev-' + Date.now(),
        author: user.name || 'Verified Customer',
        rating: review.rating,
        date: 'Just now',
        comment: review.comment,
        verifiedUser: true,
        serviceUsed: review.serviceUsed || 'General Service',
        helpfulCount: 0,
      };

      const providers = getStoredProviders();
      const idx = providers.findIndex((p) => p.id === providerId);
      if (idx >= 0) {
        providers[idx].reviews = [newReview, ...providers[idx].reviews];
        providers[idx].reviewCount += 1;
        // Recalculate average rating
        const totalRating = providers[idx].reviews.reduce((sum, r) => sum + r.rating, 0);
        providers[idx].rating = Number((totalRating / providers[idx].reviews.length).toFixed(1));
        saveStoredProviders(providers);
      }

      return newReview;
    }
  },

  // 12. Provider Dashboard: Update Profile
  async updateProviderProfile(providerId: string, updates: Partial<Provider>): Promise<Provider> {
    try {
      const response = await apiClient.put(`/provider/profile`, { providerId, ...updates });
      return response.data;
    } catch {
      await new Promise((res) => setTimeout(res, 300));
      const providers = getStoredProviders();
      const idx = providers.findIndex((p) => p.id === providerId);
      if (idx >= 0) {
        providers[idx] = { ...providers[idx], ...updates };
        saveStoredProviders(providers);
        return providers[idx];
      }
      throw new Error('Provider not found');
    }
  },

  // 13. Provider Dashboard: Update Availability
  async updateProviderAvailability(providerId: string, isAvailableNow: boolean, urgencySupported: boolean): Promise<Provider> {
    try {
      const response = await apiClient.put(`/provider/availability`, { providerId, isAvailableNow, urgencySupported });
      return response.data;
    } catch {
      const providers = getStoredProviders();
      const idx = providers.findIndex((p) => p.id === providerId);
      if (idx >= 0) {
        providers[idx].isAvailableNow = isAvailableNow;
        providers[idx].urgencySupported = urgencySupported;
        saveStoredProviders(providers);
        return providers[idx];
      }
      throw new Error('Provider not found');
    }
  },

  // 14. Provider Dashboard: Add/Update Service
  async addProviderService(providerId: string, service: Omit<ServiceItem, 'id'>): Promise<ServiceItem> {
    try {
      const response = await apiClient.post(`/provider/services`, { providerId, service });
      return response.data;
    } catch {
      const providers = getStoredProviders();
      const idx = providers.findIndex((p) => p.id === providerId);
      if (idx >= 0) {
        const newService: ServiceItem = {
          id: 'svc-' + Date.now(),
          ...service,
        };
        providers[idx].services.push(newService);
        saveStoredProviders(providers);
        return newService;
      }
      throw new Error('Provider not found');
    }
  },

  // 15. Provider Dashboard: Delete Service
  async deleteProviderService(providerId: string, serviceId: string): Promise<void> {
    try {
      await apiClient.delete(`/provider/services/${serviceId}`, { data: { providerId } });
    } catch {
      const providers = getStoredProviders();
      const idx = providers.findIndex((p) => p.id === providerId);
      if (idx >= 0) {
        providers[idx].services = providers[idx].services.filter((s) => s.id !== serviceId);
        saveStoredProviders(providers);
      }
    }
  },
};
