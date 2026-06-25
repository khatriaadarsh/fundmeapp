// src/screens/auth/EmailVerifyForResetPass.jsx
import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import GradientButton       from '../../components/common/GradientButton';
import { FullScreenLoader } from '../../components/common/Loader';
import { useToast }         from '../../components/common/Toast';
import { useResendOtp }     from '../../hooks/useAuth';

import { COLORS, SPACING, TYPOGRAPHY, scale } from '../../theme';

const EmailVerifyForResetPass = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const toast  = useToast();
  const { mutate: sendOtp, isPending } = useResendOtp();

  const [email,     setEmail]     = useState('');
  const [error,     setError]     = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;

  const triggerShake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue:  8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:  5, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -5, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:  0, duration: 35, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const isValidEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());

  const handleSubmit = useCallback(() => {
    Keyboard.dismiss();

    if (!email.trim()) {
      setError('Please enter your email address');
      triggerShake();
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      triggerShake();
      return;
    }

    setError('');

    sendOtp(email.trim(), {
      onSuccess: (body) => {
        toast.success(body?.responseMessage || 'OTP sent to your email.');
        navigation.navigate('ForgotPasswordScreen', { email: email.trim() });
      },
      onError: (err) => {
        const msg = err?.message || 'Failed to send OTP. Please try again.';
        setError(msg);
        toast.error(msg);
        triggerShake();
      },
    });
  }, [email, sendOtp, navigation, toast, triggerShake]);

  const handleEmailChange = (text) => {
    setEmail(text);
    if (error) setError('');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} translucent={false} />

      <TouchableOpacity
        style={[styles.backBtn, { top: insets.top + scale(4) }]}
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        activeOpacity={0.7}
        disabled={isPending}
      >
        <Icon name="chevron-left" size={scale(22)} color={COLORS.textPrimary} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Icon name="lock-reset" size={scale(36)} color={COLORS.primary} />
          </View>

          <Text style={styles.headline}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter your registered email address.{'\n'}
            We'll send you a verification code.
          </Text>

          <Animated.View
            style={[
              styles.inputWrap,
              isFocused && styles.inputWrapFocused,
              !!error && styles.inputWrapError,
              { transform: [{ translateX: shakeAnim }] },
            ]}
          >
            <Icon
              name="email-outline"
              size={scale(18)}
              color={error ? (COLORS.error ?? '#EF4444') : isFocused ? COLORS.primary : COLORS.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={COLORS.textSecondary}
              value={email}
              onChangeText={handleEmailChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              editable={!isPending}
            />
          </Animated.View>

          {!!error && (
            <View style={styles.errorRow}>
              <Icon name="alert-circle-outline" size={scale(13)} color={COLORS.error ?? '#EF4444'} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.btnWrapper}>
            <GradientButton
              title={isPending ? 'Sending...' : 'Submit'}
              onPress={handleSubmit}
              disabled={isPending || !email.trim()}
            />
          </View>
        </View>
      </KeyboardAvoidingView>

      <FullScreenLoader visible={isPending} message="Sending verification code…" />
    </SafeAreaView>
  );
};

export default EmailVerifyForResetPass;

const styles = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: COLORS.background },
  keyboardView: { flex: 1 },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? scale(56) : scale(15),
    left: SPACING.screenPadding,
    width: scale(38), height: scale(38), borderRadius: scale(10),
    backgroundColor: COLORS.tealTint,
    alignItems: 'center', justifyContent: 'center', zIndex: 10,
  },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: SPACING.screenPadding },
  iconCircle: {
    width: scale(80), height: scale(80), borderRadius: scale(40),
    backgroundColor: COLORS.tealTint,
    alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xxl,
  },
  headline: {
    fontSize: TYPOGRAPHY.fontSize.xxxl, fontFamily: TYPOGRAPHY.fontFamily.extraBold,
    color: COLORS.textPrimary, marginBottom: SPACING.sm, textAlign: 'center',
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.base, fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textSecondary, textAlign: 'center', lineHeight: scale(22), marginBottom: SPACING.xxl,
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', width: '100%',
    height: scale(52), borderRadius: scale(12), borderWidth: 1.5,
    borderColor: COLORS.border ?? '#E2E8F0',
    backgroundColor: COLORS.inputBackground ?? COLORS.surface ?? '#F8FAFC',
    paddingHorizontal: SPACING.lg, marginBottom: SPACING.xs,
  },
  inputWrapFocused: { borderColor: COLORS.primary },
  inputWrapError:   { borderColor: COLORS.error ?? '#EF4444' },
  inputIcon: { marginRight: SPACING.sm },
  input: {
    flex: 1, fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textPrimary, paddingVertical: 0,
  },
  errorRow: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    gap: SPACING.gapSm, marginBottom: SPACING.md ?? SPACING.lg, marginTop: SPACING.xs,
  },
  errorText: {
    fontSize: TYPOGRAPHY.fontSize.sm, fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.error ?? '#EF4444',
  },
  btnWrapper: { width: '100%', marginTop: SPACING.lg },
});