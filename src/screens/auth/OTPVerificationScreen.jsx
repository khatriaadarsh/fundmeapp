// src/screens/auth/OTPVerification.jsx
// ─────────────────────────────────────────────────────────────
//  OTP Verification — Step 2 of 4
//  FundMe App (React Native CLI)
//
//  Back arrow | Step 2 of 4 | progress bar (50%)
//  Envelope icon
//  "Verify Your Email" headline
//  "We sent a 6-digit code to ahmed@gmail.com"
//  5 OTP input boxes
//  Amber "Expires in 4:32" badge
//  "Verify" teal button
//  "Didn't get the code? Resend"
// ─────────────────────────────────────────────────────────────

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

// ── Colour tokens ──────────────────────────────────────────
const C = {
  bg: '#F9FAFB',
  white: '#FFFFFF',
  teal: '#00B4CC',
  tealDark: '#0097AA',
  tealLight: 'rgba(0,180,204,0.10)',
  amber: '#F59E0B',
  amberLight: '#FEF3C7',
  textDark: '#111827',
  textGray: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  boxBorder: '#D1D5DB',
  boxFill: '#FFFFFF',
  boxActive: '#00B4CC',
  progressBg: '#E5E7EB',
};

// ── OTP length ────────────────────────────────────────────
const OTP_LENGTH = 5;

// ── Single OTP box ────────────────────────────────────────
const OTPBox = ({ value, isFocused, inputRef, onChangeText, onKeyPress }) => (
  <TextInput
    ref={inputRef}
    style={[
      otpStyle.box,
      value && otpStyle.boxFilled,
      isFocused && otpStyle.boxFocused,
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

// ── Main screen ────────────────────────────────────────────
const OTPVerification = ({ navigation, route }) => {
  const email = route?.params?.email ?? 'ahmed@gmail.com';

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [seconds, setSeconds] = useState(272); // 4:32
  const [focused, setFocused] = useState(0);

  const inputRefs = useRef(
    Array(OTP_LENGTH)
      .fill(null)
      .map(() => React.createRef()),
  );

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  // Countdown timer
  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds(s => s - 1), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  // Entrance animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
    // Auto-focus first box
    setTimeout(() => inputRefs.current[0]?.current?.focus(), 400);
  }, [fadeAnim, scaleAnim]);

  const formatTime = s => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const handleChange = (text, idx) => {
    const newOtp = [...otp];
    newOtp[idx] = text;
    setOtp(newOtp);
    if (text && idx < OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.current?.focus();
      setFocused(idx + 1);
    }
  };

  const handleKeyPress = ({ nativeEvent: { key } }, idx) => {
    if (key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.current?.focus();
      setFocused(idx - 1);
    }
  };

  const handleResend = () => setSeconds(272);

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={s.inner}>
          {/* ── Header ── */}
          <View style={s.headerRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={s.backBtn}
            >
              <Text style={s.backArrow}>←</Text>
            </TouchableOpacity>
            <Text style={s.stepLabel}>Step 2 of 4</Text>
          </View>

          {/* ── Progress bar ── */}
          <View style={s.progressBg}>
            <View style={[s.progressFill, { width: '50%' }]} />
          </View>

          <Animated.View
            style={[
              s.card,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}
          >
            {/* Envelope icon */}
            <View style={s.envelopeWrap}>
              <View style={s.envelopeOuter}>
                <View style={s.envelopeBody}>
                  <View style={s.envFlapL} />
                  <View style={s.envFlapR} />
                </View>
              </View>
            </View>

            {/* Headline */}
            <Text style={s.headline}>Verify Your Email</Text>
            <Text style={s.subtitle}>We sent a 6-digit code to</Text>
            <Text style={s.emailText}>{email}</Text>

            {/* OTP boxes */}
            <View style={s.otpRow}>
              {otp.map((val, idx) => (
                <OTPBox
                  key={idx}
                  value={val}
                  isFocused={focused === idx}
                  inputRef={inputRefs.current[idx]}
                  onChangeText={text => handleChange(text, idx)}
                  onKeyPress={e => handleKeyPress(e, idx)}
                />
              ))}
            </View>

            {/* Expires badge */}
            <View style={s.expiryBadge}>
              <Text style={s.expiryIcon}>⏰</Text>
              <Text style={s.expiryText}>
                {seconds > 0
                  ? `Expires in ${formatTime(seconds)}`
                  : 'Code expired'}
              </Text>
            </View>

            {/* Verify button */}
            <TouchableOpacity
              onPress={() => navigation.navigate('CNICUploadScreen')}
              activeOpacity={0.85}
              style={{ width: '100%' }}
            >
              <LinearGradient
                colors={[C.teal, C.tealDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.verifyBtn}
              >
                <Text style={s.verifyBtnText}>Verify</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Resend */}
            <View style={s.resendRow}>
              <Text style={s.resendText}>{"Didn't get the code? "}</Text>
              <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
                <Text style={s.resendLink}>Resend</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default OTPVerification;

// ── OTP box styles ─────────────────────────────────────────
const otpStyle = StyleSheet.create({
  box: {
    width: 52,
    height: 56,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.boxBorder,
    backgroundColor: C.boxFill,
    fontSize: 22,
    fontWeight: '700',
    color: C.textDark,
    textAlign: 'center',
  },
  boxFilled: {
    borderColor: C.teal,
    backgroundColor: 'rgba(0,180,204,0.06)',
  },
  boxFocused: {
    borderColor: C.teal,
    borderWidth: 2,
  },
});

// ── Screen styles ──────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  inner: {
    flex: 1,
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
  backArrow: { fontSize: 20, color: '#111827', fontWeight: '600' },
  stepLabel: { fontSize: 13, color: C.textGray, fontWeight: '500' },

  // Progress
  progressBg: {
    height: 4,
    backgroundColor: C.progressBg,
    borderRadius: 2,
    marginBottom: 32,
  },
  progressFill: { height: 4, backgroundColor: C.teal, borderRadius: 2 },

  // Card (centre content)
  card: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },

  // Envelope icon
  envelopeWrap: {
    marginBottom: 24,
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  envelopeOuter: {
    width: 38,
    height: 30,
    alignItems: 'center',
  },
  envelopeBody: {
    width: 38,
    height: 28,
    borderWidth: 2,
    borderColor: C.teal,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  envFlapL: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: C.teal,
    top: -12,
    left: -2,
    transform: [{ rotate: '45deg' }],
  },
  envFlapR: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: C.teal,
    top: -12,
    right: -2,
    transform: [{ rotate: '-45deg' }],
  },

  // Text
  headline: {
    fontSize: 22,
    fontWeight: '800',
    color: C.textDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: C.textGray,
    marginBottom: 2,
    textAlign: 'center',
  },
  emailText: {
    fontSize: 14,
    color: C.teal,
    fontWeight: '700',
    marginBottom: 28,
    textAlign: 'center',
  },

  // OTP row
  otpRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },

  // Expiry badge
  expiryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.amberLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginBottom: 28,
    gap: 6,
  },
  expiryIcon: { fontSize: 14 },
  expiryText: { fontSize: 13, color: C.amber, fontWeight: '700' },

  // Verify button
  verifyBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: C.teal,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  verifyBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  // Resend
  resendRow: { flexDirection: 'row', alignItems: 'center' },
  resendText: { fontSize: 13, color: C.textGray },
  resendLink: { fontSize: 13, color: C.teal, fontWeight: '700' },
});
