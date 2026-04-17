// src/theme/theme.js
import { Dimensions } from 'react-native';

export const { width: SW, height: SH } = Dimensions.get('window');
export const sp = n => (SW / 375) * n;

export const URGENT_W = SW * 0.62;

export const GRADIENTS = {
  teal: ['#00B4CC', '#0097AA'],
  green: ['#059669', '#10B981'], // Darker/Med Green
  red: ['#EF4444', '#DC2626'],
};

export const P = {
  bg: '#F4F5F7',
  white: '#FFFFFF',
  teal: '#00B4CC',
  tealDark: '#0097AA',
  tealLight: 'rgba(0,180,204,0.10)',
  bannerFrom: '#0A3D62',
  bannerTo: '#15AABF',
  dark: '#111827',
  gray: '#6B7280',
  light: '#9CA3AF',
  border: '#E5E7EB',
  searchBg: '#F3F4F6',
  red: '#EF4444',
  darkOcean: '#0A3D62',

  categoryColors: {
    medical: { bg: '#EFF6FF', text: '#3B82F6' },
    education: { bg: '#F0FDF4', text: '#16A34A' },
    emergency: { bg: '#FFF7ED', text: '#EA580C' },
    food: { bg: '#FEF9C3', text: '#CA8A04' },
    shelter: { bg: '#F5F3FF', text: '#7C3AED' },
    default: { bg: '#F3F4F6', text: '#6B7280' },
  },
};