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
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const COLORS = {
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

const OTP_LENGTH = 5;

const OTPBox = ({ value, isFocused, inputRef, onChangeText, onKeyPress }) => (
  <TextInput
    ref={inputRef}
    style={[
      styles.otpBox,
      value && styles.otpBoxFilled,
      isFocused && styles.otpBoxFocused,
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

const SendResetCode = ({ navigation, route }) => {
  const email = route?.params?.email ?? 'ahmed@gmail.com';

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [seconds, setSeconds] = useState(272);
  const [focused, setFocused] = useState(0);

  const inputRefs = useRef(
    Array(OTP_LENGTH)
      .fill(null)
      .map(() => React.createRef()),
  );

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const iconScale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setInterval(() => setSeconds(s => s - 1), 1000);
    return () => clearInterval(timer);
  }, [seconds]);

  useEffect(() => {
    Animated.spring(iconScale, {
      toValue: 1,
      tension: 55,
      friction: 6,
      delay: 100,
      useNativeDriver: true,
    }).start();

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

    setTimeout(() => inputRefs.current[0]?.current?.focus(), 500);
  }, [fadeAnim, slideAnim, iconScale]);

  const formatTime = useCallback(s => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  }, []);

  const handleChange = useCallback(
    (text, idx) => {
      const newOtp = [...otp];
      newOtp[idx] = text;
      setOtp(newOtp);
      if (text && idx < OTP_LENGTH - 1) {
        inputRefs.current[idx + 1]?.current?.focus();
        setFocused(idx + 1);
      }
    },
    [otp],
  );

  const handleKeyPress = useCallback(
    ({ nativeEvent: { key } }, idx) => {
      if (key === 'Backspace' && !otp[idx] && idx > 0) {
        inputRefs.current[idx - 1]?.current?.focus();
        setFocused(idx - 1);
      }
    },
    [otp],
  );

  const handleResend = useCallback(() => setSeconds(272), []);

  const handleVerify = useCallback(
    () => navigation.navigate('NewPasswordScreen'),
    [navigation],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.centreWrap}>
          <Animated.View
            style={[styles.iconCircle, { transform: [{ scale: iconScale }] }]}
          >
            <Icon name="email-outline" size={38} color={COLORS.teal} />
          </Animated.View>

          <Animated.View
            style={[
              styles.textBlock,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.headline}>Verify Your Email</Text>
            <Text style={styles.subtitle}>We sent a 6-digit code to</Text>
            <Text style={styles.emailText}>{email}</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.otpRow,
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

          <Animated.View style={[styles.expiryBadge, { opacity: fadeAnim }]}>
            <Icon name="clock-outline" size={16} color={COLORS.amber} />
            <Text style={styles.expiryText}>
              {seconds > 0
                ? `Expires in ${formatTime(seconds)}`
                : 'Code expired'}
            </Text>
          </Animated.View>

          <Animated.View style={[styles.btnWrap, { opacity: fadeAnim }]}>
            <TouchableOpacity onPress={handleVerify} activeOpacity={0.85}>
              <LinearGradient
                colors={[COLORS.teal, COLORS.tealDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.verifyBtn}
              >
                <Text style={styles.verifyBtnText}>Verify</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={[styles.resendRow, { opacity: fadeAnim }]}>
            <Text style={styles.resendText}>{"Didn't get the code? "}</Text>
            <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
              <Text style={styles.resendLink}>Resend</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  keyboardView: {
    flex: 1,
  },
  centreWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
    paddingHorizontal: 28,
    paddingVertical: 24,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  textBlock: {
    alignItems: 'center',
    marginBottom: 28,
  },
  headline: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textGray,
    marginBottom: 3,
    textAlign: 'center',
  },
  emailText: {
    fontSize: 14,
    color: COLORS.teal,
    fontWeight: '700',
    textAlign: 'center',
  },
  otpRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  otpBox: {
    width: 52,
    height: 56,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.boxBorder,
    backgroundColor: COLORS.boxFill,
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
  },
  otpBoxFilled: {
    borderColor: COLORS.teal,
    backgroundColor: 'rgba(0,180,204,0.06)',
  },
  otpBoxFocused: {
    borderColor: COLORS.teal,
    borderWidth: 2,
  },
  expiryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.amberLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 28,
    gap: 6,
  },
  expiryText: {
    fontSize: 13,
    color: COLORS.amber,
    fontWeight: '700',
  },
  btnWrap: {
    width: '100%',
    marginBottom: 20,
  },
  verifyBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
    shadowColor: COLORS.teal,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 13,
    color: COLORS.textGray,
  },
  resendLink: {
    fontSize: 13,
    color: COLORS.teal,
    fontWeight: '700',
  },
});

export default SendResetCode;
