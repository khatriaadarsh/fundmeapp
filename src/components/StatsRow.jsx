// src/components/StatsRow.jsx
import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { P, sp } from '../theme/theme';

const StatsRow = memo(() => (
  <View style={stSt.card}>
    {[
      { val: 'PKR 15M', lbl: 'Raised' },
      { val: '5.2K', lbl: 'Donors' },
      { val: '320', lbl: 'Campaigns' },
    ].map((s, i) => (
      <View key={i} style={[stSt.item, i < 2 && stSt.divider]}>
        <Text style={stSt.val}>{s.val}</Text>
        <Text style={stSt.lbl}>{s.lbl}</Text>
      </View>
    ))}
  </View>
));

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
});

export default StatsRow;