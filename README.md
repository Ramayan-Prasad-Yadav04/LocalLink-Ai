# LocalLink AI — Frontend Web Application

> **LocalLink AI**: "Find the right local service. Fast. Trusted. Nearby."  
> An AI-powered hyperlocal service discovery platform matching citizens to verified nearby service providers based on natural language intent, real-time availability, distance, category, and fraud-resistant TrustScore.

---

## 🌟 Core Features & Architecture

### 1. 🏠 Landing Page (`/`)
- **Logo & Branding**: Modern AI-product styling with responsive navbar and navigation drawer.
- **Official Tagline**: *"Find the right local service. Fast. Trusted. Nearby."*
- **Large AI Search Box**: Natural language input with voice search simulation and sample query chips (e.g., *"I need a pharmacy open now near me"*, *"Find a reliable electrician within 5 km"*).
- **Location Selector & GPS**: Multi-city switcher (Bengaluru, New Delhi, Mumbai, Ahmedabad, Jaipur) + **"Use Current Location"** button with HTML5 `navigator.geolocation` live coordinates.
- **Popular Service Categories**: Home & Repair SOS, Healthcare & 24/7 Pharma, Automotive & EV Charging, Hospitality & Work Stays, Financial & Aadhaar Points, Cleaning & Sanitization.
- **TrustScore Engine Banner**: Comprehensive breakdown explaining why TrustScore replaces spoofed 5-star ratings.
- **Top Verified Providers**: Live recommendations with direct Call, Navigate, and Details actions.

### 2. 🔍 AI Search & Discovery (`/search`)
- **Natural Language Intent Parser**: Analyzes queries into structured intent (sector, urgency level, keywords, complexity, confidence score).
- **Transparent AI Loading States**: Real-time progress updates (*"Parsing intent..."*, *"Geofencing within radius..."*, *"Evaluating TrustScores & SLA..."*).
- **Interactive Multi-Filter Tray**:
  - Distance radius slider (1 km to 20 km)
  - Category selector
  - Minimum TrustScore threshold (&ge;60 to &ge;95)
  - Availability toggles (*"Open Now Only"*, *"24/7 Emergency SOS Ready"*)
  - Sorting: AI Composite Match, Highest TrustScore, Distance, Rating, Price
- **Triple View Toggles**:
  - **List View**: Grid of comprehensive provider cards
  - **Split View**: Left column cards, right column sticky interactive Leaflet map
  - **Full Map View**: Large geospatial map canvas
- **Service/Provider Cards**:
  - Provider name, category label, distance (km), ETA (mins), open/closed status
  - Verified TrustScore pill with breakdown trigger
  - Rating, reviews count, address, phone number
  - Direct action buttons: **"View Details"**, **"Call"**, **"Navigate"**
  - **"Add to Compare"** checkbox and **"Save / Favorite"** heart toggle.

### 3. 🗺️ Interactive Map View
- **Interactive Leaflet Map**: Powered by OpenStreetMap & CartoDB tiles (dark mode styling).
- **User Location Marker**: Pulsing blue beacon indicating citizen coordinates.
- **Provider Markers**: TrustScore badges (&ge;93 in emerald, verified in blue) with open/closed pulsing status dots.
- **Interactive Popups**: Click any pin to inspect summary, distance, and launch instant "View Details" or "Call".
- **Dynamic Polyline**: Displays turn-by-turn route line to selected provider.

### 4. 🏢 Provider Details Page (`/provider/:id`)
- **Full Business Profile**: Name, category, description, address, contact numbers, email, website.
- **Services Catalog**: Interactive service list with fixed pricing, estimated duration, and **"Book Now"** button.
- **TrustScore Audit**: Detailed factor breakdown (Govt Licensing, On-Time Reliability, Customer Sentiment, Dispatch Speed).
- **Interactive Geofenced Mini-Map**: Localized view with directions button.
- **Weekly Operating Hours Table**: Day-by-day scheduler with real-time open status.
- **Verified Customer Reviews**: OTP-authenticated reviews with rating stars, service tags, and **"Write a Verified Review"** form.
- **Actions**: Instant Call dialer modal, Navigation turn-by-turn drawer, and Booking with OTP modal.

