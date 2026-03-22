// src/screens/auth/SignupForm.jsx
// ─────────────────────────────────────────────────────────────
//  Signup Form — Step 1 of 4
//  FundMe App (React Native CLI)
//
//  Back arrow | Step 1 of 4 | teal progress bar
//  Create Account headline + subtitle
//  First Name, Last Name, Email, Phone (+92), Password,
//  Confirm Password inputs
//  "I want to:" — Donate | Create Campaigns toggles
//  Continue → button | Already have account? Log In
// ─────────────────────────────────────────────────────────────
import Icons from 'react-native-vector-icons/Feather';

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

// ── Colour tokens ──────────────────────────────────────────
const C = {
  bg: '#F9FAFB',
  white: '#FFFFFF',
  teal: '#00B4CC',
  tealDark: '#0097AA',
  tealLight: 'rgba(0,180,204,0.12)',
  green: '#22C55E',
  textDark: '#111827',
  textGray: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  borderFocus: '#00B4CC',
  inputBg: '#FFFFFF',
  progressBg: '#E5E7EB',
};

// ── Reusable labelled input ────────────────────────────────
const Field = ({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  secureTextEntry = false,
  autoCapitalize = 'words',
  rightIcon = null,
  leftContent = null,
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={field.wrap}>
      <Text style={field.label}>{label}</Text>
      <View style={[field.inputRow, focused && field.focused]}>
        {leftContent && <View style={field.left}>{leftContent}</View>}
        <TextInput
          style={field.input}
          placeholder={placeholder}
          placeholderTextColor={C.textLight}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {rightIcon && <View style={field.right}>{rightIcon}</View>}
      </View>
    </View>
  );
};

// ── Main screen ────────────────────────────────────────────
const SignupForm = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [role, setRole] = useState('donate'); // 'donate' | 'campaign'

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

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
    ]).start();
  }, [fadeAnim, slideAnim]);

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Header row ── */}
          <View style={s.headerRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={s.backBtn}
            >
              <Text style={s.backArrow}>←</Text>
            </TouchableOpacity>
            <Text style={s.stepLabel}>Step 1 of 4</Text>
          </View>

          {/* ── Progress bar ── */}
          <View style={s.progressBg}>
            <View style={[s.progressFill, { width: '25%' }]} />
          </View>

          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {/* ── Headline ── */}
            <Text style={s.headline}>Create Account</Text>
            <Text style={s.subtitle}>
              {'Join thousands making a difference'}
            </Text>

            {/* ── Fields ── */}
            <Field
              label="First Name"
              placeholder="Enter your first name"
              value={firstName}
              onChangeText={setFirstName}
              leftContent={
                <Icons
                  name="user"
                  size={14}
                  color={C.textLight}
                  style={field.inputIcon}
                />
              }
            />
            <Field
              label="Last Name"
              placeholder="Enter your last name"
              value={lastName}
              onChangeText={setLastName}
              leftContent={
                <Icons
                  name="user"
                  size={14}
                  color={C.textLight}
                  style={field.inputIcon}
                />
              }
              // leftContent={<Text style={s.fieldIcon}>👤</Text>}
            />
            <Field
              label="Email"
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftContent={
                <Icons
                  name="mail"
                  size={14}
                  color={C.textLight}
                  style={field.inputIcon}
                />
              }
              // leftContent={<Text style={s.fieldIcon}>✉️</Text>}
            />

            {/* Phone with +92 prefix */}
            <View style={field.wrap}>
              <Text style={field.label}>Phone</Text>
              <View style={[field.inputRow]}>
                <View style={s.phonePrefix}>
                  <Icons
                    name="phone"
                    color={C.textLight}
                    style={field.inputIcon}
                  />
                  <Text style={s.prefixText}>+92</Text>
                  <View style={s.prefixDivider} />
                </View>
                <TextInput
                  style={[field.input, { flex: 1 }]}
                  placeholder="300 1234567"
                  placeholderTextColor={C.textLight}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password */}
            <View style={field.wrap}>
              <Text style={field.label}>Password</Text>
              <View style={field.inputRow}>
                <View style={field.left}>
                  <Icons
                    name="lock"
                    color={C.textLight}
                    style={field.inputIcon}
                  />
                </View>
                <TextInput
                  style={field.input}
                  placeholder="Create a password"
                  placeholderTextColor={C.textLight}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowPass(p => !p)}
                  style={field.right}
                >
                  <Text style={s.eyeIcon}>
                    {showPass ? (
                      <Icons
                        name="eye"
                        color={C.textLight}
                        style={field.inputIcon}
                      />
                    ) : (
                      <Icons
                        name="eye-off"
                        color={C.textLight}
                        style={field.inputIcon}
                      />
                    )}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm password */}
            <View style={field.wrap}>
              <Text style={field.label}>Confirm Password</Text>
              <View style={field.inputRow}>
                <View style={field.left}>
                  <Icons
                    name="lock"
                    color={C.textLight}
                    style={field.inputIcon}
                  />
                </View>
                <TextInput
                  style={field.input}
                  placeholder="Re-enter your password"
                  placeholderTextColor={C.textLight}
                  value={confirmPass}
                  onChangeText={setConfirmPass}
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirm(p => !p)}
                  style={field.right}
                >
                  <Text style={s.eyeIcon}>
                    {showConfirm ? (
                      <Icons
                        name="eye"
                        color={C.textLight}
                        style={field.inputIcon}
                      />
                    ) : (
                      <Icons
                        name="eye-off"
                        color={C.textLight}
                        style={field.inputIcon}
                      />
                    )}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* ── I want to ── */}
            <Text style={s.roleLabel}>I want to:</Text>
            <View style={s.roleRow}>
              <TouchableOpacity
                style={[s.roleBtn, role === 'donate' && s.roleBtnActive]}
                onPress={() => setRole('donate')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    s.roleBtnText,
                    role === 'donate' && s.roleBtnTextActive,
                  ]}
                >
                  {'🤍  Donor'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.roleBtn, role === 'campaign' && s.roleBtnActive]}
                onPress={() => setRole('campaign')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    s.roleBtnText,
                    role === 'campaign' && s.roleBtnTextActive,
                  ]}
                >
                  {'📋  Creator '}
                </Text>
              </TouchableOpacity>
            </View>

            {/* ── Continue button ── */}
            <TouchableOpacity
              onPress={() => navigation.navigate('OTPVerificationScreen')}
              activeOpacity={0.85}
              style={{ marginTop: 45 }}
            >
              <LinearGradient
                colors={[C.teal, C.tealDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.continueBtn}
              >
                <Text style={s.continueBtnText}>
                  Continue{' '}
                  <Icons
                    name="arrow-right"
                    color={C.white}
                    style={s.continueBtnIcon}
                  />
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* ── Log In link ── */}
            <View style={s.loginRow}>
              <Text style={s.loginText}>{'Already have an account? '}</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.7}
              >
                <Text style={s.loginLink}>Log In</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SignupForm;

