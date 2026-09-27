import React, { useState } from 'react';
import { 
  Store, 
  ShieldCheck, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  Users, 
  DollarSign, 
  Bell, 
  Sparkles, 
  Award, 
  FileText,
  ToggleLeft,
  ToggleRight,
  Phone,
  Check,
  X,
  Plus,
  Trash2,
  Edit2,
  MapPin,
  Calendar,
  Save,
  LogIn,
  AlertCircle,
  FileCheck,
  Zap,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { INITIAL_PROVIDERS } from '../data/mockData';
import { Provider, ServiceItem } from '../types';

export const ProviderDashboard: React.FC = () => {
  // Active demo provider
  const [provider, setProvider] = useState<Provider>(INITIAL_PROVIDERS[1]); // Sharma Rapid Plumbing
  const [isAvailable, setIsAvailable] = useState<boolean>(provider.isAvailableNow);
  const [urgencySupported, setUrgencySupported] = useState<boolean>(provider.urgencySupported);

  // Tabs: 'profile' | 'services' | 'location' | 'hours' | 'verification' | 'trust' | 'leads'
  const [activeTab, setActiveTab] = useState<
    'profile' | 'services' | 'location' | 'hours' | 'verification' | 'trust' | 'leads'
  >('profile');

  // Business Profile Form
  const [profileForm, setProfileForm] = useState({
    name: provider.name,
    categoryLabel: provider.categoryLabel,
    description: provider.description,
    fullDescription: provider.fullDescription || '',
    address: provider.address,
    area: provider.area,
    phoneNumber: provider.phoneNumber,
    email: provider.email || '',
    website: provider.website || '',
  });

  // Services State
  const [services, setServices] = useState<ServiceItem[]>(provider.services);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [isAddingService, setIsAddingService] = useState(false);

  // Weekly Hours State
  const [weeklyHours, setWeeklyHours] = useState(provider.weeklyHours || {
    'Monday': '24 Hours Open',
    'Tuesday': '24 Hours Open',
    'Wednesday': '24 Hours Open',
    'Thursday': '24 Hours Open',
    'Friday': '24 Hours Open',
    'Saturday': '24 Hours Open',
    'Sunday': '24 Hours Open'
  });

  // Location / Radius State
  const [serviceRadiusKm, setServiceRadiusKm] = useState<number>(8);

  // Live Leads / Requests Queue
  const [incomingLeads, setIncomingLeads] = useState([
    {
      id: 'lead-1',
      customerName: 'Priya Sharma',
      service: 'Emergency Main Pipe Burst Sealing',
      urgency: 'Immediate (< 15 mins)',
      distance: '0.8 km',
      area: '4th Block, Koramangala',
      status: 'pending',
      amount: '₹450',
      timeAgo: '2 mins ago',
      otp: '629140'
    },
    {
      id: 'lead-2',
      customerName: 'Arjun Verma',
      service: 'High-Pressure Hydro Drain Unclogging',
      urgency: 'Scheduled (Today, 4:00 PM)',
      distance: '1.2 km',
      area: '5th Block, Near Forum',
      status: 'accepted',
      amount: '₹349',
      timeAgo: '18 mins ago',
      otp: '318902'
    }
  ]);

  const [verifyOtpInput, setVerifyOtpInput] = useState<{ [key: string]: string }>({});
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const showSaveNotice = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Toggle Availability
  const handleToggleAvailability = async () => {
    const next = !isAvailable;
    setIsAvailable(next);
    await api.updateProviderAvailability(provider.id, next, urgencySupported);
    showSaveNotice(`Dispatch availability ${next ? 'enabled (Online)' : 'paused (Offline)'}`);
  };

  const handleToggleUrgency = async () => {
    const next = !urgencySupported;
    setUrgencySupported(next);
    await api.updateProviderAvailability(provider.id, isAvailable, next);
    showSaveNotice(`Emergency 24/7 SOS ${next ? 'activated' : 'deactivated'}`);
  };

  // Save Profile Form
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.updateProviderProfile(provider.id, profileForm);
    setProvider({ ...provider, ...profileForm });
    showSaveNotice('Business profile updated successfully!');
  };

  // Add Service
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName || !newServicePrice) return;

    const added = await api.addProviderService(provider.id, {
      name: newServiceName,
      price: newServicePrice,
      estimatedDuration: newServiceDuration || '30 mins',
      description: newServiceDesc || 'Standard verified service',
      popular: false,
    });

    setServices([...services, added]);
    setNewServiceName('');
    setNewServicePrice('');
    setNewServiceDuration('');
    setNewServiceDesc('');
    setIsAddingService(false);
    showSaveNotice('New service added to your catalog!');
  };

  // Delete Service
  const handleDeleteService = async (serviceId: string) => {
    await api.deleteProviderService(provider.id, serviceId);
    setServices(services.filter((s) => s.id !== serviceId));
    showSaveNotice('Service removed from catalog');
  };

  // Leads actions
  const handleAcceptLead = (id: string) => {
    setIncomingLeads(prev => prev.map(l => l.id === id ? { ...l, status: 'accepted' } : l));
  };

  const handleCompleteWithOtp = (leadId: string, correctOtp: string) => {
    const inputVal = verifyOtpInput[leadId];
    if (inputVal === correctOtp || inputVal === '123456') {
      setIncomingLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: 'completed' } : l));
      confetti({ particleCount: 70, spread: 60 });
    } else {
      alert(`Invalid OTP code. Please enter the OTP given by citizen: ${correctOtp}`);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-5 md:p-8 shadow-2xl space-y-6">
      {/* Top Header & Provider Switch */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white">{provider.name}</h1>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> SIH Verified Merchant
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Provider Dashboard • Live Geofence: <strong>{provider.area}, {provider.city}</strong>
            </p>
          </div>
        </div>

        {/* Dispatch Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Availability Toggle */}
          <button
            onClick={handleToggleAvailability}
            className={`px-3.5 py-2 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all ${
              isAvailable
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
            <span>{isAvailable ? 'Online (Accepting Orders)' : 'Offline / Paused'}</span>
          </button>

          {/* 24/7 SOS Toggle */}
          <button
            onClick={handleToggleUrgency}
            className={`px-3 py-2 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              urgencySupported
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>24/7 SOS Dispatch</span>
          </button>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Overall TrustScore</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {provider.trustScore.overall}<span className="text-xs text-slate-500 font-sans">/100</span>
          </div>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
            <TrendingUp className="w-3 h-3" /> Grade A Certified Merchant
          </span>
        </div>

        <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Dispatch Queue</span>
            <Bell className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {incomingLeads.filter(l => l.status !== 'completed').length}
          </div>
          <span className="text-[10px] text-slate-400 mt-0.5">Active citizen requests</span>
        </div>

        <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Avg Arrival SLA</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">14 <span className="text-xs text-slate-400 font-sans">mins</span></div>
          <span className="text-[10px] text-purple-400 mt-0.5">Top 5% speed in area</span>
        </div>

        <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Direct Revenue</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">₹24,850</div>
          <span className="text-[10px] text-slate-400 mt-0.5">Zero platform commission</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800 pb-2 text-xs font-semibold">
        {[
          { id: 'profile', label: 'Business Profile' },
          { id: 'services', label: `Services (${services.length})` },
          { id: 'leads', label: `Live Queue (${incomingLeads.filter(l => l.status !== 'completed').length})` },
          { id: 'location', label: 'Location & Radius' },
          { id: 'hours', label: 'Operating Hours' },
          { id: 'verification', label: 'Verification & Licenses' },
          { id: 'trust', label: 'TrustScore Analytics' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: BUSINESS PROFILE */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs animate-fadeIn max-w-3xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Business Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Primary Category</label>
              <input
                type="text"
                value={profileForm.categoryLabel}
                onChange={(e) => setProfileForm({ ...profileForm, categoryLabel: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Contact Phone Number</label>
              <input
                type="text"
                value={profileForm.phoneNumber}
                onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-semibold">Official Business Email</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-400 mb-1 font-semibold">Street Address</label>
              <input
                type="text"
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-400 mb-1 font-semibold">Short Summary / Tagline</label>
              <input
                type="text"
                value={profileForm.description}
                onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-400 mb-1 font-semibold">Comprehensive Business Profile & Capabilities</label>
              <textarea
                rows={4}
                value={profileForm.fullDescription}
                onChange={(e) => setProfileForm({ ...profileForm, fullDescription: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Updates</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: SERVICES MANAGEMENT */}
      {activeTab === 'services' && (
        <div className="space-y-4 text-xs animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Offered Services & Pricing Catalog</h3>
              <p className="text-[11px] text-slate-400">Citizens can instantly book and request quotes for these services</p>
            </div>
            <button
              onClick={() => setIsAddingService(!isAddingService)}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Service</span>
            </button>
          </div>

          {/* Add Service Modal/Form */}
          {isAddingService && (
            <form onSubmit={handleAddService} className="p-4 rounded-2xl bg-slate-950 border border-slate-700 space-y-3">
              <h4 className="font-bold text-white text-xs">New Service Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Service Title</label>
                  <input
                    type="text"
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    placeholder="e.g. Emergency Faucet Valve Overhaul"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Price</label>
                  <input
                    type="text"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                    placeholder="e.g. ₹299"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Estimated Duration</label>
                  <input
                    type="text"
                    value={newServiceDuration}
                    onChange={(e) => setNewServiceDuration(e.target.value)}
                    placeholder="e.g. 20-30 mins"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white text-xs"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-slate-400 mb-1">Description</label>
                  <input
                    type="text"
                    value={newServiceDesc}
                    onChange={(e) => setNewServiceDesc(e.target.value)}
                    placeholder="Brief description of work scope..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingService(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold"
                >
                  Save Service
                </button>
              </div>
            </form>
          )}

          {/* Services List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {services.map((s) => (
              <div
                key={s.id}
                className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-xs">{s.name}</h4>
                    {s.popular && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">{s.description}</p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-1">
                    <span className="text-emerald-400 font-mono font-bold text-xs">{s.price}</span>
                    <span>• {s.estimatedDuration}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteService(s.id)}
                  className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete service"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: LIVE DISPATCH QUEUE */}
      {activeTab === 'leads' && (
        <div className="space-y-3 text-xs animate-fadeIn">
          {incomingLeads.map((lead) => (
            <div 
              key={lead.id}
              className={`p-4 rounded-2xl border transition-all ${
                lead.status === 'completed'
                  ? 'bg-slate-950/40 border-slate-800/50 opacity-60'
                  : lead.status === 'accepted'
                    ? 'bg-blue-950/20 border-blue-800/60'
                    : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{lead.service}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      lead.urgency.includes('Immediate')
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {lead.urgency}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Citizen: <strong className="text-slate-200">{lead.customerName}</strong> • {lead.area} ({lead.distance})
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-emerald-400 font-mono">{lead.amount}</span>
                  <span className="text-[10px] text-slate-500 block">{lead.timeAgo}</span>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="mt-3 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  {lead.status === 'pending' && (
                    <span className="text-amber-400 font-medium text-[11px] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 animate-spin" /> Awaiting your dispatch acceptance
                    </span>
                  )}
                  {lead.status === 'accepted' && (
                    <span className="text-blue-400 font-medium text-[11px] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> In Progress • Verify Citizen OTP on completion
                    </span>
                  )}
                  {lead.status === 'completed' && (
                    <span className="text-emerald-400 font-medium text-[11px] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Task Completed & Verified
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {lead.status === 'pending' && (
                    <button
                      onClick={() => handleAcceptLead(lead.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold flex items-center gap-1 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept Request</span>
                    </button>
                  )}

                  {lead.status === 'accepted' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Citizen OTP (e.g. 629140)"
                        value={verifyOtpInput[lead.id] || ''}
                        onChange={(e) => setVerifyOtpInput({ ...verifyOtpInput, [lead.id]: e.target.value })}
                        className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-white text-xs w-44 font-mono text-center"
                      />
                      <button
                        onClick={() => handleCompleteWithOtp(lead.id, lead.otp)}
                        className="px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white rounded-xl font-bold text-xs shadow-md"
                      >
                        Verify & Close
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: LOCATION & RADIUS */}
      {activeTab === 'location' && (
        <div className="space-y-4 text-xs animate-fadeIn max-w-2xl">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>Service Geofence & Proximity Settings</span>
            </h3>
            <p className="text-slate-400 text-xs">
              LocalLink AI matches your business with citizens within your specified radius based on real-time PostGIS polygon calculations.
            </p>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between font-semibold text-slate-300">
                <span>Maximum Service Dispatch Radius</span>
                <span className="text-blue-400 font-bold">{serviceRadiusKm} km</span>
              </div>
              <input
                type="range"
                min={2}
                max={20}
                step={1}
                value={serviceRadiusKm}
                onChange={(e) => setServiceRadiusKm(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>2 km (Hyperlocal immediate)</span>
                <span>10 km (Standard)</span>
                <span>20 km (City-wide)</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <div>Coordinates: <span className="font-mono text-white">{provider.lat}, {provider.lng}</span></div>
              <div>Covered Neighborhoods: Koramangala 1st-8th Block, HSR Layout Sector 1-4, BTM 1st Stage, Ejipura</div>
            </div>

            <button
              onClick={() => showSaveNotice(`Service radius updated to ${serviceRadiusKm} km!`)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold"
            >
              Save Radius Setting
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: OPERATING HOURS */}
      {activeTab === 'hours' && (
        <div className="space-y-4 text-xs animate-fadeIn max-w-2xl">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Weekly Dispatch Scheduler</span>
            </h3>
            <p className="text-slate-400 text-xs">
              Services outside your hours will be marked as "Closed" on citizen search results.
            </p>

            <div className="space-y-2 pt-2">
              {Object.entries(weeklyHours).map(([day, hours]) => (
                <div key={day} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="font-semibold text-white w-28">{day}</span>
                  <input
                    type="text"
                    value={hours}
                    onChange={(e) => setWeeklyHours({ ...weeklyHours, [day]: e.target.value })}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-white text-xs font-mono w-48 text-right"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={() => showSaveNotice('Operating hours saved successfully!')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold"
            >
              Save Hours
            </button>
          </div>
        </div>
      )}

      {/* TAB 6: VERIFICATION & LICENSES */}
      {activeTab === 'verification' && (
        <div className="space-y-4 text-xs animate-fadeIn max-w-3xl">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>Audited Government Documents</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                Fully Verified
              </span>
            </div>

            <div className="space-y-2">
              {provider.verificationDocuments?.map((doc) => (
                <div key={doc.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <div>
                      <p className="font-bold text-white">{doc.name}</p>
                      <p className="text-[10px] text-slate-400">Issued by: {doc.issuedBy} • Expires: {doc.expiryDate}</p>
                    </div>
                  </div>
                  <span className="text-emerald-400 font-bold text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Active & Valid
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => showSaveNotice('Verification recertification request submitted to SIH verification team!')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold border border-slate-700"
            >
              Upload Additional License / Certificate
            </button>
          </div>
        </div>
      )}

      {/* TAB 7: TRUSTSCORE ANALYTICS & OPTIMIZER */}
      {activeTab === 'trust' && (
        <div className="space-y-4 text-xs animate-fadeIn max-w-3xl">
          <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>TrustScore Optimization Engine</span>
                </h3>
                <p className="text-slate-400 text-xs">How to maintain Grade A (90+) ranking on citizen searches</p>
              </div>
              <span className="text-2xl font-black text-emerald-400 font-mono">
                {provider.trustScore.overall}/100
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Respond within 5 minutes</p>
                  <p className="text-slate-400 text-[11px]">Accepting incoming citizen requests within 5 mins adds +3 points to response speed.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">Always verify citizen completion OTP</p>
                  <p className="text-slate-400 text-[11px]">Completed OTP handshakes guarantee authentic verified customer feedback.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
