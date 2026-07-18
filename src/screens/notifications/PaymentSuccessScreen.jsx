// src/screens/payment/PaymentSuccessScreen.jsx
// ─────────────────────────────────────────────────────────────
//  Payment Success Screen — matches screenshot exactly
//  Receipt card with zigzag bottom, celebration icon,
//  transaction rows, Share/Print/Favourite actions, DONE button
//  React Native CLI  ·  Fully responsive
// ─────────────────────────────────────────────────────────────

import React, { useRef, useEffect, useCallback, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import MCIcon from 'react-native-vector-icons/MaterialCommunityIcons';

import { COLORS, SPACING, TYPOGRAPHY, scale } from '../../theme';

// ─────────────────────────────────────────────────────────────
//  Responsive helpers
// ─────────────────────────────────────────────────────────────
const { width: SW, height: SH } = Dimensions.get('window');
const vscale = n => (SH / 812) * n;

// ─────────────────────────────────────────────────────────────
//  Design tokens
// ─────────────────────────────────────────────────────────────
const T = {
  navy: COLORS?.primary ?? '#1A2D4F',
  navyDark: COLORS?.primaryDark ?? '#152540',
  teal: COLORS?.secondary ?? '#00C896',
  white: COLORS?.white ?? '#FFFFFF',
  bg: COLORS?.background ?? '#F5F7FA',
  textDark: COLORS?.textPrimary ?? '#1A2D4F',
  textGray: COLORS?.textSecondary ?? '#8A9BB0',
  textLight: COLORS?.textTertiary ?? '#B0BEC5',
  success: COLORS?.success ?? '#00C896',
  successBg: '#E8FAF4',
  border: COLORS?.border ?? '#E8EDF2',
  yellow: '#FFB800',
  orange: '#FF6B35',
  receiptBg: '#FAFBFC',
};

// ─────────────────────────────────────────────────────────────
//  Mock transaction data — replace with real route params
// ─────────────────────────────────────────────────────────────
const TRANSACTIONS = [
  {
    id: '1',
    name: 'KenGen Power',
    txnId: '34374287',
    amount: 1240.0,
  },
  {
    id: '2',
    name: 'Total Gas',
    txnId: '64234285',
    amount: 1490.0,
  },
];

const TOTAL = TRANSACTIONS.reduce((s, t) => s + t.amount, 0);

// ─────────────────────────────────────────────────────────────
//  SuccessIcon — target/dart board celebration
//  Built with pure View circles (no image needed)
// ─────────────────────────────────────────────────────────────
const SuccessIcon = memo(() => {
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(bounceAnim, {
        toValue: 1,
        tension: 50,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [bounceAnim, rotateAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-20deg', '0deg'],
  });

  return (
    <Animated.View
      style={[
        ic.wrap,
        {
          transform: [{ scale: bounceAnim }, { rotate }],
        },
      ]}
    >
      {/* Confetti dots */}
      <View
        style={[
          ic.confetti,
          { top: 0, left: scale(30), backgroundColor: T.yellow },
        ]}
      />
      <View
        style={[
          ic.confetti,
          { top: scale(4), right: scale(28), backgroundColor: '#FF6B9D' },
        ]}
      />
      <View
        style={[
          ic.confetti,
          { top: scale(12), left: scale(10), backgroundColor: T.teal },
        ]}
      />
      <View
        style={[
          ic.confetti,
          { bottom: scale(8), right: scale(10), backgroundColor: T.yellow },
        ]}
      />

      {/* Target rings */}
      <View style={ic.ring3}>
        <View style={ic.ring2}>
          <View style={ic.ring1}>
            <View style={ic.center}>
              {/* Dart/arrow icon */}
              <MCIcon name="bullseye-arrow" size={scale(28)} color={T.white} />
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
});

const ICON_SIZE = scale(90);
const ic = StyleSheet.create({
  wrap: {
    width: ICON_SIZE + scale(24),
    height: ICON_SIZE + scale(24),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: scale(16),
    position: 'relative',
  },
  confetti: {
    position: 'absolute',
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
  },
  ring3: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    backgroundColor: '#E8FAF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring2: {
    width: ICON_SIZE * 0.76,
    height: ICON_SIZE * 0.76,
    borderRadius: (ICON_SIZE * 0.76) / 2,
    backgroundColor: '#B2EDD8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring1: {
    width: ICON_SIZE * 0.54,
    height: ICON_SIZE * 0.54,
    borderRadius: (ICON_SIZE * 0.54) / 2,
    backgroundColor: T.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    width: ICON_SIZE * 0.38,
    height: ICON_SIZE * 0.38,
    borderRadius: (ICON_SIZE * 0.38) / 2,
    backgroundColor: '#00A87A',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ─────────────────────────────────────────────────────────────
//  TransactionRow — single bill row inside receipt
// ─────────────────────────────────────────────────────────────
const TransactionRow = memo(({ item, isLast }) => (
  <View style={[tr.row, !isLast && tr.rowBorder]}>
    {/* Green checkmark circle */}
    <View style={tr.checkCircle}>
      <Icon name="check" size={scale(13)} color={T.white} />
    </View>

    {/* Details */}
    <View style={tr.info}>
      <Text style={tr.name}>{item.name}</Text>
      <Text style={tr.txnId}>Txn Id: {item.txnId}</Text>
    </View>

    {/* Amount */}
    <Text style={tr.amount}>
      $ {item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
    </Text>
  </View>
));

const tr = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scale(14),
    paddingHorizontal: scale(16),
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: T.border,
  },
  checkCircle: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: T.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
    flexShrink: 0,
  },
  info: { flex: 1 },
  name: {
    fontSize: scale(13),
    fontFamily: TYPOGRAPHY?.fontFamily?.semiBold ?? 'System',
    color: T.textDark,
    marginBottom: scale(2),
  },
  txnId: {
    fontSize: scale(11),
    fontFamily: TYPOGRAPHY?.fontFamily?.regular ?? 'System',
    color: T.textGray,
  },
  amount: {
    fontSize: scale(14),
    fontFamily: TYPOGRAPHY?.fontFamily?.bold ?? 'System',
    color: T.textDark,
    flexShrink: 0,
  },
});

// ─────────────────────────────────────────────────────────────
//  ZigzagEdge — receipt tear bottom edge
//  Built with alternating triangles using border tricks
// ─────────────────────────────────────────────────────────────
const ZigzagEdge = memo(() => {
  const TOOTH = scale(10);
  const TEETH = Math.ceil(SW / TOOTH) + 2;

  return (
    <View style={zz.row}>
      {Array.from({ length: TEETH }).map((_, i) => (
        <View
          key={i}
          style={[
            zz.tooth,
            {
              borderTopColor: i % 2 === 0 ? T.receiptBg : T.bg,
              borderLeftWidth: TOOTH / 2,
              borderRightWidth: TOOTH / 2,
              borderTopWidth: TOOTH * 0.6,
            },
          ]}
        />
      ))}
    </View>
  );
});

const zz = StyleSheet.create({
  row: {
    flexDirection: 'row',
    overflow: 'hidden',
    width: SW,
    marginLeft: -scale(16), // bleed to edges of receipt
  },
  tooth: {
    width: 0,
    height: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderStyle: 'solid',
  },
});

// ─────────────────────────────────────────────────────────────
//  ActionButton — Share / Print / Favourite
// ─────────────────────────────────────────────────────────────
const ActionButton = memo(({ iconName, label, onPress, isMC }) => {
  const IconComp = isMC ? MCIcon : Icon;
  return (
    <TouchableOpacity style={ab.wrap} onPress={onPress} activeOpacity={0.75}>
      <View style={ab.circle}>
        <IconComp name={iconName} size={scale(20)} color={T.textDark} />
      </View>
      <Text style={ab.label}>{label}</Text>
    </TouchableOpacity>
  );
});

const ab = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    flex: 1,
  },
  circle: {
    width: scale(52),
    height: scale(52),
    borderRadius: scale(26),
    backgroundColor: T.white,
    borderWidth: 1,
    borderColor: T.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: scale(6),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  label: {
    fontSize: scale(12),
    fontFamily: TYPOGRAPHY?.fontFamily?.regular ?? 'System',
    color: T.textGray,
  },
});

