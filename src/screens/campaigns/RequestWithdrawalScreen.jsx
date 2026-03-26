// src/screens/campaigns/RequestWithdrawalScreen.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/Feather';

// ═══════════════════════════════════════════════════════════
// Responsive Scale
// ═══════════════════════════════════════════════════════════
const { width: SW, height: SH } = Dimensions.get('window');
const scale = size => (SW / 375) * size;
const vscale = size => (SH / 812) * size;

// ═══════════════════════════════════════════════════════════
// Design Tokens
// ═══════════════════════════════════════════════════════════
const C = {
  pageBg: '#F4F6F9',
  white: '#FFFFFF',
  primary: '#0A3D62',
  teal: '#15AABF',
  textDark: '#111827',
  textGray: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  success: '#16A34A',
  warning: '#D97706',
  warningBg: '#FEF3C7',
  warningBorder: '#FDE68A',
  selectedBg: '#EFF6FF',
  selectedBorder: '#0A3D62',
};

// ═══════════════════════════════════════════════════════════
// Static Data
// ═══════════════════════════════════════════════════════════
const CAMPAIGN = {
  title: "Help Fatima's Heart Surgery",
  raised: 325000,
  withdrawn: 100000,
  available: 225000,
};

const PAYMENT_METHODS = [
  { id: 'easypaisa', label: 'EasyPaisa', placeholder: '03XX XXXXXXX' },
  { id: 'jazzcash', label: 'JazzCash', placeholder: '03XX XXXXXXX' },
  { id: 'bank', label: 'Bank Transfer', placeholder: 'IBAN / Account Number' },
];

const formatPKR = n => n.toLocaleString('en-PK');

const BUTTON_HEIGHT = vscale(54);
const FULL_WIDTH = SW - scale(32);

