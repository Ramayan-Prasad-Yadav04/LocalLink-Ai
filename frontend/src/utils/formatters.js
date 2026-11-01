/**
 * Utilities and formatters for FloodWatch AI
 */

export const RISK_COLORS = {
  LOW: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400',
    badge: 'bg-emerald-500 text-slate-950 font-bold',
    glow: 'shadow-emerald-500/20',
    hex: '#10B981',
    label: 'NORMAL / LOW RISK'
  },
  MODERATE: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/40',
    text: 'text-amber-400',
    badge: 'bg-amber-500 text-slate-950 font-bold',
    glow: 'shadow-amber-500/20',
    hex: '#F59E0B',
    label: 'MODERATE ADVISORY'
  },
  HIGH: {
    bg: 'bg-orange-500/15',
    border: 'border-orange-500/50',
    text: 'text-orange-400',
    badge: 'bg-orange-500 text-slate-950 font-bold',
    glow: 'shadow-orange-500/30',
    hex: '#F97316',
    label: 'HIGH FLOOD WARNING'
  },
  CRITICAL: {
    bg: 'bg-rose-500/20',
    border: 'border-rose-500/60',
    text: 'text-rose-400',
    badge: 'bg-rose-600 text-white font-extrabold animate-pulse',
    glow: 'shadow-rose-600/40',
    hex: '#EF4444',
    label: 'CRITICAL BREACH WARNING'
  }
};

export function getRiskDetails(level = 'LOW') {
  return RISK_COLORS[level?.toUpperCase()] || RISK_COLORS.LOW;
}

export function formatWaterLevel(val) {
  if (val === undefined || val === null) return '0.00 m';
  return `${Number(val).toFixed(2)} m`;
}

export function formatRainfall(val) {
  if (val === undefined || val === null) return '0.0 mm/h';
  return `${Number(val).toFixed(1)} mm/h`;
}

export function formatSoilMoisture(val) {
  if (val === undefined || val === null) return '0.0%';
  return `${Number(val).toFixed(1)}%`;
}

export function formatPercent(val) {
  if (val === undefined || val === null) return '0.0%';
  return `${Number(val).toFixed(1)}%`;
}
