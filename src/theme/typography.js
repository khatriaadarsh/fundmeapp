import { scale } from './spacing';

export const TYPOGRAPHY = {
  // Font Families
  fontFamily: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
    extraBold: 'Inter-ExtraBold',
  },
  
  // Font Sizes
  fontSize: {
    xs: scale(11),
    sm: scale(13),
    base: scale(14),
    md: scale(15),
    lg: scale(16),
    xl: scale(18),
    xxl: scale(20),
    xxxl: scale(22),
    display: scale(26),
    hero: scale(32),
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Letter Spacing
  letterSpacing: {
    tight: -0.3,
    normal: 0,
    wide: 0.3,
    wider: 0.5,
  },
};