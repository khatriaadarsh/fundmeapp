// src/components/donation/DonationConfirmModal.jsx
// ─────────────────────────────────────────────────────────────
//  Reusable donation confirmation bottom-sheet modal.
//  Fully responsive, theme-colored, animated entrance.
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
import LinearGradient from 'react-native-linear-gradient';
import Icons from 'react-native-vector-icons/Feather';

const { width: SW, height: SH } = Dimensions.get('window');
const scale = n => (SW / 375) * n;

// ── Theme tokens (self-contained so this drops in anywhere) ───
const C = {
  white: '#FFFFFF',
  overlay: 'rgba(15, 23, 42, 0.60)',
  headerFrom: '#0D4F6B',
  headerTo: '#00B4CC',
  dark: '#111827',
  mid: '#334155',
  gray: '#64748B',
  light: '#94A3B8',
  border: '#E5E7EB',
  green: '#059669',
  greenLight: '#10B981',
  greenBg: '#ECFDF5',
  iconBg: '#F1F5F9',
};

const fmt = n => `PKR ${Number(n || 0).toLocaleString('en-PK')}`;

// Masks an account number to first 4 + dots + last 3 digits.
const maskAccount = num => {
  if (!num) return null;
  const digits = String(num);
  if (digits.length <= 7) return digits.replace(/./g, '•');
  const first = digits.slice(0, 4);
  const last = digits.slice(-3);
  return `${first}${'•'.repeat(digits.length - 7)}${last}`;
};

// ── One label/value row with a leading icon ────────────────
const Row = memo(({ icon, label, value }) => (
  <View style={row.wrap}>
    <View style={row.iconWrap}>
      <Icons name={icon} size={scale(14)} color={C.headerFrom} />
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
  label: {
    fontSize: scale(11.5),
    color: C.gray,
    marginBottom: scale(2),
  },
  value: {
    fontSize: scale(14),
    fontWeight: '700',
    color: C.dark,
    lineHeight: scale(19),
  },
});

// ── Main component ─────────────────────────────────────────
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
}) => {
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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={s.overlay}>
        <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose} />

        <Animated.View
          style={[
            s.sheet,
            { opacity: anim, transform: [{ translateY }] },
          ]}
        >
          {/* Header */}
          <LinearGradient
            colors={[C.headerFrom, C.headerTo]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.header}
          >
            <TouchableOpacity
              onPress={onClose}
              style={s.closeBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              disabled={loading}
            >
              <Icons name="x" size={scale(15)} color={C.white} />
            </TouchableOpacity>

            <View style={s.iconBadge}>
              <Icons name="heart" size={scale(22)} color={C.white} />
            </View>
            <Text style={s.headerTitle}>Confirm Donation</Text>
            <Text style={s.headerSub}>Review your details before paying</Text>
          </LinearGradient>

          {/* Amount hero */}
          <View style={s.amountHero}>
            <Text style={s.amountLabel}>Donation Amount</Text>
            <Text style={s.amountValue}>{fmt(amount)}</Text>
          </View>

          {/* Body */}
          <ScrollView
            style={s.body}
            contentContainerStyle={s.bodyContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <Row icon="target" label="Campaign Title" value={campaignTitle} />
            <Row
              icon="user"
              label="Campaign Creator"
              value={creatorLoading ? 'Loading...' : campaignCreator}
            />
            <Row icon="phone" label="Account Number" value={maskAccount(accountNumber)} />
            <Row icon="user-check" label="Donor Name" value={name} />
            <Row icon="smartphone" label="Payment Method" value={paymentMethod} />

            {/* Message — only shown when the donor actually entered one */}
            {!!message && (
              <Row icon="message-circle" label="Message" value={message} />
            )}

            {serviceFee > 0 && (
              <View style={s.feeRow}>
                <Text style={s.feeLabel}>Service Fee</Text>
                <Text style={s.feeValue}>{fmt(serviceFee)}</Text>
              </View>
            )}

            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Total Amount</Text>
              <Text style={s.totalValue}>{fmt(total)}</Text>
            </View>
          </ScrollView>

          {/* Footer actions */}
          <View style={s.footer}>
            <TouchableOpacity
              style={s.confirmBtnWrap}
              onPress={onConfirm}
              activeOpacity={0.88}
              disabled={loading}
            >
              <LinearGradient
                colors={[C.green, C.greenLight]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[s.confirmBtn, loading && s.confirmBtnDisabled]}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={C.white} />
                ) : (
                  <>
                    <Icons name="check-circle" size={scale(17)} color={C.white} />
                    <Text style={s.confirmTxt}>Confirm Payment</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              activeOpacity={0.7}
              style={s.cancelBtn}
              disabled={loading}
            >
              <Text style={s.cancelTxt}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default memo(DonationConfirmModal);

// ── Styles ──────────────────────────────────────────────────
const s = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: C.overlay,
  },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: scale(26),
    borderTopRightRadius: scale(26),
    maxHeight: SH * 0.88,
    overflow: 'hidden',
  },
  header: {
    alignItems: 'center',
    paddingTop: scale(22),
    paddingBottom: scale(24),
    paddingHorizontal: scale(20),
  },
  closeBtn: {
    position: 'absolute',
    top: scale(16),
    right: scale(16),
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadge: {
    width: scale(52),
    height: scale(52),
    borderRadius: scale(26),
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: scale(10),
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  headerTitle: {
    fontSize: scale(18),
    fontWeight: '800',
    color: C.white,
    includeFontPadding: false,
  },
  headerSub: {
    fontSize: scale(12),
    color: 'rgba(255,255,255,0.85)',
    marginTop: scale(4),
  },

  amountHero: {
    alignItems: 'center',
    backgroundColor: C.greenBg,
    marginHorizontal: scale(20),
    marginTop: -scale(14),
    borderRadius: scale(16),
    paddingVertical: scale(14),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  amountLabel: {
    fontSize: scale(11.5),
    fontWeight: '600',
    color: C.green,
    marginBottom: scale(4),
  },
  amountValue: {
    fontSize: scale(26),
    fontWeight: '800',
    color: C.green,
    letterSpacing: -0.5,
  },

  body: {
    paddingHorizontal: scale(20),
  },
  bodyContent: {
    paddingTop: scale(14),
    paddingBottom: scale(6),
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: scale(10),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
  },
  feeLabel: { fontSize: scale(13), color: C.gray },
  feeValue: { fontSize: scale(13), fontWeight: '600', color: C.dark },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: scale(16),
    marginTop: scale(2),
  },
  totalLabel: {
    fontSize: scale(14),
    fontWeight: '700',
    color: C.dark,
  },
  totalValue: {
    fontSize: scale(19),
    fontWeight: '800',
    color: C.green,
  },

  footer: {
    paddingHorizontal: scale(20),
    paddingTop: scale(16),
    paddingBottom: Platform.OS === 'ios' ? scale(30) : scale(20),
  },
  confirmBtnWrap: { borderRadius: scale(14), overflow: 'hidden' },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(8),
    height: scale(52),
    elevation: 4,
    shadowColor: C.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  confirmBtnDisabled: { opacity: 0.75 },
  confirmTxt: {
    fontSize: scale(15.5),
    fontWeight: '700',
    color: C.white,
  },
  cancelBtn: {
    marginTop: scale(14),
    alignItems: 'center',
  },
  cancelTxt: {
    fontSize: scale(14),
    fontWeight: '600',
    color: C.headerFrom,
  },
});