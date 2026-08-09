// src/components/donation/DonationConfirmModal.jsx
// ─────────────────────────────────────────────────────────────
//  Donation confirmation — "Confirm Details" screen UI.
//  Theme = teal. No console.log / no Alert. Backend responseCode +
//  responseMessage shown via the shared <ResponseModal />.
//  Props & logic are UNCHANGED — only visuals were tuned.
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
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/Feather';

import ResponseModal from '../ResponseModal';

const { width: SW } = Dimensions.get('window');
const scale = n => (SW / 375) * n;

// ── Theme tokens (teal) ──
const C = {
  pageBg: '#F2F3F5',
  white: '#FFFFFF',
  dark: '#1A1A1A',
  gray: '#8A8F98',
  border: '#E5E7EB',

  teal: '#00B4CC',
  tealDeep: '#0D4F6B',
  tealText: '#0D4F6B',
  tealBg: '#E6F7FB',
};

const fmt = n => `Rs. ${Number(n || 0).toLocaleString('en-PK')}`;

// Masks an account number to first 4 + dots + last 3 digits.
const maskAccount = num => {
  if (!num) return null;
  const digits = String(num);
  if (digits.length <= 7) return digits;
  const first = digits.slice(0, 4);
  const last = digits.slice(-3);
  return `${first}${'•'.repeat(digits.length - 7)}${last}`;
};

// ── Amount / Fees / Total row ──
const AmountRow = memo(({ label, value, bold }) => (
  <View style={s.amountRow}>
    <Text style={[s.amountLabel, bold && s.amountLabelBold]}>{label}</Text>
    <Text style={[s.amountValue, bold && s.amountValueBold]}>{value}</Text>
  </View>
));

// ── Selection box (Channel / Purpose) ──
const SelectBox = memo(({ icon, text, badge }) => (
  <View style={s.selectBox}>
    <View style={s.selectLeft}>
      <View style={s.selectIcon}>
        <Icons name={icon} size={scale(16)} color={C.tealText} />
      </View>
      <Text style={s.selectText} numberOfLines={1}>
        {text}
      </Text>
    </View>
    <View style={s.selectRight}>
      {!!badge && (
        <View style={s.badge}>
          <Text style={s.badgeTxt}>{badge}</Text>
        </View>
      )}
      <Icons name="chevron-down" size={scale(18)} color={C.dark} />
    </View>
  </View>
));

// ── Main component ──
const DonationConfirmModal = ({
  visible,
  onClose,
  onConfirm,
  loading = false,

  campaignTitle,
  campaignCreator,
  creatorLoading = false,
  amount,
  serviceFee = 0,
  accountNumber,
  name,
  paymentMethod,
  message,

  error,        // { visible, code, message } | null
  onErrorClose,
}) => {
  const insets = useSafeAreaInsets();
  const total = Number(amount || 0) + Number(serviceFee || 0);

  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: visible ? 1 : 0,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [visible, anim]);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [scale(40), 0],
  });

  const displayName =
    name || (creatorLoading ? 'Loading...' : campaignCreator) || '—';
  const displayNumber = maskAccount(accountNumber);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View
        style={[s.screen, { opacity: anim, transform: [{ translateY }] }]}
      >
        {/* Header — safe-area top so it never sits under status bar/battery */}
        <View style={[s.header, { paddingTop: insets.top + scale(8) }]}>
          <TouchableOpacity
            onPress={onClose}
            style={s.backBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            disabled={loading}
          >
            <Icons name="arrow-left" size={scale(22)} color={C.dark} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Confirm Details</Text>
        </View>

        {/* Body */}
        <ScrollView
          style={s.body}
          contentContainerStyle={s.bodyContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Heart badge (overlaps card) */}
          <View style={s.logoWrap}>
            <View style={s.logoCircle}>
              <View style={s.logoInner}>
                <Icons name="heart" size={scale(30)} color={C.white} />
              </View>
            </View>
          </View>

          {/* Card */}
          <View style={s.card}>
            <View style={s.nameBlock}>
              <Text style={s.name}>{displayName}</Text>
              {!!displayNumber && <Text style={s.number}>{displayNumber}</Text>}
            </View>

            {/* Campaign title so donor knows whom they're donating to */}
            {!!campaignTitle && (
              <View style={s.campaignPill}>
                <Icons name="heart" size={scale(12)} color={C.tealText} />
                <Text style={s.campaignPillTxt} numberOfLines={1}>
                  Donating to: {campaignTitle}
                </Text>
              </View>
            )}

            <AmountRow label="Amount" value={fmt(amount)} />
            <AmountRow label="Fees" value={fmt(serviceFee)} />
            <AmountRow label="Total Amount" value={fmt(total)} bold />

            {/* Channel */}
            <Text style={s.sectionLabel}>Channel</Text>
            <SelectBox
              icon="credit-card"
              text={paymentMethod || 'Raast'}
              badge="FREE 🎉"
            />

            {/* Purpose of Payment */}
            <Text style={[s.sectionLabel, { marginTop: scale(16) }]}>
              Purpose of Payment
            </Text>
            <SelectBox icon="file-text" text={campaignTitle || 'Others'} />
          </View>
        </ScrollView>

        {/* Footer CONFIRM */}
        <View
          style={[
            s.footer,
            { paddingBottom: Math.max(insets.bottom, scale(12)) + scale(6) },
          ]}
        >
          <TouchableOpacity
            style={[s.confirmBtn, loading && s.confirmBtnDisabled]}
            onPress={onConfirm}
            activeOpacity={0.88}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={C.white} />
            ) : (
              <Text style={s.confirmTxt}>CONFIRM</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Backend response (exact code + message) */}
        {!!error && (
          <ResponseModal
            visible={!!error?.visible}
            variant="error"
            code={error?.code}
            message={error?.message}
            onClose={onErrorClose}
          />
        )}
      </Animated.View>
    </Modal>
  );
};

