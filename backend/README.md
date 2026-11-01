# FloodWatch AI – Backend Hydrology & Disaster Warning Engine

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python)](https://python.org)
[![NumPy](https://img.shields.io/badge/NumPy-1.24+-013243?style=for-the-badge&logo=numpy)](https://numpy.org)
[![SciPy](https://img.shields.io/badge/SciPy-1.11+-8CAAE6?style=for-the-badge&logo=scipy)](https://scipy.org)
[![NetworkX](https://img.shields.io/badge/NetworkX-3.0+-orange?style=for-the-badge)](https://networkx.org)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0+-D71F00?style=for-the-badge)](https://sqlalchemy.org)
[![Pytest](https://img.shields.io/badge/Pytest-8.0+-0A9EDC?style=for-the-badge&logo=pytest)](https://pytest.org)

**FloodWatch AI Backend** is a high-performance hydrological prediction and disaster response system designed specifically for mountainous and hilly river basins (calibrated for the Alaknanda and Mandakini River catchments in Uttarakhand). 

The platform continuously consumes multi-station environmental sensor telemetry, suppresses turbulent noise via a **1D Discrete Kalman Filter**, calculates 30-minute flash flood stage trajectories via a **kinematic wave runoff engine**, evaluates probabilistic breach risk using **Monte Carlo simulation (1,000 stochastic ensembles)**, applies **stateful hysteresis dampening** to prevent alarm jitter, dynamically solves safe high-ground escape routes using **NetworkX Dijkstra pathfinding with flood inundation penalties**, and dispatches automated alerts across WebSockets and SMTP.

---

## 1. System Architecture

```mermaid
flowchart TD
    subgraph TELEMETRY["1. Multi-Station Telemetry Ingestion"]
        S1["Sensor 1: Alaknanda Upstream Gauge"]
        S2["Sensor 2: Mandakini Gorge Velocity Radar"]
        S3["Sensor 3: Chamoli Ridge Rain Station"]
        S4["Sensor 4: Rudraprayag Sangam Junction"]
        S5["Sensor 5: Lowland Floodplain Soil Array"]
    end

    subgraph ENGINE["2. Hydrological & ML Processing Pipeline"]
        KF["Kalman Filter (1D State-Space Fusion)\nx = [h, v]^T | P, Q, R Covariance | Missing Packet Coasting"]
        KW["Kinematic Wave Runoff Engine\n30-Min Forward Stage Rise | Tau = 22 mins Lag"]
        MC["Monte Carlo Simulation (1,000 Iterations)\nGaussian Rainfall Perturbation | Soil Non-linearity | 95% CI"]
        RC["Stateful Hysteresis Risk Classifier\nLOW, MODERATE, HIGH, CRITICAL | 0.20m / 5% Deadband"]
        NX["NetworkX Dijkstra Evacuation Router\nInundated Road Avoidance (Cost = 10^6) | Ridge Pass Selection"]
        ALERT["Alert & Notification Engine\nSMTP Email Gateway | 45s Deduplication Throttle"]
    end

    subgraph STORAGE["3. Persistent Storage & Persistence"]
        DB[("SQLAlchemy Engine: SQLite (floodwatch.db) / PostgreSQL\nSensors, Readings, Predictions, Risk, Shelters, Nodes, Alerts")]
    end

    subgraph DISTRIBUTION["4. Real-Time Distribution & API Gateway"]
        WS["WebSocket Broadcast Manager\nTopics: sensor_update, prediction_update, risk_update, evacuation_update, emergency_alert"]
        REST["FastAPI REST Endpoints\nOpenAPI /docs & /redoc"]
    end

    S1 & S2 & S3 & S4 & S5 -->|Raw Telemetry Stream (2s cycle)| KF
    KF -->|Filtered Stage h & Velocity v| KW
    KW -->|Stage Hydrograph| MC
    MC -->|Breach Probability & Percentiles (p10..p95)| RC
    RC -->|Current Threat Level & Water Level| NX
    RC -->|Trigger on CRITICAL / HIGH| ALERT
    KF & KW & MC & RC & NX & ALERT <--> DB
    KF & KW & MC & RC & NX & ALERT --> WS
    DB <--> REST
```

---

## 2. Directory Structure

```
backend/
├── app/
│   ├── main.py                     # FastAPI application entrypoint, CORS, routes & WebSockets
│   ├── config.py                   # Pydantic v2 settings (database URL, thresholds, SMTP, JWT)
│   ├── database.py                 # SQLAlchemy engine, session maker & declarative Base
│   ├── models/
│   │   └── __init__.py             # SQLAlchemy ORM models (Sensor, Reading, Prediction, Risk, Shelter, etc.)
│   ├── schemas/
│   │   └── __init__.py             # Pydantic request/response validation schemas
│   ├── services/
│   │   ├── kalman_filter.py        # 1D Discrete Kalman Filter state-space sensor fusion
│   │   ├── flood_prediction.py     # Kinematic wave 30-min rainfall-runoff engine
│   │   ├── monte_carlo.py          # 1,000-scenario Monte Carlo stochastic simulator
│   │   ├── risk_classifier.py      # Stateful hysteresis risk classification engine
│   │   ├── evacuation_router.py    # NetworkX Dijkstra topological road graph router
│   │   ├── alert_service.py        # Automated emergency alert generator & SMTP dispatcher
│   │   └── sensor_simulator.py     # Multi-station physics simulator (normal, warning, extreme)
│   ├── websocket/
│   │   └── manager.py              # WebSocket connection manager & topic publisher
│   └── routes/
│       ├── sensors.py              # Sensor telemetry, history & simulation endpoints
│       ├── predictions.py          # 30-minute flood forecasting & ad-hoc runs
│       ├── risk.py                 # Real-time risk assessments & hysteresis status
│       ├── evacuation.py           # Dijkstra evacuation route & shelter directory
│       ├── alerts.py               # Emergency alert feed & operator acknowledgment
│       ├── analytics.py            # Aggregate telemetry analytics & statistics
│       ├── map.py                  # Map GIS features (sensors, risk polygons, shelters)
│       ├── simulation.py           # Scenario switcher (normal, warning, extreme) & reset
│       └── auth.py                 # Operator JWT login & identity profile
├── tests/
│   ├── test_kalman.py              # Kalman filter noise reduction & missing packet tests
│   ├── test_prediction.py          # Kinematic wave prediction & lag time tests
│   ├── test_monte_carlo.py         # Monte Carlo breach probability & confidence envelope tests
│   ├── test_evacuation.py          # Dijkstra evacuation router & flood road detour tests
│   └── test_routes.py              # Full REST API endpoint integration tests
├── requirements.txt                # Python package dependencies
├── .env.example                    # Sample environment variables
├── pytest.ini                      # Pytest package root discovery configuration
└── README.md                       # Comprehensive backend documentation
```

---

## 3. Mathematical & Algorithmic Formulation

### 3.1 1D Discrete Kalman Filter (`services/kalman_filter.py`)
In turbulent mountain rivers, ultrasonic river gauges experience severe measurement variance due to white water rapids, splashing spray, and drifting debris.

- **State Vector**:
  $$\mathbf{x}_k = \begin{bmatrix} h_k \\ v_k \end{bmatrix}$$
  where $h_k$ is the river water level in meters, and $v_k = \frac{dh}{dt}$ is the rate of stage rise in meters per minute.

- **State Transition**:
  $$\mathbf{x}_{k|k-1} = \mathbf{F} \mathbf{x}_{k-1|k-1}$$
  $$\mathbf{F} = \begin{bmatrix} 1 & \Delta t \\ 0 & 1 \end{bmatrix}, \quad \Delta t = \frac{2}{60} \approx 0.0333 \text{ min}$$

- **State Covariance Extrapolation**:
  $$\mathbf{P}_{k|k-1} = \mathbf{F} \mathbf{P}_{k-1|k-1} \mathbf{F}^T + \mathbf{Q}$$
  where process noise $\mathbf{Q} = \begin{bmatrix} 10^{-4} & 0 \\ 0 & 10^{-3} \end{bmatrix}$.

- **Measurement Update**:
  $$\mathbf{y}_k = z_k - \mathbf{H} \mathbf{x}_{k|k-1}, \quad \mathbf{H} = \begin{bmatrix} 1 & 0 \end{bmatrix}$$
  $$\mathbf{S}_k = \mathbf{H} \mathbf{P}_{k|k-1} \mathbf{H}^T + R, \quad R = 0.04 \text{ m}^2$$
  $$\mathbf{K}_k = \mathbf{P}_{k|k-1} \mathbf{H}^T \mathbf{S}_k^{-1}$$
  $$\mathbf{x}_{k|k} = \mathbf{x}_{k|k-1} + \mathbf{K}_k \mathbf{y}_k$$
  $$\mathbf{P}_{k|k} = (\mathbf{I} - \mathbf{K}_k \mathbf{H}) \mathbf{P}_{k|k-1}$$

- **Missing Packet Coasting**: When sensor packets drop, the filter coasts using internal kinematic extrapolation $\mathbf{x}_{k|k} = \mathbf{x}_{k|k-1}$ while growing uncertainty $\mathbf{P}_{k|k} = \mathbf{P}_{k|k-1}$.

---

### 3.2 Kinematic Wave Runoff Prediction (`services/flood_prediction.py`)
Mountain flash floods are characterized by steep catchment slopes, low soil infiltration, and short concentration times.

- **Non-linear Soil Runoff Coefficient ($C$)**:
  $$C(S_{moist}) = C_{base} + \frac{C_{sat} - C_{base}}{1 + \exp\left(-12 \cdot (S_{moist}/100 - 0.70)\right)}$$
  As soil moisture $S_{moist}$ exceeds $75\%$, infiltration capacity drops asymptotically, converting up to $85\%$ of precipitation into overland runoff.

- **Catchment Inflow Rate ($I_t$)**:
  $$I(t) = C(S_{moist}) \cdot \frac{R_{eff}(t)}{3600} \cdot \left(1 + \tanh\left(\frac{t - \tau_{lag}}{\sigma_w}\right)\right)$$
  where $\tau_{lag} \approx 22\text{ minutes}$ is the valley basin concentration time lag.

- **Channel Stage Routing**:
  $$\frac{dh}{dt} = \frac{I(t) - Q_{out}(h)}{A_{channel}}, \quad Q_{out}(h) = \kappa \cdot h^{1.5}$$

---

### 3.3 Monte Carlo Risk Simulation (`services/monte_carlo.py`)
Because orographic cloudbursts exhibit extreme localized rainfall variance:

1. **Stochastic Sampling ($N = 1,000$ to $10,000$ iterations)**:
   - Rainfall perturbation: $R_i = R_{base} \cdot \max(0.1, \mathcal{N}(1.0, 0.22^2))$
   - Soil saturation perturbation: $S_i = \min(100, \max(10, S_{base} + \mathcal{N}(0, 4.0^2)))$
   - Channel friction variability: $\kappa_i = \kappa \cdot \mathcal{N}(1.0, 0.10^2)$

2. **Breach Probability ($P_{flood}$)**:
   $$P_{flood} = \frac{1}{N} \sum_{i=1}^{N} \mathbb{I}\left( \max_{t \in [1, 30]} h_i(t) \ge 3.50\text{ m} \right) \times 100\%$$

3. **Distribution Percentiles**:
   Calculates minute-by-minute $p_{10}(t), p_{25}(t), p_{50}(t), p_{75}(t), p_{90}(t), p_{95}(t)$ and 95% Confidence Interval $[CI_{low}(t), CI_{high}(t)]$.

---

### 3.4 Stateful Hysteresis Risk Engine (`services/risk_classifier.py`)
To prevent control room alarms and emergency sirens from rapid chattering when river water level oscillates near critical boundaries:

- **Four Risk Tiers**:
  - `LOW`: Probability $0\% - 20\%$ | Water Level $< 2.80\text{m}$ (Safe / Monitoring)
  - `MODERATE`: Probability $20\% - 40\%$ | Water Level $2.80\text{m} - 3.20\text{m}$ (Advisory / Vigilance)
  - `HIGH`: Probability $40\% - 70\%$ | Water Level $3.20\text{m} - 3.50\text{m}$ (Warning / Evacuation Preparation)
  - `CRITICAL`: Probability $70\% - 100\%$ | Water Level $\ge 3.50\text{m}$ (Immediate Flash Flood Evacuation)

- **Hysteresis Deadband**:
  - Escalation: **Instantaneous** (Safety-first protocol).
  - De-escalation: Requires water level to drop **below threshold by $0.20\text{m}$** and probability to drop **below tier by $5.0\%$** across consecutive evaluation cycles before downgrading.

---

### 3.5 NetworkX Dijkstra Evacuation Routing (`services/evacuation_router.py`)
Standard GPS navigation routes evacuees through the lowest-elevation valley road (directly parallel to the flooding river gorge). FloodWatch AI solves this with flood-inundation edge weighting:

- **Topological Road Graph $G = (V, E)$**:
  - Nodes $V$: Mountain valley sectors, transit bridges, high-ground ridge passes, and designated disaster shelters.
  - Edges $E$: Physical road connections with length $d$, elevation delta $\Delta z$, and base traversal time.

- **Dynamic Inundation Edge Weighting**:
  $$W(u, v) = \begin{cases} 
  10^6 \quad (\text{Blocked / Impassable}) & \text{if } h \ge 3.50\text{m} \text{ on river causeway} \\ 
  d_{uv} \cdot (1.0 + 5.0 \cdot P_{flood}/100) & \text{otherwise} 
  \end{cases}$$

- **Optimal Safe Path**:
  $$Path^* = \arg\min_{s \in Shelters} \text{Dijkstra}(G, \text{Origin}, s)$$
  When river levels exceed danger limits, low-lying river causeway routes are automatically blocked, directing citizens along the **Sector 4 Ridge Pass** to **Pine Ridge High Ground Shelter (Elevation: 1,420 m)**.

---

## 4. REST API Documentation

Base URL: `http://localhost:8000/api`

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | System health check, database status & model readiness |
| `GET` | `/sensors` | List all 5 environmental sensor stations |
| `GET` | `/sensors/live` | Current 2s Kalman-filtered telemetry packet |
| `GET` | `/sensors/history` | Historical time-series buffer for charts |
| `GET` | `/sensors/{id}` | Specific sensor station telemetry and hardware health |
| `POST` | `/sensors` | Register new IoT gauge station |
| `POST` | `/sensors/simulate` | Ingest simulated telemetry reading |
| `GET` | `/predictions/latest` | Latest 30-minute hydrograph & 95% confidence intervals |
| `GET` | `/predictions/history` | Historical flood prediction runs |
| `POST` | `/predictions/run` | Execute ad-hoc kinematic prediction with custom parameters |
| `GET` | `/prediction` | Alias for latest prediction |
| `GET` | `/risk` | Current risk classification, confidence & hysteresis state |
| `GET` | `/risk/{location_id}` | Location-specific risk assessment |
| `GET` | `/evacuation/route` | Dijkstra safe evacuation path from origin to nearest high-ground shelter |
| `POST` | `/evacuation/route` | Compute custom evacuation route with start and target |
| `GET` | `/evacuation/shelters` | Directory of high-ground shelters, capacities & resources |
| `GET` | `/alerts` | Chronological emergency alerts feed |
| `POST` | `/alerts/test` | Trigger manual broadcast alert test |
| `POST` | `/alerts/acknowledge` | Acknowledge active emergency alert |
| `GET` | `/analytics/summary` | 24-hour summary stats (peak water level, total rain, max risk) |
| `GET` | `/analytics/history` | 24-hour analytical time-series logs |
| `GET` | `/map/sensors` | GeoJSON sensor markers with status |
| `GET` | `/map/risk-zones` | GeoJSON risk polygons with threat colors |
| `GET` | `/map/shelters` | GeoJSON shelter locations with elevation & capacity |
| `POST` | `/simulation/scenario` | Set active scenario (`normal`, `warning`, `extreme`) |
| `POST` | `/simulation/reset` | Reset simulation state to baseline |
| `POST` | `/auth/login` | Operator JWT authentication |
| `GET` | `/auth/me` | Authenticated user profile |

---

## 5. WebSocket Event Schemas

WebSocket URL: `ws://localhost:8000/ws` (or `ws://localhost:8000/api/ws`)

Clients connect and receive JSON-formatted real-time event packets:

```json
{
  "event": "sensor_update",
  "data": {
    "sensor_id": "SN-ALAK-01",
    "station_name": "Alaknanda Upstream River Gauge",
    "water_level": 1.42,
    "raw_water_level": 1.48,
    "rainfall_rate": 4.5,
    "soil_moisture": 38.2,
    "timestamp": "2026-11-01T22:30:00Z",
    "is_simulated": true,
    "data_source": "SIMULATED"
  }
}
```

```json
{
  "event": "prediction_update",
  "data": {
    "lead_time_minutes": 30,
    "peak_water_level": 3.78,
    "time_to_peak_minutes": 18,
    "flood_probability": 84.5,
    "danger_threshold_meters": 3.50,
    "hydrograph": [ ... ]
  }
}
```

```json
{
  "event": "risk_update",
  "data": {
    "risk_level": "CRITICAL",
    "flood_probability": 84.5,
    "confidence_score": 96.0,
    "hysteresis_active": true
  }
}
```

```json
{
  "event": "emergency_alert",
  "data": {
    "severity": "CRITICAL",
    "title": "FLASH FLOOD CRITICAL EMERGENCY",
    "message": "Water stage is projected to reach 3.78m (+0.28m above danger threshold). Immediate evacuation to Pine Ridge High Ground Shelter mandatory.",
    "evacuation_recommended": true
  }
}
```

---

## 6. Installation & Execution

### 6.1 Prerequisites
- Python 3.11 or higher
- PowerShell, Bash, or Zsh

### 6.2 Setup
```bash
# Clone the repository and navigate to backend directory
cd backend

# Create virtual environment (optional)
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 6.3 Run Pytest Verification
```bash
# Run the complete test suite
python -m pytest backend/tests/ -v
```

Expected output:
```
backend/tests/test_evacuation.py::test_evacuation_routing PASSED
backend/tests/test_evacuation.py::test_flood_inundation_rerouting PASSED
backend/tests/test_kalman.py::test_kalman_filter_initialization PASSED
backend/tests/test_kalman.py::test_kalman_noise_reduction PASSED
backend/tests/test_kalman.py::test_kalman_missing_packet_coasting PASSED
backend/tests/test_kalman.py::test_kalman_state_consistency PASSED
backend/tests/test_monte_carlo.py::test_monte_carlo_execution PASSED
backend/tests/test_monte_carlo.py::test_extreme_cloudburst_breach PASSED
backend/tests/test_prediction.py::test_kinematic_prediction_normal PASSED
backend/tests/test_prediction.py::test_kinematic_prediction_extreme_surge PASSED
backend/tests/test_routes.py::test_health_check PASSED
backend/tests/test_routes.py::test_sensors_endpoints PASSED
backend/tests/test_routes.py::test_prediction_endpoints PASSED
backend/tests/test_routes.py::test_risk_endpoints PASSED
backend/tests/test_routes.py::test_evacuation_endpoints PASSED
backend/tests/test_routes.py::test_alerts_endpoints PASSED
backend/tests/test_routes.py::test_map_endpoints PASSED
backend/tests/test_routes.py::test_simulation_scenario_toggle PASSED
============================== 18 passed in 20.57s ==============================
```

### 6.4 Launch FastAPI Backend Server
```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

- **API Base**: `http://127.0.0.1:8000`
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`
- **ReDoc Documentation**: `http://127.0.0.1:8000/redoc`

---

## 7. Data Simulation & Transparency Notice
All environmental sensor readings generated by the simulation engine are explicitly tagged:
- `"is_simulated": true`
- `"data_source": "SIMULATED"`

No synthetic telemetry is passed off as real-world sensor data. Models are calibrated using baseline empirical hydrological runoff curves for mountainous Himalayan basins.