// src/components/campaign/DonorInfoModal.jsx
// ─────────────────────────────────────────────────────────────
//  DonorInfoModal — bottom-sheet popup shown when a donor
//  row in "Recent Donors" is tapped.
//
//  Shows:
//    • Avatar (circular, large)
//    • Full name  +  anonymous badge if applicable
//    • Location (city/country)
//    • Total donated to this campaign
//    • Donation date & time
//    • Payment method
//    • Optional message (italic)
//    • "Total campaigns supported" stat
//    • "Member since" stat
//
//  Theme: white surface + teal accents
//  Colors imported from ../../theme/colors
//  Sizes from ../../theme/theme (sp helper)
//
//  Usage:
//    <DonorInfoModal
//      visible={modalVisible}
//      donor={selectedDonor}   // see DONOR_SHAPE below
//      onClose={() => setModalVisible(false)}
//    />
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useRef, memo, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import MCIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FeatherIcons from 'react-native-vector-icons/Feather';

// ── Theme imports ─────────────────────────────────────────────
// Colors come from your shared colors file.
// If your file exports differently, adjust the import below.
import COLORS from '../../theme/colors';
import { sp } from '../../theme/theme';

// ── Responsive helper ─────────────────────────────────────────
const { width: SW, height: SH } = Dimensions.get('window');
const scale = n => (SW / 390) * n;

// ── Local tokens (teal + white theme) ─────────────────────────
// These reference your COLORS object.
// Fallbacks ensure nothing crashes if a key is missing.
const T = {
  teal: COLORS?.teal ?? '#00B4CC',
  tealDark: COLORS?.tealDark ?? '#0097AA',
  tealLight: COLORS?.tealLight ?? 'rgba(0,180,204,0.10)',
  tealMid: COLORS?.tealMid ?? 'rgba(0,180,204,0.18)',
  green: COLORS?.green ?? '#16A34A',
  greenLight: COLORS?.greenLight ?? '#DCFCE7',
  white: COLORS?.white ?? '#FFFFFF',
  bg: COLORS?.bg ?? '#F4F6F9',
  surface: COLORS?.surface ?? '#FFFFFF',
  dark: COLORS?.dark ?? '#111827',
  gray: COLORS?.gray ?? '#6B7280',
  lightGray: COLORS?.lightGray ?? '#9CA3AF',
  border: COLORS?.border ?? '#E5E7EB',
  overlay: 'rgba(0,0,0,0.45)',
  anonBg: '#F3F4F6',
  anonFg: '#6B7280',
  divider: '#F0F2F5',
};

// ── Avatar placeholder (when no imageUri) ────────────────────
const AvatarPlaceholder = memo(({ name, size }) => {
  const initials = (name || '?')
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <View
      style={[ap.circle, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <Text style={[ap.text, { fontSize: size * 0.38 }]}>{initials}</Text>
    </View>
  );
});

const ap = StyleSheet.create({
  circle: {
    backgroundColor: T.tealLight,
    borderWidth: 2,
    borderColor: T.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { color: T.tealDark, fontWeight: '800' },
});

// ── Stat tile ─────────────────────────────────────────────────
const StatTile = memo(({ iconName, iconLib, label, value, accent }) => {
  const IconComp = iconLib === 'mc' ? MCIcons : FeatherIcons;
  return (
    <View
      style={[
        st.tile,
        { borderColor: accent + '33', backgroundColor: accent + '0D' },
      ]}
    >
      <View style={[st.iconCircle, { backgroundColor: accent + '22' }]}>
        <IconComp name={iconName} size={scale(18)} color={accent} />
      </View>
      <Text style={st.value}>{value}</Text>
      <Text style={st.label}>{label}</Text>
    </View>
  );
});

const st = StyleSheet.create({
  tile: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: sp(14),
    paddingHorizontal: sp(8),
    borderRadius: scale(14),
    borderWidth: 1,
  },
  iconCircle: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: sp(8),
  },
  value: {
    fontSize: sp(15),
    fontWeight: '800',
    color: T.dark,
    marginBottom: sp(2),
    textAlign: 'center',
  },
  label: {
    fontSize: sp(11),
    color: T.gray,
    textAlign: 'center',
    lineHeight: sp(15),
  },
});

