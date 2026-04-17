// src/components/campaigns/CampaignCard.jsx
import React, { memo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Icons from 'react-native-vector-icons/Feather';
import { P, sp } from '../../theme/theme';
import { STATUS_CONFIG } from '../../constants/mockData';

// Helper: Shorten PKR amount
const fmtAmount = n => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${Math.round(n / 1000)}K`;
  return `${n}`;
};

const CampaignCard = memo(({ item, onAction }) => {
  const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.Draft;
  const hasActions = item.actions?.length > 0;

  return (
    <View style={styles.card}>
      {/* Thumbnail */}
      <View style={styles.thumbWrap}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.thumb} resizeMode="cover" />
        ) : (
          <View style={[styles.thumb, styles.thumbFallback]}>
            <Icons name="image" size={sp(20)} color={P.light} />
          </View>
        )}
      </View>

      {/* Content Column */}
      <View style={styles.content}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <View style={[styles.badge, { backgroundColor: status.bg }]}>
             <Text style={[styles.badgeTxt, { color: status.text }]}>{status.label}</Text>
          </View>
        </View>

        {/* Dynamic Status Content */}
        {item.status === 'Active' && (
          <View style={styles.activeBlock}>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${Math.min((item.raised/item.goal)*100, 100)}%` }]} />
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.amount}>
                 PKR {fmtAmount(item.raised)} 
                 <Text style={styles.goal}> / {fmtAmount(item.goal)}</Text>
              </Text>
              <Text style={styles.time}>{item.daysLeft}d left</Text>
            </View>
          </View>
        )}

        {['Pending', 'Draft'].includes(item.status) && (
           <Text style={styles.subText}>
             {item.status === 'Pending' ? `Submitted ${item.submittedOn}. ${item.note}` : `Last edited ${item.lastEdited}`}
           </Text>
        )}

        {item.status === 'Rejected' && (
           <Text style={styles.rejectedText}>{item.reason}</Text>
        )}
      </View>

      {/* Actions Footer */}
      {hasActions && (
        <>
          <View style={styles.divider} />
          <View style={styles.actionRow}>
            {item.actions.map((act, i) => (
              <React.Fragment key={act}>
                 {i > 0 && <View style={styles.dot}/>}
                 <TouchableOpacity onPress={() => onAction(act)}>
                   <Text style={[styles.actionLink, act === 'Delete' && styles.actionDanger]}>
                     {act}
                   </Text>
                 </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        </>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    marginHorizontal: sp(16),
    marginBottom: sp(12),
    backgroundColor: P.white,
    borderRadius: sp(12),
    paddingHorizontal: sp(12),
    paddingVertical: sp(12),
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
  },
  thumbWrap: { width: sp(80), height: sp(80), borderRadius: sp(10), overflow: 'hidden' },
  thumb: { width: '100%', height: '100%' },
  thumbFallback: { backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, marginLeft: sp(12) },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: sp(6) },
  title: { flex: 1, fontSize: sp(14), fontWeight: '700', color: P.dark, lineHeight: sp(20), textAlignVertical: 'top' },
  badge: { paddingVertical: sp(2), paddingHorizontal: sp(8), borderRadius: sp(6), alignSelf: 'flex-start' },
  badgeTxt: { fontSize: sp(10), fontWeight: '800' },
  
  activeBlock: { marginTop: sp(6) },
  progressBg: { height: sp(6), backgroundColor: P.border, borderRadius: sp(3), marginBottom: sp(4) },
  progressFill: { height: '100%', backgroundColor: P.green, borderRadius: sp(3) },
  amountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  amount: { fontSize: sp(12), fontWeight: '700', color: P.dark },
  goal: { fontSize: sp(12), color: P.gray, fontWeight: '500' },
  time: { fontSize: sp(12), color: P.gray, fontWeight: '600' },
  subText: { fontSize: sp(12), color: P.gray, fontStyle: 'italic' },
  rejectedText: { fontSize: sp(12), color: P.red, fontStyle: 'italic' },
  
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: P.border, marginVertical: sp(8) },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: sp(4) },
  actionLink: { fontSize: sp(13), fontWeight: '700', color: P.primary }, // Using primary color for links
  actionDanger: { color: P.red },
  dot: { width: sp(4), height: sp(4), borderRadius: sp(2), backgroundColor: P.light, marginHorizontal: sp(1) },
});

export default CampaignCard;