// ── Field component styles ─────────────────────────────────
const field = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 15, fontWeight: '600', color: '#aeafb0', marginBottom: 6 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 8,
    backgroundColor: C.inputBg,
    paddingHorizontal: 12,
    height: 55,
  },
  focused: { borderColor: C.borderFocus },
  left: { marginRight: 8 },
  right: { marginLeft: 8 },
  input: { flex: 1, fontSize: 15, color: C.textDark, paddingVertical: 0 },
  inputIcon: { fontSize: 17, marginRight: 5 },
});

// ── Screen styles ──────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: {
    paddingHorizontal: 22,
    paddingTop: 52,
    paddingBottom: 36,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  backBtn: { padding: 4 },
  backArrow: { fontSize: 20, color: C.textDark, fontWeight: '600' },
  stepLabel: { fontSize: 13, color: C.textGray, fontWeight: '500' },

  // Progress
  progressBg: {
    height: 4,
    backgroundColor: C.progressBg,
    borderRadius: 2,
    marginBottom: 24,
  },
  progressFill: { height: 4, backgroundColor: C.teal, borderRadius: 2 },

  // Headline
  headline: {
    fontSize: 24,
    fontWeight: '800',
    color: C.textDark,
    marginBottom: 4,
  },
  subtitle: { fontSize: 13, color: C.textGray, marginBottom: 22 },

  // Icons inside inputs
  fieldIcon: { fontSize: 14 },
  eyeIcon: { fontSize: 16 },

  // Phone prefix
  phonePrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  prefixText: {
    fontSize: 14,
    color: '#a3a3a3',
    fontWeight: '600',
    marginLeft: 6,
    marginRight: 4,
  },
  prefixDivider: {
    width: 1,
    height: 20,
    backgroundColor: C.border,
    marginLeft: 6,
  },

  // Role buttons
  roleLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textLight,
    marginBottom: 10,
  },
  roleRow: { flexDirection: 'row', gap: 10 },
  roleBtn: {
    flex: 1,
    height: 60,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleBtnActive: {
    borderColor: C.teal,
    backgroundColor: C.tealLight,
  },
  roleBtnText: { fontSize: 13, color: C.textGray, fontWeight: '600' },
  roleBtnTextActive: { color: C.teal },

  // Continue button
  continueBtn: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
    shadowColor: C.teal,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  continueBtnIcon: { fontSize: 16, marginLeft: 6 },

  // Log in
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
  loginText: { fontSize: 13, color: C.textGray },
  loginLink: { fontSize: 13, color: C.teal, fontWeight: '700' },
});
