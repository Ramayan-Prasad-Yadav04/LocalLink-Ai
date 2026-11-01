# FloodWatch AI – Intelligent Flash Flood Prediction & Early Warning System for Hilly Regions

[![Smart India Hackathon 2026](https://img.shields.io/badge/SIH-2026-blue?style=for-the-badge&logo=shield)](https://sih.gov.in)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.128-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?style=for-the-badge&logo=leaflet)](https://leafletjs.com)
[![NetworkX](https://img.shields.io/badge/NetworkX-3.7-orange?style=for-the-badge)](https://networkx.org)

**FloodWatch AI** is an end-to-end, disaster-management web application engineered for mountainous and hilly river basins prone to cloudbursts and sudden flash floods. The system fuses noisy multi-sensor telemetry using a **State-Space Kalman Filter**, executes a **kinematic rainfall-runoff model** across **200 Monte-Carlo scenarios**, calculates stochastic flood probability against a **3.5m danger threshold**, filters risk jitter via a stateful **hysteresis engine**, and dynamically computes safest evacuation paths to high-ground shelters using **NetworkX & Dijkstra's algorithm**.

---

## 🌟 Key Features

1. **Sensor Fusion via Kalman Filter**:
   - Suppresses ultrasonic gauge acoustic bounce, river turbulence, and splashing.
   - Dual-state vector tracking water level $h$ and rate of rise $\dot{h}$ ($m/min$).
2. **Rainfall-Runoff Hydrology Engine**:
   - Dynamic SCS curve saturation modeling where infiltration capacity drops as soil moisture approaches saturation (>80%).
   - Generates deterministic and ensemble stage-discharge hydrographs for the next 30 minutes.
3. **200 Monte-Carlo Scenarios**:
   - Accounts for precipitation variability, infiltration decay uncertainty, and channel roughness variance.
   - Computes statistical mean and 95% Confidence Interval ($CI_{low}, CI_{high}$).
4. **Flood Probability & Breach Warning**:
   - Calculates empirical threshold exceedance percentage against the **3.5 m danger threshold**.
   - Estimates time-to-breach in minutes.
5. **Stateful Hysteresis Risk Engine**:
   - Fast escalation (instantaneous transition) to safeguard human lives.
   - Buffered de-escalation requiring a deadband safety margin and $N=3$ consecutive cycles to eliminate rapid chattering.
   - Classifications: `LOW` (Green), `MODERATE` (Yellow), `HIGH` (Orange), `CRITICAL` (Red).
6. **NetworkX Dijkstra Evacuation Routing**:
   - Topographic valley graph with riverbed causeways, switchback roads, and safe high-elevation shelters.
   - Dynamically marks submerged road links as blocked and guides evacuees up safe mountain passes.
   - Interactive evacuation convoy transit simulation.
7. **HTML5 Web Audio API Emergency Siren**:
   - Authentic dual-tone 800Hz / 1200Hz synthesized alarm sweeping automatically on `CRITICAL` warnings.
8. **Interactive Control Room UI**:
   - Glassmorphic command center dashboard with Recharts, interactive Leaflet OpenStreetMap, and instant Demo Mode scenario triggers.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph SENSORS["Simulated Environmental Sensors"]
        S1["Ultrasonic River Gauge (Alaknanda)"]
        S2["Radar Rain Gauge (Ridge Peak)"]
        S3["Soil Moisture Probe Array (Valley Slopes)"]
    end

    subgraph BACKEND["FastAPI Hydrological Engine"]
        KF["1. Kalman Filter (Sensor Fusion)"]
        HYD["2. Rainfall-Runoff Hydrology Model"]
        MC["3. Monte-Carlo Ensemble (200 Scenarios)"]
        FP["4. Flood Probability Calculation (3.5m Threshold)"]
        RE["5. Stateful Risk Engine with Hysteresis"]
        ROUTER["6. NetworkX Dijkstra Evacuation Router"]
        DB[("SQLite Database: Users, Telemetry, Shelters, Alerts")]
    end

    subgraph FRONTEND["React 19 + Vite Emergency Dashboard"]
        NAV["Command Header & Demo Mode Switcher"]
        KPI["Real-Time KPI Metric Cards"]
        PRED["30-Min Prediction Chart (Recharts + 95% CI)"]
        GRAPHS["Live Sensor Graphs (Raw vs Kalman Filtered)"]
        RPANEL["Risk Analysis & Protocol Guidance"]
        MAP["Leaflet Geospatial Map + Evacuation Polylines"]
        EVAC["Turn-by-Turn Route Guidance"]
        AUDIO["Web Audio API Emergency Siren"]
    end

    S1 & S2 & S3 -->|Raw Telemetry (Every 2s)| KF
    KF -->|Filtered Stage & Rate of Rise| HYD
    HYD -->|Ensemble Perturbations| MC
    MC -->|Mean & 95% CI Envelopes| FP
    FP -->|Exceedance Probability| RE
    RE -->|Dynamic Threat Level| ROUTER
    KF & FP & RE & ROUTER <--> DB

    BACKEND -->|REST APIs (JSON)| FRONTEND
```

---

## 📁 Project Structure

```
floodwatch-ai/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx              # Status, Demo Mode selector, audio controls
│   │   │   ├── AlertBanner.jsx         # Emergency flashing alert ribbon
│   │   │   ├── KpiCards.jsx            # 6 metric telemetry cards
│   │   │   ├── PredictionChart.jsx     # Recharts 30-min forecast & 95% CI band
│   │   │   ├── SensorGraphs.jsx        # Kalman vs Raw graph & log table
│   │   │   ├── RiskPanel.jsx           # Risk classification & protocols
│   │   │   ├── FloodMap.jsx            # Leaflet map, sensors, shelters, routes
│   │   │   ├── EvacuationPanel.jsx     # Dijkstra route & transit times
│   │   │   ├── AlertHistory.jsx        # Emergency broadcast history log
│   │   │   └── EmergencyAlertModal.jsx # Auto-popup modal on HIGH/CRITICAL
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx           # Operator/Commander authentication
│   │   │   └── DashboardPage.jsx       # Integrated control room layout
│   │   ├── services/
│   │   │   ├── api.js                  # Axios client & JWT interceptor
│   │   │   └── audioService.js         # Web Audio API emergency siren
│   │   ├── hooks/
│   │   │   ├── useAuth.jsx             # Authentication context
│   │   │   └── useSensorData.js        # 2-second real-time polling hook
│   │   ├── utils/
│   │   │   └── formatters.js           # Unit formatters & color codes
│   │   ├── App.jsx                     # Protected routing configuration
│   │   ├── main.tsx                    # React DOM root entry
│   │   └── index.css                   # Tailwind v4 & radar animations
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI application entry & CORS
│   │   ├── core_config.py              # Environment configuration
│   │   ├── api/
│   │   │   └── endpoints.py            # REST endpoints
│   │   ├── schemas/
│   │   │   └── __init__.py             # Pydantic validation schemas
│   │   ├── services/
│   │   │   ├── sensor_simulator.py     # 2s physics simulation & service loop
│   │   │   └── auth_service.py         # JWT tokens & PBKDF2 hashing
│   │   ├── algorithms/
│   │   │   ├── kalman_filter.py        # State-space Kalman sensor fusion
│   │   │   ├── hydrology_model.py      # Rainfall-runoff kinematic model
│   │   │   ├── monte_carlo.py          # 200 stochastic simulation scenarios
│   │   │   ├── flood_probability.py    # Danger threshold exceedance
│   │   │   ├── risk_engine.py          # 4-level hysteresis risk classifier
│   │   │   └── evacuation_router.py    # NetworkX Dijkstra routing engine
│   │   └── database/
│   │       ├── db.py                   # SQLite tables & seed records
│   │       └── floodwatch.db           # SQLite database
│   ├── test_algorithms.py              # Algorithm verification suite
│   ├── test_api.py                     # Full REST endpoint test suite
│   ├── requirements.txt
│   ├── .env.example
│   └── .env
│
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Python**: v3.10 or higher
- **Git**

---

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (optional but recommended)
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install required Python dependencies
pip install -r requirements.txt

# Run algorithm verification tests
python test_algorithms.py

# Run API endpoint integration tests
python test_api.py

# Start the FastAPI server
python -m uvicorn app.main:app --reload --port 8000
```
Backend API will be available at: **`http://localhost:8000`**  
Interactive Swagger API documentation: **`http://localhost:8000/docs`**

---

### 2. Frontend Setup

```bash
# In a separate terminal, navigate to the frontend or project root:
cd ..

# Install frontend dependencies
npm install

# Start the Vite development server
npm run dev
```
Frontend Dashboard will be available at: **`http://localhost:5173`**

---

## 🔐 Demo Credentials

Use any of the seeded credentials on the Login Page (or use the one-click quick-fill buttons):

| Role | Username | Password | Email | Access |
|---|---|---|---|---|
| **Field Operator** | `operator` | `Flood@2026` | `operator@floodwatch.ai` | Operational Telemetry & Alert Acknowledgment |
| **Disaster Commander** | `admin` | `Admin@123` | `admin@floodwatch.ai` | Full Incident Command Center Access |
| **SIH 2026 Grand Jury** | `sih_judge` | `Judge@2026` | `judge@sih2026.gov.in` | Evaluator Mode |

---

## 🔬 Core Algorithm Explanations (For SIH Judges)

### 1. Sensor Fusion using Kalman Filter (`app/algorithms/kalman_filter.py`)
In rugged mountain valleys, ultrasonic water level sensors experience severe measurement noise caused by water turbulence, floating driftwood, and splashing waves.
- **State Vector**: $x_k = \begin{bmatrix} h \\ \dot{h} \end{bmatrix}$ (water stage height in meters, rate of change in $m/min$).
- **State Transition Matrix**: $F = \begin{bmatrix} 1 & \Delta t \\ 0 & 1 \end{bmatrix}$ with $\Delta t = 2/60\text{ min}$.
- **Innovation**: $y = z_k - H x_{k|k-1}$.
- **Kalman Gain**: $K = P_{k|k-1} H^T (H P_{k|k-1} H^T + R)^{-1}$.
The filter successfully isolates genuine water level rises from transient acoustic bounces.

### 2. Rainfall-Runoff Kinematic Model (`app/algorithms/hydrology_model.py`)
Mountain flash floods occur when steep slopes exceed soil infiltration capacity.
- **Dynamic Runoff Coefficient ($C$)**:
  $$C(S_{moist}) = C_{base} + \frac{C_{sat} - C_{base}}{1 + e^{-10(S_{moist}/100 - 0.65)}}$$
  When soil saturation exceeds 70-80%, ground infiltration plummets, causing rapid surface runoff surges.
- **Hydraulic Channel Routing**: Outflow rate follows stage-discharge power law $Q_{out}(h) = \kappa \cdot h^{1.5}$.

### 3. 200 Monte-Carlo Scenarios (`app/algorithms/monte_carlo.py`)
Because mountain rainfall exhibits extreme localized variability:
- 200 stochastic ensemble paths are generated every evaluation cycle.
- Parameters perturbed: rainfall intensity $\mathcal{N}(1.0, 0.18^2)$, soil saturation $\pm 5\%$, channel roughness $\pm 10\%$.
- Computes mean hydrograph $\mu(t)$, standard deviation $\sigma(t)$, and empirical 95% Confidence Interval $[CI_{2.5\%}(t), CI_{97.5\%}(t)]$.

### 4. Flood Probability Calculation (`app/algorithms/flood_probability.py`)
- Danger threshold: **$3.50\text{ meters}$**.
- $$P(\text{Flood}) = \frac{\sum_{i=1}^{200} \mathbb{I}\left(\max_{t \in [1, 30]} h_i(t) \ge 3.50\text{ m}\right)}{200} \times 100\%$$
- Detects the earliest minute where the ensemble crosses the danger line.

### 5. Stateful Hysteresis Risk Engine (`app/algorithms/risk_engine.py`)
To prevent control room alarms from flickering erratically when sensor noise hovers near threshold boundaries:
- **Instant Escalation**: Any breach of threshold immediately elevates risk level to protect lives.
- **Buffered De-escalation**: Downgrading risk requires metrics to fall below the threshold minus a deadband buffer ($5\%$ probability, $0.15m$ water level) AND remain below for $N=3$ consecutive cycles (6 seconds).

### 6. Dijkstra Evacuation Routing (`app/algorithms/evacuation_router.py`)
- Topographic valley road network modeled as a weighted graph $G=(V,E)$ in **NetworkX**.
- When river stage crosses critical submergence thresholds (e.g. riverbank road at $2.6m$), those edges are assigned infinite weight ($10^6$) and flagged as impassable.
- Dijkstra's algorithm `nx.dijkstra_path` computes the shortest safe uphill path to safe shelters (Pine Ridge, St. Jude, Civil Hospital).

---

## 🚨 SIH Judge Demo Mode Walkthrough

Use the **Demo Mode** button bar in the dashboard navbar to simulate scenarios:

1. **Normal Mode**:
   - Rainfall: ~5 mm/h | Soil Moisture: ~38% | Water Level: ~1.35 m
   - Risk: `LOW` (Green)
   - Hydrograph remains comfortably below the 3.5 m line.
2. **Heavy Rain Mode**:
   - Rainfall: ~60 mm/h | Soil Moisture: ~74% | Water Level: ~2.60 m
   - Risk: `MODERATE` / `HIGH` (Yellow / Orange)
   - Prediction curve trends upward, warning banners appear.
3. **Extreme Mode (Cloudburst)**:
   - Rainfall: ~135 mm/h | Soil Moisture: ~93% (Saturated) | Water Level: surges to >3.5 m
   - Risk escalates to **`CRITICAL`** (Red, pulsing).
   - **Emergency Siren**: Web Audio API dual-tone siren triggers automatically.
   - **Emergency Modal**: Displays mandatory evacuation instructions.
   - **Evacuation Route**: Dijkstra algorithm reroutes traffic away from flooded river causeways to Pine Ridge High Ground (1,420 m elevation).
   - **Convoy Simulation**: Click "Start Evacuation Simulation" on the map to view real-time convoy transit along safe switchbacks!

---

## 🌐 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate user & return JWT token |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |
| `GET` | `/api/sensors/live` | Current 2s Kalman-filtered telemetry |
| `GET` | `/api/sensors/history` | Historical time series buffer for charting |
| `GET` | `/api/prediction` | 30-min forecast & 200 Monte-Carlo runs |
| `GET` | `/api/risk` | Risk classification & hysteresis status |
| `GET` | `/api/map/sensors` | Sensor locations & status |
| `GET` | `/api/map/shelters` | High-ground shelters & capacities |
| `GET` | `/api/evacuation/route` | Dijkstra shortest safe path & directions |
| `GET` | `/api/alerts` | Emergency alerts history |
| `POST` | `/api/alerts/acknowledge` | Acknowledge emergency alert |
| `POST` | `/api/simulation/scenario` | Set scenario (`normal`, `heavy`, `extreme`) |
| `POST` | `/api/simulation/reset` | Reset simulation to baseline |
| `GET` | `/api/health` | Algorithm health & system status |

---

## 🚀 Future Roadmap

1. **Satellite Precipitation Ingestion**: Integrate INSAT-3D and IMD Doppler Weather Radar gridded precipitation APIs.
2. **PostGIS & OpenStreetMap Overpass**: Live dynamic routing over real-time OpenStreetMap road networks using pgRouting.
3. **LoRaWAN / Satellite Telemetry**: Direct ingestion from remote mountainous catchment sensor nodes via edge microcontrollers.
4. **Cell Broadcast / CAP Protocol**: Integration with Common Alerting Protocol (CAP) and NDMA SMS broadcast gateway.