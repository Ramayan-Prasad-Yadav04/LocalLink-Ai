import React, { useState } from 'react';
import { TopNavbar } from './TopNavbar';
import { Sidebar } from './Sidebar';
import { EmergencyAlertModal } from './EmergencyAlertModal';
import { useSensorData } from '../context/SensorContext';
import { PublicCitizenPage } from '../pages/PublicCitizenPage';

export function CommandCenterLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { newEmergencyModal, dismissModal, experienceMode } = useSensorData();

  if (experienceMode === 'public_citizen') {
    return (
      <div className="min-h-screen bg-[#07111F] text-slate-100 flex flex-col font-sans">
        <TopNavbar />
        <PublicCitizenPage />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07111F] text-slate-100 flex flex-col font-sans selection:bg-[#00D4FF] selection:text-slate-950">
      
      {/* 1. Universal Top Navigation Bar */}
      <TopNavbar />

      {/* 2. Command Center Viewport (Sidebar + Main Content Area) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Navigation Sidebar */}
        <Sidebar 
          collapsed={sidebarCollapsed} 
          setCollapsed={setSidebarCollapsed} 
        />

        {/* Dynamic Main Workspace Area */}
        <main className="flex-1 overflow-y-auto max-h-[calc(100vh-65px)] px-4 lg:px-8 py-6 space-y-6">
          {children}

          {/* Persistent Footer */}
          <footer className="border-t border-[#1E2D42]/80 bg-[#07111F] py-4 text-xs text-slate-500 mt-12">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#20D69A]" />
                <span className="text-slate-400 font-semibold">
                  FloodWatch AI • Early Warning & Disaster Resilience Intelligence
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">Better Future, Secure You.</span>
              </div>

              <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono">
                <span>Kalman Fusion v2.4</span>
                <span>•</span>
                <span>200 Monte Carlo Paths</span>
                <span>•</span>
                <span>Dijkstra Weighted Router</span>
                <span>•</span>
                <span>Smart India Hackathon 2026</span>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* Auto-popup modal on HIGH or CRITICAL escalation */}
      <EmergencyAlertModal
        modalData={newEmergencyModal}
        onDismiss={dismissModal}
      />

    </div>
  );
}
