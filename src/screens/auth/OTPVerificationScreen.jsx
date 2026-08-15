// src/screens/auth/OTPVerificationScreen.js
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
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

import { useRegisterStep2, useResendOtp } from '../../hooks/useRegistration';
import { useAppContext } from '../../context/AppContext';
import { FullScreenLoader } from '../../components/common/Loader';
import ResponseModal from '../../components/ResponseModal';
import Icons from 'react-native-vector-icons/Feather';
import { P, sp } from '../../theme/theme';
const { width: SW } = Dimensions.get('window');
// const sp = n => (SW / 375) * n;

const C = {
  bg: '#F9FAFB',
  white: '#FFFFFF',
  teal: '#00B4CC',
  tealDark: '#0097AA',
  amber: '#F59E0B',
  amberLight: '#FEF3C7',
  textDark: '#111827',
  textGray: '#6B7280',
  border: '#E5E7EB',
  disabled: '#9CA3AF',
};

const OTP_LENGTH = 5;
const RESEND_SECONDS = 272;

/**
 * CNIC upload is step 3 of the normal registration flow.
 *
 * Passed explicitly on navigation because React Navigation MERGES params
 * into an existing route instance rather than replacing them. If the user
 * has previously opened CNICUploadScreen from a CNIC-rejection
 * notification, that instance still carries isRejection:true and
 * stepNumber:2 — and a bare navigate('CNICUploadScreen', { email }) would
 * inherit both, making the normal flow submit as a rejection re-upload.
 */
const CNIC_STEP = 3;

const CNIC_NORMAL_FLOW_PARAMS = {
  isRejection: false,
  stepNumber: CNIC_STEP,
  rejectedStep: null,
  rejectionReason: '',
  notificationType: '',
  notificationStatus: '',
  userStatus: '',
  rawNotification: null,
};

const OTPBox = ({
  value,
  isFocused,
  inputRef,
  onChangeText,
  onKeyPress,
  editable,
}) => (
  <TextInput
    ref={inputRef}
    style={[st.box, value && st.boxFilled, isFocused && st.boxFocused]}
    value={value}
    onChangeText={onChangeText}
    onKeyPress={onKeyPress}
    keyboardType="number-pad"
    maxLength={1}
    textAlign="center"
    caretHidden
    selectTextOnFocus
    editable={editable}
  />
);

const OTPVerificationScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { currentUser } = useAppContext();

  const { mutate: verifyOtp, isPending: isVerifying } = useRegisterStep2();
  const { mutate: resendOtp, isPending: isResending } = useResendOtp();

  // Email priority: navigation param (from step 1) → AppContext (draft resume)
  const email = route?.params?.email || currentUser?.email || '';

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [focused, setFocused] = useState(0);

  const inputRefs = useRef(
    Array(OTP_LENGTH)
      .fill(null)
      .map(() => React.createRef()),
  );
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  // Errors only. This is step 2 of 4 — a success dialog would just add a
  // tap between the user and the next step. Verification advances
  // silently; resend confirms itself through the reset timer and boxes.
  const [errorModal, setErrorModal] = useState({
    visible: false,
    title: '',
    message: '',
    code: '',
    refocus: false,
  });

  const closeErrorModal = useCallback(() => {
    const shouldRefocus = errorModal.refocus;
    setErrorModal(prev => ({ ...prev, visible: false, refocus: false }));

    if (shouldRefocus) {
      // Deferred until the modal has finished dismissing — focusing
      // mid-animation gets swallowed on Android.
      setTimeout(() => {
        inputRefs.current[0]?.current?.focus();
        setFocused(0);
      }, 250);
    }
  }, [errorModal.refocus]);

  const showError = useCallback(({ title, message, code = '', refocus = false }) => {
    setErrorModal({
      visible: true,
      title: title || 'Error',
      message: message || 'Something went wrong. Please try again.',
      code: code ? String(code) : '',
      refocus,
    });
  }, []);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds(s => s - 1), 1000);
    return () => clearInterval(id);
  }, [seconds]);

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
    setTimeout(() => inputRefs.current[0]?.current?.focus(), 400);
  }, [fadeAnim, scaleAnim]);

  const formatTime = s =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const handleChange = (text, idx) => {
    if (text.length > 1) {
      const digits = text.replace(/\D/g, '').slice(0, OTP_LENGTH).split('');
      const next = Array(OTP_LENGTH).fill('');
      digits.forEach((d, i) => {
        next[i] = d;
      });
      setOtp(next);
      const lastIdx = Math.min(digits.length, OTP_LENGTH) - 1;
      inputRefs.current[lastIdx]?.current?.focus();
      setFocused(lastIdx);
      return;
    }

    const next = [...otp];
    next[idx] = text;
    setOtp(next);
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

  const handleVerify = useCallback(() => {
    const otpValue = otp.join('');
    if (otpValue.length !== OTP_LENGTH) {
      showError({ message: `Please enter the ${OTP_LENGTH}-digit OTP.` });
      return;
    }
    if (!email) {
      showError({ message: 'Missing email. Please restart registration.' });
      return;
    }

    verifyOtp(
      { email, otp: otpValue },
      {
        onSuccess: body => {
          // HTTP 200 alone isn't success — the backend returns failures
          // with a 200 and a non-"000" responseCode.
          if (body?.responseCode && body.responseCode !== '000') {
            setOtp(Array(OTP_LENGTH).fill(''));
            showError({
              title: 'Verification Failed',
              message:
                body?.responseMessage ||
                'Verification failed. Please try again.',
              code: body?.responseCode,
              refocus: true,
            });
            return;
          }

          // Silent success — straight to CNIC upload (step 3).
          // The rejection params are reset explicitly; see
          // CNIC_NORMAL_FLOW_PARAMS above for why.
          navigation.navigate('CNICUploadScreen', {
            ...CNIC_NORMAL_FLOW_PARAMS,
            email,
          });
        },
        onError: err => {
          const data = err?.response?.data || err?.raw;
          setOtp(Array(OTP_LENGTH).fill(''));
          showError({
            title: 'Verification Failed',
            message:
              data?.responseMessage ||
              err?.message ||
              'Verification failed. Please try again.',
            code: data?.responseCode || err?.code || '',
            refocus: true,
          });
        },
      },
    );
  }, [otp, email, verifyOtp, navigation, showError]);

  // ─── Resend OTP ──────────────────────────────────────────
  const handleResend = useCallback(() => {
    if (!email) {
      showError({ message: 'Missing email. Please restart registration.' });
      return;
    }
    if (seconds > 0) return; // safety — button is disabled too

    resendOtp(email, {
      onSuccess: body => {
        if (body?.responseCode && body.responseCode !== '000') {
          showError({
            title: 'Resend Failed',
            message:
              body?.responseMessage ||
              'Failed to resend OTP. Please try again.',
            code: body?.responseCode,
          });
          return;
        }

        // The cleared boxes and restarted countdown are the confirmation.
        setOtp(Array(OTP_LENGTH).fill(''));
        setSeconds(RESEND_SECONDS);
        inputRefs.current[0]?.current?.focus();
        setFocused(0);
      },
      onError: err => {
        const data = err?.response?.data || err?.raw;
        showError({
          title: 'Resend Failed',
          message:
            data?.responseMessage ||
            err?.message ||
            'Failed to resend OTP. Please try again.',
          code: data?.responseCode || err?.code || '',
        });
      },
    });
  }, [email, seconds, resendOtp, showError]);

  const otpComplete = otp.every(Boolean);
  const isBusy = isVerifying || isResending;
  const canResend = seconds <= 0 && !isBusy;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={C.bg}
        translucent={false}
      />

      <KeyboardAvoidingView
        style={s.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[s.inner, { paddingTop: insets.top + sp(6) }]}>
          <View style={s.headerRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={s.backBtn}
            >
              <Icons name="arrow-left" size={sp(22)} color={P.dark} />
            </TouchableOpacity>
            <Text style={s.stepLabel}>Step 2 of 4</Text>
          </View>

          <View style={s.progressBg}>
            <View style={s.progressFill} />
          </View>

          <Animated.View
            style={[
              s.card,
              { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
            ]}
          >
            <View style={s.envelopeWrap}>
              <View style={s.envelopeOuter}>
                <View style={s.envelopeBody}>
                  <View style={s.envFlapL} />
                  <View style={s.envFlapR} />
                </View>
              </View>
            </View>

            <Text style={s.headline}>Verify Your Email</Text>
            <Text style={s.subtitle}>We sent a {OTP_LENGTH}-digit code to</Text>
            <Text style={s.emailText}>{email}</Text>

            <View style={s.otpRow}>
              {otp.map((val, idx) => (
                <OTPBox
                  key={idx}
                  value={val}
                  isFocused={focused === idx}
                  inputRef={inputRefs.current[idx]}
                  onChangeText={text => handleChange(text, idx)}
                  onKeyPress={e => handleKeyPress(e, idx)}
                  editable={!isBusy}
                />
              ))}
            </View>

            <View style={s.expiryBadge}>
              <Text style={s.expiryIcon}>⏰</Text>
              <Text style={s.expiryText}>
                {seconds > 0
                  ? `Expires in ${formatTime(seconds)}`
                  : 'Code expired'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleVerify}
              activeOpacity={0.85}
              style={s.verifyBtnWrap}
              disabled={!otpComplete || isBusy}
            >
              <LinearGradient
                colors={
                  !otpComplete || isBusy
                    ? [C.disabled, C.disabled]
                    : [C.teal, C.tealDark]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.verifyBtn}
              >
                <Text style={s.verifyBtnText}>Verify</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={s.resendRow}>
              <Text style={s.resendText}>{"Didn't get the code? "}</Text>
              <TouchableOpacity
                onPress={handleResend}
                activeOpacity={0.7}
                disabled={!canResend}
              >
                <Text
                  style={[s.resendLink, !canResend && { color: C.disabled }]}
                >
                  {isResending ? 'Sending…' : 'Resend'}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>

      <FullScreenLoader
        visible={isVerifying || isResending}
        message={isResending ? 'Sending new OTP…' : 'Verifying OTP…'}
      />

      <ResponseModal
        visible={errorModal.visible}
        variant="error"
        title={errorModal.title}
        message={errorModal.message}
        code={errorModal.code}
        onClose={closeErrorModal}
      />
    </SafeAreaView>
  );
};

export default OTPVerificationScreen;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  kav: { flex: 1 },

  inner: { flex: 1, paddingHorizontal: sp(22), paddingBottom: sp(36) },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: sp(10),
  },
  backBtn: { padding: sp(4) },
  backArrow: { fontSize: sp(20), color: C.textDark, fontWeight: '600' },
  stepLabel: { fontSize: sp(13), color: C.textGray, fontWeight: '500' },

  progressBg: {
    height: 4,
    backgroundColor: C.border,
    borderRadius: 2,
    marginBottom: sp(32),
  },
  progressFill: {
    height: 4,
    width: '50%',
    backgroundColor: C.teal,
    borderRadius: 2,
  },

  card: { flex: 1, alignItems: 'center', paddingHorizontal: sp(8) },

  envelopeWrap: {
    marginBottom: sp(24),
    width: sp(72),
    height: sp(72),
    borderRadius: sp(36),
    backgroundColor: 'rgba(0,180,204,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  envelopeOuter: { width: sp(38), height: sp(30), alignItems: 'center' },
  envelopeBody: {
    width: sp(38),
    height: sp(28),
    borderWidth: 2,
    borderColor: C.teal,
    borderRadius: sp(4),
    overflow: 'hidden',
    position: 'relative',
  },
  envFlapL: {
    position: 'absolute',
    width: sp(24),
    height: sp(24),
    borderRightWidth: 2,
    borderBottomWidth: 2,
    borderColor: C.teal,
    top: -sp(12),
    left: -sp(2),
    transform: [{ rotate: '45deg' }],
  },
  envFlapR: {
    position: 'absolute',
    width: sp(24),
    height: sp(24),
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: C.teal,
    top: -sp(12),
    right: -sp(2),
    transform: [{ rotate: '-45deg' }],
  },

  headline: {
    fontSize: sp(22),
    fontWeight: '800',
    color: C.textDark,
    marginBottom: sp(8),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: sp(14),
    color: C.textGray,
    marginBottom: sp(2),
    textAlign: 'center',
  },
  emailText: {
    fontSize: sp(14),
    color: C.teal,
    fontWeight: '700',
    marginBottom: sp(28),
    textAlign: 'center',
  },

  otpRow: { flexDirection: 'row', gap: sp(8), marginBottom: sp(20) },
  expiryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: sp(20),
    paddingHorizontal: sp(14),
    paddingVertical: sp(7),
    marginBottom: sp(28),
    gap: sp(6),
  },
  expiryIcon: { fontSize: sp(14) },
  expiryText: { fontSize: sp(13), color: C.amber, fontWeight: '700' },

  verifyBtnWrap: { width: '100%' },
  verifyBtn: {
    width: '100%',
    paddingVertical: sp(16),
    borderRadius: sp(10),
    alignItems: 'center',
    marginBottom: sp(20),
    elevation: 3,
    shadowColor: C.teal,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  verifyBtnText: { color: '#FFFFFF', fontSize: sp(16), fontWeight: '700' },

  resendRow: { flexDirection: 'row', alignItems: 'center' },
  resendText: { fontSize: sp(13), color: C.textGray },
  resendLink: { fontSize: sp(13), color: C.teal, fontWeight: '700' },
});

const st = StyleSheet.create({
  box: {
    width: sp(46),
    height: sp(56),
    borderRadius: sp(10),
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    fontSize: sp(22),
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  boxFilled: {
    borderColor: '#00B4CC',
    backgroundColor: 'rgba(0,180,204,0.06)',
  },
  boxFocused: { borderColor: '#00B4CC', borderWidth: 2 },
});