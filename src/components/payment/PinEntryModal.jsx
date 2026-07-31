// src/components/payment/PinEntryModal.jsx
// ─────────────────────────────────────────────────────────────
//  PIN Entry Modal — themed to match app colors, presented as a
//  Modal. Calls onSubmit(pin) when 4 digits are entered; onSubmit
//  should be an async function that throws on failure (the modal
//  will shake + clear the PIN automatically on error).
// ─────────────────────────────────────────────────────────────

import React, { useState, useRef, useCallback, useEffect, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';

import { COLORS, SPACING, TYPOGRAPHY, scale } from '../../theme';

const { width: SW, height: SH } = Dimensions.get('window');
const vscale = n => (SH / 812) * n;

const T = {
  navy: COLORS?.primary ?? '#0D4F6B',
  navyDark: COLORS?.primaryDark ?? '#0B3D52',
  teal: COLORS?.secondary ?? '#00B4CC',
  white: COLORS?.white ?? '#FFFFFF',
  textDark: COLORS?.textPrimary ?? '#111827',
  textGray: COLORS?.textSecondary ?? '#64748B',
  bg: COLORS?.background ?? '#F8FAFC',
  dotBorder: COLORS?.secondary ?? '#00B4CC',
  dotFill: COLORS?.secondary ?? '#00B4CC',
  red: '#EF4444',
};

const PIN_LENGTH = 4;

const PAD_KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'del'],
];

// ─────────────────────────────────────────────────────────────
//  PinDot
// ─────────────────────────────────────────────────────────────
const PinDot = memo(({ filled }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (filled) {
      Animated.sequence([
        Animated.spring(scaleAnim, { toValue: 1.25, tension: 300, friction: 6, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 200, friction: 8, useNativeDriver: true }),
      ]).start();
    }
  }, [filled, scaleAnim]);

  return (
    <Animated.View
      style={[pd.dot, filled && pd.dotFilled, { transform: [{ scale: scaleAnim }] }]}
    >
      {filled && <Text style={pd.asterisk}>*</Text>}
    </Animated.View>
  );
});

const pd = StyleSheet.create({
  dot: {
    width: scale(54),
    height: scale(54),
    borderRadius: scale(12),
    borderWidth: 2,
    borderColor: T.dotBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: T.white,
    marginHorizontal: scale(8),
  },
  dotFilled: { backgroundColor: T.white },
  asterisk: {
    fontSize: scale(28),
    fontWeight: '800',
    color: T.dotFill,
    includeFontPadding: false,
    lineHeight: scale(30),
  },
});

