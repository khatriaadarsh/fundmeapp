import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, scale } from '../../theme';

const SecurityBanner = memo(({ onDismiss }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔒</Text>
      <Text style={styles.text}>
        Your data is encrypted with bank-level security
      </Text>
      {onDismiss && (
        <TouchableOpacity
          onPress={onDismiss}
          style={styles.closeButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0D3B4A',
    borderRadius: SPACING.borderRadius,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    marginTop: SPACING.xl,
    gap: SPACING.sm,
  },
  icon: {
    fontSize: TYPOGRAPHY.fontSize.lg,
  },
  text: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    color: COLORS.white,
    lineHeight: TYPOGRAPHY.fontSize.sm * 1.5,
  },
  closeButton: {
    width: scale(26),
    height: scale(26),
    borderRadius: scale(13),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.white,
  },
});

export default SecurityBanner;