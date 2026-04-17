import React, { useState, memo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS, SPACING, TYPOGRAPHY } from '../../theme';
import { validatePhoneWithMessage } from '../../utils/validators';
import { formatPhone } from '../../utils/formatters';

const PhoneInput = memo(({ label, value, onChangeText, error, mandatory = true }) => {
  const [focused, setFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const handleBlur = useCallback(() => {
    setFocused(false);
    setTouched(true);
    
    const error = validatePhoneWithMessage(value);
    setValidationError(error);
  }, [value]);

  const handleChangeText = useCallback((text) => {
    const formatted = formatPhone(text);
    onChangeText(formatted);
    
    // Real-time validation after touched
    if (touched) {
      const error = validatePhoneWithMessage(formatted);
      setValidationError(error);
    }
  }, [onChangeText, touched]);

  const displayError = error || (touched ? validationError : null);

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {!mandatory && <Text style={styles.optional}>(Optional)</Text>}
        {mandatory && <Text style={styles.mandatory}>*</Text>}
      </View>

      <View style={[
        styles.inputWrapper, 
        focused && styles.inputFocused, 
        displayError && styles.inputError
      ]}>
        <View style={styles.prefixContainer}>
          <Icon
            name="phone"
            size={SPACING.iconSize - 2}
            color={displayError ? COLORS.error : COLORS.textTertiary}
          />
          <Text style={styles.prefixText}>+92</Text>
          <View style={styles.divider} />
        </View>

        <TextInput
          style={styles.input}
          placeholder="3001234567"
          placeholderTextColor={COLORS.textPlaceholder}
          value={value}
          onChangeText={handleChangeText}
          keyboardType="phone-pad"
          maxLength={11}
          onFocus={() => setFocused(true)}
          onBlur={handleBlur}
        />
      </View>

      {displayError && <Text style={styles.errorText}>{displayError}</Text>}
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: SPACING.borderWidth,
    borderColor: COLORS.border,
    borderRadius: SPACING.borderRadiusSm,
    paddingHorizontal: SPACING.md,
    minHeight: SPACING.inputHeight,
  },
  inputFocused: {
    borderColor: COLORS.borderFocus,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  prefixContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  prefixText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: COLORS.textTertiary,
    marginLeft: SPACING.gapSm,
    marginRight: SPACING.xs,
  },
  divider: {
    width: 1,
    height: SPACING.xl,
    backgroundColor: COLORS.border,
    marginLeft: SPACING.gapSm,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.error,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
});

export default PhoneInput;