// ── Info row ──────────────────────────────────────────────────
const InfoRow = memo(({ iconName, iconLib, text, accent }) => {
  const IconComp = iconLib === 'mc' ? MCIcons : FeatherIcons;
  return (
    <View style={ir.row}>
      <View style={[ir.iconWrap, { backgroundColor: accent + '15' }]}>
        <IconComp name={iconName} size={scale(14)} color={accent} />
      </View>
      <Text style={ir.text}>{text}</Text>
    </View>
  );
});

const ir = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sp(10),
    gap: sp(10),
  },
  iconWrap: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(8),
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  text: {
    fontSize: sp(14),
    color: T.dark,
    flex: 1,
    lineHeight: sp(20),
  },
});

// ── Divider ───────────────────────────────────────────────────
const Divider = () => (
  <View
    style={{ height: 1, backgroundColor: T.divider, marginVertical: sp(16) }}
  />
);

// ─────────────────────────────────────────────────────────────
//  DonorInfoModal — main component
// ─────────────────────────────────────────────────────────────

/**
 * DONOR_SHAPE (all optional except name + amount):
 * {
 *   id:               string
 *   name:             string       // "Zara M." or "Anonymous"
 *   isAnonymous:      boolean
 *   avatarUri:        string|null
 *   location:         string|null  // "Karachi, Pakistan"
 *   amount:           number       // 5000
 *   donationDate:     string       // "Jan 15, 2025"
 *   donationTime:     string       // "2:30 PM"
 *   paymentMethod:    string       // "EasyPaisa"
 *   message:          string|null  // "Praying for everyone!"
 *   totalCampaigns:   number       // 12
 *   memberSince:      string       // "Mar 2023"
 * }
 */

const AVATAR_SIZE = scale(88);
const SHEET_MAX_H = SH * 0.82;