// ─────────────────────────────────────────────────────────────
//  PaymentSuccessScreen
// ─────────────────────────────────────────────────────────────
const PaymentSuccessScreen = ({ navigation, route }) => {
  // Accept real data from route params, fallback to mock
  const transactions = route?.params?.transactions ?? TRANSACTIONS;
  const total = route?.params?.total ?? TOTAL;

  // Slide-up animation for the card
  const slideAnim = useRef(new Animated.Value(vscale(120))).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 55,
        friction: 9,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, opacityAnim]);

  const handleDone = useCallback(() => {
    navigation?.reset?.({ index: 0, routes: [{ name: 'Home' }] });
  }, [navigation]);

  const handleShare = useCallback(
    () => Alert.alert('Share', 'Share receipt'),
    [],
  );
  const handlePrint = useCallback(
    () => Alert.alert('Print', 'Print receipt'),
    [],
  );
  const handleFav = useCallback(
    () => Alert.alert('Favourite', 'Saved to favourites'),
    [],
  );

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={T.bg} />

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Header area (bg) ─────────────────────────── */}
        <View style={s.topBg} />

        {/* ── Animated card ────────────────────────────── */}
        <Animated.View
          style={[
            s.card,
            {
              opacity: opacityAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Success icon */}
          <View style={s.iconRow}>
            <SuccessIcon />
          </View>

          {/* Heading */}
          <Text style={s.successTitle}>Success !</Text>
          <Text style={s.successSub}>
            Payment is completed for {transactions.length} bills
          </Text>

          {/* Transaction rows */}
          <View style={s.receiptCard}>
            {transactions.map((item, index) => (
              <TransactionRow
                key={item.id}
                item={item}
                isLast={index === transactions.length - 1}
              />
            ))}

            {/* Zigzag tear edge */}
            <View style={s.zigzagWrap}>
              <ZigzagEdge />
            </View>
          </View>

          {/* Total */}
          <View style={s.totalSection}>
            <Text style={s.totalLabel}>Total Amount</Text>
            <Text style={s.totalAmount}>
              ${' '}
              <Text style={s.totalAmountBig}>
                {total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </Text>
          </View>

          {/* Action buttons */}
          <View style={s.actionsRow}>
            <ActionButton
              iconName="share-2"
              label="Share"
              onPress={handleShare}
            />
            <ActionButton
              iconName="printer"
              label="Print"
              onPress={handlePrint}
            />
            <ActionButton
              iconName="star"
              label="Favourite"
              onPress={handleFav}
            />
          </View>
        </Animated.View>
      </ScrollView>

      {/* ── Sticky DONE button ────────────────────────── */}
      <SafeAreaView style={s.footer} edges={['bottom']}>
        <TouchableOpacity
          style={s.doneBtn}
          onPress={handleDone}
          activeOpacity={0.85}
        >
          <Text style={s.doneBtnText}>DONE</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

export default PaymentSuccessScreen;

// ─────────────────────────────────────────────────────────────
//  Styles
// ─────────────────────────────────────────────────────────────
const CARD_MARGIN = scale(16);

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: T.bg,
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: vscale(100),
  },

  // Colored top background strip
  topBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: vscale(220),
    backgroundColor: T.navy,
    borderBottomLeftRadius: scale(32),
    borderBottomRightRadius: scale(32),
  },

  // Main receipt card
  card: {
    marginHorizontal: CARD_MARGIN,
    marginTop: vscale(40),
    backgroundColor: T.white,
    borderRadius: scale(20),
    paddingHorizontal: scale(20),
    paddingTop: scale(24),
    paddingBottom: scale(20),
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
  },

  // Icon centered
  iconRow: {
    alignItems: 'center',
    marginBottom: scale(8),
  },

  // Headings
  successTitle: {
    fontSize: scale(26),
    fontFamily: TYPOGRAPHY?.fontFamily?.extraBold ?? 'System',
    color: T.textDark,
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: scale(6),
  },
  successSub: {
    fontSize: scale(13),
    fontFamily: TYPOGRAPHY?.fontFamily?.regular ?? 'System',
    color: T.textGray,
    textAlign: 'center',
    marginBottom: scale(20),
  },

  // Transaction receipt card
  receiptCard: {
    borderRadius: scale(14),
    borderWidth: 1,
    borderColor: T.border,
    backgroundColor: T.receiptBg,
    overflow: 'hidden',
    marginBottom: 0,
  },

  // Zigzag wrapper
  zigzagWrap: {
    height: scale(10),
    overflow: 'hidden',
    backgroundColor: T.bg,
  },

  // Total section
  totalSection: {
    alignItems: 'center',
    paddingVertical: scale(16),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: T.border,
    marginBottom: scale(20),
  },
  totalLabel: {
    fontSize: scale(12),
    fontFamily: TYPOGRAPHY?.fontFamily?.regular ?? 'System',
    color: T.textGray,
    marginBottom: scale(4),
    letterSpacing: 0.4,
  },
  totalAmount: {
    fontSize: scale(18),
    fontFamily: TYPOGRAPHY?.fontFamily?.bold ?? 'System',
    color: T.textDark,
  },
  totalAmountBig: {
    fontSize: scale(30),
    fontFamily: TYPOGRAPHY?.fontFamily?.extraBold ?? 'System',
    color: T.textDark,
    letterSpacing: -0.5,
  },

  // Action buttons row
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(8),
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: CARD_MARGIN,
    paddingTop: scale(12),
    paddingBottom: Platform.OS === 'ios' ? 0 : scale(16),
    backgroundColor: T.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: T.border,
  },
  doneBtn: {
    backgroundColor: T.navy,
    borderRadius: scale(14),
    height: vscale(54),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: T.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  doneBtnText: {
    fontSize: scale(15),
    fontFamily: TYPOGRAPHY?.fontFamily?.bold ?? 'System',
    color: T.white,
    letterSpacing: 1.5,
  },
});
