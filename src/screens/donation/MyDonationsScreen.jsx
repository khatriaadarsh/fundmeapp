// src/screens/donations/MyDonationsScreen.jsx
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
import LinearGradient from 'react-native-linear-gradient';
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
  textMid: '#374151',
  textGray: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  cardBg: '#FFFFFF',
  success: '#16A34A',
  successBg: '#DCFCE7',
  pending: '#D97706',
  pendingBg: '#FEF3C7',
  methodBg: '#F1F5F9',
  methodBorder: '#E2E8F0',
  tabTrack: '#E9EEF4',
};

// ═══════════════════════════════════════════════════════════
// Static Data
// ═══════════════════════════════════════════════════════════
const ALL_DONATIONS = [
  {
    id: '1',
    title: "Help Fatima's Heart Surgery",
    amount: 5000,
    status: 'Completed',
    method: 'EasyPaisa',
    message: 'Get well soon little angel, praying for you.',
    date: 'Jan 15, 2025 · 2:30 PM',
    image: 'https://picsum.photos/id/237/120',
  },
  {
    id: '2',
    title: 'Education Fund for Street Children',
    amount: 2500,
    status: 'Completed',
    method: 'Visa ••42',
    message: 'Education is the right of every child.',
    date: 'Jan 10, 2025 · 10:15 AM',
    image: 'https://picsum.photos/id/1011/120',
  },
  {
    id: '3',
    title: 'Emergency Flood Relief',
    amount: 10000,
    status: 'Completed',
    method: 'JazzCash',
    message: '',
    date: 'Dec 28, 2024 · 9:45 PM',
    image: 'https://picsum.photos/id/1016/120',
  },
  {
    id: '4',
    title: 'Winter Blankets Drive',
    amount: 1000,
    status: 'Completed',
    method: 'EasyPaisa',
    message: '',
    date: 'Dec 15, 2024 · 4:20 PM',
    image: 'https://picsum.photos/id/1059/120',
  },
  {
    id: '5',
    title: 'Clean Water for Villages',
    amount: 3000,
    status: 'Pending',
    method: 'JazzCash',
    message: 'Clean water is a basic right.',
    date: 'Jan 18, 2025 · 11:00 AM',
    image: 'https://picsum.photos/id/1015/120',
  },
  {
    id: '6',
    title: 'Food Packages for Orphans',
    amount: 2000,
    status: 'Pending',
    method: 'EasyPaisa',
    message: 'No child should sleep hungry.',
    date: 'Jan 17, 2025 · 3:00 PM',
    image: 'https://picsum.photos/id/1060/120',
  },
];

const TABS = ['All', 'Completed', 'Pending'];

const TOTAL_DONATED = ALL_DONATIONS.filter(
  d => d.status === 'Completed',
).reduce((s, d) => s + d.amount, 0);

const TOTAL_COUNT = ALL_DONATIONS.filter(d => d.status === 'Completed').length;

// ═══════════════════════════════════════════════════════════
// HEADER
// ═══════════════════════════════════════════════════════════
const Header = ({ onBack }) => (
  <View style={s.header}>
    <TouchableOpacity
      onPress={onBack}
      style={s.headerBtn}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Icons name="arrow-left" size={scale(22)} color={C.textDark} />
    </TouchableOpacity>
    <Text style={s.headerTitle}>My Donations</Text>
    {/* balance spacer */}
    <View style={s.headerBtn} />
  </View>
);