const DonorInfoModal = ({ visible, donor, onClose }) => {
  // ── Slide-up animation ────────────────────────────────────
  const slideAnim = useRef(new Animated.Value(SHEET_MAX_H)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 68,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SHEET_MAX_H,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, overlayAnim]);

  const handleClose = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SHEET_MAX_H,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => onClose?.());
  }, [slideAnim, overlayAnim, onClose]);

  if (!donor) return null;

  const {
    name = 'Anonymous',
    isAnonymous = false,
    avatarUri = null,
    location = null,
    age = null, // ← ADD
    gender = null, // ← ADD
    occupation = null, // ← ADD
    phone = null, // ← ADD
    totalDonated = null, // ← ADD
    amount = 0,
    donationDate = '',
    donationTime = '',
    paymentMethod = '',
    message = null,
    totalCampaigns = 0,
    memberSince = '',
  } = donor;

  const displayName = isAnonymous ? 'Anonymous' : name;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      {/* ── Dimmed overlay ─────────────────────────────────── */}
      <Animated.View
        style={[m.overlay, { opacity: overlayAnim }]}
        pointerEvents="auto"
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={handleClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* ── Bottom sheet ───────────────────────────────────── */}
      <Animated.View
        style={[m.sheet, { transform: [{ translateY: slideAnim }] }]}
      >
        {/* Drag handle */}
        <View style={m.handle} />

        {/* Close button */}
        <TouchableOpacity
          style={m.closeBtn}
          onPress={handleClose}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <FeatherIcons name="x" size={scale(18)} color={T.gray} />
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={m.scrollContent}
          bounces={false}
        >
          {/* ── Avatar + name + badges ───────────────────────── */}
          <View style={m.heroSection}>
            {/* Teal ring around avatar */}
            <View style={m.avatarRing}>
              {avatarUri ? (
                <Image
                  source={{ uri: avatarUri }}
                  style={[
                    m.avatar,
                    {
                      width: AVATAR_SIZE,
                      height: AVATAR_SIZE,
                      borderRadius: AVATAR_SIZE / 2,
                    },
                  ]}
                  resizeMode="cover"
                />
              ) : (
                <AvatarPlaceholder name={displayName} size={AVATAR_SIZE} />
              )}
            </View>

            {/* Name */}
            <Text style={m.donorName}>{displayName}</Text>

            {/* Badges row */}
            <View style={m.badgesRow}>
              {isAnonymous && (
                <View style={m.anonBadge}>
                  <MCIcons name="incognito" size={scale(12)} color={T.anonFg} />
                  <Text style={m.anonText}>Anonymous</Text>
                </View>
              )}
              {location && (
                <View style={m.locationBadge}>
                  <MCIcons
                    name="map-marker-outline"
                    size={scale(12)}
                    color={T.teal}
                  />
                  <Text style={m.locationText}>{location}</Text>
                </View>
              )}
              {memberSince ? (
                <View style={m.memberBadge}>
                  <MCIcons
                    name="shield-check-outline"
                    size={scale(12)}
                    color={T.tealDark}
                  />
                  <Text style={m.memberText}>Since {memberSince}</Text>
                </View>
              ) : null}
            </View>
            {/* ── ADD THIS: Profile detail pills ─────────────────── */}
            {!isAnonymous && (age || gender || occupation) && (
              <View style={m.profilePills}>
                {age && (
                  <View style={m.profilePill}>
                    <MCIcons
                      name="cake-variant-outline"
                      size={scale(12)}
                      color={T.tealDark}
                    />
                    <Text style={m.profilePillText}>{age} years old</Text>
                  </View>
                )}
                {gender && (
                  <View style={m.profilePill}>
                    <MCIcons
                      name="gender-male-female"
                      size={scale(12)}
                      color={T.tealDark}
                    />
                    <Text style={m.profilePillText}>{gender}</Text>
                  </View>
                )}
                {occupation && (
                  <View style={m.profilePill}>
                    <MCIcons
                      name="briefcase-outline"
                      size={scale(12)}
                      color={T.tealDark}
                    />
                    <Text style={m.profilePillText}>{occupation}</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          <Divider />

          {/* ── Donation amount highlight ────────────────────── */}
          <View style={m.amountCard}>
            <View style={m.amountLeft}>
              <Text style={m.amountLabel}>Donated to this campaign</Text>
              <Text style={m.amountValue}>
                PKR {amount.toLocaleString('en-PK')}
              </Text>
            </View>
            <View style={m.amountIconCircle}>
              <MCIcons name="heart" size={scale(22)} color={T.teal} />
            </View>
          </View>

          <Divider />

          {/* ── Info rows ── */}
          <View style={m.infoSection}>
            {donationDate ? (
              <InfoRow
                iconName="calendar-outline"
                iconLib="mc"
                text={`${donationDate}${
                  donationTime ? ' · ' + donationTime : ''
                }`}
                accent={T.teal}
              />
            ) : null}
            {paymentMethod ? (
              <InfoRow
                iconName="credit-card-outline"
                iconLib="mc"
                text={`Paid via ${paymentMethod}`}
                accent={T.tealDark}
              />
            ) : null}
            {location ? (
              <InfoRow
                iconName="map-marker-outline"
                iconLib="mc"
                text={location}
                accent={T.teal}
              />
            ) : null}

            {/* ── ADD THESE TWO ─────────────────────────────────── */}
            {phone ? (
              <InfoRow
                iconName="phone-outline"
                iconLib="mc"
                text={phone}
                accent={T.tealDark}
              />
            ) : null}
            {totalDonated ? (
              <InfoRow
                iconName="hand-heart-outline"
                iconLib="mc"
                text={`PKR ${totalDonated.toLocaleString(
                  'en-PK',
                )} donated across all campaigns`}
                accent={T.teal}
              />
            ) : null}
          </View>
          {/* ── Message ──────────────────────────────────────── */}
          {!!message && (
            <>
              <View style={m.messageCard}>
                <MCIcons
                  name="format-quote-open"
                  size={scale(20)}
                  color={T.teal}
                  style={{ marginBottom: sp(4) }}
                />
                <Text style={m.messageText}>{message}</Text>
              </View>
              <View style={{ height: sp(16) }} />
            </>
          )}

          {/* ── Stats row ────────────────────────────────────── */}
          {totalCampaigns > 0 || memberSince ? (
            <>
              <Divider />
              <View style={m.statsRow}>
                {totalCampaigns > 0 && (
                  <StatTile
                    iconName="hand-heart-outline"
                    iconLib="mc"
                    value={String(totalCampaigns)}
                    label={'Campaigns\nSupported'}
                    accent={T.teal}
                  />
                )}
                {totalCampaigns > 0 && memberSince ? (
                  <View style={{ width: sp(10) }} />
                ) : null}
                {memberSince ? (
                  <StatTile
                    iconName="account-clock-outline"
                    iconLib="mc"
                    value={memberSince}
                    label={'Member\nSince'}
                    accent={T.tealDark}
                  />
                ) : null}
              </View>
            </>
          ) : null}

          <View style={{ height: sp(8) }} />
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

export default DonorInfoModal;

// ─────────────────────────────────────────────────────────────
//  Modal styles — StyleSheets defined before components use them
// ─────────────────────────────────────────────────────────────
const m = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: T.overlay,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: SHEET_MAX_H,
    backgroundColor: T.white,
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
    paddingBottom: Platform.OS === 'ios' ? sp(36) : sp(24),
    // Shadow on sheet top edge
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 20,
  },
  handle: {
    width: scale(40),
    height: scale(4),
    borderRadius: scale(2),
    backgroundColor: T.border,
    alignSelf: 'center',
    marginTop: sp(12),
    marginBottom: sp(4),
  },
  closeBtn: {
    position: 'absolute',
    top: sp(14),
    right: sp(18),
    width: scale(32),
    height: scale(32),
    borderRadius: scale(16),
    backgroundColor: T.bg,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  scrollContent: {
    paddingHorizontal: sp(20),
    paddingTop: sp(8),
  },

  // ── Hero: avatar + name + badges ────────────────────────
  heroSection: {
    alignItems: 'center',
    paddingTop: sp(12),
    paddingBottom: sp(4),
  },
  avatarRing: {
    width: AVATAR_SIZE + scale(8),
    height: AVATAR_SIZE + scale(8),
    borderRadius: (AVATAR_SIZE + scale(8)) / 2,
    borderWidth: 2.5,
    borderColor: T.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: sp(14),
    // Subtle teal glow
    shadowColor: T.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  avatar: {
    backgroundColor: T.tealLight,
  },
  donorName: {
    fontSize: sp(20),
    fontWeight: '800',
    color: T.dark,
    marginBottom: sp(10),
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: sp(8),
  },
  anonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp(4),
    backgroundColor: T.anonBg,
    paddingHorizontal: sp(10),
    paddingVertical: sp(4),
    borderRadius: sp(20),
  },
  anonText: {
    fontSize: sp(12),
    color: T.anonFg,
    fontWeight: '600',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp(4),
    backgroundColor: T.tealLight,
    paddingHorizontal: sp(10),
    paddingVertical: sp(4),
    borderRadius: sp(20),
  },
  locationText: {
    fontSize: sp(12),
    color: T.tealDark,
    fontWeight: '600',
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp(4),
    backgroundColor: T.tealLight,
    paddingHorizontal: sp(10),
    paddingVertical: sp(4),
    borderRadius: sp(20),
  },
  memberText: {
    fontSize: sp(12),
    color: T.tealDark,
    fontWeight: '600',
  },

  // ── Amount card ──────────────────────────────────────────
  amountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: T.tealLight,
    borderRadius: scale(14),
    paddingHorizontal: sp(18),
    paddingVertical: sp(16),
    borderWidth: 1,
    borderColor: T.teal + '33',
  },
  amountLeft: { flex: 1 },
  amountLabel: {
    fontSize: sp(12),
    color: T.tealDark,
    fontWeight: '500',
    marginBottom: sp(4),
  },
  amountValue: {
    fontSize: sp(26),
    fontWeight: '800',
    color: T.tealDark,
    letterSpacing: -0.5,
  },
  amountIconCircle: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    backgroundColor: T.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: T.teal + '55',
    shadowColor: T.teal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },

  // ── Info rows section ────────────────────────────────────
  infoSection: {
    paddingBottom: sp(4),
  },

  // ── Message card ─────────────────────────────────────────
  messageCard: {
    backgroundColor: T.tealLight,
    borderLeftWidth: 3,
    borderLeftColor: T.teal,
    borderRadius: scale(10),
    padding: sp(14),
  },
  messageText: {
    fontSize: sp(14),
    fontStyle: 'italic',
    color: T.dark,
    lineHeight: sp(21),
  },

  // ── Stats row ────────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  // Inside the m = StyleSheet.create({ ... }) object, add:

  profilePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: sp(6),
    marginTop: sp(10),
  },
  profilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp(4),
    backgroundColor: T.tealLight,
    borderWidth: 1,
    borderColor: T.teal + '33',
    paddingHorizontal: sp(10),
    paddingVertical: sp(5),
    borderRadius: sp(20),
  },
  profilePillText: {
    fontSize: sp(12),
    color: T.tealDark,
    fontWeight: '600',
  },
});
