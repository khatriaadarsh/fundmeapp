import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const baseWidth = 375;

// Responsive scaling
export const scale = (size) => (width / baseWidth) * size;

export const SPACING = {
  // Base spacing units
  xs: scale(4),
  sm: scale(8),
  md: scale(12),
  lg: scale(16),
  xl: scale(20),
  xxl: scale(24),
  xxxl: scale(32),
  
  // Specific use cases
  screenPadding: scale(22),
  cardPadding: scale(16),
  inputHeight: scale(54),
  buttonHeight: scale(52),
  iconSize: scale(20),
  
  // Gaps
  gapXs: scale(4),
  gapSm: scale(8),
  gapMd: scale(12),
  gapLg: scale(16),
  
  // Borders
  borderRadius: scale(10),
  borderRadiusSm: scale(8),
  borderRadiusLg: scale(12),
  borderWidth: 1.5,
};