// ═══════════════════════════════════════════════════════════
// SUMMARY BANNER
// ═══════════════════════════════════════════════════════════
const SummaryBanner = () => (
  <LinearGradient
    colors={[C.primary, C.teal]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={s.banner}
  >
    {/* Decorative blobs */}
    <View style={s.bannerBlob1} />
    <View style={s.bannerBlob2} />

    <Text style={s.bannerLabel}>Total Donated</Text>
    <Text style={s.bannerAmount}>
      PKR {TOTAL_DONATED.toLocaleString('en-PK')}
    </Text>
    <View style={s.bannerRow}>
      <Icons name="heart" size={scale(12)} color="rgba(255,255,255,0.75)" />
      <Text style={s.bannerSub}> {TOTAL_COUNT} donations</Text>
    </View>
  </LinearGradient>
);

// ═══════════════════════════════════════════════════════════
// TAB BAR — matches Figma exactly
// ═══════════════════════════════════════════════════════════
const TabBar = ({ active, onChange }) => (
  <View style={s.tabBar}>
    {TABS.map(tab => {
      const isActive = active === tab;
      return (
        <TouchableOpacity
          key={tab}
          style={[s.tabItem, isActive && s.tabItemActive]}
          onPress={() => onChange(tab)}
          activeOpacity={0.75}
        >
          <Text style={[s.tabLabel, isActive && s.tabLabelActive]}>{tab}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

// ═══════════════════════════════════════════════════════════
// STATUS BADGE
// ═══════════════════════════════════════════════════════════
const StatusBadge = ({ status }) => {
  const done = status === 'Completed';
  return (
    <View style={[s.badge, done ? s.badgeDone : s.badgePend]}>
      <Text style={[s.badgeText, done ? s.badgeTextDone : s.badgeTextPend]}>
        {status.toUpperCase()}
      </Text>
    </View>
  );
};

// ═══════════════════════════════════════════════════════════
// METHOD CHIP
// ═══════════════════════════════════════════════════════════
const MethodChip = ({ label }) => (
  <View style={s.chip}>
    <Text style={s.chipText}>{label}</Text>
  </View>
);

// ═══════════════════════════════════════════════════════════
// DONATION CARD — exact Figma layout
// ═══════════════════════════════════════════════════════════
const DonationCard = ({ item }) => (
  <View style={s.card}>
    {/* ── Row 1: thumb + title + amount ─────────────────── */}
    <View style={s.cardRow}>
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
            <Icons name="image" size={scale(18)} color={C.textLight} />
          </View>
        )}
      </View>

      {/* Title — flex:1 so it compresses between thumb and amount */}
      <Text style={s.cardTitle} numberOfLines={3}>
        {item.title}
      </Text>

      {/* Amount — right-aligned, never wraps */}
      <View style={s.amountWrap}>
        <Text style={s.amountLabel}>PKR</Text>
        <Text style={s.amountValue}>{item.amount.toLocaleString('en-PK')}</Text>
      </View>
    </View>

    {/* ── Row 2: badge + method ─────────────────────────── */}
    <View style={s.badgeRow}>
      <StatusBadge status={item.status} />
      <MethodChip label={item.method} />
    </View>

    {/* ── Divider ───────────────────────────────────────── */}
    {(item.message || true) && <View style={s.divider} />}

    {/* ── Message ───────────────────────────────────────── */}
    {item.message ? (
      <Text style={s.message} numberOfLines={2}>
        "{item.message}"
      </Text>
    ) : null}

    {/* ── Date ──────────────────────────────────────────── */}
    <Text style={s.date}>{item.date}</Text>
  </View>
);

// ═══════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════
const EmptyState = ({ tab }) => (
  <View style={s.empty}>
    <View style={s.emptyIcon}>
      <Icons name="inbox" size={scale(32)} color={C.textLight} />
    </View>
    <Text style={s.emptyTitle}>No {tab} Donations</Text>
    <Text style={s.emptySub}>
      {tab === 'Pending'
        ? 'You have no pending donations right now.'
        : 'Your donation history will appear here.'}
    </Text>
  </View>
);

// ═══════════════════════════════════════════════════════════
// LIST HEADER (memoized — renders once)
// ═══════════════════════════════════════════════════════════
const ListHeader = ({ active, onChange }) => (
  <>
    <SummaryBanner />
    <TabBar active={active} onChange={onChange} />
  </>
);

// ═══════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════
const MyDonationsScreen = ({ navigation }) => {
  // ✅ Default is 'All' as requested
  const [activeTab, setActiveTab] = useState('All');

  const data = useCallback(() => {
    if (activeTab === 'All') return ALL_DONATIONS;
    return ALL_DONATIONS.filter(d => d.status === activeTab);
  }, [activeTab])();

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.pageBg} />

      <Header onBack={() => navigation.goBack()} />

      <FlatList
        data={data}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.listContent}
        ListHeaderComponent={
          <ListHeader active={activeTab} onChange={setActiveTab} />
        }
        ListEmptyComponent={<EmptyState tab={activeTab} />}
        renderItem={({ item }) => <DonationCard item={item} />}
        ItemSeparatorComponent={() => <View style={{ height: vscale(10) }} />}
      />
    </SafeAreaView>
  );
};

// ═══════════════════════════════════════════════════════════
// STYLES — pixel-perfect Figma match
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
  headerBtn: {
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

  // ── List ─────────────────────────────────────────────────
  listContent: {
    paddingBottom: vscale(32),
    flexGrow: 1,
  },

  // ── Summary Banner ────────────────────────────────────────
  banner: {
    marginHorizontal: scale(16),
    marginTop: vscale(14),
    marginBottom: vscale(14),
    borderRadius: scale(14),
    paddingHorizontal: scale(20),
    paddingVertical: vscale(20),
    overflow: 'hidden',
    elevation: 4,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },
  bannerBlob1: {
    position: 'absolute',
    width: scale(120),
    height: scale(120),
    borderRadius: scale(60),
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -scale(30),
    right: -scale(10),
  },
  bannerBlob2: {
    position: 'absolute',
    width: scale(80),
    height: scale(80),
    borderRadius: scale(40),
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: -scale(20),
    left: scale(10),
  },
  bannerLabel: {
    fontSize: scale(12),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.78)',
    marginBottom: vscale(4),
    letterSpacing: 0.3,
  },
  bannerAmount: {
    fontSize: scale(30),
    fontWeight: '800',
    color: C.white,
    letterSpacing: -0.5,
    marginBottom: vscale(6),
    includeFontPadding: false,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerSub: {
    fontSize: scale(12),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.78)',
  },

  // ── Tab Bar ───────────────────────────────────────────────
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: scale(16),
    marginBottom: vscale(12),
    backgroundColor: C.tabTrack,
    borderRadius: scale(28),
    padding: scale(3),
  },
  tabItem: {
    flex: 1,
    paddingVertical: vscale(8),
    borderRadius: scale(25),
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItemActive: {
    backgroundColor: C.primary,
    elevation: 2,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  tabLabel: {
    fontSize: scale(13),
    fontWeight: '600',
    color: C.textGray,
    includeFontPadding: false,
  },
  tabLabelActive: {
    color: C.white,
  },

  // ── Donation Card ─────────────────────────────────────────
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
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },

  // Top row
  cardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: vscale(10),
    gap: scale(10),
  },

  // Thumbnail
  thumbWrap: {
    width: scale(52),
    height: scale(52),
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

  // Title
  cardTitle: {
    flex: 1,
    fontSize: scale(13),
    fontWeight: '700',
    color: C.textDark,
    lineHeight: scale(18),
    includeFontPadding: false,
  },

  // Amount block — stacked PKR / number
  amountWrap: {
    alignItems: 'flex-end',
    flexShrink: 0,
    marginLeft: scale(6),
  },
  amountLabel: {
    fontSize: scale(11),
    fontWeight: '700',
    color: C.success,
    includeFontPadding: false,
    lineHeight: scale(14),
  },
  amountValue: {
    fontSize: scale(15),
    fontWeight: '800',
    color: C.success,
    includeFontPadding: false,
    lineHeight: scale(20),
  },

  // Badge row
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(8),
    marginBottom: vscale(8),
  },

  // Status badge
  badge: {
    paddingHorizontal: scale(9),
    paddingVertical: vscale(3),
    borderRadius: scale(20),
  },
  badgeDone: { backgroundColor: C.successBg },
  badgePend: { backgroundColor: C.pendingBg },
  badgeText: {
    fontSize: scale(10),
    fontWeight: '700',
    letterSpacing: 0.4,
    includeFontPadding: false,
  },
  badgeTextDone: { color: C.success },
  badgeTextPend: { color: C.pending },

  // Method chip
  chip: {
    paddingHorizontal: scale(9),
    paddingVertical: vscale(3),
    borderRadius: scale(20),
    backgroundColor: C.methodBg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.methodBorder,
  },
  chipText: {
    fontSize: scale(11),
    fontWeight: '600',
    color: C.textGray,
    includeFontPadding: false,
  },

  // Divider
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: C.border,
    marginBottom: vscale(7),
  },

  // Message
  message: {
    fontSize: scale(12),
    color: C.textGray,
    fontStyle: 'italic',
    lineHeight: scale(17),
    marginBottom: vscale(5),
    includeFontPadding: false,
  },

  // Date
  date: {
    fontSize: scale(11),
    color: C.textLight,
    textAlign: 'right',
    fontWeight: '500',
    includeFontPadding: false,
  },

  // ── Empty State ───────────────────────────────────────────
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: vscale(60),
    paddingHorizontal: scale(40),
  },
  emptyIcon: {
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

export default MyDonationsScreen;
