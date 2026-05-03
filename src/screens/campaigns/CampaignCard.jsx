import React, { memo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

import Icons from 'react-native-vector-icons/Feather';
import { P, sp } from '../../theme/theme';
import { STATUS_CONFIG } from '../../constants/mockData';

// ─────────────────────────────────────────────
// Format PKR Amount
// ─────────────────────────────────────────────
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
      {/* TOP ROW */}
      <View style={styles.topRow}>
        {/* Thumbnail */}
        <View style={styles.thumbWrap}>
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              style={styles.thumb}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.thumb, styles.thumbFallback]}>
              <Icons name="image" size={sp(20)} color={P.light} />
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.title} numberOfLines={2}>
              {item.title}
            </Text>

            <View style={[styles.badge, { backgroundColor: status.bg }]}>
              <Text style={[styles.badgeTxt, { color: status.text }]}>
                {status.label}
              </Text>
            </View>
          </View>

          {/* ACTIVE */}
          {item.status === 'Active' && (
            <View style={styles.activeBlock}>
              <View style={styles.progressBg}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(
                        (item.raised / item.goal) * 100,
                        100,
                      )}%`,
                    },
                  ]}
                />
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

          {/* PENDING + DRAFT */}
          {['Pending', 'Draft'].includes(item.status) && (
            <Text style={styles.subText}>
              {item.status === 'Pending'
                ? `Submitted ${item.submittedOn}. ${item.note}`
                : `Last edited ${item.lastEdited}`}
            </Text>
          )}

          {/* REJECTED */}
          {item.status === 'Rejected' && (
            <Text style={styles.rejectedText}>{item.reason}</Text>
          )}
        </View>
      </View>

      {/* ACTIONS */}
      {hasActions && (
        <>
          <View style={styles.divider} />

          <View style={styles.actionRow}>
            {item.actions.map((act, i) => (
              <React.Fragment key={act}>
                {i > 0 && <View style={styles.dot} />}

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => onAction(act)}
                >
                  <Text
                    style={[
                      styles.actionLink,
                      act === 'Delete' && styles.actionDanger,
                    ]}
                  >
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
    borderRadius: sp(16),
    padding: sp(14),

    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  thumbWrap: {
    width: sp(82),
    height: sp(82),
    borderRadius: sp(12),
    overflow: 'hidden',
  },

  thumb: {
    width: '100%',
    height: '100%',
  },

  thumbFallback: {
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    flex: 1,
    marginLeft: sp(12),
    justifyContent: 'space-between',
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  title: {
    flex: 1,
    fontSize: sp(15),
    fontWeight: '700',
    color: P.dark,
    lineHeight: sp(21),
    paddingRight: sp(8),
  },

  badge: {
    paddingVertical: sp(4),
    paddingHorizontal: sp(10),
    borderRadius: sp(10),
  },

  badgeTxt: {
    fontSize: sp(10),
    fontWeight: '800',
  },

  activeBlock: {
    marginTop: sp(10),
  },

  progressBg: {
    height: sp(7),
    backgroundColor: '#E5E7EB',
    borderRadius: sp(10),
    overflow: 'hidden',
    marginBottom: sp(8),
  },

  progressFill: {
    height: '100%',
    backgroundColor: P.green,
    borderRadius: sp(10),
  },

  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  amount: {
    fontSize: sp(13),
    fontWeight: '700',
    color: P.dark,
  },

  goal: {
    color: P.gray,
    fontWeight: '500',
  },

  time: {
    fontSize: sp(12),
    fontWeight: '600',
    color: P.gray,
  },

  subText: {
    marginTop: sp(8),
    fontSize: sp(13),
    color: P.gray,
    fontStyle: 'italic',
    lineHeight: sp(18),
  },

  rejectedText: {
    marginTop: sp(8),
    fontSize: sp(13),
    color: P.red,
    fontStyle: 'italic',
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E7EB',
    marginVertical: sp(12),
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  actionLink: {
    fontSize: sp(14),
    fontWeight: '700',
    color: P.primary,
  },

  actionDanger: {
    color: '#EF4444',
  },

  dot: {
    width: sp(4),
    height: sp(4),
    borderRadius: sp(2),
    backgroundColor: P.light,
    marginHorizontal: sp(8),
  },
});

export default CampaignCard;