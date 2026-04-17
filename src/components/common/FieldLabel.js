import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../theme';

const FieldLabel = memo(({ label, mandatory = true, optional = false }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {optional && <Text style={styles.optional}>(Optional)</Text>}
      {mandatory && !optional && <Text style={styles.mandatory}>*</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.gapSm,
    marginLeft: SPACING.xs,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: COLORS.gray700,
  },
  optional: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  mandatory: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.error,
    marginLeft: SPACING.xs,
  },
});

export default FieldLabel;