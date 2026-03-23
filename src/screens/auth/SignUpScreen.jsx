// src/screens/auth/SignupForm.jsx
// ─────────────────────────────────────────────────────────────
//  Signup Form — Step 1 of 4  |  FundMe App (React Native CLI)
//
//  Layout model (identical to CNICUpload & ProfileComplete):
//  ┌─ SafeAreaView ──────────────────────────────────────────┐
//  │  [Header]  ←  ·  Step 1 of 4              (fixed)      │
//  │  [Progress bar — teal 25%]                (fixed)      │
//  │  ┌─ ScrollView ──────────────────────────────────────┐  │
//  │  │  headline · fields · role toggles               │  │
//  │  └───────────────────────────────────────────────────┘  │
//  │  [Continue →]                             (fixed)      │
//  └─────────────────────────────────────────────────────────┘
//
//  Key decisions (same across all 4 signup screens):
//  • NO KeyboardAvoidingView — causes shiver on Android
//  • Footer is position:absolute bottom:0 — keyboard can't push it
//  • ScrollView paddingBottom = FOOTER_H + 16 — nothing hides behind footer
//  • NO Animated wrapper on content — avoids layout thrash
//  • SafeAreaView + manual STATUSBAR_H for Android status bar
// ─────────────────────────────────────────────────────────────

