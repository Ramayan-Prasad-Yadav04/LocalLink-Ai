import React, { createContext, useContext, useState, useEffect } from 'react';
import { Provider } from '../types';
import { INITIAL_PROVIDERS } from '../data/mockData';

interface CompareContextType {
  comparedIds: string[];
  comparedProviders: Provider[];
  addToCompare: (provider: Provider) => void;
  removeFromCompare: (providerId: string) => void;
  toggleCompare: (provider: Provider) => void;
  isInCompare: (providerId: string) => boolean;
  clearCompare: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [comparedIds, setComparedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('locallink_compare_ids');
      return saved ? JSON.parse(saved) : ['prov-1', 'prov-2'];
    } catch {
      return ['prov-1', 'prov-2'];
    }
  });

  useEffect(() => {
    localStorage.setItem('locallink_compare_ids', JSON.stringify(comparedIds));
  }, [comparedIds]);

  const comparedProviders = INITIAL_PROVIDERS.filter((p) => comparedIds.includes(p.id));

  const addToCompare = (provider: Provider) => {
    if (comparedIds.includes(provider.id)) return;
    if (comparedIds.length >= 4) {
      alert('You can compare a maximum of 4 providers at a time.');
      return;
    }
    setComparedIds([...comparedIds, provider.id]);
  };

  const removeFromCompare = (providerId: string) => {
    setComparedIds(comparedIds.filter((id) => id !== providerId));
  };

  const toggleCompare = (provider: Provider) => {
    if (comparedIds.includes(provider.id)) {
      removeFromCompare(provider.id);
    } else {
      addToCompare(provider);
    }
  };

  const isInCompare = (providerId: string): boolean => {
    return comparedIds.includes(providerId);
  };

  const clearCompare = () => {
    setComparedIds([]);
  };

  return (
    <CompareContext.Provider
      value={{
        comparedIds,
        comparedProviders,
        addToCompare,
        removeFromCompare,
        toggleCompare,
        isInCompare,
        clearCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
};
