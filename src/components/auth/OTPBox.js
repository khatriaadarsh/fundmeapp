import React, { memo } from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, scale } from '../../theme';

const OTPBox = memo(({ value, isFocused, inputRef, onChangeText, onKeyPress }) => {
  return (
    <TextInput
      ref={inputRef}
      style={[
        styles.box,
        value && styles.boxFilled,
        isFocused && styles.boxFocused,
      ]}
      value={value}
      onChangeText={onChangeText}
      onKeyPress={onKeyPress}
      keyboardType="number-pad"
      maxLength={1}
      textAlign="center"
      caretHidden
      selectTextOnFocus
    />
  );
});

const styles = StyleSheet.create({
  box: {
    width: scale(52),
    height: scale(56),
    borderRadius: SPACING.borderRadius,
    borderWidth: SPACING.borderWidth,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  boxFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.tealTint,
  },
  boxFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
});

export default OTPBox;