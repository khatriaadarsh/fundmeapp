// src/components/StatsRow.jsx
import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { P, sp } from '../theme/theme';
import { useCreatorStatistics } from '../hooks/useCreator';
import { useDonorSummary } from '../hooks/useDonor';

// "N/A" for null/undefined — matches the pattern used elsewhere in the app.
const naFallback = (value) =>
  value === null || value === undefined || value === '' ? 'N/A' : value;

// PKR 6,650 / PKR 15.2K / PKR 2.4M — same abbreviated style as the
// original mock ("PKR 15M"), just driven by the real number now.
const formatAmount = (n) => {
  if (n === null || n === undefined) return 'N/A';
  const num = Number(n);
  if (isNaN(num)) return 'N/A';

  if (num >= 1_000_000) return `PKR ${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (num >= 1_000) return `PKR ${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return `PKR ${num.toLocaleString('en-PK')}`;
};

const formatCount = (n) => {
  if (n === null || n === undefined) return 'N/A';
  const num = Number(n);
  if (isNaN(num)) return 'N/A';
  if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return String(num);
};

/**
 * Same three-cell card for both roles, different source and labels.
 *
 * Both hooks are called unconditionally because hooks can't sit behind
 * an if — but each is gated with `enabled`, so exactly one request goes
 * out. Without that gate a donor would still hit /creator/statistics on
 * every home load and get a guaranteed 403/404 back.
 */
const StatsRow = memo(({ userId, role }) => {
  const isCreator = String(role || '').toLowerCase() === 'creator';

  const {
    data: creatorStats,
    isLoading: creatorLoading,
  } = useCreatorStatistics(userId, { enabled: isCreator });

  const {
    data: donorStats,
    isLoading: donorLoading,
  } = useDonorSummary(userId, { enabled: !isCreator });

  const isLoading = isCreator ? creatorLoading : donorLoading;

  const stats = useMemo(() => {
    if (isCreator) {
      return [
        { val: formatAmount(creatorStats?.totalRaised), lbl: 'Raised' },
        { val: formatCount(creatorStats?.totalDonors), lbl: 'Donors' },
        { val: formatCount(creatorStats?.totalCampaigns), lbl: 'Campaigns' },
      ];
    }

    return [
      { val: formatAmount(donorStats?.totalAmount), lbl: 'Donated' },
      { val: formatCount(donorStats?.totalDonations), lbl: 'Donations' },
      {
        val: formatCount(donorStats?.totalCampaignsSupported),
        lbl: 'Campaigns',
      },
    ];
  }, [isCreator, creatorStats, donorStats]);

  return (
    <View style={stSt.card}>
      {stats.map((s, i) => (
        <View key={s.lbl} style={[stSt.item, i < 2 && stSt.divider]}>
          {isLoading ? (
            <ActivityIndicator size="small" color={P.teal} style={stSt.loader} />
          ) : (
            <Text style={stSt.val}>{naFallback(s.val)}</Text>
          )}
          <Text style={stSt.lbl}>{s.lbl}</Text>
        </View>
      ))}
    </View>
  );
});

const stSt = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: P.white,
    marginHorizontal: sp(16),
    marginTop: sp(14),
    borderRadius: sp(12),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  item: { flex: 1, alignItems: 'center', paddingVertical: sp(14) },
  divider: { borderRightWidth: 1, borderRightColor: P.border },
  val: {
    fontSize: sp(15),
    fontWeight: '800',
    color: P.dark,
    marginBottom: sp(2),
  },
  lbl: { fontSize: sp(11), color: P.light },
  loader: { marginBottom: sp(4) },
});

export default StatsRow;