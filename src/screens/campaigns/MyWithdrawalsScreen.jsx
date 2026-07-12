// src/screens/profile/MyWithdrawalsScreen.jsx

import React, { useState, useCallback, useMemo, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  FlatList,
  Dimensions,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/Feather';
import MCIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { sp } from '../../theme/theme';
import {
  useUserWithdrawalSummary,
  useMyWithdrawals,
} from '../../hooks/useWithdrawal';

// ⚠️ ADJUST THIS IMPORT to match your actual auth hook/store.
// It just needs to return the logged-in user's id.
// import { useAppContext } from '../context/AppContext';
import{useAppContext} from '../../context/AppContext';

// ─────────────────────────────────────────────────────────────
//  Responsive helpers — SAME as MyDonationsScreen
// ─────────────────────────────────────────────────────────────
const { width: SW } = Dimensions.get('window');
const scale = n => (SW / 390) * n; // 390 = design base width

// ─────────────────────────────────────────────────────────────
//  Design tokens — SAME palette as MyDonationsScreen
//  (status colours added on top, kept consistent with that style)
// ─────────────────────────────────────────────────────────────
const C = {
  pageBg: '#F4F6F9',
  white: '#FFFFFF',
  dark: '#111827',
  gray: '#6B7280',
  lightGray: '#9CA3AF',
  border: '#E5E7EB',

  bannerStart: '#0D4F6B',
  bannerMid: '#0B7B8A',
  bannerEnd: '#00B4CC',

  tabActive: '#0D4F6B',
  tabInactive: '#6B7280',

  amountGreen: '#16A34A',

  completedBg: '#DCFCE7',
  completedFg: '#15803D',
  pendingBg: '#FEF9C3',
  pendingFg: '#B45309',
  rejectedBg: '#FEE2E2',
  rejectedFg: '#DC2626',

  paymentBg: '#F3F4F6',
  paymentFg: '#374151',
};

const TABS = ['All', 'Pending', 'Approved', 'Rejected'];

const STATUS = {
  pending: { label: 'Pending', bg: C.pendingBg, fg: C.pendingFg },
  approved: { label: 'Approved', bg: C.completedBg, fg: C.completedFg },
  rejected: { label: 'Rejected', bg: C.rejectedBg, fg: C.rejectedFg },
};

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────
const formatDate = isoString => {
  if (!isoString) return '';
  try {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '';
  }
};

const formatAmount = value => {
  const num = Number(value) || 0;
  return num.toLocaleString('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

// Maps a raw API withdrawal item -> the shape WithdrawalCard expects
const mapWithdrawal = item => {
  const status = String(item.status || '').toLowerCase(); // PENDING -> pending

  const mapped = {
    id: String(item.id),
    title: item.campaignTitle || 'Withdrawal Request',
    amount: formatAmount(item.amount),
    status,
  };

  if (status === 'pending') {
    mapped.date = `Requested: ${formatDate(item.requestedDate)}`;
    mapped.note = 'Under Review by Admin';
  } else if (status === 'approved') {
    mapped.date = `Processed: ${formatDate(item.processedDate || item.requestedDate)}`;
    mapped.trx = `Ref: WD-${item.id}`;
  } else if (status === 'rejected') {
    mapped.date = `Requested: ${formatDate(item.requestedDate)}`;

    // Backend field name for the rejection reason isn't fixed yet on our
    // side — check every common variant the API might send, take the
    // first non-empty one, and only attach it if it's a real string.
    const rejectionReason =
      item.rejectedReason ??
      item.rejectionReason ??
      item.rejectReason ??
      item.reasonForRejection ??
      item.remarks ??
      item.reason ??
      item.adminRemarks ??
      item.rejectRemarks ??
      null;

    if (rejectionReason && String(rejectionReason).trim().length > 0) {
      mapped.reason = String(rejectionReason).trim();
    }
  }

  return mapped;
};
// ─────────────────────────────────────────────────────────────
//  SummaryCard — SAME gradient/layout as MyDonationsScreen,
//  fields swapped for Total Withdrawn + Approved/Pending/Rejected
// ─────────────────────────────────────────────────────────────
const SummaryCard = memo(({ totalAmount, approvedCount, pendingCount, rejectedCount }) => (
  <View style={summary.outer}>
    <View style={summary.layerDark} />
    <View style={summary.layerMid} />
    <View style={summary.circle} />

    <View style={summary.content}>
      <Text style={summary.label}>Total Withdrawn</Text>
      <Text style={summary.amount}>PKR {totalAmount}</Text>

      <View style={summary.statsRow}>
        <StatBox icon="check" label="Approved" value={approvedCount} />
        <StatBox icon="clock" label="Pending" value={pendingCount} />
        <StatBox icon="x" label="Rejected" value={rejectedCount} />
      </View>
    </View>
  </View>
));

const StatBox = memo(({ icon, label, value }) => (
  <View style={summary.statBox}>
    <View style={summary.statIconWrap}>
      <Icons name={icon} size={scale(12)} color={C.white} />
    </View>
    <Text style={summary.statValue}>{value}</Text>
    <Text style={summary.statLabel}>{label}</Text>
  </View>
));

const BANNER_H = scale(172);
const CIRCLE_SIZE = scale(160);

const summary = StyleSheet.create({
  outer: {
    marginHorizontal: sp(16),
    marginTop: sp(16),
    marginBottom: sp(20),
    height: BANNER_H,
    borderRadius: scale(16),
    overflow: 'hidden',
    backgroundColor: C.bannerStart,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  layerDark: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: C.bannerStart,
  },
  layerMid: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '65%',
    backgroundColor: C.bannerEnd,
    opacity: 0.75,
    borderTopLeftRadius: BANNER_H,
    borderBottomLeftRadius: BANNER_H * 0.4,
  },
  circle: {
    position: 'absolute',
    top: -CIRCLE_SIZE * 0.35,
    right: -CIRCLE_SIZE * 0.25,
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  content: {
    flex: 1,
    paddingHorizontal: sp(20),
    paddingTop: sp(18),
    paddingBottom: sp(18),
    justifyContent: 'space-between',
  },
  label: {
    fontSize: sp(13),
    color: 'rgba(255,255,255,0.80)',
    fontWeight: '800',
  },
  amount: {
    fontSize: sp(30),
    fontWeight: '800',
    color: C.white,
    letterSpacing: -0.5,
    marginTop: sp(2),
  },

  statsRow: {
    flexDirection: 'row',
    gap: sp(8),
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: scale(10),
    paddingVertical: sp(8),
  },
  statIconWrap: {
    width: scale(22),
    height: scale(22),
    borderRadius: scale(11),
    backgroundColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: sp(5),
  },
  statValue: {
    fontSize: sp(14),
    fontWeight: '800',
    color: C.white,
  },
  statLabel: {
    fontSize: sp(10),
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
    marginTop: sp(1),
  },
});

// ─────────────────────────────────────────────────────────────
//  FilterTabs — SAME pill layout as MyDonationsScreen
// ─────────────────────────────────────────────────────────────
const FilterTabs = memo(({ tabs, active, onChange }) => (
  <View style={ft.row}>
    {tabs.map(tab => {
      const isActive = tab === active;
      return (
        <TouchableOpacity
          key={tab}
          style={[ft.tab, isActive && ft.tabActive]}
          onPress={() => onChange(tab)}
          activeOpacity={0.75}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        >
          <Text style={[ft.label, isActive && ft.labelActive]}>{tab}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
));

const ft = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: sp(16),
    marginBottom: sp(14),
    gap: sp(8),
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: sp(10),
    borderRadius: sp(50),
  },
  tabActive: {
    backgroundColor: C.tabActive,
  },
  label: {
    fontSize: sp(14),
    fontWeight: '500',
    color: C.tabInactive,
  },
  labelActive: {
    color: C.white,
    fontWeight: '700',
  },
});

// ─────────────────────────────────────────────────────────────
//  StatusBadge — SAME pill shape/typography as MyDonationsScreen
// ─────────────────────────────────────────────────────────────
const StatusBadge = memo(({ status }) => {
  const cfg = STATUS[status];
  if (!cfg) return null;
  return (
    <View style={[badge.statusWrap, { backgroundColor: cfg.bg }]}>
      <Text style={[badge.statusText, { color: cfg.fg }]}>{cfg.label}</Text>
    </View>
  );
});

const badge = StyleSheet.create({
  statusWrap: {
    alignSelf: 'flex-start',
    paddingHorizontal: sp(10),
    paddingVertical: sp(3),
    borderRadius: sp(20),
  },
  statusText: {
    fontSize: sp(11),
    fontWeight: '700',
  },
});

// ─────────────────────────────────────────────────────────────
//  WithdrawalCard — SAME structure/sizing as DonationCard:
//  icon box · title · amount
//  status pill
//  info label + value row
//  optional note / trx / reason rows
// ─────────────────────────────────────────────────────────────
const ICON_BOX = scale(38);

const WithdrawalCard = memo(({ item }) => {
  const cfg = STATUS[item.status];

  return (
    <View style={card.outer}>
      {/* Top row: icon + title + amount */}
      <View style={card.topRow}>
        <View style={card.iconBox}>
          <MCIcons name="cash-refund" size={scale(18)} color={C.bannerStart} />
        </View>

        <View style={card.titleCol}>
          <Text style={card.title} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={card.dateTime} numberOfLines={1}>
            {item.date}
          </Text>
        </View>

        <View style={card.rightCol}>
          <Text style={card.amount}>PKR {item.amount}</Text>
          <StatusBadge status={item.status} />
        </View>
      </View>

      {/* Note / Transaction / Reason — same label + value pattern as Donation card */}
      {!!item.note && (
        <>
          <Text style={card.txnLabel}>Status Note</Text>
          <View style={card.txnRow}>
            <View style={[card.dot, { backgroundColor: cfg.fg }]} />
            <Text style={[card.noteText, { color: cfg.fg }]}>{item.note}</Text>
          </View>
        </>
      )}

      {!!item.trx && (
        <>
          <Text style={card.txnLabel}>Transaction ID</Text>
          <View style={card.txnRow}>
            <Text style={card.txnId}>{item.trx}</Text>
          </View>
        </>
      )}

      {!!item.reason && (
        <>
          <Text style={card.txnLabel}>Rejection Reason</Text>
          <View style={card.reasonBox}>
            <Icons name="alert-circle" size={scale(13)} color={C.rejectedFg} />
            <Text style={card.reasonText}>{item.reason}</Text>
          </View>
        </>
      )}
    </View>
  );
});

const card = StyleSheet.create({
  outer: {
    backgroundColor: C.white,
    marginHorizontal: sp(16),
    borderRadius: scale(14),
    padding: sp(12),
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: sp(10),
  },
  iconBox: {
    width: ICON_BOX,
    height: ICON_BOX,
    borderRadius: scale(10),
    backgroundColor: 'rgba(13,79,107,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: sp(10),
    flexShrink: 0,
  },

  titleCol: {
    flex: 1,
    marginRight: sp(8),
  },
  title: {
    fontSize: sp(14),
    fontWeight: '700',
    color: C.dark,
  },

  rightCol: {
    alignItems: 'flex-end',
    flexShrink: 0,
    gap: sp(4),
  },
  amount: {
    fontSize: sp(14),
    fontWeight: '700',
    color: C.amountGreen,
  },

  txnLabel: {
    fontSize: sp(10.5),
    color: C.lightGray,
    marginBottom: sp(3),
    marginTop: sp(2),
  },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  txnId: {
    fontSize: sp(12.5),
    fontWeight: '600',
    color: C.dark,
  },
  dateTime: {
    fontSize: sp(12),
    color: C.gray,
    marginTop: sp(2),
  },

  dot: {
    width: scale(7),
    height: scale(7),
    borderRadius: scale(4),
    marginRight: sp(8),
  },
  noteText: {
    fontSize: sp(12),
    fontWeight: '600',
  },

  reasonBox: {
    marginTop: sp(2),
    backgroundColor: '#FEF2F2',
    borderRadius: scale(10),
    padding: sp(10),
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  reasonText: {
    flex: 1,
    marginLeft: sp(8),
    color: C.rejectedFg,
    fontSize: sp(12),
    lineHeight: sp(18),
    fontWeight: '500',
  },
});

// ─────────────────────────────────────────────────────────────
//  EmptyState — used for both "no data at all" and "no results for filter"
// ─────────────────────────────────────────────────────────────
const EmptyState = memo(({ tab, hasAnyData }) => (
  <View style={empty.wrap}>
    <Icons name="inbox" size={scale(44)} color={C.lightGray} />
    <Text style={empty.title}>
      {hasAnyData ? `No ${tab} Withdrawals` : 'No Withdrawal Requests Yet'}
    </Text>
    <Text style={empty.sub}>
      {hasAnyData
        ? "We couldn't find any withdrawals matching this filter."
        : "You haven't made any withdrawal requests yet. Once you do, they'll show up here."}
    </Text>
  </View>
));

const empty = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scale(60),
    paddingHorizontal: sp(32),
  },
  title: {
    fontSize: sp(16),
    fontWeight: '700',
    color: C.dark,
    marginTop: sp(14),
    marginBottom: sp(6),
  },
  sub: {
    fontSize: sp(13),
    color: C.gray,
    textAlign: 'center',
    lineHeight: sp(20),
  },
});

// ─────────────────────────────────────────────────────────────
//  Loading / Error states
// ─────────────────────────────────────────────────────────────
const LoadingState = memo(() => (
  <View style={empty.wrap}>
    <ActivityIndicator size="large" color={C.bannerStart} />
    <Text style={[empty.sub, { marginTop: sp(14) }]}>Loading your withdrawals...</Text>
  </View>
));

const ErrorState = memo(({ message, onRetry }) => (
  <View style={empty.wrap}>
    <Icons name="alert-triangle" size={scale(40)} color={C.rejectedFg} />
    <Text style={empty.title}>Something went wrong</Text>
    <Text style={empty.sub}>{message || 'Failed to load withdrawal data.'}</Text>
    {!!onRetry && (
      <TouchableOpacity onPress={onRetry} style={retryStyles.btn} activeOpacity={0.8}>
        <Text style={retryStyles.btnText}>Retry</Text>
      </TouchableOpacity>
    )}
  </View>
));

const retryStyles = StyleSheet.create({
  btn: {
    marginTop: sp(16),
    paddingHorizontal: sp(20),
    paddingVertical: sp(10),
    backgroundColor: C.bannerStart,
    borderRadius: sp(50),
  },
  btnText: {
    color: C.white,
    fontWeight: '700',
    fontSize: sp(13),
  },
});

// ─────────────────────────────────────────────────────────────
//  Card separator
// ─────────────────────────────────────────────────────────────
const Separator = () => <View style={{ height: sp(12) }} />;

// ─────────────────────────────────────────────────────────────
//  MyWithdrawalsScreen — main screen (SAME structure/header
//  pattern as MyDonationsScreen)
// ─────────────────────────────────────────────────────────────
const MyWithdrawalsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { currentUser } = useAppContext();
  const userId = currentUser?.id;

  const {
    data: summaryData,
    isLoading: summaryLoading,
    isError: summaryError,
    refetch: refetchSummary,
  } = useUserWithdrawalSummary(userId);

  const {
    data: historyData,
    isLoading: historyLoading,
    isError: historyError,
    error: historyErrorObj,
    refetch: refetchHistory,
  } = useMyWithdrawals(userId);

  const isLoading = summaryLoading || historyLoading;
  const isError = summaryError || historyError;

  const handleRetry = useCallback(() => {
    refetchSummary();
    refetchHistory();
  }, [refetchSummary, refetchHistory]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchSummary(), refetchHistory()]);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchSummary, refetchHistory]);

  const stats = useMemo(() => {
    if (!summaryData) {
      return { total: '0', approvedCount: 0, pendingCount: 0, rejectedCount: 0 };
    }
    return {
      total: formatAmount(summaryData.withdrawalAmount),
      approvedCount: summaryData.totalApprovedWithdrawal || 0,
      pendingCount: summaryData.totalPendingWithdrawals || 0,
      rejectedCount: summaryData.totalRejectWithdrawal || 0,
    };
  }, [summaryData]);

  const allWithdrawals = useMemo(() => {
    if (!Array.isArray(historyData)) return [];
    return historyData.map(mapWithdrawal);
  }, [historyData]);

  const filteredData = useMemo(() => {
    if (activeTab === 'All') return allWithdrawals;
    return allWithdrawals.filter(d => d.status === activeTab.toLowerCase());
  }, [activeTab, allWithdrawals]);

  const handleBack = useCallback(() => navigation?.goBack?.(), [navigation]);

  const renderItem = useCallback(({ item }) => <WithdrawalCard item={item} />, []);

  const keyExtractor = useCallback(item => item.id, []);

  const ListHeader = useMemo(
    () => (
      <>
        <SummaryCard
          totalAmount={stats.total}
          approvedCount={stats.approvedCount}
          pendingCount={stats.pendingCount}
          rejectedCount={stats.rejectedCount}
        />
        <FilterTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
      </>
    ),
    [stats, activeTab],
  );

  const ListEmpty = useMemo(() => {
    if (isLoading) return <LoadingState />;
    if (isError) {
      return (
        <ErrorState
          message={historyErrorObj?.message}
          onRetry={handleRetry}
        />
      );
    }
    return <EmptyState tab={activeTab} hasAnyData={allWithdrawals.length > 0} />;
  }, [isLoading, isError, historyErrorObj, handleRetry, activeTab, allWithdrawals.length]);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={C.pageBg} />

      <View style={s.header}>
        <TouchableOpacity
          onPress={handleBack}
          style={s.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <Icons name="arrow-left" size={sp(22)} color={C.dark} />
        </TouchableOpacity>

        <Text style={s.headerTitle}>Withdrawal History</Text>

        <View style={s.headerSpacer} />
      </View>

      <FlatList
        data={isLoading || isError ? [] : filteredData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.listContent}
        removeClippedSubviews={Platform.OS === 'android'}
        maxToRenderPerBatch={8}
        windowSize={10}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[C.bannerStart]}
            tintColor={C.bannerStart}
          />
        }
      />
    </SafeAreaView>
  );
};
export default MyWithdrawalsScreen;

// ─────────────────────────────────────────────────────────────
//  Screen-level styles — SAME as MyDonationsScreen
// ─────────────────────────────────────────────────────────────
const BACK_BTN_W = sp(32);

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.pageBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sp(16),
    paddingVertical: sp(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
    backgroundColor: C.pageBg,
  },
  backBtn: {
    width: BACK_BTN_W,
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: sp(17),
    fontWeight: '700',
    color: C.dark,
    letterSpacing: -0.2,
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: BACK_BTN_W,
  },
  listContent: {
    paddingBottom: sp(32),
    flexGrow: 1,
  },
});