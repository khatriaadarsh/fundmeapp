// src/screens/payment/PinEntryScreen.jsx
// ─────────────────────────────────────────────────────────────
//  PIN Entry Screen — matches screenshot exactly
//  Colors from COLORS / SPACING / TYPOGRAPHY / scale (theme)
//  React Native CLI  ·  Fully responsive
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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';

import { COLORS, SPACING, TYPOGRAPHY, scale } from '../../theme';

// ─────────────────────────────────────────────────────────────
//  Responsive helpers
// ─────────────────────────────────────────────────────────────
const { width: SW, height: SH } = Dimensions.get('window');
const vscale = n => (SH / 812) * n;

// ─────────────────────────────────────────────────────────────
//  Design tokens — extend COLORS from theme
// ─────────────────────────────────────────────────────────────
const T = {
  navy: COLORS?.primary ?? '#1A2D4F',
  navyDark: COLORS?.primaryDark ?? '#152540',
  teal: COLORS?.secondary ?? '#00C896',
  white: COLORS?.white ?? '#FFFFFF',
  textDark: COLORS?.textPrimary ?? '#1A2D4F',
  textGray: COLORS?.textSecondary ?? '#8A9BB0',
  bg: COLORS?.background ?? '#F5F7FA',
  dotBorder: COLORS?.secondary ?? '#00C896',
  dotFill: COLORS?.secondary ?? '#00C896',
};

const PIN_LENGTH = 4;

// ─────────────────────────────────────────────────────────────
//  NumPad key layout
// ─────────────────────────────────────────────────────────────
const PAD_KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'del'],
];

