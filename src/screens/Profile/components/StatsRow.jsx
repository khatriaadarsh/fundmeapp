// src/screens/Profile/components/StatsRow.jsx
// ─────────────────────────────────────────────────────────────
//  StatsRow — 4-column stats: Campaigns | Raised | Donors | Rating
// ─────────────────────────────────────────────────────────────

import React, { memo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width: SW } = Dimensions.get('window');
const sp = n => (SW / 375) * n;

const P = {
  darkOcean: '#0A3D62',
  gray:      '#6B7280',
  white:     '#FFFFFF',
  border:    '#E5E7EB',
};

// Compacts large numbers (e.g. 4500000 -> "4.5M", 850 -> "850")
const formatCompact = (n) => {
  const num = Number(n || 0);
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return String(num);
};

const StatsRow = memo(({ campaignCount, amountRaised, totalDonors, averageRating }) => {
  const stats = [
    { value: formatCompact(campaignCount), label: 'Campaigns' },
    { value: formatCompact(amountRaised), label: 'Raised' },
    { value: formatCompact(totalDonors), label: 'Donors' },
    { value: `${Number(averageRating || 0).toFixed(1)}★`, label: 'Rating' },
  ];

  return (
    <View style={s.card}>
      {stats.map((stat, i) => (
        <View key={stat.label} style={[s.col, i < stats.length - 1 && s.divider]}>
          <Text style={s.value}>{stat.value}</Text>
          <Text style={s.label}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
});

export default StatsRow;

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: P.white,
    borderRadius: sp(16),
    marginHorizontal: sp(20),
    marginTop: sp(16),
    paddingVertical: sp(18),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },
  col: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    borderRightWidth: 1,
    borderRightColor: P.border,
  },
  value: {
    fontSize: sp(18),
    fontWeight: '800',
    color: P.darkOcean,
    marginBottom: sp(3),
    letterSpacing: -0.3,
  },
  label: {
    fontSize: sp(11),
    fontWeight: '500',
    color: P.gray,
  },
});