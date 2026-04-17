import React, { useState, memo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Platform,
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, scale } from '../../theme';
import FieldLabel from '../common/FieldLabel';

const Dropdown = memo(({
  label,
  placeholder,
  value,
  options,
  onSelect,
  error,
  mandatory = true,
  disabled = false,
  onDisabledPress, // Callback when user tries to press disabled dropdown
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = useCallback(
    (item) => {
      onSelect(item);
      setIsOpen(false);
    },
    [onSelect]
  );

  const handlePress = useCallback(() => {
    if (disabled) {
      // Trigger callback if provided
      if (onDisabledPress) {
        onDisabledPress();
      }
      return;
    }
    setIsOpen(true);
  }, [disabled, onDisabledPress]);

  return (
    <View style={styles.container}>
      <FieldLabel label={label} mandatory={mandatory} />

      <TouchableOpacity
        style={[
          styles.trigger,
          error && styles.triggerError,
          disabled && styles.triggerDisabled,
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Text style={value ? styles.valueText : styles.placeholderText}>
          {value || placeholder}
        </Text>
        <Text style={styles.arrow}>▾</Text>
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>{label}</Text>

            <FlatList
              data={options}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    value === item && styles.optionActive,
                  ]}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.optionText,
                      value === item && styles.optionTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                  {value === item && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: SPACING.borderWidth,
    borderColor: COLORS.border,
    borderRadius: SPACING.borderRadiusSm,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    minHeight: SPACING.inputHeight,
  },
  triggerError: {
    borderColor: COLORS.error,
  },
  triggerDisabled: {
    backgroundColor: COLORS.gray100,
    opacity: 0.6,
  },
  placeholderText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textPlaceholder,
  },
  valueText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textPrimary,
  },
  arrow: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textTertiary,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.error,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: SPACING.xl,
    borderTopRightRadius: SPACING.xl,
    paddingBottom: Platform.OS === 'android' ? SPACING.xxl : SPACING.xxxl,
    maxHeight: SPACING.inputHeight * 7,
  },
  handle: {
    width: scale(40),
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  sheetTitle: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: COLORS.border,
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.xs,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
  },
  optionActive: {
    backgroundColor: COLORS.tealTint,
  },
  optionText: {
    fontSize: TYPOGRAPHY.fontSize.md,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textPrimary,
  },
  optionTextActive: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.primary,
  },
  checkmark: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.primary,
  },
});

export default Dropdown;