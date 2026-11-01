import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Phone, 
  Navigation, 
  Star, 
  CheckCircle2, 
  Scale, 
  Sparkles, 
  Heart, 
  ArrowLeft, 
  Mail, 
  Globe, 
  Calendar, 
  AlertCircle,
  FileCheck,
  Send,
  Zap,
  Award,
  Users
} from 'lucide-react';
import { api } from '../services/api';
import { Provider, ServiceItem, Review } from '../types';
import { useAuth } from '../context/AuthContext';
import { useCompare } from '../context/CompareContext';
import { InteractiveMap } from '../components/Map/InteractiveMap';
import { TrustScoreModal } from '../components/TrustScoreModal';
import { CallModal } from '../components/CallModal';
import { BookingOtpModal } from '../components/BookingOtpModal';
import { NavigationDrawer } from '../components/NavigationDrawer';

export const ProviderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useAuth();
  const { isInCompare, toggleCompare } = useCompare();

  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isTrustModalOpen, setIsTrustModalOpen] = useState(false);
  const [isCallModalOpen, setIsCallModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);
  const [selectedServiceToBook, setSelectedServiceToBook] = useState<string>('');

  // Write Review State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    async function fetchProvider() {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await api.getProviderById(id);
        setProvider(data);
      } catch (err: any) {
        setError(err.message || 'Provider not found');
      } finally {
        setLoading(false);
      }
    }
    fetchProvider();
  }, [id]);

  const handleBookService = (serviceName?: string) => {
    if (serviceName) setSelectedServiceToBook(serviceName);
    setIsBookingModalOpen(true);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!provider || !reviewComment.trim()) return;

    setReviewSubmitting(true);
    try {
      const newReview = await api.submitReview(provider.id, {
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      setProvider({
        ...provider,
        reviews: [newReview, ...provider.reviews],
        reviewCount: provider.reviewCount + 1,
      });
      setReviewComment('');
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-3 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
        <p className="text-sm text-slate-400 font-semibold">Loading Provider Verification Profile...</p>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-lg font-bold text-white">Provider Not Found</h2>
        <p className="text-xs text-slate-400">{error || 'The requested service provider could not be located.'}</p>
        <button
          onClick={() => navigate('/search')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
        >
          Return to Search
        </button>
      </div>
    );
  }

  const isFav = isFavorite(provider.id);
  const isCompared = isInCompare(provider.id);
  const { trustScore } = provider;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to search results</span>
      </button>

      {/* 1. HERO PROFILE HEADER */}
      <div className="relative rounded-3xl bg-slate-900 border border-slate-700/80 p-6 md:p-8 shadow-2xl overflow-hidden">
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-blue-500/10 text-blue-400 font-bold text-xs uppercase tracking-wider border border-blue-500/20">
                {provider.categoryLabel}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 font-bold text-xs flex items-center gap-1 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Merchant
              </span>
              {provider.urgencySupported && (
                <span className="px-2.5 py-1 rounded-xl bg-rose-500/10 text-rose-300 font-bold text-xs flex items-center gap-1 border border-rose-500/20">
                  <Zap className="w-3.5 h-3.5" />
                  24/7 Emergency Dispatch
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              {provider.name}
            </h1>

            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              {provider.fullDescription || provider.description}
            </p>

            {/* Quick Meta */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
              <div className="flex items-center gap-1.5 text-amber-400">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold text-white text-sm">{provider.rating}</span>
                <span className="text-slate-400">({provider.reviewCount} customer reviews)</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>{provider.distanceKm} km away • {provider.area}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">{provider.openingHours}</span>
              </div>
            </div>
          </div>

          {/* TrustScore Badge & Favorite/Compare Pill */}
          <div className="flex flex-col sm:items-end gap-3 shrink-0">
            {/* TrustScore Interactive Card */}
            <div 
              onClick={() => setIsTrustModalOpen(true)}
              className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/40 hover:border-emerald-400 cursor-pointer transition-all shadow-xl text-right group"
            >
              <div className="flex items-center justify-end gap-2 text-emerald-400">
                <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-xs uppercase font-extrabold tracking-wider">LocalLink TrustScore</span>
              </div>
              <div className="text-3xl font-black text-emerald-300 mt-0.5">
                {trustScore.overall}<span className="text-sm text-emerald-500 font-bold">/100</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Audit verified • Click for breakdown
              </p>
            </div>

            {/* Favorite & Compare Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleFavorite(provider.id)}
                className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  isFav
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                <span>{isFav ? 'Saved' : 'Save'}</span>
              </button>

              <button
                onClick={() => toggleCompare(provider)}
                className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  isCompared
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>{isCompared ? 'In Compare' : 'Compare'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* PRIMARY CALL-TO-ACTION BAR */}
        <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Call */}
          <button
            onClick={() => setIsCallModalOpen(true)}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 shadow-sm transition-all"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>Call: {provider.phoneNumber}</span>
          </button>

          {/* Navigate */}
          <button
            onClick={() => setIsNavDrawerOpen(true)}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 shadow-sm transition-all"
          >
            <Navigation className="w-4 h-4 text-blue-400" />
            <span>Navigate & Directions</span>
          </button>

          {/* Instant Book */}
          <button
            onClick={() => handleBookService()}
            className="py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 hover:from-blue-500 hover:to-amber-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>Book Service (Instant OTP)</span>
          </button>
        </div>
      </div>

      {/* 2. GRID: SERVICES & TRUSTSCORE EXPLANATION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Services Offered (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Services & Price List</span>
              </h2>
              <span className="text-xs text-slate-400">{provider.services.length} options available</span>
            </div>

            <div className="space-y-3">
              {provider.services.map((service) => (
                <div
                  key={service.id}
                  className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-white group-hover:text-blue-300 transition-colors">
                        {service.name}
                      </h3>
                      {service.popular && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                          Most Requested
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{service.description}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>Duration: {service.estimatedDuration}</span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                    <div className="font-black text-sm text-emerald-400 font-mono">
                      {service.price}
                    </div>
                    <button
                      onClick={() => handleBookService(service.name)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Verified Customer Reviews</span>
                <span className="text-xs font-semibold text-amber-400">({provider.rating} ★)</span>
              </h2>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> OTP Verified Only
              </span>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {provider.reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{rev.author}</span>
                      {rev.verifiedUser && (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                          Verified Visit
                        </span>
                      )}
                    </div>
                    <span className="text-slate-500 text-[11px]">{rev.date}</span>
                  </div>

                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-current' : 'text-slate-700'}`}
                      />
                    ))}
                    {rev.serviceUsed && (
                      <span className="text-[11px] text-slate-400 ml-2">Used: {rev.serviceUsed}</span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>

            {/* Submit a Review Form */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white">Write a Verified Review</h3>
              
              {reviewSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Your review has been submitted and verified into the TrustScore algorithm!</span>
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Your Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((stars) => (
                      <button
                        type="button"
                        key={stars}
                        onClick={() => setReviewRating(stars)}
                        className={`p-1 text-lg ${stars <= reviewRating ? 'text-amber-400' : 'text-slate-600'}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Feedback & Experience</label>
                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share honest details regarding timeliness, professional quality, and price transparency..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={reviewSubmitting || !reviewComment.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{reviewSubmitting ? 'Submitting...' : 'Post Verified Review'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Location Map, Hours & TrustScore Breakdown (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* TrustScore Explanation Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>TrustScore Explanation</span>
              </h3>
              <span className="font-mono text-emerald-300 font-extrabold text-sm">
                {trustScore.overall}/100
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              TrustScore evaluates regulatory licensing, on-time GPS arrival SLA, verified customer feedback sentiment, and response speed.
            </p>

            <div className="space-y-3 text-xs pt-1">
              <div>
                <div className="flex justify-between text-slate-300 font-semibold mb-1">
                  <span>Govt & License Verification</span>
                  <span className="text-emerald-400 font-bold">{trustScore.verification}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div style={{ width: `${trustScore.verification}%` }} className="bg-emerald-500 h-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-semibold mb-1">
                  <span>Reliability & SLA Arrival</span>
                  <span className="text-blue-400 font-bold">{trustScore.reliability}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div style={{ width: `${trustScore.reliability}%` }} className="bg-blue-500 h-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-semibold mb-1">
                  <span>Review Sentiment Integrity</span>
                  <span className="text-amber-400 font-bold">{trustScore.reviewsAndSentiment}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div style={{ width: `${trustScore.reviewsAndSentiment}%` }} className="bg-amber-400 h-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 font-semibold mb-1">
                  <span>Avg Response Speed</span>
                  <span className="text-purple-400 font-bold">{trustScore.responseSpeed}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div style={{ width: `${trustScore.responseSpeed}%` }} className="bg-purple-500 h-full"></div>
                </div>
              </div>
            </div>

            {/* Verification Documents */}
            {provider.verificationDocuments && provider.verificationDocuments.length > 0 && (
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Audited Regulatory Credentials:
                </span>
                {provider.verificationDocuments.map((doc) => (
                  <div key={doc.id} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <p className="font-semibold text-white">{doc.name}</p>
                        <p className="text-[10px] text-slate-500">{doc.issuedBy}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                      Verified
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Mini Map */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>Location & Geofence</span>
              </h3>
              <span className="text-xs text-blue-300 font-semibold">{provider.distanceKm} km from you</span>
            </div>

            <p className="text-xs text-slate-400">{provider.address}, {provider.area}, {provider.city}</p>

            <InteractiveMap
              providers={[provider]}
              selectedProvider={provider}
              height="240px"
              center={[provider.lat, provider.lng]}
              zoom={15}
            />

            <button
              onClick={() => setIsNavDrawerOpen(true)}
              className="w-full py-2.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Launch Turn-by-Turn Navigation</span>
            </button>
          </div>

          {/* Operating Hours Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Weekly Operating Hours</span>
            </h3>

            <div className="space-y-1.5 text-xs">
              {provider.weeklyHours ? (
                Object.entries(provider.weeklyHours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between py-1 border-b border-slate-800/40 text-slate-300">
                    <span className="font-medium">{day}</span>
                    <span className="font-mono text-slate-400">{hours}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-400">{provider.openingHours}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* OVERLAYS & MODALS */}
      {isTrustModalOpen && (
        <TrustScoreModal
          provider={provider}
          onClose={() => setIsTrustModalOpen(false)}
        />
      )}

      {isCallModalOpen && (
        <CallModal
          provider={provider}
          onClose={() => setIsCallModalOpen(false)}
        />
      )}

      {isBookingModalOpen && (
        <BookingOtpModal
          provider={provider}
          onClose={() => setIsBookingModalOpen(false)}
        />
      )}

      {isNavDrawerOpen && (
        <NavigationDrawer
          provider={provider}
          onClose={() => setIsNavDrawerOpen(false)}
        />
      )}
    </div>
  );
};