### 5. ⚖️ Compare Feature (`/compare` + Floating Dock)
- **Floating Compare Dock**: Persistent bottom tray tracking selected providers from anywhere in the app.
- **Side-by-Side Comparison Matrix**:
  - Compares up to 4 providers simultaneously
  - Distance, Arrival ETA, Open status, TrustScore, Rating, Review counts, Pricing, Services offered, and Regulatory audit sources
  - Highlights winners (*"Best Trust"*, *"Closest"*, *"Top Rated"*).

### 6. 🔐 User Authentication & Citizen Profile (`/profile`)
- **OTP-Based Authentication**:
  - Phone number input
  - Request OTP (`POST /api/auth/otp/send`)
  - Enter 6-digit code with demo helper (`123456` or auto-generated code)
  - Verify OTP (`POST /api/auth/otp/verify`)
- **Citizen Profile**:
  - Name, Phone, Email editing
  - **Saved Providers**: Collection of bookmarked merchants
  - **Search History**: Timestamped queries with 1-click re-search and "Clear History"
  - **Recent Bookings**: Service bookings with confirmation OTP codes and status tracking.

### 7. 🏪 Provider Dashboard (`/provider-dashboard`)
- **Business Profile**: Update business details, address, and descriptions.
- **Services Management**: Full CRUD to add new services, set prices, durations, or delete services.
- **Location & Radius**: PostGIS coordinates and dispatch radius slider (2 km – 20 km).
- **Live Availability Toggle**: Switch between **Online (Accepting Orders)** and **Offline / Paused**.
- **24/7 Emergency SOS Toggle**: Activate emergency on-call status.
- **Opening Hours Scheduler**: Customize daily operating hours for all 7 days.
- **Verification Status**: Displays active trade licenses, GSTIN, and regulatory inspection certificates.
- **TrustScore Analytics**: Actionable tips and response speed benchmarks to boost ranking.
- **Live Dispatch Queue**: Incoming citizen requests with OTP verification upon completion.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + Lucide React Icons
- **Routing**: React Router DOM (v7)
- **HTTP Client**: Axios with configured `baseURL` and Bearer token interceptor
- **Interactive Maps**: Leaflet + OpenStreetMap / CartoDB tiles
- **Build Tool**: Vite 8 (builds in ~2 seconds)
- **Local Persistence**: Full transparent mock engine fallback with `localStorage` and `sessionStorage`

---

## ⚙️ Environment Variables

Create a `.env` file in the project root (see `.env.example`):

```env
# Backend REST API URL
VITE_API_URL=http://localhost:5000/api

# Map provider: 'osm' (OpenStreetMap - free, no API key needed), 'mapbox', or 'google'
VITE_MAP_PROVIDER=osm

# Optional: Mapbox access token if using Mapbox vector tiles
VITE_MAPBOX_TOKEN=

# Optional: Google Maps API key if using Google Maps JS API
VITE_GOOGLE_MAPS_API_KEY=
```

---

## 🏃 Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Run in Development Mode
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Build for Production
```bash
npm run build
```
Verify the production build with:
```bash
npm run preview
```

---

## 🔌 Connecting to a Backend REST API

The frontend is fully wired to REST API endpoints via `src/services/api.ts`:
- `GET /api/services/search`: Search with natural language query & filters
- `GET /api/providers/:id`: Get single provider details
- `GET /api/providers/featured`: Get top-rated providers
- `POST /api/auth/otp/send`: Request OTP
- `POST /api/auth/otp/verify`: Verify OTP & authenticate
- `GET /api/user/profile`: Get citizen profile, favorites & history
- `PUT /api/user/profile`: Update citizen profile
- `POST /api/user/favorites/toggle`: Toggle saved provider
- `DELETE /api/user/history`: Clear search history
- `POST /api/bookings`: Create booking request
- `POST /api/providers/:id/reviews`: Post verified review
- `PUT /api/provider/profile`: Update business profile
- `PUT /api/provider/availability`: Toggle online/offline status
- `POST /api/provider/services`: Add new service
- `DELETE /api/provider/services/:id`: Delete service

> **Note**: When the backend server is offline or unreachable, the frontend automatically falls back to its built-in client AI intent and mock data engine with `localStorage` persistence, ensuring zero broken pages during demonstrations.
#   L o c a l L i n k - A i  
 #   L o c a l L i n k - A i  
 #   L o c a l L i n k - A i -  
 