// ═══════════════════════════════════════════════════════════
// ✅ ANIMATED SUBMIT BUTTON
// idle → loading (shrinks to circle + spins) →
// success (ripples + color + check + expands) →
// auto navigate after 1.8s
// ═══════════════════════════════════════════════════════════
const AnimatedSubmitButton = ({ state, onPress }) => {
  // Width: 0 = circle, 1 = full
  const widthAnim = useRef(new Animated.Value(1)).current;
  const radiusAnim = useRef(new Animated.Value(scale(12))).current;

  // Colors
  const bgAnim = useRef(new Animated.Value(0)).current; // 0=primary,1=success

  // Idle text
  const idleOpacity = useRef(new Animated.Value(1)).current;

  // Spinner
  const spinAnim = useRef(new Animated.Value(0)).current;
  const spinOpacity = useRef(new Animated.Value(0)).current;
  const spinPulse = useRef(new Animated.Value(1)).current;
  const spinLoop = useRef(null);
  const pulseLoop = useRef(null);

  // Ripples (3 layers)
  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;
  const ripple3 = useRef(new Animated.Value(0)).current;
  const ripple1Op = useRef(new Animated.Value(0)).current;
  const ripple2Op = useRef(new Animated.Value(0)).current;
  const ripple3Op = useRef(new Animated.Value(0)).current;

  // Check icon
  const checkScale = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const checkRotate = useRef(new Animated.Value(-45)).current;

  // Success text
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslate = useRef(new Animated.Value(14)).current;

  // Shine sweep
  const shineX = useRef(new Animated.Value(-1)).current;
  const shineOpacity = useRef(new Animated.Value(0)).current;

  // ── Stop all loops cleanly ───────────────────────────────
  const stopLoops = useCallback(() => {
    spinLoop.current?.stop();
    pulseLoop.current?.stop();
  }, []);

  useEffect(() => {
    if (state === 'loading') {
      // 1. Fade out idle text
      Animated.timing(idleOpacity, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }).start();

      // 2. Morph to circle
      Animated.parallel([
        Animated.spring(widthAnim, {
          toValue: 0,
          tension: 70,
          friction: 11,
          useNativeDriver: false,
        }),
        Animated.spring(radiusAnim, {
          toValue: BUTTON_HEIGHT / 2,
          tension: 70,
          friction: 11,
          useNativeDriver: false,
        }),
      ]).start(() => {
        // 3. Show spinner + start loops
        Animated.timing(spinOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }).start();

        spinLoop.current = Animated.loop(
          Animated.timing(spinAnim, {
            toValue: 1,
            duration: 750,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        );
        spinLoop.current.start();

        // Pulse the circle
        pulseLoop.current = Animated.loop(
          Animated.sequence([
            Animated.timing(spinPulse, {
              toValue: 1.08,
              duration: 550,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            }),
            Animated.timing(spinPulse, {
              toValue: 1,
              duration: 550,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            }),
          ]),
        );
        pulseLoop.current.start();
      });
    }

    if (state === 'success') {
      stopLoops();
      spinAnim.setValue(0);

      Animated.sequence([
        // Step 1 — hide spinner instantly
        Animated.timing(spinOpacity, {
          toValue: 0,
          duration: 120,
          useNativeDriver: true,
        }),

        // Step 2 — triple ripple burst + color change simultaneously
        Animated.parallel([
          // Ripple 1 — fastest
          Animated.sequence([
            Animated.timing(ripple1Op, {
              toValue: 0.8,
              duration: 80,
              useNativeDriver: true,
            }),
            Animated.parallel([
              Animated.timing(ripple1, {
                toValue: 1,
                duration: 400,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
              Animated.timing(ripple1Op, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
              }),
            ]),
          ]),
          // Ripple 2 — medium delay
          Animated.sequence([
            Animated.delay(80),
            Animated.timing(ripple2Op, {
              toValue: 0.6,
              duration: 80,
              useNativeDriver: true,
            }),
            Animated.parallel([
              Animated.timing(ripple2, {
                toValue: 1,
                duration: 450,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
              Animated.timing(ripple2Op, {
                toValue: 0,
                duration: 450,
                useNativeDriver: true,
              }),
            ]),
          ]),
          // Ripple 3 — slowest
          Animated.sequence([
            Animated.delay(160),
            Animated.timing(ripple3Op, {
              toValue: 0.4,
              duration: 80,
              useNativeDriver: true,
            }),
            Animated.parallel([
              Animated.timing(ripple3, {
                toValue: 1,
                duration: 500,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
              Animated.timing(ripple3Op, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
              }),
            ]),
          ]),
          // Color flip to green
          Animated.timing(bgAnim, {
            toValue: 1,
            duration: 380,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
          }),
        ]),

        // Step 3 — check icon pops in with rotation + bounce
        Animated.parallel([
          Animated.spring(checkScale, {
            toValue: 1,
            tension: 220,
            friction: 5,
            useNativeDriver: true,
          }),
          Animated.timing(checkOpacity, {
            toValue: 1,
            duration: 180,
            useNativeDriver: true,
          }),
          Animated.spring(checkRotate, {
            toValue: 0,
            tension: 180,
            friction: 6,
            useNativeDriver: true,
          }),
        ]),

        // Step 4 — expand back to full width with spring overshoot
        Animated.parallel([
          Animated.spring(widthAnim, {
            toValue: 1,
            tension: 55,
            friction: 7,
            useNativeDriver: false,
          }),
          Animated.spring(radiusAnim, {
            toValue: scale(12),
            tension: 55,
            friction: 7,
            useNativeDriver: false,
          }),
          Animated.spring(spinPulse, {
            toValue: 1,
            tension: 80,
            friction: 8,
            useNativeDriver: false,
          }),
        ]),

        // Step 5 — shine sweep across button
        Animated.parallel([
          Animated.timing(shineOpacity, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(shineX, {
            toValue: 2,
            duration: 600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),

        // Step 6 — success text slides up
        Animated.parallel([
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 280,
            useNativeDriver: true,
          }),
          Animated.spring(textTranslate, {
            toValue: 0,
            tension: 65,
            friction: 9,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }

    return () => stopLoops();
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Interpolations ────────────────────────────────────────
  const animWidth = widthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [BUTTON_HEIGHT, FULL_WIDTH],
  });

  const bgColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [C.primary, C.success],
  });

  const spinRotate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const checkDeg = checkRotate.interpolate({
    inputRange: [-45, 0],
    outputRange: ['-45deg', '0deg'],
  });

  const makeRippleSize = anim =>
    anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, BUTTON_HEIGHT * 2.8],
    });

  const shineTranslate = shineX.interpolate({
    inputRange: [-1, 2],
    outputRange: [-FULL_WIDTH * 0.5, FULL_WIDTH * 1.5],
  });

  const isIdle = state === 'idle';

  return (
    <Animated.View
      style={[
        s.btnOuter,
        {
          width: animWidth,
          borderRadius: radiusAnim,
          backgroundColor: bgColor,
          transform: [{ scale: spinPulse }],
        },
      ]}
    >
      <TouchableOpacity
        style={s.btnTouchable}
        onPress={isIdle ? onPress : undefined}
        disabled={!isIdle}
        activeOpacity={0.88}
      >
        {/* ── RIPPLE LAYERS ────────────────────────────── */}
        {[
          [ripple1, ripple1Op],
          [ripple2, ripple2Op],
          [ripple3, ripple3Op],
        ].map(([r, o], i) => (
          <Animated.View
            key={i}
            style={[
              s.rippleLayer,
              {
                width: makeRippleSize(r),
                height: makeRippleSize(r),
                borderRadius: BUTTON_HEIGHT * 2.8,
                opacity: o,
              },
            ]}
          />
        ))}

        {/* ── SHINE SWEEP ──────────────────────────────── */}
        <Animated.View
          style={[
            s.shine,
            {
              opacity: shineOpacity,
              transform: [{ translateX: shineTranslate }],
            },
          ]}
        />

        {/* ── IDLE TEXT ────────────────────────────────── */}
        <Animated.Text style={[s.btnText, { opacity: idleOpacity }]}>
          Submit Request
        </Animated.Text>

        {/* ── SPINNER ──────────────────────────────────── */}
        <Animated.View
          style={[s.absoluteCenter, { opacity: spinOpacity }]}
          pointerEvents="none"
        >
          {/* Faint track ring */}
          <View style={ss.trackRing} />
          {/* Gradient-like arc — two overlapping arcs */}
          <Animated.View
            style={[ss.arc1, { transform: [{ rotate: spinRotate }] }]}
          />
          <Animated.View
            style={[ss.arc2, { transform: [{ rotate: spinRotate }] }]}
          />
          {/* Bright leading dot */}
          <Animated.View
            style={[ss.leadDot, { transform: [{ rotate: spinRotate }] }]}
          />
        </Animated.View>

        {/* ── SUCCESS CONTENT ───────────────────────────── */}
        <Animated.View
          style={[
            s.absoluteCenter,
            s.successRow,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslate }],
            },
          ]}
          pointerEvents="none"
        >
          <Animated.View
            style={{
              transform: [{ scale: checkScale }, { rotate: checkDeg }],
              opacity: checkOpacity,
            }}
          >
            <Icons name="check-circle" size={scale(22)} color={C.white} />
          </Animated.View>
          <Text style={s.successText}>Submitted Successfully!</Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Spinner sub-styles
const ss = StyleSheet.create({
  trackRing: {
    position: 'absolute',
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    borderWidth: scale(2.8),
    borderColor: 'rgba(255,255,255,0.22)',
  },
  arc1: {
    position: 'absolute',
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    borderWidth: scale(2.8),
    borderColor: 'transparent',
    borderTopColor: C.white,
  },
  arc2: {
    position: 'absolute',
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    borderWidth: scale(2.8),
    borderColor: 'transparent',
    borderRightColor: 'rgba(255,255,255,0.55)',
  },
  leadDot: {
    position: 'absolute',
    top: scale(0),
    alignSelf: 'center',
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    backgroundColor: C.white,
    marginTop: -scale(1),
    shadowColor: C.white,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 4,
    elevation: 4,
  },
});

// ═══════════════════════════════════════════════════════════
// HEADER
// ═══════════════════════════════════════════════════════════
const Header = ({ onBack }) => (
  <View style={s.header}>
    <TouchableOpacity
      onPress={onBack}
      style={s.headerBack}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Icons name="arrow-left" size={scale(22)} color={C.textDark} />
    </TouchableOpacity>
    <Text style={s.headerTitle}>Request Withdrawal</Text>
    <View style={s.headerBack} />
  </View>
);

// ═══════════════════════════════════════════════════════════
// CAMPAIGN CARD
// ═══════════════════════════════════════════════════════════
const CampaignCard = ({ campaign }) => (
  <View style={s.card}>
    <Text style={s.campaignTitle} numberOfLines={1}>
      {campaign.title}
    </Text>
    <Text style={s.balanceLabel}>Available Balance</Text>
    <Text style={s.balanceAmount}>PKR {formatPKR(campaign.available)}</Text>
    <View style={s.statsRow}>
      <Text style={s.statItem}>
        Raised: <Text style={s.statValue}>{formatPKR(campaign.raised)}</Text>
      </Text>
      <Text style={s.statItem}>
        Withdrawn:{' '}
        <Text style={s.statValue}>{formatPKR(campaign.withdrawn)}</Text>
      </Text>
    </View>
  </View>
);

// ═══════════════════════════════════════════════════════════
// SECTION LABEL
// ═══════════════════════════════════════════════════════════
const SectionLabel = ({ label }) => <Text style={s.sectionLabel}>{label}</Text>;

// ═══════════════════════════════════════════════════════════
// AMOUNT INPUT
// ═══════════════════════════════════════════════════════════
const AmountInput = ({ value, onChange }) => (
  <View style={s.amountBox}>
    <Text style={s.amountPrefix}>PKR</Text>
    <View style={s.amountDivider} />
    <TextInput
      style={s.amountInput}
      value={value}
      onChangeText={onChange}
      keyboardType="numeric"
      placeholder="0"
      placeholderTextColor={C.textLight}
      returnKeyType="done"
    />
  </View>
);

// ═══════════════════════════════════════════════════════════
// METHOD ROW
// ═══════════════════════════════════════════════════════════
const MethodRow = ({ method, selected, onSelect }) => {
  const active = selected === method.id;
  return (
    <TouchableOpacity
      style={[s.methodRow, active && s.methodRowActive]}
      onPress={() => onSelect(method.id)}
      activeOpacity={0.75}
    >
      <View style={[s.radioOuter, active && s.radioOuterActive]}>
        {active && <View style={s.radioInner} />}
      </View>
      <Text style={[s.methodLabel, active && s.methodLabelActive]}>
        {method.label}
      </Text>
    </TouchableOpacity>
  );
};

// ═══════════════════════════════════════════════════════════
// INPUT FIELD
// ═══════════════════════════════════════════════════════════
const InputField = ({
  label,
  value,
  onChange,
  placeholder,
  keyboardType = 'default',
}) => (
  <View style={s.fieldWrap}>
    <SectionLabel label={label} />
    <TextInput
      style={s.textInput}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={C.textLight}
      keyboardType={keyboardType}
      returnKeyType="next"
      autoCapitalize="words"
    />
  </View>
);

// ═══════════════════════════════════════════════════════════
// REVIEW NOTICE
// ═══════════════════════════════════════════════════════════
const ReviewNotice = () => (
  <View style={s.noticeBanner}>
    <Icons name="clock" size={scale(16)} color={C.warning} />
    <Text style={s.noticeText}>Reviewed within 24–48 hours</Text>
  </View>
);

// ═══════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════
const RequestWithdrawalScreen = ({ navigation }) => {
  const [amount, setAmount] = useState(String(CAMPAIGN.available));
  const [selectedMethod, setSelectedMethod] = useState('easypaisa');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountTitle, setAccountTitle] = useState('');
  const [btnState, setBtnState] = useState('idle');

  const selectedMethodData = PAYMENT_METHODS.find(m => m.id === selectedMethod);

  const handleSubmit = useCallback(() => {
    if (!amount || Number(amount) <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid withdrawal amount.');
      return;
    }
    if (Number(amount) > CAMPAIGN.available) {
      Alert.alert('Exceeds Balance', 'Amount exceeds your available balance.');
      return;
    }
    if (!accountNumber.trim()) {
      Alert.alert('Required', 'Please enter your account number.');
      return;
    }
    if (!accountTitle.trim()) {
      Alert.alert('Required', 'Please enter your account title.');
      return;
    }

    // ── Phase 1: Loading ──────────────────────────────────
    setBtnState('loading');

    setTimeout(() => {
      // ── Phase 2: Success animation ────────────────────
      setBtnState('success');

      // ── Phase 3: Auto-navigate to Profile after animation
      setTimeout(() => {
        navigation.navigate('Profile'); // ← change to your actual route name
      }, 2200); // enough time to enjoy the full success animation
    }, 2000);
  }, [amount, accountNumber, accountTitle, navigation]);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.pageBg} />

      <Header onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={s.flex}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <CampaignCard campaign={CAMPAIGN} />

          <View style={s.section}>
            <SectionLabel label="Withdrawal Amount" />
            <AmountInput value={amount} onChange={setAmount} />
          </View>

          <View style={s.section}>
            <SectionLabel label="Select Account" />
            {PAYMENT_METHODS.map(method => (
              <MethodRow
                key={method.id}
                method={method}
                selected={selectedMethod}
                onSelect={setSelectedMethod}
              />
            ))}
          </View>

          <InputField
            label="Account Number"
            value={accountNumber}
            onChange={setAccountNumber}
            placeholder={selectedMethodData?.placeholder ?? '03XX XXXXXXX'}
            keyboardType="phone-pad"
          />

          <InputField
            label="Account Title"
            value={accountTitle}
            onChange={setAccountTitle}
            placeholder="e.g. Ahmed Khan"
          />

          <ReviewNotice />
          <View style={{ height: vscale(12) }} />
        </ScrollView>

        <View style={s.footer}>
          <AnimatedSubmitButton state={btnState} onPress={handleSubmit} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ═══════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.pageBg },
  flex: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    // paddingVertical: vscale(14),
    backgroundColor: C.pageBg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
  },
  headerBack: {
    width: scale(36),
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: scale(17),
    fontWeight: '700',
    color: C.textDark,
    letterSpacing: -0.2,
  },

  scrollContent: {
    paddingHorizontal: scale(16),
    paddingTop: vscale(16),
    paddingBottom: vscale(8),
  },

  card: {
    backgroundColor: C.white,
    borderRadius: scale(12),
    padding: scale(16),
    marginBottom: vscale(20),
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },
  campaignTitle: {
    fontSize: scale(14),
    fontWeight: '700',
    color: C.textDark,
    marginBottom: vscale(8),
    includeFontPadding: false,
  },
  balanceLabel: {
    fontSize: scale(12),
    fontWeight: '500',
    color: C.textGray,
    marginBottom: vscale(3),
    includeFontPadding: false,
  },
  balanceAmount: {
    fontSize: scale(26),
    fontWeight: '800',
    color: C.success,
    marginBottom: vscale(12),
    letterSpacing: -0.3,
    includeFontPadding: false,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: vscale(10),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.border,
  },
  statItem: {
    fontSize: scale(12),
    color: C.textGray,
    includeFontPadding: false,
  },
  statValue: {
    fontWeight: '600',
    color: C.textDark,
  },

  section: { marginBottom: vscale(20) },
  sectionLabel: {
    fontSize: scale(14),
    fontWeight: '600',
    color: C.textDark,
    marginBottom: vscale(10),
    includeFontPadding: false,
  },

  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: scale(10),
    borderWidth: 1,
    borderColor: C.border,
    height: vscale(54),
    paddingHorizontal: scale(16),
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  amountPrefix: {
    fontSize: scale(15),
    fontWeight: '700',
    color: C.textGray,
    marginRight: scale(12),
    includeFontPadding: false,
  },
  amountDivider: {
    width: 1,
    height: '55%',
    backgroundColor: C.border,
    marginRight: scale(12),
  },
  amountInput: {
    flex: 1,
    fontSize: scale(16),
    fontWeight: '600',
    color: C.textDark,
    padding: 0,
    margin: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },

  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: scale(10),
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: scale(16),
    height: vscale(54),
    marginBottom: vscale(10),
    gap: scale(14),
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  methodRowActive: {
    borderColor: C.selectedBorder,
    backgroundColor: C.selectedBg,
  },
  radioOuter: {
    width: scale(22),
    height: scale(22),
    borderRadius: scale(11),
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: { borderColor: C.primary },
  radioInner: {
    width: scale(11),
    height: scale(11),
    borderRadius: scale(6),
    backgroundColor: C.primary,
  },
  methodLabel: {
    fontSize: scale(15),
    fontWeight: '500',
    color: C.textGray,
    includeFontPadding: false,
  },
  methodLabelActive: {
    color: C.textDark,
    fontWeight: '600',
  },

  fieldWrap: { marginBottom: vscale(16) },
  textInput: {
    backgroundColor: C.white,
    borderRadius: scale(10),
    borderWidth: 1,
    borderColor: C.border,
    height: vscale(54),
    paddingHorizontal: scale(16),
    fontSize: scale(15),
    fontWeight: '500',
    color: C.textDark,
    padding: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },

  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
    backgroundColor: C.warningBg,
    borderWidth: 1,
    borderColor: C.warningBorder,
    borderRadius: scale(10),
    paddingHorizontal: scale(16),
    paddingVertical: vscale(14),
    marginBottom: vscale(4),
  },
  noticeText: {
    fontSize: scale(14),
    fontWeight: '500',
    color: C.warning,
    includeFontPadding: false,
  },

  footer: {
    paddingHorizontal: scale(16),
    paddingTop: vscale(12),
    paddingBottom: Platform.OS === 'ios' ? vscale(20) : vscale(16),
    backgroundColor: C.pageBg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.border,
    alignItems: 'center',
  },

  // ── Animated Button ───────────────────────────────────────
  btnOuter: {
    height: BUTTON_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.32,
    shadowRadius: 12,
  },
  btnTouchable: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Ripple layers
  rippleLayer: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.22)',
  },

  // Shine sweep
  shine: {
    position: 'absolute',
    top: 0,
    width: scale(60),
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.18)',
    transform: [{ skewX: '-20deg' }],
  },

  btnText: {
    position: 'absolute',
    color: C.white,
    fontSize: scale(16),
    fontWeight: '700',
    letterSpacing: 0.4,
    includeFontPadding: false,
  },

  absoluteCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },

  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
  },
  successText: {
    color: C.white,
    fontSize: scale(15),
    fontWeight: '700',
    letterSpacing: 0.2,
    includeFontPadding: false,
  },
});

export default RequestWithdrawalScreen;
