// src/screens/campaigns/MyCampaignsScreen.jsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Icons from 'react-native-vector-icons/Feather';

// ═══════════════════════════════════════════════════════════
// Responsive Scale
// ═══════════════════════════════════════════════════════════
const { width: SW, height: SH } = Dimensions.get('window');
const scale = size => (SW / 375) * size;
const vscale = size => (SH / 812) * size;

// ═══════════════════════════════════════════════════════════
// Design Tokens
// ═══════════════════════════════════════════════════════════
const C = {
  pageBg: '#F4F6F9',
  white: '#FFFFFF',
  primary: '#0A3D62',
  teal: '#15AABF',
  textDark: '#111827',
  textGray: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  cardBg: '#FFFFFF',
  active: '#16A34A',
  activeBg: '#DCFCE7',
  activeBorder: '#BBF7D0',
  pending: '#D97706',
  pendingBg: '#FEF3C7',
  pendingBorder: '#FDE68A',
  draft: '#6B7280',
  draftBg: '#F3F4F6',
  draftBorder: '#E5E7EB',
  rejected: '#DC2626',
  rejectedBg: '#FEE2E2',
  rejectedBorder: '#FECACA',
  progressBg: '#E5E7EB',
  progressFill: '#16A34A',
  linkPrimary: '#0A3D62',
  linkDanger: '#DC2626',
};

// ═══════════════════════════════════════════════════════════
// Data
// ═══════════════════════════════════════════════════════════
const ALL_CAMPAIGNS = [
  {
    id: '1',
    title: "Help Fatima's Heart Surgery",
    status: 'Active',
    image: 'https://picsum.photos/id/237/200',
    raised: 325000,
    goal: 500000,
    daysLeft: 12,
    actions: ['View', 'Update', 'Withdraw'],
  },
  {
    id: '2',
    title: 'Emergency Flood Relief for Dadu',
    status: 'Pending',
    image: 'https://picsum.photos/id/1016/200',
    submittedOn: 'Jan 14, 2025',
    note: 'Under review.',
    actions: [],
  },
  {
    id: '3',
    title: 'Education Fund for...',
    status: 'Draft',
    image: 'https://picsum.photos/id/1011/200',
    lastEdited: '2 days ago',
    actions: ['Edit', 'Delete'],
  },
  {
    id: '4',
    title: 'Medical Supplies Support',
    status: 'Rejected',
    image: 'https://picsum.photos/id/1059/200',
    reason: '"Missing valid medical verification documents."',
    actions: ['Edit & Resubmit'],
  },
];

const TABS = ['All', 'Active', 'Pending', 'Draft'];

const STATUS_MAP = {
  Active: {
    label: 'ACTIVE',
    color: '#16A34A',
    bg: '#DCFCE7',
    border: '#BBF7D0',
  },
  Pending: {
    label: 'PENDING',
    color: '#D97706',
    bg: '#FEF3C7',
    border: '#FDE68A',
  },
  Draft: { label: 'DRAFT', color: '#6B7280', bg: '#F3F4F6', border: '#E5E7EB' },
  Rejected: {
    label: 'REJECTED',
    color: '#DC2626',
    bg: '#FEE2E2',
    border: '#FECACA',
  },
};

