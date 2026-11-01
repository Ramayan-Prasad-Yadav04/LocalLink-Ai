import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';
import { audioService } from '../services/audioService';
import { 
  WaterLevelKalmanFilter, 
  ScalarKalmanFilter, 
  runDijkstra, 
  runMonteCarloSimulation, 
  classifyRisk, 
  MOUNTAIN_ROAD_GRAPH 
} from '../services/simulationEngine';

const SensorContext = createContext(null);

export const MONITORING_REGIONS = [
  { id: 'chamoli', name: 'Chamoli District – Alaknanda Valley', state: 'Uttarakhand', lat: 30.155, lon: 78.790, dangerLevel: 3.5 },
  { id: 'kedarnath', name: 'Kedarnath Basin – Mandakini River', state: 'Uttarakhand', lat: 30.142, lon: 78.805, dangerLevel: 3.4 },
  { id: 'kullu', name: 'Kullu Valley – Beas River Basin', state: 'Himachal Pradesh', lat: 31.957, lon: 77.109, dangerLevel: 3.8 },
  { id: 'wayanad', name: 'Wayanad Hills – Chaliyar Basin', state: 'Kerala', lat: 11.685, lon: 76.132, dangerLevel: 3.2 }
];

export function SensorProvider({ children }) {
  const [systemStatus, setSystemStatus] = useState('ONLINE');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(0);
  const [pollingIntervalMs, setPollingIntervalMs] = useState(2000);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Region and Experience Mode
  const [selectedRegion, setSelectedRegion] = useState(MONITORING_REGIONS[0]);
  const [experienceMode, setExperienceMode] = useState('command_center'); // 'command_center' | 'public_citizen'
  const [selectedOriginVillage, setSelectedOriginVillage] = useState('LOC-AFFECTED');

  // Audio siren states
  const [isMuted, setIsMuted] = useState(false);
  const [isSirenTesting, setIsSirenTesting] = useState(false);

  // Active monitored sensor / inspection drawer
  const [selectedSensor, setSelectedSensor] = useState(null);

  // Simulation controls & custom overrides
  const [currentScenario, setCurrentScenario] = useState('normal'); // 'normal' | 'heavy' | 'extreme' | 'flash_breach'
  const [isScenarioLoading, setIsScenarioLoading] = useState(false);
  const [customOverrides, setCustomOverrides] = useState({
    enabled: false,
    rainfall: 5.4,
    water_level: 1.34,
    soil_moisture: 38.2
  });
  const [kalmanParams, setKalmanParams] = useState({
    processVar: 0.002,
    measureVar: 0.04
  });

  // Client-side Kalman filters
  const kalmanWaterRef = useRef(new WaterLevelKalmanFilter(2.0 / 60.0, 0.002, 0.04));
  const kalmanRainRef = useRef(new ScalarKalmanFilter(5.4, 0.02, 0.15));
  const kalmanSoilRef = useRef(new ScalarKalmanFilter(38.2, 0.01, 0.1));

  // Core live telemetry state
  const [liveSensor, setLiveSensor] = useState({
    timestamp: new Date().toLocaleTimeString(),
    rainfall: 5.4,
    raw_rainfall: 5.8,
    soil_moisture: 38.2,
    raw_soil_moisture: 39.1,
    water_level: 1.34,
    raw_water_level: 1.39,
    rate_of_rise: 0.001,
    station_id: 'RIVER-GAUGE-01',
    station_name: 'Alaknanda Basin Upstream Gauge',
    battery_pct: 95,
    signal_rssi: -66,
    data_confidence: 98.4
  });

  const [history, setHistory] = useState(() => {
    // Initial 15 history points
    const now = Date.now();
    return Array.from({ length: 15 }, (_, i) => {
      const t = new Date(now - (14 - i) * 60000).toLocaleTimeString();
      return {
        timestamp: t,
        time: t,
        water_level: Number((1.30 + Math.sin(i * 0.4) * 0.05).toFixed(2)),
        raw_water_level: Number((1.30 + Math.sin(i * 0.4) * 0.05 + (Math.random() - 0.5) * 0.08).toFixed(2)),
        rainfall: Number((5.0 + Math.sin(i * 0.3) * 0.8).toFixed(1)),
        soil_moisture: Number((37.5 + i * 0.08).toFixed(1)),
        rate_of_rise: 0.001
      };
    });
  });

  const [prediction, setPrediction] = useState(() => {
    return runMonteCarloSimulation(1.34, 5.4, 38.2, 0.001, 3.5, 200, 30);
  });

  const [risk, setRisk] = useState(() => {
    return classifyRisk(0.0, 1.34, 3.5, 0.001);
  });

  const [sensors, setSensors] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [evacuationRoute, setEvacuationRoute] = useState(() => {
    return runDijkstra('LOC-AFFECTED', 1.34, 'LOW');
  });

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      timestamp: new Date().toLocaleTimeString(),
      risk_level: "LOW",
      type: "Baseline Nominal",
      title: "Hydrometric Baseline Nominal",
      location: "Alaknanda Basin (Chamoli)",
      message: "River stream levels in Alaknanda & Mandakini valleys operating within normal hydrological flow range.",
      recommended_action: "Routine automated monitoring continuing across all hydrometric telemetry stations.",
      siren_triggered: false,
      acknowledged: true
    }
  ]);

  const [newEmergencyModal, setNewEmergencyModal] = useState(null);

  const prevRiskRef = useRef('LOW');
  const isFetchingRef = useRef(false);

  // Siren helpers
  const toggleMute = () => {
    const muted = audioService.toggleMute();
    setIsMuted(muted);
    return muted;
  };

  const testSiren = (seconds = 3) => {
    setIsSirenTesting(true);
    audioService.testSiren(seconds);
    setTimeout(() => setIsSirenTesting(false), seconds * 1000 + 100);
  };

  // Clock ticker
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  // Update Kalman Filter noise params when changed in Settings
  useEffect(() => {
    kalmanWaterRef.current.setNoiseParameters(kalmanParams.processVar, kalmanParams.measureVar);
  }, [kalmanParams]);

  // Client-side simulation tick generator
  const stepClientSimulation = useCallback(() => {
    let targetRain = 5.4;
    let targetWater = 1.34;
    let targetSoil = 38.2;
    let targetRise = 0.001;

    if (customOverrides.enabled) {
      targetRain = customOverrides.rainfall;
      targetWater = customOverrides.water_level;
      targetSoil = customOverrides.soil_moisture;
      targetRise = (targetWater - liveSensor.water_level) * 0.1;
    } else {
      switch (currentScenario) {
        case 'heavy':
          targetRain = 46.5 + (Math.sin(Date.now() / 4000) * 8);
          targetWater = 2.68 + (Math.sin(Date.now() / 6000) * 0.12);
          targetSoil = 73.5 + (Math.sin(Date.now() / 8000) * 2.5);
          targetRise = 0.025;
          break;
        case 'extreme':
          targetRain = 115.0 + (Math.sin(Date.now() / 3000) * 14);
          targetWater = 3.78 + (Math.sin(Date.now() / 5000) * 0.22);
          targetSoil = 91.5 + (Math.sin(Date.now() / 7000) * 2.0);
          targetRise = 0.065;
          break;
        case 'flash_breach':
          targetRain = 142.0 + (Math.sin(Date.now() / 2500) * 18);
          targetWater = 4.35 + (Math.sin(Date.now() / 4000) * 0.3);
          targetSoil = 97.2 + (Math.sin(Date.now() / 5000) * 1.5);
          targetRise = 0.095;
          break;
        case 'normal':
        default:
          targetRain = 5.4 + (Math.sin(Date.now() / 5000) * 1.5);
          targetWater = 1.34 + (Math.sin(Date.now() / 7000) * 0.05);
          targetSoil = 38.2 + (Math.sin(Date.now() / 9000) * 1.2);
          targetRise = 0.001;
          break;
      }
    }

    // Add acoustic and sensor bounce noise
    const noiseWater = (Math.random() - 0.5) * 0.12;
    const noiseRain = (Math.random() - 0.5) * 1.4;
    const noiseSoil = (Math.random() - 0.5) * 0.8;

    const rawWater = Math.max(0.1, Number((targetWater + noiseWater).toFixed(2)));
    const rawRain = Math.max(0.0, Number((targetRain + noiseRain).toFixed(1)));
    const rawSoil = Math.max(5.0, Math.min(99.0, Number((targetSoil + noiseSoil).toFixed(1))));

    // Run Kalman Filters
    const { filteredLevel, rateOfRise } = kalmanWaterRef.current.update(rawWater);
    const filteredRain = kalmanRainRef.current.update(rawRain);
    const filteredSoil = kalmanSoilRef.current.update(rawSoil);

    const nowStr = new Date().toLocaleTimeString();
    const newLive = {
      timestamp: nowStr,
      rainfall: filteredRain,
      raw_rainfall: rawRain,
      soil_moisture: filteredSoil,
      raw_soil_moisture: rawSoil,
      water_level: filteredLevel,
      raw_water_level: rawWater,
      rate_of_rise: rateOfRise,
      station_id: 'RIVER-GAUGE-01',
      station_name: `${selectedRegion.name} Station`,
      battery_pct: Math.max(88, 95 - Math.floor((Date.now() / 100000) % 7)),
      signal_rssi: -66 - Math.floor((Date.now() / 15000) % 6),
      data_confidence: Number((98.5 - Math.abs(rawWater - filteredLevel) * 15).toFixed(1))
    };

    setLiveSensor(newLive);

    // Update history
    setHistory((prev) => {
      const updated = [...prev, {
        timestamp: nowStr,
        time: nowStr,
        water_level: filteredLevel,
        raw_water_level: rawWater,
        rainfall: filteredRain,
        soil_moisture: filteredSoil,
        rate_of_rise: rateOfRise
      }];
      if (updated.length > 30) updated.shift();
      return updated;
    });

    // Run Monte Carlo Forecast
    const newPred = runMonteCarloSimulation(
      filteredLevel, 
      filteredRain, 
      filteredSoil, 
      rateOfRise, 
      selectedRegion.dangerLevel, 
      200, 
      30
    );
    setPrediction(newPred);

    // Dynamic Risk Assessment
    const newRisk = classifyRisk(newPred.flood_probability, filteredLevel, selectedRegion.dangerLevel, rateOfRise);
    setRisk(newRisk);

    // Dynamic Dijkstra Route
    const newRoute = runDijkstra(selectedOriginVillage, filteredLevel, newRisk.risk_level);
    setEvacuationRoute(newRoute);

    // Escalation alerts & siren
    const curRiskLvl = newRisk.risk_level;
    if ((curRiskLvl === 'HIGH' || curRiskLvl === 'CRITICAL') && prevRiskRef.current !== curRiskLvl) {
      if (curRiskLvl === 'CRITICAL' && !isMuted) {
        audioService.startSiren();
      }

      const alertTitle = curRiskLvl === 'CRITICAL' ? 'CRITICAL FLASH FLOOD BREACH WARNING' : 'HIGH DISASTER RISK ALERT';
      setNewEmergencyModal({
        risk_level: curRiskLvl,
        title: alertTitle,
        message: newRisk.explanation,
        action: newRisk.recommended_action,
        timestamp: nowStr
      });

      // Append new emergency alert
      setAlerts(prev => [
        {
          id: Date.now(),
          timestamp: nowStr,
          risk_level: curRiskLvl,
          type: curRiskLvl === 'CRITICAL' ? 'Critical Flood Alert' : 'Rapid Water Level Rise',
          title: alertTitle,
          location: selectedRegion.name,
          message: newRisk.explanation,
          recommended_action: newRisk.recommended_action,
          siren_triggered: curRiskLvl === 'CRITICAL',
          acknowledged: false
        },
        ...prev
      ]);
    } else if (curRiskLvl === 'LOW' && (prevRiskRef.current === 'HIGH' || prevRiskRef.current === 'CRITICAL')) {
      audioService.stopSiren();
    }

    prevRiskRef.current = curRiskLvl;
    setLastUpdated(new Date());
    setSecondsSinceUpdate(0);
  }, [customOverrides, currentScenario, liveSensor.water_level, selectedRegion, selectedOriginVillage, isMuted]);

  // Fetch telemetry from backend or fall back smoothly to client simulation
  const fetchData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      // Attempt backend call
      const [liveRes, histRes, predRes, riskRes, routeRes, alertsRes] = await Promise.all([
        api.getLiveSensors(),
        api.getSensorHistory(),
        api.getPrediction(),
        api.getRisk(),
        api.getEvacuationRoute(),
        api.getAlerts()
      ]);

      // If backend responded with non-fallback live telemetry
      if (liveRes && liveRes.water_level !== undefined && !apiClientFallbackDetected(liveRes)) {
        setLiveSensor(liveRes);
        if (histRes?.readings?.length > 0) setHistory(histRes.readings);
        if (predRes) setPrediction(predRes);
        if (riskRes) setRisk(riskRes);
        if (routeRes) setEvacuationRoute(routeRes);
        if (alertsRes) setAlerts(alertsRes);
        setSystemStatus('ONLINE');
        setLastUpdated(new Date());
        setSecondsSinceUpdate(0);
      } else {
        // Run autonomous client-side mathematical simulation
        stepClientSimulation();
        setSystemStatus('SIMULATION ACTIVE');
      }
    } catch (err) {
      // In case of error/network fail, run client simulation
      stepClientSimulation();
      setSystemStatus('SIMULATION ACTIVE');
    } finally {
      isFetchingRef.current = false;
    }
  }, [stepClientSimulation]);

  function apiClientFallbackDetected(liveRes) {
    // If it is the default static fallback, run client-side simulation to keep values moving realistically
    return liveRes.timestamp === '--:--:--';
  }

  // Load static map markers (sensors, shelters)
  useEffect(() => {
    async function loadMapData() {
      try {
        const [sensorLocs, shelterList] = await Promise.all([
          api.getMapSensors(),
          api.getMapShelters()
        ]);
        if (sensorLocs && sensorLocs.length > 0) setSensors(sensorLocs);
        if (shelterList && shelterList.length > 0) setShelters(shelterList);
      } catch (err) {
        console.warn('Map initialization:', err);
      }
    }
    loadMapData();
  }, []);

  // Polling loop
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, pollingIntervalMs);
    return () => clearInterval(interval);
  }, [fetchData, pollingIntervalMs]);

  // Seconds since update timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsSinceUpdate((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Scenario handlers
  const handleScenarioChange = async (scenario) => {
    setIsScenarioLoading(true);
    setCurrentScenario(scenario);
    setCustomOverrides(prev => ({ ...prev, enabled: false }));

    try {
      await api.setSimulationScenario(scenario);
    } catch (err) {
      // Handled in client simulation
    } finally {
      setIsScenarioLoading(false);
      stepClientSimulation();
    }
  };

  const handleResetSimulation = async () => {
    setIsScenarioLoading(true);
    setCurrentScenario('normal');
    setCustomOverrides({
      enabled: false,
      rainfall: 5.4,
      water_level: 1.34,
      soil_moisture: 38.2
    });
    audioService.stopSiren();
    kalmanWaterRef.current.reset(1.34);
    kalmanRainRef.current.reset(5.4);
    kalmanSoilRef.current.reset(38.2);

    try {
      await api.resetSimulation();
    } catch (err) {
      // Handled in client simulation
    } finally {
      setIsScenarioLoading(false);
      stepClientSimulation();
    }
  };

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      await api.acknowledgeAlert(alertId);
    } catch (err) {
      // Handled
    }
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a))
    );
  };

  const dismissModal = () => {
    setNewEmergencyModal(null);
  };

  // Re-run Dijkstra whenever user changes origin village or shelter target
  const changeOriginVillage = (originId) => {
    setSelectedOriginVillage(originId);
    const newRoute = runDijkstra(originId, liveSensor.water_level, risk.risk_level);
    setEvacuationRoute(newRoute);
  };

  // Manual sliders
  const updateCustomOverrides = (overrides) => {
    setCustomOverrides(prev => ({
      ...prev,
      ...overrides,
      enabled: true
    }));
  };

  // Computed metrics
  const activeWarningCount = alerts.filter(
    (a) => !a.acknowledged && (a.risk_level === 'HIGH' || a.risk_level === 'CRITICAL')
  ).length;

  const monitoredLocationsCount = sensors.length > 0 ? sensors.length : 5;

  return (
    <SensorContext.Provider
      value={{
        systemStatus,
        lastUpdated,
        secondsSinceUpdate,
        currentTime,
        pollingIntervalMs,
        setPollingIntervalMs,
        selectedRegion,
        setSelectedRegion,
        experienceMode,
        setExperienceMode,
        selectedOriginVillage,
        setSelectedOriginVillage: changeOriginVillage,
        liveSensor,
        history,
        prediction,
        risk,
        sensors,
        shelters,
        evacuationRoute,
        alerts,
        currentScenario,
        isScenarioLoading,
        customOverrides,
        updateCustomOverrides,
        kalmanParams,
        setKalmanParams,
        newEmergencyModal,
        dismissModal,
        handleScenarioChange,
        handleResetSimulation,
        handleAcknowledgeAlert,
        refetch: fetchData,
        selectedSensor,
        setSelectedSensor,
        isMuted,
        isSirenTesting,
        toggleMute,
        testSiren,
        activeWarningCount,
        monitoredLocationsCount
      }}
    >
      {children}
    </SensorContext.Provider>
  );
}

export function useSensorData() {
  const context = useContext(SensorContext);
  if (!context) {
    throw new Error('useSensorData must be used within a SensorProvider');
  }
  return context;
}
