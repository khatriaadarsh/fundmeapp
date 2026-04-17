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
  dark:      '#111827',
  gray:      '#6B7280',
  white:     '#FFFFFF',
  border:    '#E5E7EB',
  green:     '#10B981',
};

const BADGES = [
  { emoji: '✉️', label: 'Email'       },
  { emoji: '📱', label: 'Phone'       },
  { emoji: '🆔', label: 'ID Verified' },
  { emoji: '🏦', label: 'Bank'        },
];

const TrustBadges = memo(() => (
  <View style={s.card}>
    {/* Header row */}
    <View style={s.headerRow}>
      <Text style={s.headerLabel}>VERIFIED</Text>
      <Icons name="check-circle" size={sp(13)} color={P.green} style={{ marginLeft: sp(5) }} />
    </View>

    {/* Badge pills */}
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.pillsRow}
    >
      {BADGES.map(b => (
        <View key={b.label} style={s.pill}>
          <Text style={s.pillEmoji}>{b.emoji}</Text>
          <Icons name="check" size={sp(9)} color={P.teal} style={{ marginRight: sp(3) }} />
          <Text style={s.pillLabel}>{b.label}</Text>
        </View>
      ))}
    </ScrollView>
  </View>
));

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
  pillEmoji: { fontSize: sp(12) },
  pillLabel: {
    fontSize: sp(11),
    fontWeight: '600',
    color: P.teal,
  },
});