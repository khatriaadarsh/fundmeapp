// src/components/payment/PinEntryModal.jsx
// ─────────────────────────────────────────────────────────────
//  PIN Entry Modal — themed to match app colors, presented as a
//  Modal (driven by visible/onClose/onSuccess) instead of a
//  standalone screen/navigation route.
//
//  Layout:
//  - True bottom sheet: slides up from the bottom and extends
//    all the way down to the screen edge (safe-area aware), so
//    the parent screen's CTA (e.g. "Pay PKR 5,000") is fully
//    covered/hidden while the sheet is open — not peeking
//    through underneath.
//  - Rounded corners on the TOP only (bottom is flush with the
//    screen edge, standard bottom-sheet behaviour).
//  - Backdrop is a real blur (BlurView) + dark tint, so content
//    behind the sheet reads as blurred, not just dimmed.
//  - No header / back button — monkey emoji, "Enter PIN" title,
//    4 PIN boxes, curved wave divider, navy keypad.
//
//  Dependency: this uses @react-native-community/blur for the
//  backdrop blur. If it isn't installed yet:
//    npm install @react-native-community/blur
//    npx pod-install   (iOS)
//  If you'd rather not add the dependency, swap <BlurView> below
//  for a plain semi-transparent View (see FALLBACK note).
// ─────────────────────────────────────────────────────────────

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  StatusBar,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import MCIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { sp } from '../../theme/theme';

// ─────────────────────────────────────────────────────────────
//  Responsive helpers — same pattern used across the app
// ─────────────────────────────────────────────────────────────
const { width: SW, height: SH } = Dimensions.get('window');
const scale = n => (SW / 390) * n;

// ─────────────────────────────────────────────────────────────
//  Design tokens — SAME palette as the rest of the app
// ─────────────────────────────────────────────────────────────
const C = {
  white: '#FFFFFF',
  dark: '#111827',
  gray: '#6B7280',
  lightGray: '#9CA3AF',
  border: '#E5E7EB',

  navy: '#0D4F6B',
  amountGreen: '#16A34A',
  greenBg: 'rgba(22,163,74,0.08)',

  waveLight: '#C7D0DA',

  scrim: 'rgba(8,15,28,0.35)',
};

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'back'],
];

const PIN_LENGTH = 4;
const SHEET_RADIUS = scale(28);

// ─────────────────────────────────────────────────────────────
//  PinDots — the 4 boxes (filled = green border + green dot)
// ─────────────────────────────────────────────────────────────
const PinDots = ({ length, filled }) => (
  <View style={dots.row}>
    {Array.from({ length }).map((_, i) => {
      const isFilled = i < filled;
      return (
        <View key={i} style={[dots.box, isFilled && dots.boxFilled]}>
          {isFilled && <View style={dots.dot} />}
        </View>
      );
    })}
  </View>
);

const dots = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: sp(14),
    marginTop: sp(18),
    marginBottom: sp(26),
  },
  box: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(12),
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.white,
  },
  boxFilled: {
    borderColor: C.amountGreen,
    backgroundColor: C.greenBg,
  },
  dot: {
    width: scale(12),
    height: scale(12),
    borderRadius: scale(6),
    backgroundColor: C.amountGreen,
  },
});

// ─────────────────────────────────────────────────────────────
//  Wave divider — real curve between the white section and the
//  navy keypad (a large clipped circle, not a flat bar).
// ─────────────────────────────────────────────────────────────
const WAVE_H = scale(30);

const WaveDivider = () => (
  <View style={wave.wrap}>
    <View style={wave.hill} />
  </View>
);

const wave = StyleSheet.create({
  wrap: {
    height: WAVE_H,
    backgroundColor: C.navy,
    overflow: 'hidden',
  },
  hill: {
    position: 'absolute',
    left: '-10%',
    top: -WAVE_H * 1.6,
    width: '120%',
    height: WAVE_H * 2.6,
    borderRadius: 999,
    backgroundColor: C.waveLight,
  },
});

