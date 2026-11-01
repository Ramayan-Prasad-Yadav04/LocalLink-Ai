import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';
import { audioService } from '../services/audioService';

export function useSensorData(pollingIntervalMs = 2000) {
  const [systemStatus, setSystemStatus] = useState('ONLINE'); // ONLINE | OFFLINE
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(0);
  
  // Data states
  const [liveSensor, setLiveSensor] = useState({
    timestamp: '--:--:--',
    rainfall: 5.0,
    soil_moisture: 38.0,
    water_level: 1.35,
    raw_water_level: 1.37,
    rate_of_rise: 0.001,
    station_id: 'RIVER-GAUGE-01',
    station_name: 'Alaknanda Basin Upstream Gauge'
  });

  const [history, setHistory] = useState([]);
  
  const [prediction, setPrediction] = useState({
    prediction_minutes: 30,
    current_water_level: 1.35,
    mean_water_level: 1.40,
    time_series: [],
    flood_probability: 0.0,
    confidence_interval: { lower: 1.25, upper: 1.55 },
    danger_threshold: 3.5,
    risk_level: 'LOW',
    monte_carlo_scenarios: 200,
    estimated_time_to_breach_min: null,
    trend: 'stable'
  });

  const [risk, setRisk] = useState({
    risk_level: 'LOW',
    raw_risk_level: 'LOW',
    flood_probability: 0.0,
    current_water_level: 1.35,
    predicted_water_level_30m: 1.40,
    confidence_interval: { lower: 1.25, upper: 1.55 },
    explanation: 'Situation normal. River discharge and soil saturation within baseline capacity.',
    recommended_action: 'Routine hydrometric observation active. No public action needed.',
    color_code: '#10B981',
    hysteresis_active: false
  });

  const [sensors, setSensors] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [evacuationRoute, setEvacuationRoute] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [currentScenario, setCurrentScenario] = useState('normal');
  const [isScenarioLoading, setIsScenarioLoading] = useState(false);
  const [newEmergencyModal, setNewEmergencyModal] = useState(null);

  const prevRiskRef = useRef('LOW');
  const isFetchingRef = useRef(false);

  // Fetch all live operational data
  const fetchData = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const [liveRes, histRes, predRes, riskRes, routeRes, alertsRes] = await Promise.all([
        api.getLiveSensors(),
        api.getSensorHistory(),
        api.getPrediction(),
        api.getRisk(),
        api.getEvacuationRoute(),
        api.getAlerts()
      ]);

      setLiveSensor(liveRes);
      setHistory(histRes.readings || []);
      setPrediction(predRes);
      setRisk(riskRes);
      setEvacuationRoute(routeRes);
      setAlerts(alertsRes || []);
      
      setSystemStatus('ONLINE');
      setLastUpdated(new Date());
      setSecondsSinceUpdate(0);

      // Check for escalation to HIGH or CRITICAL to trigger alarm and modal
      const newRisk = riskRes.risk_level;
      if ((newRisk === 'HIGH' || newRisk === 'CRITICAL') && prevRiskRef.current !== newRisk) {
        if (newRisk === 'CRITICAL') {
          audioService.startSiren();
        }
        setNewEmergencyModal({
          risk_level: newRisk,
          title: riskRes.title || `${newRisk} FLOOD RISK DETECTED`,
          message: riskRes.explanation || riskRes.standard_message,
          action: riskRes.recommended_action,
          timestamp: new Date().toLocaleTimeString()
        });
      } else if (newRisk === 'LOW' && (prevRiskRef.current === 'HIGH' || prevRiskRef.current === 'CRITICAL')) {
        audioService.stopSiren();
      }

      prevRiskRef.current = newRisk;
    } catch (err) {
      console.warn('Backend polling error:', err.message);
      setSystemStatus('OFFLINE');
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  // Fetch initial static map data (sensors, shelters)
  useEffect(() => {
    async function loadMapData() {
      try {
        const [sensorLocs, shelterList] = await Promise.all([
          api.getMapSensors(),
          api.getMapShelters()
        ]);
        setSensors(sensorLocs || []);
        setShelters(shelterList || []);
      } catch (err) {
        console.warn('Failed to load initial map markers:', err);
      }
    }
    loadMapData();
  }, []);

  // Set up 2-second real-time polling
  useEffect(() => {
    fetchData(); // Immediate initial fetch
    const interval = setInterval(fetchData, pollingIntervalMs);
    return () => clearInterval(interval);
  }, [fetchData, pollingIntervalMs]);

  // Seconds counter timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsSinceUpdate(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Scenario switchers for Demo Mode
  const handleScenarioChange = async (scenario) => {
    setIsScenarioLoading(true);
    try {
      await api.setSimulationScenario(scenario);
      setCurrentScenario(scenario);
      await fetchData(); // Force immediate refresh
    } catch (err) {
      console.error('Failed to change scenario:', err);
    } finally {
      setIsScenarioLoading(false);
    }
  };

  const handleResetSimulation = async () => {
    setIsScenarioLoading(true);
    try {
      await api.resetSimulation();
      setCurrentScenario('normal');
      audioService.stopSiren();
      await fetchData();
    } catch (err) {
      console.error('Failed to reset simulation:', err);
    } finally {
      setIsScenarioLoading(false);
    }
  };

  const dismissModal = () => {
    setNewEmergencyModal(null);
  };

  return {
    systemStatus,
    lastUpdated,
    secondsSinceUpdate,
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
    newEmergencyModal,
    dismissModal,
    handleScenarioChange,
    handleResetSimulation,
    refetch: fetchData
  };
}