// ═══════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════
const formatPKR = n => {
  if (n >= 1000000) return `PKR ${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `PKR ${Math.round(n / 1000)}K`;
  return `PKR ${n}`;
};

const actionColor = action => {
  if (action === 'Delete' || action === 'Withdraw') return C.linkDanger;
  return C.linkPrimary;
};

// ═══════════════════════════════════════════════════════════
// HEADER
// ═══════════════════════════════════════════════════════════
const Header = ({ onBack, onNew }) => (
  <View style={s.header}>
    <TouchableOpacity
      onPress={onBack}
      style={s.headerBack}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Icons name="arrow-left" size={scale(22)} color={C.textDark} />
    </TouchableOpacity>
    <Text style={s.headerTitle}>My Campaigns</Text>
    <TouchableOpacity onPress={onNew} activeOpacity={0.75}>
      <Text style={s.headerNew}>+ New</Text>
    </TouchableOpacity>
  </View>
);

// ═══════════════════════════════════════════════════════════
// ✅ TAB BAR — equal width tabs, no extra space
// ═══════════════════════════════════════════════════════════
const TabBar = ({ active, onChange }) => (
  <View style={s.tabRow}>
    {TABS.map(tab => {
      const isActive = active === tab;
      return (
        <TouchableOpacity
          key={tab}
          onPress={() => onChange(tab)}
          activeOpacity={0.75}
          // ✅ flex:1 makes every tab equal width
          style={[s.tabBtn, isActive && s.tabBtnActive]}
        >
          <Text
            style={[
              s.tabLabel,
              isActive ? s.tabLabelActive : s.tabLabelInactive,
            ]}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

// ═══════════════════════════════════════════════════════════
// STATUS BADGE
// ═══════════════════════════════════════════════════════════
const StatusBadge = ({ status }) => {
  const cfg = STATUS_MAP[status] ?? STATUS_MAP.Draft;
  return (
    <View
      style={[s.badge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}
    >
      <Text style={[s.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════
// PROGRESS BAR
// ═══════════════════════════════════════════════════════════
const ProgressBar = ({ raised, goal }) => {
  const pct = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;
  return (
    <View style={s.progressBg}>
      <View style={[s.progressFill, { width: `${pct}%` }]} />
    </View>
  );
};

// ═══════════════════════════════════════════════════════════
// ACTION LINKS
// ═══════════════════════════════════════════════════════════
const ActionLinks = ({ actions, onAction }) => {
  if (!actions?.length) return null;
  return (
    <View style={s.actionsRow}>
      {actions.map((action, idx) => (
        <React.Fragment key={action}>
          {idx > 0 && <View style={s.dot} />}
          <TouchableOpacity
            onPress={() => onAction?.(action)}
            activeOpacity={0.7}
          >
            <Text style={[s.actionText, { color: actionColor(action) }]}>
              {action}
            </Text>
          </TouchableOpacity>
        </React.Fragment>
      ))}
    </View>
  );
};

// ═══════════════════════════════════════════════════════════
// CAMPAIGN CARD
// ═══════════════════════════════════════════════════════════
const CampaignCard = ({ item, onAction }) => {
  const isActive = item.status === 'Active';
  const isPending = item.status === 'Pending';
  const isDraft = item.status === 'Draft';
  const isRejected = item.status === 'Rejected';
  const hasActions = item.actions?.length > 0;

  return (
    <View style={s.card}>
      <View style={s.cardInner}>
        {/* Thumbnail */}
        <View style={s.thumbWrap}>
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              style={s.thumb}
              resizeMode="cover"
            />
          ) : (
            <View style={[s.thumb, s.thumbFallback]}>
              <Icons name="image" size={scale(22)} color={C.textLight} />
            </View>
          )}
        </View>

        {/* Right column */}
        <View style={s.cardRight}>
          {/* Title + badge */}
          <View style={s.titleRow}>
            <Text style={s.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <StatusBadge status={item.status} />
          </View>

          {/* ACTIVE */}
          {isActive && (
            <View style={s.activeBlock}>
              <ProgressBar raised={item.raised} goal={item.goal} />
              <View style={s.amountRow}>
                <Text style={s.raisedAmt}>
                  {formatPKR(item.raised)}
                  <Text style={s.goalAmt}> / {formatPKR(item.goal)}</Text>
                </Text>
                <Text style={s.daysLeft}>{item.daysLeft}d left</Text>
              </View>
            </View>
          )}

          {/* PENDING */}
          {isPending && (
            <Text style={s.subNote}>
              Submitted on {item.submittedOn}. {item.note}
            </Text>
          )}

          {/* DRAFT */}
          {isDraft && (
            <Text style={s.subNote}>Last edited {item.lastEdited}</Text>
          )}

          {/* REJECTED */}
          {isRejected && (
            <Text style={s.rejectedReason} numberOfLines={3}>
              {item.reason}
            </Text>
          )}
        </View>
      </View>

      {/* Action links */}
      {hasActions && (
        <>
          <View style={s.cardDivider} />
          <ActionLinks actions={item.actions} onAction={onAction} />
        </>
      )}
    </View>
  );
};

// ═══════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════
const EmptyState = ({ tab }) => (
  <View style={s.empty}>
    <View style={s.emptyIconWrap}>
      <Icons name="folder" size={scale(32)} color={C.textLight} />
    </View>
    <Text style={s.emptyTitle}>No {tab} Campaigns</Text>
    <Text style={s.emptySub}>
      {tab === 'Draft'
        ? 'You have no saved drafts.'
        : `Your ${tab.toLowerCase()} campaigns will appear here.`}
    </Text>
  </View>
);

// ═══════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════
const MyCampaignsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('All');

  const data = useCallback(() => {
    if (activeTab === 'All') return ALL_CAMPAIGNS;
    return ALL_CAMPAIGNS.filter(c => c.status === activeTab);
  }, [activeTab])();

  const handleAction = useCallback((action, item) => {
    console.warn(`[Campaign] ${action} → id:${item?.id}`);
  }, []);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.pageBg} />

      <Header
        onBack={() => navigation.goBack()}
        onNew={() => navigation.navigate('CreateCampaign')}
      />

      <FlatList
        data={data}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.listContent}
        ListHeaderComponent={
          <TabBar active={activeTab} onChange={setActiveTab} />
        }
        ListEmptyComponent={<EmptyState tab={activeTab} />}
        renderItem={({ item }) => (
          <CampaignCard
            item={item}
            onAction={action => handleAction(action, item)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: vscale(10) }} />}
      />
    </SafeAreaView>
  );
};

// ═══════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════
const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.pageBg,
  },

  // ── Header ───────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    // paddingVertical: vscale(14),
    backgroundColor: C.pageBg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
  },
  headerBack: {
    width: scale(36),
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: scale(17),
    fontWeight: '700',
    color: C.textDark,
    letterSpacing: -0.2,
  },
  headerNew: {
    fontSize: scale(14),
    fontWeight: '700',
    color: C.teal,
    width: scale(36),
    textAlign: 'right',
  },

  // ── List ─────────────────────────────────────────────────
  listContent: {
    paddingBottom: vscale(32),
    flexGrow: 1,
  },

  // ══════════════════════════════════════════════════════════
  // ✅ TAB BAR — FIXED
  //
  // Container: white pill, marginHorizontal so it aligns
  //            with cards, small padding inside
  //
  // Each tabBtn: flex:1 → all tabs get EXACTLY equal width
  //              No extra space anywhere
  // ══════════════════════════════════════════════════════════
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    marginHorizontal: scale(16),
    marginTop: vscale(14),
    marginBottom: vscale(12),
    borderRadius: scale(50),
    paddingHorizontal: scale(4),
    paddingVertical: scale(4),
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
  },

  tabBtn: {
    // ✅ KEY FIX: flex:1 makes all 4 tabs share width equally
    // No tab takes more or less space than others
    flex: 1,
    paddingVertical: vscale(8),
    borderRadius: scale(50),
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabBtnActive: {
    backgroundColor: C.teal,
    elevation: 2,
    shadowColor: C.teal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  tabLabel: {
    fontSize: scale(13),
    fontWeight: '600',
    includeFontPadding: false,
  },
  tabLabelActive: { color: C.white },
  tabLabelInactive: { color: C.textGray },

  // ── Card ─────────────────────────────────────────────────
  card: {
    marginHorizontal: scale(16),
    backgroundColor: C.cardBg,
    borderRadius: scale(12),
    paddingHorizontal: scale(12),
    paddingTop: vscale(12),
    paddingBottom: vscale(10),
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: scale(12),
  },

  // ── Thumbnail ─────────────────────────────────────────────
  thumbWrap: {
    width: scale(80),
    height: scale(80),
    borderRadius: scale(8),
    overflow: 'hidden',
    flexShrink: 0,
  },
  thumb: {
    width: '100%',
    height: '100%',
  },
  thumbFallback: {
    backgroundColor: '#EEF2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Card right column ─────────────────────────────────────
  cardRight: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: scale(8),
    marginBottom: vscale(6),
  },
  cardTitle: {
    flex: 1,
    fontSize: scale(14),
    fontWeight: '700',
    color: C.textDark,
    lineHeight: scale(20),
    includeFontPadding: false,
  },

  // ── Status Badge ──────────────────────────────────────────
  badge: {
    paddingHorizontal: scale(8),
    paddingVertical: vscale(3),
    borderRadius: scale(6),
    borderWidth: 1,
    flexShrink: 0,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: scale(10),
    fontWeight: '700',
    letterSpacing: 0.5,
    includeFontPadding: false,
  },

  // ── Active block ─────────────────────────────────────────
  activeBlock: {
    marginTop: vscale(2),
  },
  progressBg: {
    height: vscale(6),
    backgroundColor: C.progressBg,
    borderRadius: scale(4),
    overflow: 'hidden',
    marginBottom: vscale(5),
  },
  progressFill: {
    height: '100%',
    backgroundColor: C.progressFill,
    borderRadius: scale(4),
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  raisedAmt: {
    fontSize: scale(12),
    fontWeight: '700',
    color: C.textDark,
    includeFontPadding: false,
  },
  goalAmt: {
    fontSize: scale(12),
    fontWeight: '500',
    color: C.textGray,
  },
  daysLeft: {
    fontSize: scale(12),
    fontWeight: '600',
    color: C.textGray,
    includeFontPadding: false,
  },

  // ── Pending / Draft note ──────────────────────────────────
  subNote: {
    fontSize: scale(12),
    color: C.textGray,
    lineHeight: scale(17),
    includeFontPadding: false,
  },

  // ── Rejected reason ───────────────────────────────────────
  rejectedReason: {
    fontSize: scale(12),
    color: C.rejected,
    fontStyle: 'italic',
    lineHeight: scale(17),
    includeFontPadding: false,
  },

  // ── Card divider + action links ───────────────────────────
  cardDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: C.border,
    marginTop: vscale(10),
    marginBottom: vscale(8),
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: scale(4),
  },
  actionText: {
    fontSize: scale(13),
    fontWeight: '700',
    includeFontPadding: false,
  },
  dot: {
    width: scale(4),
    height: scale(4),
    borderRadius: scale(2),
    backgroundColor: C.textLight,
    marginHorizontal: scale(2),
  },

  // ── Empty State ───────────────────────────────────────────
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: vscale(60),
    paddingHorizontal: scale(40),
  },
  emptyIconWrap: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(32),
    backgroundColor: '#EEF2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vscale(14),
  },
  emptyTitle: {
    fontSize: scale(15),
    fontWeight: '700',
    color: C.textDark,
    marginBottom: vscale(6),
    textAlign: 'center',
  },
  emptySub: {
    fontSize: scale(13),
    color: C.textGray,
    textAlign: 'center',
    lineHeight: scale(19),
  },
});

export default MyCampaignsScreen;
