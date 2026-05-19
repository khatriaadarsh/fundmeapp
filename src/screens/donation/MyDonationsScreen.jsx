// src/screens/donations/MyDonationsScreen.jsx
// ─────────────────────────────────────────────────────────────
//  My Donations — pixel-accurate match to screenshot
//  Self-contained: SummaryBanner, FilterTabs, DonationCard
//  all live here so alignment is guaranteed consistent.
//  Swap mock data for real API data without changing layout.
// ─────────────────────────────────────────────────────────────

import React, { useState, useCallback, useMemo, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  FlatList,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/Feather';
import MCIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { sp } from '../../theme/theme';

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

  // Banner gradient colours (replicated with views since no LinearGradient dep guaranteed)
  bannerStart: '#0D4F6B',
  bannerMid: '#0B7B8A',
  bannerEnd: '#00B4CC',

  // Filter tab active
  tabActive: '#0D4F6B',
  tabInactive: '#6B7280',

  // Amounts
  amountGreen: '#16A34A',

  // Status badges
  completedBg: '#DCFCE7',
  completedFg: '#15803D',
  pendingBg: '#FEF9C3',
  pendingFg: '#B45309',

  // Payment badge
  paymentBg: '#F3F4F6',
  paymentFg: '#374151',
};

// ─────────────────────────────────────────────────────────────
//  Mock data — replace with your real DONATION_HISTORY import
// ─────────────────────────────────────────────────────────────
const DONATION_HISTORY = [
  {
    id: '1',
    title: "Help Fatima's Heart Surgery",
    amount: 5000,
    status: 'Completed',
    paymentMethod: 'EasyPaisa',
    message: 'Get well soon little angel!',
    date: 'Jan 15, 2025',
    time: '2:30 PM',
    imageUri: null, // replace with real URI or require()
  },
  {
    id: '2',
    title: 'Education Fund for Street Children',
    amount: 2500,
    status: 'Completed',
    paymentMethod: 'Visa ••42',
    message: null,
    date: 'Jan 10, 2025',
    time: '10:15 AM',
    imageUri: null,
  },
  {
    id: '3',
    title: 'Emergency Flood Relief',
    amount: 10000,
    status: 'Pending',
    paymentMethod: 'JazzCash',
    message: 'Praying for safe delivery.',
    date: 'Dec 28, 2024',
    time: '9:45 PM',
    imageUri: null,
  },
];

const TABS = ['All', 'Completed', 'Pending'];

// ─────────────────────────────────────────────────────────────
//  SummaryBanner
//  Dark teal gradient card with decorative circle top-right
// ─────────────────────────────────────────────────────────────
const SummaryBanner = memo(({ totalAmount, totalCount }) => (
  <View style={banner.outer}>
    {/* Gradient simulation via layered views */}
    <View style={banner.layerDark} />
    <View style={banner.layerMid} />
    {/* Decorative circle — top right */}
    <View style={banner.circle} />

    {/* Content */}
    <View style={banner.content}>
      <Text style={banner.label}>Total Donated</Text>
      <Text style={banner.amount}>
        PKR {totalAmount.toLocaleString('en-PK')}
      </Text>
      <View style={banner.countRow}>
        <MCIcons
          name="heart-outline"
          size={scale(14)}
          color="rgba(255,255,255,0.85)"
        />
        <Text style={banner.countText}>
          {totalCount} {totalCount === 1 ? 'donation' : 'donations'}
        </Text>
      </View>
    </View>
  </View>
));

const BANNER_H = scale(130);
const CIRCLE_SIZE = scale(160);

const banner = StyleSheet.create({
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
  // Gradient layers (left dark → right teal)
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
  // Decorative circle — top right corner
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: sp(20),
    paddingVertical: sp(18),
    justifyContent: 'space-between',
  },
  label: {
    fontSize: sp(13),
    color: 'rgba(255,255,255,0.80)',
    fontWeight: '500',
  },
  amount: {
    fontSize: sp(32),
    fontWeight: '800',
    color: C.white,
    letterSpacing: -0.5,
    marginTop: sp(2),
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp(5),
  },
  countText: {
    fontSize: sp(13),
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
});

// ─────────────────────────────────────────────────────────────
//  FilterTabs
//  Active tab = dark navy filled pill, inactive = plain text
//  Left-aligned row — NOT equal-width buttons
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
    gap: sp(4),
  },
  tab: {
    paddingHorizontal: sp(20),
    paddingVertical: sp(10),
    borderRadius: sp(50),
  },
  tabActive: {
    backgroundColor: C.tabActive,
  },
  label: {
    fontSize: sp(15),
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
  const isCompleted = status === 'Completed';
  return (
    <View
      style={[
        badge.wrap,
        { backgroundColor: isCompleted ? C.completedBg : C.pendingBg },
      ]}
    >
      <Text
        style={[
          badge.text,
          { color: isCompleted ? C.completedFg : C.pendingFg },
        ]}
      >
        {status.toUpperCase()}
      </Text>
    </View>
  );
});

// ─────────────────────────────────────────────────────────────
//  PaymentBadge
// ─────────────────────────────────────────────────────────────
const PaymentBadge = memo(({ method }) => (
  <View style={badge.payWrap}>
    <Text style={badge.payText}>{method}</Text>
  </View>
));

const badge = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
    paddingHorizontal: sp(10),
    paddingVertical: sp(4),
    borderRadius: sp(6),
  },
  text: {
    fontSize: sp(11),
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  payWrap: {
    alignSelf: 'flex-start',
    paddingHorizontal: sp(12),
    paddingVertical: sp(4),
    borderRadius: sp(20),
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: C.white,
  },
  payText: {
    fontSize: sp(12),
    fontWeight: '500',
    color: C.paymentFg,
  },
});