import React, { useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  StatusBar,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icons from 'react-native-vector-icons/Feather';

// ── Responsive scale (base 375 pt) ─────────────────────────
const { width: SW } = Dimensions.get('window');
const sp = n => (SW / 375) * n;

// Footer height — view height + scroll padding
const FOOTER_H = Platform.OS === 'android' ? sp(82) : sp(70);

// Android: SafeAreaView gives no top inset — add manually
const STATUSBAR_H =
  Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0;

// ── Palette ─────────────────────────────────────────────────
const P = {
  bg:        '#F9FAFB',
  white:     '#FFFFFF',
  teal:      '#00B4CC',
  tealDark:  '#0097AA',
  tealLight: 'rgba(0,180,204,0.12)',
  dark:      '#111827',
  gray:      '#6B7280',
  light:     '#9CA3AF',
  labelGray: '#aeafb0',
  border:    '#E5E7EB',
};

// ════════════════════════════════════════════════════════════
//  Field — reusable labelled input
// ════════════════════════════════════════════════════════════
const Field = memo(({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  secureTextEntry = false,
  autoCapitalize = 'words',
  leftContent = null,
  rightContent = null,
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={fSt.wrap}>
      <Text style={fSt.label}>{label}</Text>
      <View style={[fSt.row, focused && fSt.rowFocused]}>
        {leftContent && <View style={fSt.left}>{leftContent}</View>}
        <TextInput
          style={fSt.input}
          placeholder={placeholder}
          placeholderTextColor={P.light}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {rightContent && <View style={fSt.right}>{rightContent}</View>}
      </View>
    </View>
  );
});

// ════════════════════════════════════════════════════════════
//  Main Screen
// ════════════════════════════════════════════════════════════
const SignupForm = ({ navigation }) => {
  const [firstName,   setFirstName  ] = useState('');
  const [lastName,    setLastName   ] = useState('');
  const [email,       setEmail      ] = useState('');
  const [phone,       setPhone      ] = useState('');
  const [password,    setPassword   ] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass,    setShowPass   ] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [role,        setRole       ] = useState('donate');
  const [phoneFocused, setPhoneFocused] = useState(false);

  const togglePass    = useCallback(() => setShowPass(v => !v),    []);
  const toggleConfirm = useCallback(() => setShowConfirm(v => !v), []);

  return (
    <SafeAreaView style={scSt.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={P.bg} />

      {/* ══ FIXED HEADER ════════════════════════════════════ */}
      <View style={scSt.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack?.()}
          style={scSt.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={scSt.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={scSt.stepLabel}>Step 1 of 4</Text>
      </View>

      {/* ══ FIXED PROGRESS BAR (teal 25%) ═══════════════════ */}
      <View style={scSt.progressBg}>
        <View style={scSt.progressFill} />
      </View>

      {/* ══ SCROLLABLE CONTENT ══════════════════════════════ */}
      <ScrollView
        style={scSt.scroll}
        contentContainerStyle={[
          scSt.scrollContent,
          { paddingBottom: FOOTER_H + sp(16) },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        overScrollMode="never"
      >
        <Text style={scSt.headline}>Create Account</Text>
        <Text style={scSt.subtitle}>Join thousands making a difference</Text>

        {/* First Name */}
        <Field
          label="First Name"
          placeholder="Enter your first name"
          value={firstName}
          onChangeText={setFirstName}
          leftContent={<Icons name="user" size={sp(15)} color={P.light} />}
        />

        {/* Last Name */}
        <Field
          label="Last Name"
          placeholder="Enter your last name"
          value={lastName}
          onChangeText={setLastName}
          leftContent={<Icons name="user" size={sp(15)} color={P.light} />}
        />

        {/* Email */}
        <Field
          label="Email"
          placeholder="name@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          leftContent={<Icons name="mail" size={sp(15)} color={P.light} />}
        />

        {/* Phone — custom prefix layout */}
        <View style={fSt.wrap}>
          <Text style={fSt.label}>Phone</Text>
          <View style={[fSt.row, phoneFocused && fSt.rowFocused]}>
            <View style={scSt.phonePrefix}>
              <Icons name="phone" size={sp(14)} color={P.light} />
              <Text style={scSt.prefixTxt}>+92</Text>
              <View style={scSt.prefixDivider} />
            </View>
            <TextInput
              style={[fSt.input, { flex: 1 }]}
              placeholder="300 1234567"
              placeholderTextColor={P.light}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoCapitalize="none"
              onFocus={() => setPhoneFocused(true)}
              onBlur={() => setPhoneFocused(false)}
            />
          </View>
        </View>

        {/* Password */}
        <Field
          label="Password"
          placeholder="Create a password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPass}
          autoCapitalize="none"
          leftContent={<Icons name="lock" size={sp(15)} color={P.light} />}
          rightContent={
            <TouchableOpacity onPress={togglePass} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Icons name={showPass ? 'eye' : 'eye-off'} size={sp(16)} color={P.light} />
            </TouchableOpacity>
          }
        />

        {/* Confirm Password */}
        <Field
          label="Confirm Password"
          placeholder="Re-enter your password"
          value={confirmPass}
          onChangeText={setConfirmPass}
          secureTextEntry={!showConfirm}
          autoCapitalize="none"
          leftContent={<Icons name="lock" size={sp(15)} color={P.light} />}
          rightContent={
            <TouchableOpacity onPress={toggleConfirm} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Icons name={showConfirm ? 'eye' : 'eye-off'} size={sp(16)} color={P.light} />
            </TouchableOpacity>
          }
        />

        {/* I want to: role toggle */}
        <Text style={scSt.roleLabel}>I want to:</Text>
        <View style={scSt.roleRow}>
          <TouchableOpacity
            style={[scSt.roleBtn, role === 'donate' && scSt.roleBtnActive]}
            onPress={() => setRole('donate')}
            activeOpacity={0.8}
          >
            <Text style={[scSt.roleTxt, role === 'donate' && scSt.roleTxtActive]}>
              🤍  Donor
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[scSt.roleBtn, role === 'campaign' && scSt.roleBtnActive]}
            onPress={() => setRole('campaign')}
            activeOpacity={0.8}
          >
            <Text style={[scSt.roleTxt, role === 'campaign' && scSt.roleTxtActive]}>
              📋  Creator
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ══ FIXED FOOTER — Continue button ══════════════════ */}
      <View style={scSt.footer}>
        <TouchableOpacity
          onPress={() => navigation?.navigate?.('OTPVerificationScreen')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[P.teal, P.tealDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={scSt.continueBtn}
          >
            <Text style={scSt.continueTxt}>Continue  </Text>
            <Icons name="arrow-right" size={sp(16)} color={P.white} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SignupForm;

// ════════════════════════════════════════════════════════════
//  STYLESHEETS
// ════════════════════════════════════════════════════════════

// ── Screen ──────────────────────────────────────────────────
const scSt = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: P.bg,
  },

  // Fixed header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sp(22),
    paddingTop: sp(14) + STATUSBAR_H,
    paddingBottom: sp(10),
    backgroundColor: P.bg,
  },
  backBtn:   { padding: sp(4) },
  backArrow: { fontSize: sp(20), color: P.dark, fontWeight: '700' },
  stepLabel: { fontSize: sp(13), color: P.gray, fontWeight: '600' },

  // Fixed progress bar — teal 25% (Step 1)
  progressBg: {
    height: 4,
    marginHorizontal: sp(22),
    backgroundColor: P.border,
    borderRadius: 2,
    marginBottom: sp(22),
  },
  progressFill: {
    height: 4,
    width: '25%',
    backgroundColor: P.teal,
    borderRadius: 2,
  },

  // Scroll
  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: sp(22) },

  // Headline
  headline: {
    fontSize: sp(24),
    fontWeight: '800',
    color: P.dark,
    marginBottom: sp(4),
  },
  subtitle: {
    fontSize: sp(13),
    color: P.gray,
    marginBottom: sp(22),
  },

  // Phone prefix
  phonePrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: sp(8),
  },
  prefixTxt: {
    fontSize: sp(14),
    color: P.light,
    fontWeight: '600',
    marginLeft: sp(6),
    marginRight: sp(4),
  },
  prefixDivider: {
    width: 1,
    height: sp(20),
    backgroundColor: P.border,
    marginLeft: sp(6),
  },

  // Role toggles
  roleLabel: {
    fontSize: sp(13),
    fontWeight: '600',
    color: P.light,
    marginBottom: sp(10),
    marginTop: sp(6),
  },
  roleRow: {
    flexDirection: 'row',
    gap: sp(10),
  },
  roleBtn: {
    flex: 1,
    height: sp(54),
    borderRadius: sp(8),
    borderWidth: 1.5,
    borderColor: P.border,
    backgroundColor: P.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleBtnActive: {
    borderColor: P.teal,
    backgroundColor: P.tealLight,
  },
  roleTxt:       { fontSize: sp(13), color: P.gray, fontWeight: '600' },
  roleTxtActive: { fontSize: sp(13), color: P.teal, fontWeight: '700' },

  // Fixed footer
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: sp(22),
    paddingTop: sp(12),
    paddingBottom: Platform.OS === 'android' ? sp(22) : sp(12),
    backgroundColor: P.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: P.border,
  },
  continueBtn: {
    width: '100%',
    paddingVertical: sp(16),
    borderRadius: sp(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: P.teal,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  continueTxt: {
    color: P.white,
    fontSize: sp(16),
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

// ── Field ────────────────────────────────────────────────────
const fSt = StyleSheet.create({
  wrap:  { marginBottom: sp(14) },
  label: {
    fontSize: sp(13),
    fontWeight: '600',
    color: P.labelGray,
    marginBottom: sp(6),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: P.border,
    borderRadius: sp(8),
    backgroundColor: P.white,
    paddingHorizontal: sp(12),
    height: sp(54),
  },
  rowFocused: { borderColor: P.teal },
  left:  { marginRight: sp(8) },
  right: { marginLeft:  sp(8) },
  input: {
    flex: 1,
    fontSize: sp(14),
    color: P.dark,
    paddingVertical: 0,
  },
});