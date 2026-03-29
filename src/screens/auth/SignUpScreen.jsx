import React, { useState, useCallback, memo } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Platform, StatusBar, Dimensions, SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icons from 'react-native-vector-icons/Feather';

const { width: SW } = Dimensions.get('window');
const sp = n => (SW / 375) * n;

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

// ─── Field ───────────────────────────────────────────────────
const Field = memo(({ label, placeholder, value, onChangeText,
  keyboardType = 'default', secureTextEntry = false,
  autoCapitalize = 'words', leftContent = null, rightContent = null,
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

// ─── Screen ──────────────────────────────────────────────────
const SignUpScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const [firstName,   setFirstName  ] = useState('');
  const [lastName,    setLastName   ] = useState('');
  const [email,       setEmail      ] = useState('');
  const [phone,       setPhone      ] = useState('');
  const [password,    setPassword   ] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass,    setShowPass   ] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [role,        setRole       ] = useState('donate');
  const [phoneFocused,setPhoneFocused] = useState(false);

  const togglePass    = useCallback(() => setShowPass(v => !v),    []);
  const toggleConfirm = useCallback(() => setShowConfirm(v => !v), []);

  // Footer height accounts for bottom inset (home bar on notched devices)
  const footerPb = insets.bottom > 0 ? insets.bottom : sp(22);
  const footerH  = sp(52) + footerPb + sp(12); // button + paddingBottom + paddingTop

  return (
    <SafeAreaView style={scSt.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={P.bg} translucent={false} />

      {/* HEADER — top padding = insets.top so it clears status bar on every device */}
      <View style={[scSt.header, { paddingTop: insets.top + sp(6) }]}>
        <TouchableOpacity
          onPress={() => navigation?.goBack?.()}
          style={scSt.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={scSt.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={scSt.stepLabel}>Step 1 of 4</Text>
      </View>

      {/* PROGRESS BAR */}
      <View style={scSt.progressBg}>
        <View style={scSt.progressFill} />
      </View>

      {/* SCROLL */}
      <ScrollView
        style={scSt.scroll}
        contentContainerStyle={[scSt.scrollContent, { paddingBottom: footerH + sp(16) }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        overScrollMode="never"
      >
        <Text style={scSt.headline}>Create Account</Text>
        <Text style={scSt.subtitle}>Join thousands making a difference</Text>

        <Field label="First Name" placeholder="Enter your first name"
          value={firstName} onChangeText={setFirstName}
          leftContent={<Icons name="user" size={sp(15)} color={P.light} />}
        />
        <Field label="Last Name" placeholder="Enter your last name"
          value={lastName} onChangeText={setLastName}
          leftContent={<Icons name="user" size={sp(15)} color={P.light} />}
        />
        <Field label="Email" placeholder="name@example.com"
          value={email} onChangeText={setEmail}
          keyboardType="email-address" autoCapitalize="none"
          leftContent={<Icons name="mail" size={sp(15)} color={P.light} />}
        />

        {/* Phone */}
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

        <Field label="Password" placeholder="Create a password"
          value={password} onChangeText={setPassword}
          secureTextEntry={!showPass} autoCapitalize="none"
          leftContent={<Icons name="lock" size={sp(15)} color={P.light} />}
          rightContent={
            <TouchableOpacity onPress={togglePass} hitSlop={{ top:8, bottom:8, left:8, right:8 }}>
              <Icons name={showPass ? 'eye' : 'eye-off'} size={sp(16)} color={P.light} />
            </TouchableOpacity>
          }
        />
        <Field label="Confirm Password" placeholder="Re-enter your password"
          value={confirmPass} onChangeText={setConfirmPass}
          secureTextEntry={!showConfirm} autoCapitalize="none"
          leftContent={<Icons name="lock" size={sp(15)} color={P.light} />}
          rightContent={
            <TouchableOpacity onPress={toggleConfirm} hitSlop={{ top:8, bottom:8, left:8, right:8 }}>
              <Icons name={showConfirm ? 'eye' : 'eye-off'} size={sp(16)} color={P.light} />
            </TouchableOpacity>
          }
        />

        <Text style={scSt.roleLabel}>I want to:</Text>
        <View style={scSt.roleRow}>
          {[['donate','🤍  Donor'],['campaign','📋  Creator']].map(([key, label]) => (
            <TouchableOpacity
              key={key}
              style={[scSt.roleBtn, role === key && scSt.roleBtnActive]}
              onPress={() => setRole(key)}
              activeOpacity={0.8}
            >
              <Text style={[scSt.roleTxt, role === key && scSt.roleTxtActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* FOOTER */}
      <View style={[scSt.footer, { paddingBottom: footerPb }]}>
        <TouchableOpacity
          onPress={() => navigation?.navigate?.('OTPVerificationScreen')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[P.teal, P.tealDark]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
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

export default SignUpScreen;

// ─── Styles ──────────────────────────────────────────────────
const scSt = StyleSheet.create({
  safe: { flex: 1, backgroundColor: P.bg },

  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: sp(22),
    // paddingTop is set inline via insets.top — do NOT put a static value here
    paddingBottom:     sp(10),
    backgroundColor:   P.bg,
  },

  backBtn:   { padding: sp(4) },
  backArrow: { fontSize: sp(20), color: P.dark, fontWeight: '700' },
  stepLabel: { fontSize: sp(13), color: P.gray, fontWeight: '600' },

  progressBg: {
    height: 4, marginHorizontal: sp(22),
    backgroundColor: P.border, borderRadius: 2, marginBottom: sp(22),
  },
  progressFill: { height: 4, width: '25%', backgroundColor: P.teal, borderRadius: 2 },

  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: sp(22) },

  headline: { fontSize: sp(24), fontWeight: '800', color: P.dark, marginBottom: sp(4) },
  subtitle:  { fontSize: sp(13), color: P.gray, marginBottom: sp(22) },

  phonePrefix:   { flexDirection: 'row', alignItems: 'center', marginRight: sp(8) },
  prefixTxt:     { fontSize: sp(14), color: P.light, fontWeight: '600', marginLeft: sp(6), marginRight: sp(4) },
  prefixDivider: { width: 1, height: sp(20), backgroundColor: P.border, marginLeft: sp(6) },

  roleLabel: { fontSize: sp(13), fontWeight: '600', color: P.light, marginBottom: sp(10), marginTop: sp(6) },
  roleRow:   { flexDirection: 'row', gap: sp(10) },
  roleBtn: {
    flex: 1, height: sp(54), borderRadius: sp(8),
    borderWidth: 1.5, borderColor: P.border,
    backgroundColor: P.white, alignItems: 'center', justifyContent: 'center',
  },
  roleBtnActive: { borderColor: P.teal, backgroundColor: P.tealLight },
  roleTxt:       { fontSize: sp(13), color: P.gray, fontWeight: '600' },
  roleTxtActive: { fontSize: sp(13), color: P.teal, fontWeight: '700' },

  footer: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    paddingHorizontal: sp(22), paddingTop: sp(12),
    // paddingBottom set inline via insets.bottom
    backgroundColor: P.bg,
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: P.border,
  },
  continueBtn: {
    width: '100%', paddingVertical: sp(16), borderRadius: sp(10),
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    elevation: 3, shadowColor: P.teal,
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6,
  },
  continueTxt: { color: P.white, fontSize: sp(16), fontWeight: '700', letterSpacing: 0.3 },
});

const fSt = StyleSheet.create({
  wrap:  { marginBottom: sp(14) },
  label: { fontSize: sp(13), fontWeight: '600', color: P.labelGray, marginBottom: sp(6) },
  row: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: P.border,
    borderRadius: sp(8), backgroundColor: P.white,
    paddingHorizontal: sp(12), height: sp(54),
  },
  rowFocused: { borderColor: P.teal },
  left:       { marginRight: sp(8) },
  right:      { marginLeft: sp(8) },
  input:      { flex: 1, fontSize: sp(14), color: P.dark, paddingVertical: 0 },
});