// src/screens/donations/MyDonationsScreen.jsx
import React, { useState, useCallback, useMemo, useEffect, memo } from 'react';
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
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/Feather';
import MCIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { sp } from '../../theme/theme';
// import { useDonation } from '../../hooks/useDonation';
import { useDonation } from '../../hooks/useDonation';
import { storage } from '../../utils/storage';
import ResponseModal from '../../components/ResponseModal';
// ─────────────────────────────────────────────────────────────
//  Responsive helpers
// ─────────────────────────────────────────────────────────────
const { width: SW } = Dimensions.get('window');
const scale = n => (SW / 390) * n; // 390 = design base width
// ─────────────────────────────────────────────────────────────
//  Design tokens
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
  paymentBg: '#F3F4F6',
  paymentFg: '#374151',
};
const TABS = ['All', 'Completed', 'Pending'];
// ─────────────────────────────────────────────────────────────
//  SummaryCard
// ─────────────────────────────────────────────────────────────
const SummaryCard = memo(({ totalAmount, totalCount, completedCount, pendingCount }) => (
  <View style={summary.outer}>
    <View style={summary.layerDark} />
    <View style={summary.layerMid} />
    <View style={summary.circle} />
    <View style={summary.content}>
      <Text style={summary.label}>Total Donated</Text>
      <Text style={summary.amount}>
        PKR {totalAmount.toLocaleString('en-PK')}
      </Text>
      <View style={summary.statsRow}>
        <StatBox icon="layers" label="Total" value={totalCount} />
        <StatBox icon="check" label="Complete" value={completedCount} />
        <StatBox icon="clock" label="Pending" value={pendingCount} />
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
//  FilterTabs
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
//  StatusBadge
// ─────────────────────────────────────────────────────────────
const StatusBadge = memo(({ status }) => {
  const isCompleted = String(status).toUpperCase() === 'SUCCESS' || String(status).toUpperCase() === 'COMPLETED';
  return (
    <View
      style={[
        badge.statusWrap,
        { backgroundColor: isCompleted ? C.completedBg : C.pendingBg },
      ]}
    >
      <Text
        style={[
          badge.statusText,
          { color: isCompleted ? C.completedFg : C.pendingFg },
        ]}
      >
        {isCompleted ? 'Completed' : 'Pending'}
      </Text>
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
//  DonationCard
// ─────────────────────────────────────────────────────────────
const ICON_BOX = scale(38);
// Formatting Date Helper for ISO 8601 Timestamps from Real API
const formatDate = isoString => {
  if (!isoString) return 'Recent';
  try {
    const date = new Date(isoString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  } catch (e) {
    return 'Recent';
  }
};
const formatTime = isoString => {
  if (!isoString) return 'Live';
  try {
    const date = new Date(isoString);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  } catch (e) {
    return 'Live';
  }
};
const DonationCard = memo(({ item }) => {
  const formattedDate = item.date?.includes('-') ? formatDate(item.date) : item.date;
  const formattedTime = item.date?.includes('-') ? formatTime(item.date) : item.time;
  return (
    <View style={card.outer}>
      {/* Top row: icon + title + amount */}
      <View style={card.topRow}>
        <View style={card.iconBox}>
          <MCIcons name="hand-heart-outline" size={scale(18)} color={C.bannerStart} />
        </View>
        <View style={card.titleCol}>
          <Text style={card.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={card.paymentMethod} numberOfLines={1}>
            {item.paymentMethod}
          </Text>
        </View>
        <View style={card.rightCol}>
          <Text style={card.amount}>PKR {Number(item.amount || 0).toLocaleString('en-PK')}</Text>
          <StatusBadge status={item.status} />
        </View>
      </View>
      {/* Transaction ID + date/time */}
      <Text style={card.txnLabel}>Transaction ID</Text>
      <View style={card.txnRow}>
        <Text style={card.txnId}>{item.transactionId}</Text>
        <Text style={card.dateTime}>
          {formattedDate} · {formattedTime}
        </Text>
      </View>
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
  paymentMethod: {
    fontSize: sp(12),
    color: C.gray,
    marginTop: sp(2),
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
    fontSize: sp(11),
    color: C.lightGray,
  },
});
// ─────────────────────────────────────────────────────────────
//  EmptyState
// ─────────────────────────────────────────────────────────────
const EmptyState = memo(({ tab }) => (
  <View style={empty.wrap}>
    <Icons name="inbox" size={scale(44)} color={C.lightGray} />
    <Text style={empty.title}>No {tab} Donations</Text>
    <Text style={empty.sub}>
      We couldn't find any donations matching this filter.
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
//  Separator
// ─────────────────────────────────────────────────────────────
const Separator = () => <View style={{ height: sp(12) }} />;
// ─────────────────────────────────────────────────────────────
//  MyDonationsScreen — main screen
// ─────────────────────────────────────────────────────────────
const MyDonationsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('All');
  const [userId, setUserId] = useState(9); // Default fallback user ID
  const [responseModalVisible, setResponseModalVisible] = useState(false);
  const [responseModalConfig, setResponseModalConfig] = useState({
    variant: 'error',
    title: '',
    message: '',
    code: '',
  });
  // Fetch logged-in user ID dynamically
  useEffect(() => {
    const fetchStoredUser = async () => {
      const storedId = await storage.getUserId();
      if (storedId) {
        setUserId(Number(storedId));
      }
    };
    fetchStoredUser();
  }, []);
  // API query integration
  const { data, isLoading, error, refetch } = useDonation(userId);
  // Trigger ResponseModal on API error as per response requirements
  useEffect(() => {
    if (error) {
      setResponseModalConfig({
        variant: 'error',
        title: 'Network Error',
        message: error.message || 'Failed to fetch donation history.',
        code: '500',
      });
      setResponseModalVisible(true);
    }
  }, [error]);
  const donationsList = useMemo(() => {
    return data?.donations || [];
  }, [data]);
  // Stats calculation
  const stats = useMemo(() => {
    const completedList = donationsList.filter(d => 
      String(d.status).toUpperCase() === 'SUCCESS' || String(d.status).toUpperCase() === 'COMPLETED'
    );
    const pendingList = donationsList.filter(d => 
      String(d.status).toUpperCase() === 'PENDING'
    );
    const totalAmount = donationsList.reduce((sum, d) => sum + Number(d.amount || 0), 0);
    return {
      total: totalAmount,
      totalCount: donationsList.length,
      completedCount: completedList.length,
      pendingCount: pendingList.length,
    };
  }, [donationsList]);
  // Filtered List
  const filteredData = useMemo(() => {
    if (activeTab === 'All') return donationsList;
    
    return donationsList.filter(d => {
      const rawStatus = String(d.status).toUpperCase();
      const isSuccess = rawStatus === 'SUCCESS' || rawStatus === 'COMPLETED';
      
      if (activeTab === 'Completed') return isSuccess;
      if (activeTab === 'Pending') return rawStatus === 'PENDING';
      return false;
    });
  }, [donationsList, activeTab]);
  const handleBack = useCallback(() => navigation?.goBack?.(), [navigation]);
  const renderItem = useCallback(({ item }) => <DonationCard item={item} />, []);
  const keyExtractor = useCallback(item => String(item.id || Math.random()), []);
  const ListHeader = useMemo(
    () => (
      <>
        <SummaryCard
          totalAmount={stats.total}
          totalCount={stats.totalCount}
          completedCount={stats.completedCount}
          pendingCount={stats.pendingCount}
        />
        <FilterTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
      </>
    ),
    [stats, activeTab],
  );
  const ListEmpty = useMemo(() => <EmptyState tab={activeTab} />, [activeTab]);
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
        <Text style={s.headerTitle}>My Donations</Text>
        <View style={s.headerSpacer} />
      </View>
      {isLoading && (
        <View style={s.loaderBox}>
          <ActivityIndicator size="small" color={C.bannerStart} />
        </View>
      )}
      <FlatList
        data={filteredData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.listContent}
        refreshing={isLoading}
        onRefresh={refetch} // Triggers only on Pull-to-Refresh swipe gesture
        removeClippedSubviews={Platform.OS === 'android'}
        maxToRenderPerBatch={8}
        windowSize={10}
      />
      {/* Cohesive design compliant Response modal */}
      <ResponseModal
        visible={responseModalVisible}
        variant={responseModalConfig.variant}
        title={responseModalConfig.title}
        message={responseModalConfig.message}
        code={responseModalConfig.code}
        onClose={() => setResponseModalVisible(false)}
      />
    </SafeAreaView>
  );
};
export default MyDonationsScreen;
// ─────────────────────────────────────────────────────────────
//  Screen-level styles
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
  loaderBox: {
    paddingVertical: sp(8),
    alignItems: 'center',
  }
});