// ─────────────────────────────────────────────────────────────
//  PinDot — single animated PIN indicator
// ─────────────────────────────────────────────────────────────
const PinDot = memo(({ filled }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (filled) {
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1.25,
          tension: 300,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 200,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [filled, scaleAnim]);

  return (
    <Animated.View
      style={[
        pd.dot,
        filled && pd.dotFilled,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      {filled && <View style={pd.innerDot} />}
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
  dotFilled: {
    backgroundColor: T.white,
  },
  innerDot: {
    width: scale(16),
    height: scale(16),
    borderRadius: scale(8),
    backgroundColor: T.dotFill,
  },
});

// ─────────────────────────────────────────────────────────────
//  NumKey — single numpad button
// ─────────────────────────────────────────────────────────────
const NumKey = memo(({ label, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(scaleAnim, {
      toValue: 0.88,
      tension: 300,
      friction: 8,
      useNativeDriver: true,
    }).start();

  const handlePressOut = () =>
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 200,
      friction: 8,
      useNativeDriver: true,
    }).start();

  if (!label) return <View style={nk.empty} />;

  return (
    <TouchableOpacity
      onPress={() => onPress(label)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Animated.View style={[nk.key, { transform: [{ scale: scaleAnim }] }]}>
        {label === 'del' ? (
          <Icon name="delete" size={scale(22)} color={T.white} />
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
  empty: {
    width: scale(72),
    height: scale(72),
  },
  label: {
    fontSize: scale(26),
    fontFamily: TYPOGRAPHY?.fontFamily?.semiBold ?? 'System',
    color: T.white,
    includeFontPadding: false,
  },
});

// ─────────────────────────────────────────────────────────────
//  Wave SVG — white wave divider between card and numpad
//  Built with pure View/border tricks (no SVG dependency)
// ─────────────────────────────────────────────────────────────
const WaveDivider = memo(() => (
  <View style={wv.container} pointerEvents="none">
    {/* Three layered waves using border-radius curves */}
    <View style={[wv.wave, wv.wave3]} />
    <View style={[wv.wave, wv.wave2]} />
    <View style={[wv.wave, wv.wave1]} />
  </View>
));

const WAVE_H = scale(48);
const wv = StyleSheet.create({
  container: {
    width: SW,
    height: WAVE_H,
    position: 'relative',
    marginBottom: -2,
  },
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
  wave2: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    bottom: scale(6),
    transform: [{ scaleX: 1.05 }],
  },
  wave3: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    bottom: scale(12),
    transform: [{ scaleX: 1.1 }],
  },
});

// ─────────────────────────────────────────────────────────────
//  PinEntryScreen
// ─────────────────────────────────────────────────────────────
const PinEntryScreen = ({ navigation }) => {
  const [pin, setPin] = useState([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Shake animation when PIN is wrong
  const triggerShake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 55,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 8,
        duration: 45,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -8,
        duration: 45,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 35,
        useNativeDriver: true,
      }),
    ]).start();
  }, [shakeAnim]);

  const handleKey = useCallback(
    key => {
      if (key === 'del') {
        setPin(prev => prev.slice(0, -1));
        return;
      }
      if (pin.length >= PIN_LENGTH) return;

      const newPin = [...pin, key];
      setPin(newPin);

      // Auto-submit when PIN_LENGTH reached
      if (newPin.length === PIN_LENGTH) {
        setTimeout(() => {
          // TODO: validate PIN via API
          // On success:
          navigation?.navigate?.('PaymentSuccessScreen');
          // On failure: triggerShake(); setPin([]);
        }, 300);
      }
    },
    [pin, navigation],
  );

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={T.navy} />

      {/* ── Header ────────────────────────────────────────── */}
      <SafeAreaView style={s.header} edges={['top']}>
        <TouchableOpacity
          onPress={() => navigation?.goBack?.()}
          style={s.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-left" size={scale(20)} color={T.white} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Select Account</Text>
      </SafeAreaView>

      {/* ── White card section ────────────────────────────── */}
      <View style={s.cardSection}>
        {/* Monkey emoji */}
        <Text style={s.emoji}>🙈</Text>

        {/* Title */}
        <Text style={s.pinTitle}>Enter PIN</Text>
        <Text style={s.pinSubtitle}>Please enter your PIN to proceed</Text>

        {/* PIN dots */}
        <Animated.View
          style={[s.dotsRow, { transform: [{ translateX: shakeAnim }] }]}
        >
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <PinDot key={i} filled={i < pin.length} />
          ))}
        </Animated.View>
      </View>

      {/* ── Wave divider ──────────────────────────────────── */}
      <View style={s.waveWrapper}>
        <WaveDivider />
      </View>

      {/* ── Numpad section ────────────────────────────────── */}
      <View style={s.padSection}>
        {PAD_KEYS.map((row, ri) => (
          <View key={ri} style={s.padRow}>
            {row.map((key, ki) => (
              <NumKey key={ki} label={key} onPress={handleKey} />
            ))}
          </View>
        ))}
        <SafeAreaView edges={['bottom']} style={{ height: vscale(16) }} />
      </View>
    </View>
  );
};

export default PinEntryScreen;

// ─────────────────────────────────────────────────────────────
//  Styles
// ─────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: T.navy,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingVertical: scale(14),
    backgroundColor: T.navy,
  },
  backBtn: {
    marginRight: scale(16),
  },
  headerTitle: {
    fontSize: scale(20),
    fontFamily: TYPOGRAPHY?.fontFamily?.bold ?? 'System',
    color: T.white,
    letterSpacing: -0.3,
  },

  // Card section (white)
  cardSection: {
    flex: 1,
    backgroundColor: T.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: scale(16),
  },
  emoji: {
    fontSize: scale(60),
    marginBottom: scale(16),
  },
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
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Wave wrapper — sits between card and pad
  waveWrapper: {
    backgroundColor: T.navy, // behind wave
  },

  // Numpad section (navy)
  padSection: {
    backgroundColor: T.navy,
    paddingTop: scale(16),
    paddingBottom: scale(8),
    alignItems: 'center',
  },
  padRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: scale(20),
    marginBottom: scale(8),
  },
});