// ─────────────────────────────────────────────────────────────
//  DonationCard
//
//  Two layouts from screenshot:
//    WITH image  → thumbnail left, content right
//    WITHOUT img → no thumbnail, full-width content
//
//  Both share: status badge + payment badge row,
//  optional italic quote, date·time right-aligned
// ─────────────────────────────────────────────────────────────
const THUMB_SIZE = scale(72);

const DonationCard = memo(({ item }) => {
  const hasImage = !!item.imageUri;

  return (
    <View style={card.outer}>
      {/* ── Top row: [thumbnail?] + title + amount ──────── */}
      <View style={card.topRow}>
        {/* Thumbnail — only when imageUri exists */}
        {hasImage && (
          <Image
            source={{ uri: item.imageUri }}
            style={card.thumb}
            resizeMode="cover"
          />
        )}

        {/* Title + amount block */}
        <View style={[card.titleBlock, !hasImage && { paddingLeft: 0 }]}>
          <Text
            style={[card.title, hasImage && { flex: 1, marginRight: sp(8) }]}
            numberOfLines={2}
          >
            {item.title}
          </Text>
          <View style={card.amountBlock}>
            <Text style={card.amountCurrency}>PKR</Text>
            <Text style={card.amountValue}>
              {item.amount.toLocaleString('en-PK')}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Badge row ───────────────────────────────────── */}
      <View style={[card.badgeRow, hasImage && { paddingLeft: 0 }]}>
        <StatusBadge status={item.status} />
        <PaymentBadge method={item.paymentMethod} />
      </View>

      {/* ── Optional italic message ──────────────────────── */}
      {!!item.message && <Text style={card.message}>"{item.message}"</Text>}

      {/* ── Date · Time — right-aligned ──────────────────── */}
      <Text style={card.dateTime}>
        {item.date} · {item.time}
      </Text>
    </View>
  );
});

const card = StyleSheet.create({
  outer: {
    backgroundColor: C.white,
    marginHorizontal: sp(16),
    borderRadius: scale(14),
    paddingHorizontal: sp(14),
    paddingTop: sp(14),
    paddingBottom: sp(12),
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },

  // Top row: thumbnail (optional) + title/amount
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: sp(10),
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: scale(10),
    marginRight: sp(12),
    flexShrink: 0,
  },

  // Title + amount sit side by side
  titleBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: sp(15),
    fontWeight: '700',
    color: C.dark,
    lineHeight: sp(21),
    flexShrink: 1,
    marginRight: sp(8),
  },
  amountBlock: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  amountCurrency: {
    fontSize: sp(11),
    fontWeight: '600',
    color: C.amountGreen,
    lineHeight: sp(15),
  },
  amountValue: {
    fontSize: sp(20),
    fontWeight: '700',
    color: C.amountGreen,
    lineHeight: sp(26),
  },

  // Badge row
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp(8),
    marginBottom: sp(10),
  },

  // Italic message
  message: {
    fontSize: sp(13),
    fontStyle: 'italic',
    color: C.gray,
    lineHeight: sp(19),
    marginBottom: sp(8),
  },

  // Date·time
  dateTime: {
    fontSize: sp(12),
    color: C.lightGray,
    textAlign: 'right',
  },
});

// ─────────────────────────────────────────────────────────────
//  EmptyState — inline (no external component dep)
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
//  Card separator
// ─────────────────────────────────────────────────────────────
const Separator = () => <View style={{ height: sp(12) }} />;

// ─────────────────────────────────────────────────────────────
//  MyDonationsScreen — main screen
// ─────────────────────────────────────────────────────────────
const MyDonationsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('All');

  // Stats: count + total of COMPLETED only (matches screenshot)
  const stats = useMemo(() => {
    const completed = DONATION_HISTORY.filter(d => d.status === 'Completed');
    const total = completed.reduce((sum, d) => sum + d.amount, 0);
    return { count: completed.length, total };
  }, []);

  // Filtered list
  const filteredData = useMemo(() => {
    if (activeTab === 'All') return DONATION_HISTORY;
    return DONATION_HISTORY.filter(d => d.status === activeTab);
  }, [activeTab]);

  const handleBack = useCallback(() => navigation?.goBack?.(), [navigation]);

  const renderItem = useCallback(
    ({ item }) => <DonationCard item={item} />,
    [],
  );

  const keyExtractor = useCallback(item => item.id, []);

  const ListHeader = useMemo(
    () => (
      <>
        <SummaryBanner totalAmount={stats.total} totalCount={stats.count} />
        <FilterTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
      </>
    ),
    [stats, activeTab],
  );

  const ListEmpty = useMemo(() => <EmptyState tab={activeTab} />, [activeTab]);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={C.pageBg} />

      {/* ── Header ─────────────────────────────────────────── */}
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

        {/* Spacer — same width as back button for perfect centering */}
        <View style={s.headerSpacer} />
      </View>

      {/* ── List ───────────────────────────────────────────── */}
      <FlatList
        data={filteredData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={Separator}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.listContent}
        // Performance
        removeClippedSubviews={Platform.OS === 'android'}
        maxToRenderPerBatch={8}
        windowSize={10}
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

  // Header — back arrow + centred title + invisible spacer
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
    flex: 1, // ← takes remaining space, centres between two spacers
  },
  headerSpacer: {
    width: BACK_BTN_W, // mirrors back button width exactly
  },

  listContent: {
    paddingBottom: sp(32),
    flexGrow: 1,
  },
});
