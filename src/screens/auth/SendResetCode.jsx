// src/screens/auth/OTPVerification.jsx
// ─────────────────────────────────────────────────────────────
//  OTP Verification — FundMe App (React Native CLI)
//
//  ✅ Header row (back arrow + step label) REMOVED
//  ✅ Progress bar REMOVED
//  ✅ Hand-drawn envelope Views REMOVED
//  ✅ Real envelope icon from react-native-vector-icons
//  ✅ Entire content centred vertically on screen
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
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// ── Colour tokens ──────────────────────────────────────────
const C = {
  bg: '#F9FAFB',
  white: '#FFFFFF',
  teal: '#00B4CC',
  tealDark: '#0097AA',
  tealLight: 'rgba(0,180,204,0.12)',
  amber: '#F59E0B',
  amberLight: '#FEF3C7',
  textDark: '#111827',
  textGray: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  boxBorder: '#D1D5DB',
  boxFill: '#FFFFFF',
};

// ── OTP config ────────────────────────────────────────────
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
const SendResetCode = ({ navigation, route }) => {
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
  const slideAnim = useRef(new Animated.Value(30)).current;
  const iconScale = useRef(new Animated.Value(0.6)).current;

  // ── Countdown timer ──────────────────────────────────────
  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds(s => s - 1), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  // ── Entrance animations ──────────────────────────────────
  useEffect(() => {
    // Icon pops in
    Animated.spring(iconScale, {
      toValue: 1,
      tension: 55,
      friction: 6,
      delay: 100,
      useNativeDriver: true,
    }).start();

    // Content fades + slides up
    Animated.sequence([
      Animated.delay(200),
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
      ]),
    ]).start();

    // Auto-focus first OTP box
    setTimeout(() => inputRefs.current[0]?.current?.focus(), 500);
  }, [fadeAnim, slideAnim, iconScale]);

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

  const handleVerify = () => navigation.navigate('NewPasswordScreen');

  return (
    <SafeAreaView style={s.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <KeyboardAvoidingView
        style={s.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={s.centreWrap}>
          {/* ── Envelope icon from library ── */}
          <Animated.View
            style={[s.iconCircle, { transform: [{ scale: iconScale }] }]}
          >
            <Icon
              name="email-outline" // MaterialCommunityIcons envelope
              size={38}
              color={C.teal}
            />
          </Animated.View>

          {/* ── Text content ── */}
          <Animated.View
            style={[
              s.textBlock,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={s.headline}>Verify Your Email</Text>
            <Text style={s.subtitle}>We sent a 6-digit code to</Text>
            <Text style={s.emailText}>{email}</Text>
          </Animated.View>

          {/* ── OTP boxes ── */}
          <Animated.View
            style={[
              s.otpRow,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
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
          </Animated.View>

          {/* ── Expiry badge ── */}
          <Animated.View style={[s.expiryBadge, { opacity: fadeAnim }]}>
            <Icon name="clock-outline" size={16} color={C.amber} />
            <Text style={s.expiryText}>
              {seconds > 0
                ? `Expires in ${formatTime(seconds)}`
                : 'Code expired'}
            </Text>
          </Animated.View>

          {/* ── Verify button ── */}
          <Animated.View style={[s.btnWrap, { opacity: fadeAnim }]}>
            <TouchableOpacity onPress={handleVerify} activeOpacity={0.85}>
              <LinearGradient
                colors={[C.teal, C.tealDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.verifyBtn}
              >
                <Text style={s.verifyBtnText}>Verify</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* ── Resend link ── */}
          <Animated.View style={[s.resendRow, { opacity: fadeAnim }]}>
            <Text style={s.resendText}>{"Didn't get the code? "}</Text>
            <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
              <Text style={s.resendLink}>Resend</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SendResetCode;

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
  safeArea: {
    flex: 1,
    backgroundColor: C.bg,
  },

  kav: { flex: 1 },

  // ✅ All content centred vertically and horizontally
  centreWrap: {
    flex: 1,
    justifyContent: 'center', // ← vertical centre
    alignItems: 'center', // ← horizontal centre
    paddingHorizontal: 28,
    paddingVertical: 24,
  },

  // ── Envelope icon circle ──
  // ✅ Real icon from MaterialCommunityIcons: 'email-outline'
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },

  // ── Text block ──
  textBlock: {
    alignItems: 'center',
    marginBottom: 28,
  },
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
    marginBottom: 3,
    textAlign: 'center',
  },
  emailText: {
    fontSize: 14,
    color: C.teal,
    fontWeight: '700',
    textAlign: 'center',
  },

  // ── OTP row ──
  otpRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },

  // ── Expiry badge ──
  expiryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.amberLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 28,
    gap: 6,
  },
  expiryText: {
    fontSize: 13,
    color: C.amber,
    fontWeight: '700',
  },

  // ── Verify button ──
  btnWrap: { width: '100%', marginBottom: 20 },
  verifyBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
    shadowColor: C.teal,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // ── Resend row ──
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendText: { fontSize: 13, color: C.textGray },
  resendLink: { fontSize: 13, color: C.teal, fontWeight: '700' },
});
