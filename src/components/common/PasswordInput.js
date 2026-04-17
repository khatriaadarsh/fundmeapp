import React, { useState, memo, useMemo, useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import InputField from './InputField';
import { COLORS, SPACING, TYPOGRAPHY, scale } from '../../theme';
import { 
  getPasswordStrength, 
  validatePasswordWithMessage, 
  validatePasswordMatch 
} from '../../utils/validators';

const PasswordInput = memo(({ 
  label, 
  value, 
  onChangeText, 
  error,
  showStrength = false,
  isConfirmPassword = false,
  originalPassword = '',
  containerStyle,
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const strength = useMemo(() => {
    if (!showStrength || !value) return null;
    return getPasswordStrength(value);
  }, [value, showStrength]);

  const validator = useCallback((val) => {
    if (isConfirmPassword) {
      return validatePasswordMatch(originalPassword, val);
    }
    return validatePasswordWithMessage(val);
  }, [isConfirmPassword, originalPassword]);

  return (
    <InputField
      label={label}
      placeholder={isConfirmPassword ? "Confirm password" : "Password"}
      value={value}
      onChangeText={onChangeText}
      leftIcon="lock"
      secureTextEntry={!showPassword}
      autoCapitalize="none"
      error={error}
      validator={validator}
      showValidationOnChange={true}
      containerStyle={containerStyle}
      rightElement={
        <View style={styles.rightContainer}>
          {strength && (
            <View style={[styles.strengthBadge, { backgroundColor: `${strength.color}15` }]}>
              <Text style={[styles.strengthText, { color: strength.color }]}>
                {strength.text}
              </Text>
            </View>
          )}
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.eyeButton}
          >
            <Icon
              name={showPassword ? 'eye' : 'eye-off'}
              size={scale(20)}
              color={COLORS.textTertiary}
            />
          </TouchableOpacity>
        </View>
      }
      {...props}
    />
  );
});

const styles = StyleSheet.create({
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.gapSm,
  },
  strengthBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: SPACING.xs,
  },
  strengthText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
  },
  eyeButton: {
    padding: SPACING.xs,
  },
});

export default PasswordInput;