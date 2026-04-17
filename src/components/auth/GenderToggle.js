import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../theme';
import FieldLabel from '../common/FieldLabel';

const GENDERS = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
  { id: 'other', label: 'Other' },
];

const GenderToggle = memo(({ value, onChange, error, mandatory = true }) => {
  return (
    <View style={styles.container}>
      <FieldLabel label="Gender" mandatory={mandatory} />

      <View style={styles.buttonRow}>
        {GENDERS.map((gender) => (
          <TouchableOpacity
            key={gender.id}
            style={[
              styles.button,
              value === gender.id && styles.buttonActive,
            ]}
            onPress={() => onChange(gender.id)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.buttonText,
                value === gender.id && styles.buttonTextActive,
              ]}
            >
              {gender.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  button: {
    flex: 1,
    height: SPACING.inputHeight - SPACING.sm,
    borderRadius: SPACING.borderRadiusSm,
    borderWidth: SPACING.borderWidth,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  buttonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: COLORS.textSecondary,
  },
  buttonTextActive: {
    color: COLORS.white,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.error,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
});

export default GenderToggle;