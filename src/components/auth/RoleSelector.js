import React, { memo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, scale } from '../../theme';

const ROLES = [
  { id: 'donor', label: '🤍  Donor', description: 'Support campaigns' },
  { id: 'creator', label: '📋  Creator', description: 'Create fundraisers' },
  { id: 'user', label: '👤  User', description: 'Browse & explore' },
];

const RoleSelector = memo(({ value, onChange, error }) => {
  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>I want to be a</Text>
        <Text style={styles.mandatory}>*</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {ROLES.map((role, index) => (
          <TouchableOpacity
            key={role.id}
            style={[
              styles.roleCard,
              value === role.id && styles.roleCardActive,
              index === 0 && styles.firstCard,
              index === ROLES.length - 1 && styles.lastCard,
            ]}
            onPress={() => onChange(role.id)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.roleLabel,
                value === role.id && styles.roleLabelActive,
              ]}
            >
              {role.label}
            </Text>
            <Text
              style={[
                styles.roleDescription,
                value === role.id && styles.roleDescriptionActive,
              ]}
            >
              {role.description}
            </Text>

            {/* Selection indicator */}
            {value === role.id && (
              <View style={styles.selectedIndicator} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: COLORS.gray700,
  },
  mandatory: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.error,
    marginLeft: SPACING.xs,
  },
  scrollView: {
    marginHorizontal: -SPACING.screenPadding,
  },
  scrollContent: {
    paddingHorizontal: SPACING.screenPadding,
  },
  roleCard: {
    width: scale(140),
    height: scale(54), // FIXED: Same as original
    marginRight: SPACING.sm,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: SPACING.borderRadiusSm,
    borderWidth: SPACING.borderWidth,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    position: 'relative',
  },
  firstCard: {
    // No additional margin
  },
  lastCard: {
    marginRight: 0,
  },
  roleCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.tealTint,
  },
  roleLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  roleLabelActive: {
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  roleDescription: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textTertiary,
  },
  roleDescriptionActive: {
    color: COLORS.primaryDark,
  },
  selectedIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: SPACING.borderRadiusSm,
    borderBottomRightRadius: SPACING.borderRadiusSm,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.error,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
});

export default RoleSelector;