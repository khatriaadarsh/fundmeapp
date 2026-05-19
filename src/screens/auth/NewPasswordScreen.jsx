// src/screens/auth/NewPasswordScreen.jsx
// ─────────────────────────────────────────────────────────────
//  Forgot Password — Step 3: Set New Password
//  Validation matches SendResetCode + EmailVerifyForResetPass:
//    • Shake animation on failure
//    • Inline error per field
//    • Weak password blocked (min score 2)
//    • Both fields turn red border on their own errors
//    • SafeAreaView added
//    • Button disabled after successful submit (prevents double-tap)
// ─────────────────────────────────────────────────────────────

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icons from 'react-native-vector-icons/Feather';

// ─────────────────────────────────────────────────────────────
//  Colors — unchanged from original
// ─────────────────────────────────────────────────────────────
const COLORS = {
  bg: '#FFFFFF',
  teal: '#00B4CC',
  tealDark: '#0097AA',
  tealLight: 'rgba(0,180,204,0.12)',
  green: '#22C55E',
  greenLight: 'rgba(34,197,94,0.10)',
  red: '#EF4444',
  redLight: '#FEF2F2',
  amber: '#F59E0B',
  textDark: '#111827',
  textGray: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
};

// ─────────────────────────────────────────────────────────────
//  Password strength — unchanged from original
// ─────────────────────────────────────────────────────────────
const getPasswordStrength = password => {
  if (!password) return { score: 0, label: '', color: COLORS.border };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const map = [
    { label: '', color: COLORS.border },
    { label: 'Weak', color: COLORS.red },
    { label: 'Fair', color: COLORS.amber },
    { label: 'Good', color: COLORS.teal },
    { label: 'Strong', color: COLORS.green },
  ];
  return { score, ...map[score] };
};

