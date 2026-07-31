// src/components/donation/DonationReceiptModal.jsx
// ─────────────────────────────────────────────────────────────
//  Animated donation success receipt. Shows details from the
//  confirm-donation API response.
// ─────────────────────────────────────────────────────────────

import React, { memo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icons from 'react-native-vector-icons/Feather';

const { width: SW, height: SH } = Dimensions.get('window');
const scale = n => (SW / 375) * n;

const C = {
  white: '#FFFFFF',
  bg: '#F8FAFC',
  green: '#059669',
  greenLight: '#10B981',
  greenBg: '#ECFDF5',
  dark: '#111827',
  mid: '#334155',
  gray: '#64748B',
  light: '#94A3B8',
  border: '#E5E7EB',
  iconBg: '#F1F5F9',
  teal: '#00B4CC',
};

const fmt = n => `PKR ${Number(n || 0).toLocaleString('en-PK')}`;

const formatDate = iso => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
};

// ── One confetti dot: fades/rises/falls with a random delay ───
const ConfettiDot = memo(({ delay, left, color, size }) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }),
    ]).start();
  }, [anim, delay]);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -scale(60)] });
  const opacity = anim.interpolate({ inputRange: [0, 0.15, 0.8, 1], outputRange: [0, 1, 1, 0] });

  return (
    <Animated.View
      style={[
        confetti.dot,
        {
          left,
          width: size,
          height: size,
          backgroundColor: color,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    />
  );
});

const CONFETTI = [
  { left: '15%', color: '#FDE68A', size: scale(8), delay: 0 },
  { left: '30%', color: '#93C5FD', size: scale(6), delay: 120 },
  { left: '50%', color: '#FCA5A5', size: scale(7), delay: 60 },
  { left: '68%', color: '#86EFAC', size: scale(6), delay: 200 },
  { left: '82%', color: '#FDE68A', size: scale(8), delay: 40 },
  { left: '40%', color: '#C4B5FD', size: scale(6), delay: 160 },
];

const confetti = StyleSheet.create({
  dot: { position: 'absolute', bottom: scale(20), borderRadius: scale(4) },
});

// ── Row ─────────────────────────────────────────────────────
const Row = memo(({ icon, label, value }) => (
  <View style={row.wrap}>
    <View style={row.iconWrap}>
      <Icons name={icon} size={scale(14)} color={C.green} />
    </View>
    <View style={row.textCol}>
      <Text style={row.label}>{label}</Text>
      <Text style={row.value} numberOfLines={2}>
        {value || '—'}
      </Text>
    </View>
  </View>
));

const row = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: scale(11),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
    gap: scale(12),
  },
  iconWrap: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(9),
    backgroundColor: C.iconBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: { flex: 1 },
  label: { fontSize: scale(11.5), color: C.gray, marginBottom: scale(2) },
  value: { fontSize: scale(14), fontWeight: '700', color: C.dark, lineHeight: scale(19) },
});