export default memo(DonationConfirmModal);

// ── Styles ──
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.pageBg },

  header: {
    paddingHorizontal: scale(20),
    paddingBottom: scale(4),
  },
  backBtn: {
    width: scale(38),
    height: scale(38),
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: scale(24), // decent, not oversized
    fontWeight: '800',
    color: C.dark,
    marginTop: scale(6),
  },

  body: { flex: 1 },
  bodyContent: {
    paddingHorizontal: scale(20),
    paddingTop: scale(44),
    paddingBottom: scale(16),
  },

  logoWrap: {
    position: 'absolute',
    top: scale(6),
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  logoCircle: {
    width: scale(82),
    height: scale(82),
    borderRadius: scale(41),
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
  },
  logoInner: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(32),
    backgroundColor: C.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    backgroundColor: C.white,
    borderRadius: scale(24),
    paddingHorizontal: scale(22),
    paddingTop: scale(50),
    paddingBottom: scale(30), // a bit taller so spacing feels balanced
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
  },

  nameBlock: { alignItems: 'center', marginBottom: scale(12) },
  name: { fontSize: scale(20), fontWeight: '800', color: C.dark },
  number: { fontSize: scale(15), color: C.gray, marginTop: scale(4) },

  campaignPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: scale(6),
    backgroundColor: C.tealBg,
    borderRadius: scale(20),
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    marginBottom: scale(16),
    maxWidth: '100%',
  },
  campaignPillTxt: {
    fontSize: scale(12),
    fontWeight: '700',
    color: C.tealText,
    flexShrink: 1,
  },

  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: scale(7),
  },
  amountLabel: { fontSize: scale(16), color: C.gray },
  amountLabelBold: { color: C.dark, fontWeight: '800' },
  amountValue: { fontSize: scale(16), fontWeight: '600', color: C.dark },
  amountValueBold: { fontSize: scale(17), fontWeight: '800' },

  sectionLabel: {
    fontSize: scale(15),
    color: C.gray,
    marginTop: scale(18),
    marginBottom: scale(8),
  },

  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: scale(14),
    paddingHorizontal: scale(14),
    paddingVertical: scale(12),
  },
  selectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
    flex: 1,
  },
  selectIcon: {
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    borderWidth: 1,
    borderColor: C.tealBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectText: {
    fontSize: scale(16),
    fontWeight: '800',
    color: C.dark,
    flexShrink: 1,
  },
  selectRight: { flexDirection: 'row', alignItems: 'center', gap: scale(8) },
  badge: {
    backgroundColor: C.tealBg,
    borderRadius: scale(8),
    paddingHorizontal: scale(8),
    paddingVertical: scale(4),
  },
  badgeTxt: { fontSize: scale(11), fontWeight: '800', color: C.tealText },

  // Footer sits closer to the card (less empty gap)
  footer: {
    backgroundColor: C.white,
    paddingHorizontal: scale(20),
    paddingTop: scale(12),
  },
  confirmBtn: {
    height: scale(54),
    borderRadius: scale(12),
    backgroundColor: C.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnDisabled: { opacity: 0.7 },
  confirmTxt: {
    fontSize: scale(16),
    fontWeight: '700',
    color: C.white,
    letterSpacing: 0.5,
  },
});