// ─────────────────────────────────────────────────────────────
//  StrengthBar — unchanged from original
// ─────────────────────────────────────────────────────────────
const StrengthBar = ({ password }) => {
  const { score, label, color } = getPasswordStrength(password);
  if (!password) return null;
  return (
    <View style={styles.strengthWrap}>
      <View style={styles.strengthTrack}>
        {[1, 2, 3, 4].map(i => (
          <View
            key={i}
            style={[
              styles.strengthSegment,
              { backgroundColor: i <= score ? color : COLORS.border },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.strengthLabel, { color }]}>{label}</Text>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────
//  Inline error row — same pattern as SendResetCode
// ─────────────────────────────────────────────────────────────
const ErrorMsg = ({ msg }) => {
  if (!msg) return null;
  return (
    <View style={styles.errorRow}>
      <Icons
        name="alert-circle"
        size={12}
        color={COLORS.red}
        style={{ marginRight: 4 }}
      />
      <Text style={styles.errorText}>{msg}</Text>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────
//  NewPasswordScreen
// ─────────────────────────────────────────────────────────────
const NewPasswordScreen = ({ navigation }) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [confFocused, setConfFocused] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // ── Per-field errors ──────────────────────────────────────
  const [errors, setErrors] = useState({ password: '', confirm: '' });

  const clearError = key => setErrors(prev => ({ ...prev, [key]: '' }));

  // ── Animation refs ────────────────────────────────────────
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const iconScale = useRef(new Animated.Value(0.6)).current;
  const shakePassAnim = useRef(new Animated.Value(0)).current; // password field shake
  const shakeConfAnim = useRef(new Animated.Value(0)).current; // confirm field shake

  // ── Mount animation — unchanged ───────────────────────────
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(iconScale, {
        toValue: 1,
        tension: 55,
        friction: 6,
        delay: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, iconScale]);

  // ── Shake helper — same pattern as SendResetCode ──────────
  const shake = useCallback(anim => {
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 10,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: -10,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 7,
        duration: 45,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: -7,
        duration: 45,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 0,
        duration: 35,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // ── Derived state for live feedback (kept from original) ──
  const { score: strengthScore } = getPasswordStrength(password);
  const passwordsMatch = confirm.length > 0 && password === confirm;
  const passwordMismatch = confirm.length > 0 && password !== confirm;

  // ── Validation ────────────────────────────────────────────
  const validate = useCallback(() => {
    const e = { password: '', confirm: '' };
    let valid = true;

    // Password: required
    if (!password) {
      e.password = 'Password is required';
      valid = false;
    }
    // Password: minimum length
    else if (password.length < 8) {
      e.password = 'Password must be at least 8 characters';
      valid = false;
    }
    // Password: minimum strength (score must be ≥ 2 = "Fair")
    else if (strengthScore < 2) {
      e.password = 'Password is too weak — add uppercase letters or numbers';
      valid = false;
    }

    // Confirm: required
    if (!confirm) {
      e.confirm = 'Please confirm your password';
      valid = false;
    }
    // Confirm: must match
    else if (password !== confirm) {
      e.confirm = 'Passwords do not match';
      valid = false;
    }

    setErrors(e);

    // Shake the fields that have errors
    if (e.password) shake(shakePassAnim);
    if (e.confirm) shake(shakeConfAnim);

    return valid;
  }, [password, confirm, strengthScore, shake, shakePassAnim, shakeConfAnim]);

  // ── Submit ────────────────────────────────────────────────
  const handleResetPassword = useCallback(() => {
    Keyboard.dismiss();
    if (!validate()) return;

    setSubmitted(true);
    // TODO: Replace with your actual API call
    // e.g. await authService.resetPassword({ password })
    setTimeout(() => navigation.navigate('Login'), 1200);
  }, [validate, navigation]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.inner}>
          <Animated.View
            style={[
              styles.content,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* ── Icon circle ─────────────────────────────── */}
            <Animated.View
              style={[styles.iconCircle, { transform: [{ scale: iconScale }] }]}
            >
              <Icons name="lock" size={28} color={COLORS.teal} />
            </Animated.View>

            {/* ── Heading ─────────────────────────────────── */}
            <Text style={styles.headline}>New Password</Text>
            <Text style={styles.subtitle}>
              Your new password must be different from previously used
              passwords.
            </Text>

            {/* ── Password field ───────────────────────────── */}
            <View style={styles.fieldWrap}>
              <Animated.View
                style={{ transform: [{ translateX: shakePassAnim }] }}
              >
                <View
                  style={[
                    styles.inputRow,
                    passFocused && styles.inputFocused,
                    errors.password && styles.inputError,
                  ]}
                >
                  <Icons
                    name="lock"
                    size={16}
                    color={errors.password ? COLORS.red : COLORS.textGray}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="New password"
                    placeholderTextColor={COLORS.textLight}
                    value={password}
                    onChangeText={text => {
                      setPassword(text);
                      if (errors.password) clearError('password');
                    }}
                    secureTextEntry={!showPass}
                    autoCapitalize="none"
                    onFocus={() => setPassFocused(true)}
                    onBlur={() => setPassFocused(false)}
                    returnKeyType="next"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPass(v => !v)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Icons
                      name={showPass ? 'eye-off' : 'eye'}
                      size={18}
                      color={COLORS.textGray}
                    />
                  </TouchableOpacity>
                </View>
              </Animated.View>

              {/* Strength bar — shown while typing, hides on error */}
              {!errors.password && <StrengthBar password={password} />}

              {/* Password field error */}
              <ErrorMsg msg={errors.password} />
            </View>

            {/* ── Confirm password field ───────────────────── */}
            <View style={styles.fieldWrap}>
              <Animated.View
                style={{ transform: [{ translateX: shakeConfAnim }] }}
              >
                <View
                  style={[
                    styles.inputRow,
                    confFocused && styles.inputFocused,
                    (errors.confirm || passwordMismatch) && styles.inputError,
                    passwordsMatch && styles.inputSuccess,
                  ]}
                >
                  <Icons
                    name="lock"
                    size={16}
                    color={
                      errors.confirm || passwordMismatch
                        ? COLORS.red
                        : passwordsMatch
                        ? COLORS.green
                        : COLORS.textGray
                    }
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm new password"
                    placeholderTextColor={COLORS.textLight}
                    value={confirm}
                    onChangeText={text => {
                      setConfirm(text);
                      if (errors.confirm) clearError('confirm');
                    }}
                    secureTextEntry={!showConfirm}
                    autoCapitalize="none"
                    onFocus={() => setConfFocused(true)}
                    onBlur={() => setConfFocused(false)}
                    returnKeyType="done"
                    onSubmitEditing={handleResetPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirm(v => !v)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Icons
                      name={showConfirm ? 'eye-off' : 'eye'}
                      size={18}
                      color={COLORS.textGray}
                    />
                  </TouchableOpacity>
                </View>
              </Animated.View>

              {/* Live match / mismatch feedback (from original) */}
              {!errors.confirm && passwordsMatch && (
                <View style={styles.matchRow}>
                  <Icons name="check-circle" size={12} color={COLORS.green} />
                  <Text style={styles.matchText}>Passwords match</Text>
                </View>
              )}
              {!errors.confirm && passwordMismatch && (
                <View style={styles.mismatchRow}>
                  <Icons name="x-circle" size={12} color={COLORS.red} />
                  <Text style={styles.mismatchText}>
                    Passwords do not match
                  </Text>
                </View>
              )}

              {/* Confirm field error (shown after submit attempt) */}
              <ErrorMsg msg={errors.confirm} />
            </View>

            {/* ── Reset button ─────────────────────────────── */}
            <TouchableOpacity
              onPress={handleResetPassword}
              activeOpacity={0.85}
              style={styles.buttonWrap}
              disabled={submitted}
            >
              <LinearGradient
                colors={
                  submitted
                    ? ['#9CA3AF', '#9CA3AF']
                    : [COLORS.teal, COLORS.tealDark]
                }
                style={[styles.resetBtn, submitted && { opacity: 0.7 }]}
              >
                <Text style={styles.resetBtnText}>
                  {submitted ? 'Redirecting...' : 'Reset Password'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────────────────────
//  Styles — StyleSheets defined before they are referenced
// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  keyboardView: { flex: 1 },
  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 20,
    marginBottom: 45,
  },
  content: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
  },

  // ── Icon ──────────────────────────────────────────────────
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },

  // ── Text ──────────────────────────────────────────────────
  headline: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textGray,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 28,
    paddingHorizontal: 8,
  },

  // ── Fields ────────────────────────────────────────────────
  fieldWrap: { width: '100%', marginBottom: 16 },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 14,
    height: 50,
  },
  inputFocused: { borderColor: COLORS.teal },
  inputError: { borderColor: COLORS.red, backgroundColor: COLORS.redLight },
  inputSuccess: {
    borderColor: COLORS.green,
    backgroundColor: COLORS.greenLight,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textDark,
    marginLeft: 10,
  },

  // ── Strength bar — unchanged ───────────────────────────────
  strengthWrap: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  strengthTrack: { flex: 1, flexDirection: 'row', gap: 4 },
  strengthSegment: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '700',
    minWidth: 50,
    textAlign: 'right',
  },

  // ── Match / mismatch live feedback ────────────────────────
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  mismatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  matchText: { fontSize: 12, color: COLORS.green, fontWeight: '600' },
  mismatchText: { fontSize: 12, color: COLORS.red, fontWeight: '600' },

  // ── Error row (same pattern as SendResetCode) ─────────────
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.red,
    flexShrink: 1,
  },

  // ── Button ────────────────────────────────────────────────
  buttonWrap: { width: '100%' },
  resetBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
    elevation: 3,
    shadowColor: COLORS.teal,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  resetBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});

export default NewPasswordScreen;
