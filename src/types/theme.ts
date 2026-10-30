export interface IChartTheme {
  background: string;
  axisLine: string;
  gridLine: string;
  textPrimary: string;
  textSecondary: string;
  tooltipBg: string;
  tooltipText: string;
  tooltipBorder: string;
  fallbackColors: string[];
}

export const LIGHT_THEME: IChartTheme = {
  background: '#ffffff',
  axisLine: '#d1d5db',
  gridLine: '#eee', //'#f3f4f6',
  textPrimary: '#1f2937',
  textSecondary: '#4b5563',
  tooltipBg: 'rgba(255, 255, 255, 0.95)',
  tooltipText: '#1f2937',
  tooltipBorder: '#e5e7eb',
  fallbackColors: ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
};

export const DARK_THEME: IChartTheme = {
  background: '#111827',
  axisLine: '#374151',
  gridLine: '#1f2937',
  textPrimary: '#f9fafb',
  textSecondary: '#9ca3af',
  tooltipBg: 'rgba(17, 24, 39, 0.95)',
  tooltipText: '#f9fafb',
  tooltipBorder: '#374151',
  fallbackColors: ['#3b82f6', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#f472b6']
};
