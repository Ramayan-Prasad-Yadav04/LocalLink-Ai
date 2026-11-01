import React, { createContext, useContext, useState, useEffect } from 'react';
import { CityLocation } from '../types';
import { CITIES } from '../data/mockData';

interface LocationContextType {
  currentCity: CityLocation;
  userCoords: { lat: number; lng: number } | null;
  isLocating: boolean;
  locationError: string | null;
  selectCity: (cityId: string) => void;
  requestCurrentLocation: () => Promise<void>;
  locationLabel: string;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentCity, setCurrentCity] = useState<CityLocation>(() => {
    const saved = localStorage.getItem('locallink_current_city');
    if (saved) {
      const found = CITIES.find((c) => c.id === saved);
      if (found) return found;
    }
    return CITIES[0]; // Bengaluru default
  });

  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>({
    lat: currentCity.lat,
    lng: currentCity.lng,
  });
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isCustomGps, setIsCustomGps] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('locallink_current_city', currentCity.id);
    if (!isCustomGps) {
      setUserCoords({ lat: currentCity.lat, lng: currentCity.lng });
    }
  }, [currentCity, isCustomGps]);

  const selectCity = (cityId: string) => {
    const found = CITIES.find((c) => c.id === cityId);
    if (found) {
      setCurrentCity(found);
      setIsCustomGps(false);
      setUserCoords({ lat: found.lat, lng: found.lng });
      setLocationError(null);
    }
  };

  const requestCurrentLocation = async (): Promise<void> => {
    setIsLocating(true);
    setLocationError(null);

    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        setLocationError('Geolocation is not supported by your browser');
        setIsLocating(false);
        resolve();
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserCoords({ lat: latitude, lng: longitude });
          setIsCustomGps(true);
          setIsLocating(false);
          resolve();
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
          // Graceful fallback: Keep city location and notify
          setLocationError('Unable to retrieve your exact GPS position. Using nearest city hub.');
          setIsLocating(false);
          resolve();
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 60000 }
      );
    });
  };

  const locationLabel = isCustomGps ? 'Current GPS Location' : `${currentCity.area}, ${currentCity.name}`;

  return (
    <LocationContext.Provider
      value={{
        currentCity,
        userCoords,
        isLocating,
        locationError,
        selectCity,
        requestCurrentLocation,
        locationLabel,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
