import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, TYPOGRAPHY } from '../../theme';

const Header = memo(({ 
  onBackPress, 
  title, 
  rightText,
  step,
  totalSteps,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + SPACING.gapSm }]}>
      <TouchableOpacity
        onPress={onBackPress}
        style={styles.backButton}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      {title && <Text style={styles.title}>{title}</Text>}

      {step && totalSteps && (
        <Text style={styles.stepText}>
          Step {step} of {totalSteps}
        </Text>
      )}
      
      {rightText && <Text style={styles.rightText}>{rightText}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.background,
  },
  backButton: {
    padding: SPACING.xs,
  },
  backArrow: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.textPrimary,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: COLORS.textPrimary,
  },
  stepText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: COLORS.textSecondary,
  },
  rightText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: COLORS.primary,
  },
});

export default Header;