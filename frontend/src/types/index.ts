export interface TrustScoreDetails {
  overall: number; // 0 - 100
  verification: number; // Govt ID, Trade license, SIH verification (0-100)
  reviewsAndSentiment: number; // Customer sentiment & verified review score (0-100)
  reliability: number; // On-time arrival and job completion rate (0-100)
  responseSpeed: number; // Average response time & acceptance speed (0-100)
  verifiedBadge: boolean;
  verificationSource: string;
  inspectionDate?: string;
  auditId?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: string;
  estimatedDuration: string;
  popular?: boolean;
}

export interface Review {
  id: string;
  author: string;
  rating: number; // 1-5
  date: string;
  comment: string;
  verifiedUser: boolean;
  serviceUsed?: string;
  helpfulCount: number;
}

export interface VerificationDocument {
  id: string;
  name: string;
  type: string;
  status: 'verified' | 'pending' | 'rejected';
  issuedBy: string;
  expiryDate: string;
}

export interface Provider {
  id: string;
  name: string;
  category: 'emergency' | 'retail' | 'hospitality' | 'finance' | 'entertainment' | 'automotive' | 'cleaning';
  categoryLabel: string;
  description: string;
  fullDescription?: string;
  address: string;
  area: string;
  city: string;
  lat: number;
  lng: number;
  latOffset?: number; // for radar view
  lngOffset?: number;
  distanceKm: number;
  estimatedTimeMin: number;
  priceLevel: '₹' | '₹₹' | '₹₹₹';
  startingPrice: string;
  isAvailableNow: boolean;
  openingHours: string;
  weeklyHours?: {
    [day: string]: string;
  };
  phoneNumber: string;
  email?: string;
  website?: string;
  rating: number;
  reviewCount: number;
  trustScore: TrustScoreDetails;
  urgencySupported: boolean;
  tags: string[];
  highlightBenefit: string;
  services: ServiceItem[];
  reviews: Review[];
  verificationDocuments?: VerificationDocument[];
  imageUrl?: string;
}

export interface CityLocation {
  id: string;
  name: string;
  area: string;
  state: string;
  lat: number;
  lng: number;
}

export interface Category {
  id: string;
  label: string;
  icon: string;
  color: string;
  description?: string;
  providerCount?: number;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: string;
  resultsCount: number;
  city: string;
}

export interface BookingItem {
  id: string;
  providerId: string;
  providerName: string;
  categoryLabel: string;
  serviceName: string;
  date: string;
  timeSlot: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  otpCode: string;
  estimatedAmount: string;
  address: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: 'citizen' | 'provider';
  avatar?: string;
  favorites: string[]; // array of provider IDs
  searchHistory: SearchHistoryItem[];
  bookings: BookingItem[];
}

export interface SearchFilters {
  query: string;
  category: string;
  radiusKm: number;
  minTrustScore: number;
  openNowOnly: boolean;
  urgentOnly: boolean;
  sortBy: 'ai_match' | 'trust' | 'distance' | 'price' | 'rating';
}

export interface AIIntentResult {
  service: string;
  urgency: string;
  complexity: string;
  sector: string;
  extractedKeywords: string[];
  radiusExpansionTriggered: boolean;
  confidenceScore: number;
  suggestedAction?: string;
}
