// src/components/donations/DonationCard.jsx
import React, { memo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Icons from 'react-native-vector-icons/Feather';
import { sp } from '../../theme/theme';

const STATUS_COLORS = {
  Completed: { bg: '#DCFCE7', text: '#16A34A' },
  Pending: { bg: '#FEF3C7', text: '#D97706' },
};

const DONATION_METHOD_COLOR = '#F1F5F9';
const DONATION_METHOD_BORDER = '#E2E8F0';

const DonationCard = memo(({ item }) => {
  const theme = STATUS_COLORS[item.status] || STATUS_COLORS.Completed;
  const showDivider = !!item.message;

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Image source={{ uri: item.image }} style={styles.thumb} resizeMode="cover" />
        
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        
        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>PKR</Text>
          <Text style={styles.amountValue}>{item.amount.toLocaleString('en-PK')}</Text>
        </View>
      </View>

      <View style={styles.badgeRow}>
        <View style={[styles.badge, { backgroundColor: theme.bg }]}>
          <Text style={[styles.badgeText, { color: theme.text }]}>{item.status.toUpperCase()}</Text>
        </View>
        <View style={[styles.chip, { backgroundColor: DONATION_METHOD_COLOR, borderColor: DONATION_METHOD_BORDER }]}>
          <Text style={styles.chipText}>{item.method}</Text>
        </View>
      </View>

      {showDivider && <View style={styles.divider} />}
      
      {item.message && <Text style={styles.message}>"{item.message}"</Text>}
      <Text style={styles.date}>{item.date}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    marginHorizontal: sp(16),
    marginBottom: sp(12),
    backgroundColor: '#FFFFFF',
    borderRadius: sp(12),
    paddingHorizontal: sp(12),
    paddingTop: sp(12),
    paddingBottom: sp(10),
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: sp(10) },
  thumb: { width: sp(52), height: sp(52), borderRadius: sp(8) },
  title: { flex: 1, fontSize: sp(13), fontWeight: '700', color: '#111827', lineHeight: sp(18), marginBottom: sp(10), textAlignVertical: 'top' },
  
  amountBox: { alignItems: 'flex-end' },
  amountLabel: { fontSize: sp(11), fontWeight: '700', color: '#16A34A', lineHeight: sp(14), includeFontPadding: false },
  amountValue: { fontSize: sp(15), fontWeight: '800', color: '#16A34A', includeFontPadding: false, lineHeight: sp(20) },
  
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: sp(8), marginBottom: sp(8) },
  badge: { paddingHorizontal: sp(9), paddingVertical: sp(3), borderRadius: sp(20) },
  badgeText: { fontSize: sp(10), fontWeight: '700', letterSpacing: 0.4 },
  
  chip: { paddingHorizontal: sp(9), paddingVertical: sp(3), borderRadius: sp(20), borderWidth: 1 },
  chipText: { fontSize: sp(11), fontWeight: '600', color: '#6B7280' },
  
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E5E7EB', marginBottom: sp(7) },
  message: { fontSize: sp(12), color: '#6B7280', fontStyle: 'italic', lineHeight: sp(17), marginBottom: sp(5) },
  date: { fontSize: sp(11), color: '#9CA3AF', textAlign: 'right', fontWeight: '500' },
});

export default DonationCard;