// ─────────────────────────────────────────────────────────────
//  Keypad
// ─────────────────────────────────────────────────────────────
const Keypad = React.memo(({ onPress, onBackspace, bottomPad }) => (
  <View style={[keypad.wrap, { paddingBottom: sp(24) + bottomPad }]}>
    {KEYS.map((row, ri) => (
      <View key={ri} style={keypad.row}>
        {row.map((key, ki) => {
          if (key === '') {
            return <View key={ki} style={keypad.key} />;
          }
          if (key === 'back') {
            return (
              <TouchableOpacity
                key={ki}
                style={keypad.key}
                activeOpacity={0.6}
                onPress={onBackspace}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View style={keypad.backspaceBox}>
                  <MCIcons name="backspace-outline" size={scale(18)} color="rgba(255,255,255,0.9)" />
                </View>
              </TouchableOpacity>
            );
          }
          return (
            <TouchableOpacity
              key={ki}
              style={keypad.key}
              activeOpacity={0.5}
              onPress={() => onPress(key)}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Text style={keypad.keyText}>{key}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    ))}
  </View>
));

const KEY_SIZE = scale(68);

const keypad = StyleSheet.create({
  wrap: {
    backgroundColor: C.navy,
    paddingHorizontal: sp(30),
    paddingTop: sp(4),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: sp(14),
  },
  key: {
    width: KEY_SIZE,
    height: KEY_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: sp(28),
    fontWeight: '700',
    color: C.white,
  },
  backspaceBox: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(10),
    borderWidth: 1.4,
    borderColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ─────────────────────────────────────────────────────────────
//  PinEntryModal
// ─────────────────────────────────────────────────────────────
const PinEntryModal = ({
  visible,
  onClose,
  onSuccess,
  navigation,
  avatarEmoji = '🙈',
  successRoute = 'PaymentSuccessScreen',
  successParams = {},
  // Extra bottom padding so keys aren't flush against the home
  // indicator / gesture bar on notched devices. Pass your
  // useSafeAreaInsets().bottom here if you have it handy.
  bottomSafeInset = Platform.OS === 'ios' ? scale(24) : sp(8),
}) => {
  const [pin, setPin] = useState('');
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) setPin('');
  }, [visible]);

  const handleComplete = useCallback(
    enteredPin => {
      if (onSuccess) {
        onSuccess(enteredPin);
      } else if (navigation) {
        navigation.replace(successRoute, { pin: enteredPin, ...successParams });
      }
      setPin('');
    },
    [onSuccess, navigation, successRoute, successParams],
  );

  const handlePress = useCallback(
    key => {
      setPin(prev => {
        if (prev.length >= PIN_LENGTH) return prev;
        const next = prev + key;
        if (next.length === PIN_LENGTH) {
          setTimeout(() => handleComplete(next), 220);
        }
        return next;
      });
    },
    [handleComplete],
  );

  const handleBackspace = useCallback(() => {
    setPin(prev => prev.slice(0, -1));
  }, []);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <View style={m.root}>
        {/* Blurred + tinted backdrop — tapping it dismisses the sheet */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill}>
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="dark"
              blurAmount={12}
              reducedTransparencyFallbackColor="rgba(8,15,28,0.6)"
            />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: C.scrim }]} />
          </View>
        </TouchableWithoutFeedback>

        {/* The sheet — covers all the way to the bottom edge */}
        <TouchableWithoutFeedback onPress={() => {}}>
          <View style={m.sheet}>
            <View style={m.whiteSection}>
              <Text style={m.avatarEmoji}>{avatarEmoji}</Text>

              <Text style={m.title}>Enter PIN</Text>
              <Text style={m.subtitle}>Please enter your PIN to proceed</Text>

              <Animated.View style={{ transform: [{ translateX: shake }] }}>
                <PinDots length={PIN_LENGTH} filled={pin.length} />
              </Animated.View>
            </View>

            <WaveDivider />

            <Keypad onPress={handlePress} onBackspace={handleBackspace} bottomPad={bottomSafeInset} />
          </View>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
};

export default PinEntryModal;

const m = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    width: SW,
    borderTopLeftRadius: SHEET_RADIUS,
    borderTopRightRadius: SHEET_RADIUS,
    overflow: 'hidden',
    backgroundColor: C.white,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  whiteSection: {
    alignItems: 'center',
    backgroundColor: C.white,
    paddingTop: sp(30),
    paddingHorizontal: sp(20),
  },
  avatarEmoji: {
    fontSize: scale(58),
  },
  title: {
    fontSize: sp(22),
    fontWeight: '800',
    color: C.dark,
    marginTop: sp(14),
  },
  subtitle: {
    fontSize: sp(13.5),
    color: C.gray,
    marginTop: sp(4),
  },
});