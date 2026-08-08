// src/screens/Profile/components/TrustBadges.jsx
// ─────────────────────────────────────────────────────────────
//  TrustBadges — Overlapping card with verification pills
// ─────────────────────────────────────────────────────────────

import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icons from 'react-native-vector-icons/Feather';

const { width: SW } = Dimensions.get('window');
const sp = n => (SW / 375) * n;

const P = {
  teal:      '#00B4CC',
  tealLight: 'rgba(0,180,204,0.10)',
  red:       '#EF4444',
  redLight:  'rgba(239,68,68,0.10)',
  dark:      '#111827',
  gray:      '#6B7280',
  white:     '#FFFFFF',
  border:    '#E5E7EB',
  green:     '#10B981',
};

const TrustBadges = memo(({ isVerified, cnicVerified, emailVerified, phoneVerified }) => {
  // Each badge's `verified` flag now comes directly from the real
  // profile API values instead of being hardcoded true.
  const badges = [
    { emoji: '✉️', label: 'Email', verified: !!emailVerified },
    { emoji: '📱', label: 'Phone', verified: !!phoneVerified },
    { emoji: '🆔', label: 'ID Verified', verified: !!cnicVerified },
    { emoji: '🏦', label: 'Bank', verified: !!isVerified },
  ];

  const anyVerified = badges.some(b => b.verified);

  return (
    <View style={s.card}>
      {/* Header row — label changed from VERIFIED to VERIFICATION */}
      <View style={s.headerRow}>
        <Text style={s.headerLabel}>VERIFICATION</Text>
        <Icons
          name={anyVerified ? 'check-circle' : 'alert-circle'}
          size={sp(13)}
          color={anyVerified ? P.green : P.gray}
          style={{ marginLeft: sp(5) }}
        />
      </View>

      {/* Badge pills — tick when verified, cross when not */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.pillsRow}
      >
        {badges.map(b => (
          <View
            key={b.label}
            style={[s.pill, !b.verified && s.pillUnverified]}
          >
            <Text style={s.pillEmoji}>{b.emoji}</Text>
            <Icons
              name={b.verified ? 'check' : 'x'}
              size={sp(9)}
              color={b.verified ? P.teal : P.red}
              style={{ marginRight: sp(3) }}
            />
            <Text
              style={[s.pillLabel, !b.verified && s.pillLabelUnverified]}
            >
              {b.label}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
});

export default TrustBadges;

const s = StyleSheet.create({
  card: {
    backgroundColor: P.white,
    borderRadius: sp(16),
    padding: sp(14),
    marginHorizontal: sp(20),
    marginTop: sp(-20),        // overlaps hero
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sp(10),
  },
  headerLabel: {
    fontSize: sp(11),
    fontWeight: '700',
    color: P.gray,
    letterSpacing: 0.5,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: sp(8),
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: P.tealLight,
    borderRadius: sp(20),
    paddingHorizontal: sp(12),
    paddingVertical: sp(6),
    gap: sp(3),
  },
  pillUnverified: {
    backgroundColor: P.redLight,
  },
  pillEmoji: { fontSize: sp(12) },
  pillLabel: {
    fontSize: sp(11),
    fontWeight: '600',
    color: P.teal,
  },
  pillLabelUnverified: {
    color: P.red,
  },
});