// ─────────────────────────────────────────────────────────────
//  NumKey
// ─────────────────────────────────────────────────────────────
const NumKey = memo(({ label, onPress, disabled }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(scaleAnim, { toValue: 0.88, tension: 300, friction: 8, useNativeDriver: true }).start();
  const handlePressOut = () =>
    Animated.spring(scaleAnim, { toValue: 1, tension: 200, friction: 8, useNativeDriver: true }).start();

  if (!label) return <View style={nk.empty} />;

  const isDelete = label === 'del';

  return (
    <TouchableOpacity
      onPress={() => !disabled && onPress(label)}
      onPressIn={disabled ? undefined : handlePressIn}
      onPressOut={disabled ? undefined : handlePressOut}
      activeOpacity={1}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      disabled={disabled}
    >
      <Animated.View
        style={[
          nk.key,
          isDelete && nk.deleteKey,
          disabled && nk.keyDisabled,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {isDelete ? (
          <Icon name="delete" size={scale(20)} color={T.white} />
        ) : (
          <Text style={nk.label}>{label}</Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
});

const nk = StyleSheet.create({
  key: {
    width: scale(72),
    height: scale(72),
    borderRadius: scale(36),
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyDisabled: { opacity: 0.4 },
  deleteKey: {
    width: scale(56),
    height: scale(44),
    borderRadius: scale(10),
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  empty: { width: scale(72), height: scale(72) },
  label: {
    fontSize: scale(26),
    fontFamily: TYPOGRAPHY?.fontFamily?.semiBold ?? 'System',
    color: T.white,
    includeFontPadding: false,
  },
});

// ─────────────────────────────────────────────────────────────
//  Wave divider
// ─────────────────────────────────────────────────────────────
const WaveDivider = memo(() => (
  <View style={wv.container} pointerEvents="none">
    <View style={[wv.wave, wv.wave3]} />
    <View style={[wv.wave, wv.wave2]} />
    <View style={[wv.wave, wv.wave1]} />
  </View>
));

const WAVE_H = scale(48);
const wv = StyleSheet.create({
  container: { width: SW, height: WAVE_H, position: 'relative', marginBottom: -2 },
  wave: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: WAVE_H * 1.6,
    borderTopLeftRadius: SW * 0.55,
    borderTopRightRadius: SW * 0.55,
  },
  wave1: { backgroundColor: T.white, bottom: 0 },
  wave2: { backgroundColor: 'rgba(255,255,255,0.5)', bottom: scale(6), transform: [{ scaleX: 1.05 }] },
  wave3: { backgroundColor: 'rgba(255,255,255,0.25)', bottom: scale(12), transform: [{ scaleX: 1.1 }] },
});

// ─────────────────────────────────────────────────────────────
//  PinEntryModal
// ─────────────────────────────────────────────────────────────
const PinEntryModal = ({ visible, onClose, onSubmit }) => {
  const [pin, setPin] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setPin([]);
      setSubmitting(false);
    }
  }, [visible]);

  const triggerShake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 35, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const handleKey = useCallback(
    async key => {
      if (submitting) return;

      if (key === 'del') {
        setPin(prev => prev.slice(0, -1));
        return;
      }
      if (pin.length >= PIN_LENGTH) return;

      const newPin = [...pin, key];
      setPin(newPin);

      if (newPin.length === PIN_LENGTH) {
        const pinStr = newPin.join('');
        setSubmitting(true);
        try {
          await onSubmit?.(pinStr);
          // On success, the parent screen is responsible for closing
          // this modal (e.g. once it opens the receipt).
        } catch (err) {
          triggerShake();
          setPin([]);
        } finally {
          setSubmitting(false);
        }
      }
    },
    [pin, submitting, onSubmit, triggerShake],
  );

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={s.root}>
        <StatusBar barStyle="light-content" backgroundColor={T.navy} />

        <SafeAreaView style={s.header} edges={['top']}>
          <TouchableOpacity
            onPress={onClose}
            style={s.backBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            disabled={submitting}
          >
            <Icon name="arrow-left" size={scale(20)} color={T.white} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Enter PIN</Text>
        </SafeAreaView>

        <View style={s.cardSection}>
          <Text style={s.emoji}>🙈</Text>

          <Text style={s.pinTitle}>Enter PIN</Text>
          <Text style={s.pinSubtitle}>
            {submitting ? 'Verifying your PIN...' : 'Please enter your PIN to proceed'}
          </Text>

          <Animated.View style={[s.dotsRow, { transform: [{ translateX: shakeAnim }] }]}>
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <PinDot key={i} filled={i < pin.length} />
            ))}
          </Animated.View>

          {submitting && (
            <ActivityIndicator size="small" color={T.teal} style={s.submittingLoader} />
          )}
        </View>

        <View style={s.waveWrapper}>
          <WaveDivider />
        </View>

        <View style={s.padSection}>
          {PAD_KEYS.map((row, ri) => (
            <View key={ri} style={s.padRow}>
              {row.map((key, ki) => (
                <NumKey key={ki} label={key} onPress={handleKey} disabled={submitting} />
              ))}
            </View>
          ))}
          <SafeAreaView edges={['bottom']} style={{ height: vscale(16) }} />
        </View>
      </View>
    </Modal>
  );
};

export default PinEntryModal;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: T.navy },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingVertical: scale(14),
    backgroundColor: T.navy,
  },
  backBtn: { marginRight: scale(16) },
  headerTitle: {
    fontSize: scale(20),
    fontFamily: TYPOGRAPHY?.fontFamily?.bold ?? 'System',
    color: T.white,
    letterSpacing: -0.3,
  },
  cardSection: {
    flex: 1,
    backgroundColor: T.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: scale(16),
  },
  emoji: { fontSize: scale(60), marginBottom: scale(16) },
  pinTitle: {
    fontSize: scale(22),
    fontFamily: TYPOGRAPHY?.fontFamily?.bold ?? 'System',
    color: T.textDark,
    marginBottom: scale(8),
    letterSpacing: -0.3,
  },
  pinSubtitle: {
    fontSize: scale(13),
    fontFamily: TYPOGRAPHY?.fontFamily?.regular ?? 'System',
    color: T.textGray,
    marginBottom: scale(28),
  },
  dotsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  submittingLoader: { marginTop: scale(20) },
  waveWrapper: { backgroundColor: T.navy },
  padSection: { backgroundColor: T.navy, paddingTop: scale(16), paddingBottom: scale(8), alignItems: 'center' },
  padRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: scale(20), marginBottom: scale(8) },
});