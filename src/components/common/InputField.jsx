import React, { useRef, useCallback, memo, useState } from 'react';
import {
  View,
  TextInput,
  Text,
  Animated,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS, SPACING, TYPOGRAPHY } from '../../theme';

const InputField = memo(({
  label,
  placeholder,
  value,
  onChangeText,
  leftIcon,
  rightElement,
  keyboardType = 'default',
  autoCapitalize = 'none',
  secureTextEntry = false,
  editable = true,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  error,
  containerStyle,
  onBlur,
  onFocus,
  validator, // Function that returns error message or null
  showValidationOnChange = true, // Show validation while typing
}) => {
  const borderAnim = useRef(new Animated.Value(0)).current;
  const [isFocused, setIsFocused] = useState(false);
  const [touched, setTouched] = useState(false);
  const [validationError, setValidationError] = useState(null);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: false,
    }).start();
    onFocus?.();
  }, [borderAnim, onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setTouched(true);
    
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
    
    // Always validate on blur
    if (validator) {
      const error = validator(value);
      setValidationError(error);
    }
    
    onBlur?.();
  }, [borderAnim, onBlur, validator, value]);

  const handleChangeText = useCallback((text) => {
    onChangeText(text);
    
    // Real-time validation after field has been touched
    if (touched && validator && showValidationOnChange) {
      const error = validator(text);
      setValidationError(error);
    }
  }, [onChangeText, touched, validator, showValidationOnChange]);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.border, COLORS.borderFocus],
  });

  // Priority: external error > internal validation error (if touched)
  const displayError = error || (touched ? validationError : null);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <Animated.View
        style={[
          styles.inputWrapper,
          { borderColor },
          displayError && styles.inputError,
          multiline && styles.multilineWrapper,
        ]}
      >
        {leftIcon && (
          <Icon
            name={leftIcon}
            size={SPACING.iconSize}
            color={displayError ? COLORS.error : COLORS.textTertiary}
            style={styles.leftIcon}
          />
        )}
        
        <TextInput
          style={[
            styles.input,
            multiline && styles.multilineInput,
          ]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textPlaceholder}
          value={value}
          onChangeText={handleChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          secureTextEntry={secureTextEntry}
          editable={editable}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          maxLength={maxLength}
          onFocus={handleFocus}
          onBlur={handleBlur}
          underlineColorAndroid="transparent"
          textAlignVertical={multiline ? 'top' : 'center'}
        />
        
        {rightElement}
      </Animated.View>
      
      {displayError && <Text style={styles.errorText}>{displayError}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: COLORS.gray700,
    marginBottom: SPACING.gapSm,
    marginLeft: SPACING.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: SPACING.borderWidth,
    borderRadius: SPACING.borderRadiusSm,
    paddingHorizontal: SPACING.md,
    minHeight: SPACING.inputHeight,
  },
  multilineWrapper: {
    minHeight: SPACING.inputHeight * 1.8,
    alignItems: 'flex-start',
    paddingVertical: SPACING.md,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  leftIcon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },
  multilineInput: {
    paddingVertical: SPACING.xs,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.error,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
});

export default InputField;