// ── Main component ─────────────────────────────────────────
const DonationReceiptModal = ({ visible, onDone, data, message }) => {
  const checkScale = useRef(new Animated.Value(0)).current;
  const checkRing = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      checkScale.setValue(0);
      checkRing.setValue(0);
      cardAnim.setValue(0);

      Animated.sequence([
        Animated.spring(checkScale, {
          toValue: 1,
          tension: 180,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(cardAnim, {
          toValue: 1,
          duration: 320,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(checkRing, { toValue: 1, duration: 1400, useNativeDriver: true }),
          Animated.timing(checkRing, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      ).start();
    }
  }, [visible, checkScale, checkRing, cardAnim]);

  const ringScale = checkRing.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] });
  const ringOpacity = checkRing.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] });

  const cardTranslate = cardAnim.interpolate({ inputRange: [0, 1], outputRange: [scale(24), 0] });

  if (!data) return null;

  return (
    <Modal visible={visible} animationType="fade" statusBarTranslucent onRequestClose={onDone}>
      <View style={s.root}>
        <LinearGradient
          colors={[C.green, C.greenLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={s.header}
        >
          {CONFETTI.map((c, i) => (
            <ConfettiDot key={i} {...c} />
          ))}

          <View style={s.checkWrap}>
            <Animated.View
              style={[s.checkRing, { transform: [{ scale: ringScale }], opacity: ringOpacity }]}
            />
            <Animated.View style={[s.checkCircle, { transform: [{ scale: checkScale }] }]}>
              <Icons name="check" size={scale(34)} color={C.green} />
            </Animated.View>
          </View>

          <Text style={s.successTitle}>Donation Successful!</Text>
          <Text style={s.successSub}>Thank you for your generosity ❤️</Text>
        </LinearGradient>

        <Animated.View
          style={[s.cardWrap, { opacity: cardAnim, transform: [{ translateY: cardTranslate }] }]}
        >
          <View style={s.amountBox}>
            <Text style={s.amountLabel}>Amount Donated</Text>
            <Text style={s.amountValue}>{fmt(data.amount)}</Text>
          </View>

          <ScrollView
            style={s.body}
            contentContainerStyle={s.bodyContent}
            showsVerticalScrollIndicator={false}
          >
            <Row icon="target" label="Campaign Title" value={data.campaignTitle} />
            <Row icon="user" label="Campaign Owner" value={data.campaignOwner} />
            <Row icon="user-check" label="Donor Name" value={data.donorName} />
            <Row icon="phone" label="Account Number" value={data.donorAccountNumber} />
            <Row icon="smartphone" label="Payment Method" value={data.paymentMethod} />
            {!!message && <Row icon="message-circle" label="Message" value={message} />}
            <Row icon="hash" label="Transaction ID" value={data.transactionId} />
            <Row icon="bookmark" label="Payment Reference" value={data.paymentReference} />
            <Row icon="clock" label="Date & Time" value={formatDate(data.transactionDate)} />

            <View style={s.statusRow}>
              <Icons name="check-circle" size={scale(14)} color={C.green} />
              <Text style={s.statusTxt}>{data.transactionStatus || data.paymentStatus}</Text>
            </View>
          </ScrollView>

          <View style={s.footer}>
            <TouchableOpacity style={s.doneBtnWrap} onPress={onDone} activeOpacity={0.88}>
              <LinearGradient
                colors={[C.green, C.greenLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.doneBtn}
              >
                <Text style={s.doneTxt}>Done</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default memo(DonationReceiptModal);

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: {
    alignItems: 'center',
    paddingTop: scale(52),
    paddingBottom: scale(30),
    paddingHorizontal: scale(20),
    overflow: 'hidden',
  },
  checkWrap: {
    width: scale(84),
    height: scale(84),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: scale(14),
  },
  checkRing: {
    position: 'absolute',
    width: scale(84),
    height: scale(84),
    borderRadius: scale(42),
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  checkCircle: {
    width: scale(68),
    height: scale(68),
    borderRadius: scale(34),
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  successTitle: {
    fontSize: scale(20),
    fontWeight: '800',
    color: C.white,
    includeFontPadding: false,
  },
  successSub: {
    fontSize: scale(13),
    color: 'rgba(255,255,255,0.9)',
    marginTop: scale(4),
  },

  cardWrap: {
    flex: 1,
    backgroundColor: C.white,
    borderTopLeftRadius: scale(26),
    borderTopRightRadius: scale(26),
    marginTop: -scale(20),
    overflow: 'hidden',
  },
  amountBox: {
    alignItems: 'center',
    paddingTop: scale(22),
    paddingBottom: scale(10),
  },
  amountLabel: { fontSize: scale(12), color: C.gray, marginBottom: scale(4) },
  amountValue: { fontSize: scale(28), fontWeight: '800', color: C.dark, letterSpacing: -0.5 },

  body: { flex: 1, paddingHorizontal: scale(20) },
  bodyContent: { paddingTop: scale(8), paddingBottom: scale(16) },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    backgroundColor: C.greenBg,
    borderRadius: scale(20),
    alignSelf: 'flex-start',
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    marginTop: scale(14),
  },
  statusTxt: { fontSize: scale(12), fontWeight: '700', color: C.green },

  footer: {
    paddingHorizontal: scale(20),
    paddingTop: scale(10),
    paddingBottom: Platform.OS === 'ios' ? scale(30) : scale(20),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.border,
  },
  doneBtnWrap: { borderRadius: scale(14), overflow: 'hidden' },
  doneBtn: {
    height: scale(52),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: C.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  doneTxt: { fontSize: scale(15.5), fontWeight: '700', color: C.white },
});