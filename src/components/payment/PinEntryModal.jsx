// src/components/payment/PinEntryModal.jsx
// ─────────────────────────────────────────────────────────────
//  MPIN Entry — centered card modal (teal theme).
//  - No custom keypad. A hidden TextInput brings up the NATIVE
//    numeric keyboard automatically when the modal opens / when the
//    PIN boxes are tapped.
//  - No logo asset (heart badge), no console.log / no Alert.
//  - Backend responseCode + responseMessage shown via <ResponseModal />.
//  onSubmit(pin) should be async and throw on failure → boxes shake+clear.
// ─────────────────────────────────────────────────────────────

import React, { useState, useRef, useCallback, useEffect, memo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
  ActivityIndicator,
  Keyboard,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

import ResponseModal from '../ResponseModal';

const { width: SW } = Dimensions.get('window');
const scale = n => (SW / 375) * n;

// ── Theme (teal) ──
const T = {
  navy: '#0D4F6B',
  teal: '#00B4CC',
  white: '#FFFFFF',
  textDark: '#111827',
  textGray: '#64748B',
  border: '#E5E7EB',
  disabled: '#CBD5E1',
  red: '#EF4444',
  redBg: '#FEE2E2',
  overlay: 'rgba(15,23,42,0.55)',
};

const PIN_LENGTH = 4; // 4-digit MPIN
const fmt = n => `Rs. ${Number(n || 0).toLocaleString('en-PK')}`;

// ── Single PIN box ──
const PinBox = memo(({ filled, isLast }) => (
  <View style={[box.cell, isLast && box.cellLast]}>
    {filled ? <Text style={box.dot}>•</Text> : null}
  </View>
));

const box = StyleSheet.create({
  cell: {
    width: scale(58),
    height: scale(58),
    borderWidth: 1,
    borderColor: T.border,
    borderRightWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellLast: { borderRightWidth: 1 },
  dot: {
    fontSize: scale(26),
    fontWeight: '800',
    color: T.textDark,
    includeFontPadding: false,
  },
});

// ── Main component ──
const PinEntryModal = ({
  visible,
  onClose,
  onSubmit,
  onForgotPin,
  amount,
  name,
  accountNumber,
  attempts = 5,
  title = 'Enter MPIN to authorize payment',

  // Backend response: { visible, code, message } | null
  error,
  onErrorClose,
}) => {
  const [pin, setPin] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const inputRef = useRef(null);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // Reset + auto-open the native keyboard when the modal appears
  useEffect(() => {
    if (visible) {
      setPin('');
      setSubmitting(false);
      const t = setTimeout(focusInput, 350);
      return () => clearTimeout(t);
    }
  }, [visible, focusInput]);

  const triggerShake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 35, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const runSubmit = useCallback(
    async (pinStr) => {
      setSubmitting(true);
      Keyboard.dismiss();
      try {
        await onSubmit?.(pinStr);
        // Parent closes the modal on success.
      } catch (err) {
        // No alert/log — shake + clear. Parent shows the exact backend
        // responseCode/message via the `error` prop.
        triggerShake();
        setPin('');
        setTimeout(focusInput, 250);
      } finally {
        setSubmitting(false);
      }
    },
    [onSubmit, triggerShake, focusInput],
  );

  const handleChange = useCallback(
    (text) => {
      if (submitting) return;
      const digits = text.replace(/[^0-9]/g, '').slice(0, PIN_LENGTH);
      setPin(digits);
    },
    [submitting],
  );

  const complete = pin.length === PIN_LENGTH;

  const handleSend = useCallback(() => {
    if (!complete || submitting) return;
    runSubmit(pin);
  }, [complete, submitting, pin, runSubmit]);

  const displayNumber = accountNumber ? String(accountNumber) : null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={s.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={submitting ? undefined : onClose}
        />

        <View style={s.card}>
          {/* Hidden input — drives the native numeric keyboard */}
          <TextInput
            ref={inputRef}
            value={pin}
            onChangeText={handleChange}
            keyboardType="number-pad"
            maxLength={PIN_LENGTH}
            secureTextEntry
            autoFocus={false}
            caretHidden
            editable={!submitting}
            style={s.hiddenInput}
          />

          {/* Close */}
          <TouchableOpacity
            onPress={onClose}
            style={s.closeBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            disabled={submitting}
          >
            <Icon name="x" size={scale(20)} color={T.textDark} />
          </TouchableOpacity>

          {/* Sending amount */}
          <Text style={s.sendingLabel}>Sending</Text>
          <Text style={s.amount}>{fmt(amount)}</Text>

          {/* Badge + name/number (no "Recipient" fallback text) */}
          {(name || displayNumber) && (
            <View style={s.recipientRow}>
              <View style={s.avatar}>
                <Icon name="heart" size={scale(20)} color={T.white} />
              </View>
              <View>
                {!!name && <Text style={s.recipientName}>{name}</Text>}
                {!!displayNumber && (
                  <Text style={s.recipientNumber}>{displayNumber}</Text>
                )}
              </View>
            </View>
          )}

          {/* Title */}
          <Text style={s.title}>{title}</Text>
          <View style={s.divider} />

          {/* PIN boxes — tap to open keyboard */}
          <TouchableWithoutFeedback onPress={focusInput} disabled={submitting}>
            <Animated.View
              style={[s.pinRow, { transform: [{ translateX: shakeAnim }] }]}
            >
              {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                <PinBox
                  key={i}
                  filled={i < pin.length}
                  isLast={i === PIN_LENGTH - 1}
                />
              ))}
            </Animated.View>
          </TouchableWithoutFeedback>

          {/* Attempts / verifying */}
          {submitting ? (
            <View style={s.verifyingRow}>
              <ActivityIndicator size="small" color={T.teal} />
              <Text style={s.verifyingTxt}>Verifying...</Text>
            </View>
          ) : (
            <Text style={s.attempts}>{attempts} attempts remaining</Text>
          )}

          {/* Warning */}
          <View style={s.warning}>
            <Icon name="alert-triangle" size={scale(20)} color={T.red} />
            <Text style={s.warningTxt}>
              Do not trust <Text style={s.warningBold}>ANYONE</Text> with your{' '}
              <Text style={s.warningBold}>MPIN</Text>
            </Text>
          </View>

          {/* Send money */}
          <TouchableOpacity
            style={[s.sendBtn, (!complete || submitting) && s.sendBtnDisabled]}
            onPress={handleSend}
            activeOpacity={0.88}
            disabled={!complete || submitting}
          >
            <Text style={s.sendTxt}>SEND MONEY</Text>
          </TouchableOpacity>

          {/* Forgot MPIN */}
          <TouchableOpacity
            onPress={onForgotPin}
            style={s.forgotBtn}
            activeOpacity={0.7}
            disabled={submitting}
          >
            <Text style={s.forgotTxt}>FORGOT MPIN</Text>
          </TouchableOpacity>
        </View>

        {/* Backend response — exact code + message from server */}
        {!!error && (
          <ResponseModal
            visible={!!error?.visible}
            variant="error"
            code={error?.code}
            message={error?.message}
            onClose={onErrorClose}
          />
        )}
      </View>
    </Modal>
  );
};

export default PinEntryModal;

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: T.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(18),
  },
  card: {
    width: '100%',
    maxWidth: scale(400),
    backgroundColor: T.white,
    borderRadius: scale(22),
    paddingHorizontal: scale(20),
    paddingTop: scale(14),
    paddingBottom: scale(20),
  },

  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    top: 0,
    left: 0,
  },

  closeBtn: { alignSelf: 'flex-end', padding: scale(4) },

  sendingLabel: {
    fontSize: scale(14),
    color: T.textGray,
    textAlign: 'center',
    marginTop: scale(2),
  },
  amount: {
    fontSize: scale(40),
    fontWeight: '800',
    color: T.textDark,
    textAlign: 'center',
    marginTop: scale(2),
  },

  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(12),
    marginTop: scale(10),
  },
  avatar: {
    width: scale(46),
    height: scale(46),
    borderRadius: scale(23),
    backgroundColor: T.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipientName: { fontSize: scale(18), fontWeight: '800', color: T.textDark },
  recipientNumber: { fontSize: scale(15), color: T.textGray, marginTop: scale(2) },

  title: {
    fontSize: scale(16),
    fontWeight: '800',
    color: T.textDark,
    textAlign: 'center',
    marginTop: scale(20),
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: T.border,
    marginTop: scale(14),
  },

  pinRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: scale(20),
  },

  attempts: {
    fontSize: scale(14),
    fontWeight: '600',
    color: T.teal,
    textAlign: 'center',
    marginTop: scale(14),
  },
  verifyingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(8),
    marginTop: scale(14),
  },
  verifyingTxt: { fontSize: scale(14), fontWeight: '600', color: T.teal },

  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
    backgroundColor: T.redBg,
    borderRadius: scale(24),
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    marginTop: scale(16),
  },
  warningTxt: { flex: 1, fontSize: scale(13.5), color: T.red },
  warningBold: { fontWeight: '800', color: T.red },

  sendBtn: {
    height: scale(52),
    borderRadius: scale(12),
    backgroundColor: T.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: scale(16),
  },
  sendBtnDisabled: { backgroundColor: T.disabled },
  sendTxt: {
    fontSize: scale(15),
    fontWeight: '700',
    color: T.white,
    letterSpacing: 0.5,
  },

  forgotBtn: {
    alignItems: 'center',
    paddingVertical: scale(12),
    marginTop: scale(4),
  },
  forgotTxt: {
    fontSize: scale(14),
    fontWeight: '800',
    color: T.teal,
    letterSpacing: 0.3,
  },
});
