import React, { memo } from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS } from '../../theme';

const GradientButton = memo(({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary', // primary, success
  fullWidth = true,
  icon,
  style,
}) => {
  const gradientColors = {
    primary: [COLORS.primary, COLORS.primaryDark],
    success: [COLORS.success, '#16A34A'],
    disabled: [COLORS.primaryMuted, COLORS.primaryMuted],
  };

  const colors = disabled || loading 
    ? gradientColors.disabled 
    : gradientColors[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[fullWidth && styles.fullWidth, style]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <Text style={styles.text}>
          {loading ? 'Please wait...' : title}
        </Text>
        {icon}
      </LinearGradient>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    borderRadius: SPACING.borderRadius,
    ...SHADOWS.button,
  },
  text: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    letterSpacing: TYPOGRAPHY.letterSpacing.wide,
  },
});

export default GradientButton;