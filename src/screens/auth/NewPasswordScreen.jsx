// src/screens/auth/NewPassword.jsx

import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icons from 'react-native-vector-icons/Feather';

// ── Colours ────────────────────────────────────────────────
const C = {
  bg: '#FFFFFF',
  teal: '#00B4CC',
  tealDark: '#0097AA',
  tealLight: 'rgba(0,180,204,0.12)',
  green: '#22C55E',
  red: '#EF4444',
  amber: '#F59E0B',
  textDark: '#111827',
  textGray: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
};

// ── Password strength calculator ──────────────────────────
const getStrength = pass => {
  if (!pass) return { score: 0, label: '', color: C.border };
  let score = 0;
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;

  const map = [
    { label: '', color: C.border },
    { label: 'Weak', color: C.red },
    { label: 'Fair', color: C.amber },
    { label: 'Good', color: C.teal },
    { label: 'Strong', color: C.green },
  ];
  return { score, ...map[score] };
};

// ── Strength bar ───────────────────────────────────────────
const StrengthBar = ({ password }) => {
  const { score, label, color } = getStrength(password);
  if (!password) return null;

  return (
    <View style={sb.wrap}>
      <View style={sb.track}>
        {[1, 2, 3, 4].map(i => (
          <View
            key={i}
            style={[
              sb.segment,
              { backgroundColor: i <= score ? color : C.border },
            ]}
          />
        ))}
      </View>
      <Text style={[sb.label, { color }]}>{label}</Text>
    </View>
  );
};

// ── Main screen ────────────────────────────────────────────
const NewPasswordScreen = ({ navigation }) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [confFocused, setConfFocused] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const iconScale = useRef(new Animated.Value(0.6)).current;

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

  const passwordsMatch = confirm.length > 0 && password === confirm;
  const passwordMismatch = confirm.length > 0 && password !== confirm;

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={s.inner}>
          <Animated.View
            style={[
              s.content,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* Icon */}
            <Animated.View
              style={[s.iconCircle, { transform: [{ scale: iconScale }] }]}
            >
              <Icons name="lock" size={28} color={C.teal} />
            </Animated.View>

            {/* Headline */}
            <Text style={s.headline}>New Password</Text>
            <Text style={s.subtitle}>
              Your new password must be different from previous used passwords.
            </Text>

            {/* Password */}
            <View style={s.fieldWrap}>
              <View style={[s.inputRow, passFocused && s.inputFocused]}>
                <Icons name="lock" size={16} color={C.textGray} />
                <TextInput
                  style={s.input}
                  placeholder="••••••••••••"
                  placeholderTextColor={C.textLight}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                  onFocus={() => setPassFocused(true)}
                  onBlur={() => setPassFocused(false)}
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                  <Icons
                    name={showPass ? 'eye-off' : 'eye'}
                    size={18}
                    color={C.textGray}
                  />
                </TouchableOpacity>
              </View>

              <StrengthBar password={password} />
            </View>

            {/* Confirm Password */}
            <View style={s.fieldWrap}>
              <View
                style={[
                  s.inputRow,
                  confFocused && s.inputFocused,
                  passwordMismatch && s.inputError,
                ]}
              >
                <Icons name="lock" size={16} color={C.textGray} />
                <TextInput
                  style={s.input}
                  placeholder="••••••••••••"
                  placeholderTextColor={C.textLight}
                  value={confirm}
                  onChangeText={setConfirm}
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                  onFocus={() => setConfFocused(true)}
                  onBlur={() => setConfFocused(false)}
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                  <Icons
                    name={showConfirm ? 'eye-off' : 'eye'}
                    size={18}
                    color={C.textGray}
                  />
                </TouchableOpacity>
              </View>

              {passwordsMatch && (
                <Text style={s.matchText}>✓ Passwords match</Text>
              )}
              {passwordMismatch && (
                <Text style={s.mismatchText}>✗ Passwords do not match</Text>
              )}
            </View>

            {/* Button */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.85}
              style={{ width: '100%' }}
            >
              <LinearGradient colors={[C.teal, C.tealDark]} style={s.resetBtn}>
                <Text style={s.resetBtnText}>Reset Password</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default NewPasswordScreen;

// ── Strength bar styles ────────────────────────────────────
const sb = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  track: { flex: 1, flexDirection: 'row', gap: 4 },
  segment: { flex: 1, height: 4, borderRadius: 2 },
  label: { fontSize: 12, fontWeight: '700', minWidth: 50, textAlign: 'right' },
});

// ── Screen styles ──────────────────────────────────────────
const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },

  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 20,
  },

  content: {
    width: '100%',
    maxWidth: 420, // ✅ responsive magic
    alignItems: 'center',
  },

  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: C.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },

  headline: {
    fontSize: 24,
    fontWeight: '800',
    color: C.textDark,
    marginBottom: 10,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 14,
    color: C.textGray,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 28,
    paddingHorizontal: 8,
  },

  fieldWrap: { width: '100%', marginBottom: 16 },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    height: 50,
  },

  inputFocused: { borderColor: C.teal },
  inputError: { borderColor: C.red },

  input: {
    flex: 1,
    fontSize: 15,
    color: C.textDark,
    marginLeft: 10,
  },

  matchText: {
    marginTop: 6,
    fontSize: 12,
    color: C.green,
    fontWeight: '600',
  },

  mismatchText: {
    marginTop: 6,
    fontSize: 12,
    color: C.red,
    fontWeight: '600',
  },

  resetBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },

  resetBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
