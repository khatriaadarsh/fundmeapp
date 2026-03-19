// src/screens/home/HomeScreen.jsx
// ─────────────────────────────────────────────────────────────
//  Home Screen — FundMe App (React Native CLI)
//
//  SCROLLABLE — full content:
//  ┌ Top bar: FundMe logo (left) + notification bell (right)
//  ├ Search bar
//  ├ Teal hero banner "Fund Someone's Future Today" + Explore →
//  ├ 3 stats: PKR 15M Raised | 5.2K Donors | 320 Campaigns
//  ├ Categories row (Medical • Education • Emergency • See All)
//  ├ 🔥 Urgent Campaigns — horizontal scroll cards
//  │    card: image placeholder | URGENT badge | category chip
//  │          title | PKR amount / goal | avatar + user | time
//  ├ ⭐ Featured — vertical list items
//  │    item: thumbnail | title | amount | time ago
//  └ Bottom Tab Bar: Home | Explore | ＋ (FAB) | Saved | Me
// ─────────────────────────────────────────────────────────────

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Dimensions,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_W = width * 0.62;

// ── Colours ────────────────────────────────────────────────
const C = {
  bg: '#F3F4F6',
  white: '#FFFFFF',
  teal: '#00B4CC',
  tealDark: '#0097AA',
  tealDeep: '#0D4F5C',
  tealBanner: '#0A6B7A',
  green: '#22C55E',
  red: '#EF4444',
  amber: '#F59E0B',
  textDark: '#111827',
  textGray: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  cardBg: '#FFFFFF',
  tabBar: '#FFFFFF',
  tabActive: '#00B4CC',
  tabInactive: '#9CA3AF',
};

// ── Mock data ─────────────────────────────────────────────
const CATEGORIES = [
  { id: 'medical', label: 'Medical', icon: '🏥' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'emergency', label: 'Emergency', icon: '🚨' },
  { id: 'food', label: 'Food', icon: '🍲' },
  { id: 'shelter', label: 'Shelter', icon: '🏠' },
];

const URGENT_CAMPAIGNS = [
  {
    id: '1',
    category: 'Medical',
    catColor: '#EF4444',
    title: "Urgent Surgery for Little Ali's Heart Condition",
    raised: 'PKR 325,000',
    goal: '500,000',
    user: 'Ali Hassan',
    timeLeft: '13d left',
    urgent: true,
    bgColor: '#DBEAFE',
    emoji: '🏥',
  },
  {
    id: '2',
    category: 'Education',
    catColor: '#3B82F6',
    title: 'Help Fatima Get Medical Education',
    raised: 'PKR 120,000',
    goal: '300,000',
    user: 'Fatima Malik',
    timeLeft: '7d left',
    urgent: true,
    bgColor: '#FEF9C3',
    emoji: '📚',
  },
  {
    id: '3',
    category: 'Emergency',
    catColor: '#F59E0B',
    title: 'Flood Relief for Balochistan Families',
    raised: 'PKR 89,000',
    goal: '200,000',
    user: 'Relief Fund',
    timeLeft: '3d left',
    urgent: true,
    bgColor: '#DCFCE7',
    emoji: '🌊',
  },
];

const FEATURED = [
  {
    id: '1',
    title: 'Clean Water for Village',
    raised: 'PKR 910K',
    time: '1M',
    pct: 74,
    emoji: '💧',
    bgColor: '#DBEAFE',
  },
  {
    id: '2',
    title: 'Flood Relief Support',
    raised: 'PKR 256K',
    time: '2M',
    pct: 42,
    emoji: '🏠',
    bgColor: '#DCFCE7',
  },
  {
    id: '3',
    title: 'School Rebuilding Project',
    raised: 'PKR 430K',
    time: '3M',
    pct: 58,
    emoji: '🏫',
    bgColor: '#FEF9C3',
  },
];

// ── Urgent campaign card ───────────────────────────────────
const UrgentCard = ({ item }) => (
  <View style={card.wrap}>
    {/* Image area */}
    <View style={[card.imgArea, { backgroundColor: item.bgColor }]}>
      <Text style={card.imgEmoji}>{item.emoji}</Text>
      {item.urgent && (
        <View style={card.urgentBadge}>
          <Text style={card.urgentText}>URGENT</Text>
        </View>
      )}
    </View>

    <View style={card.body}>
      {/* Category chip */}
      <View style={[card.catChip, { backgroundColor: item.catColor + '20' }]}>
        <Text style={[card.catText, { color: item.catColor }]}>
          {item.category}
        </Text>
      </View>

      {/* Title */}
      <Text style={card.title} numberOfLines={2}>
        {item.title}
      </Text>

      {/* Amount */}
      <Text style={card.raised}>{item.raised}</Text>
      <Text style={card.goal}>/ {item.goal}</Text>

      {/* Progress bar */}
      <View style={card.progressBg}>
        <View
          style={[
            card.progressFill,
            {
              width: `${Math.round(
                (parseInt(item.raised.replace(/\D/g, '')) /
                  parseInt(item.goal.replace(/\D/g, ''))) *
                  100,
              )}%`,
            },
          ]}
        />
      </View>

      {/* User + time */}
      <View style={card.footer}>
        <View style={card.avatarCircle}>
          <Text style={card.avatarText}>{item.user.charAt(0)}</Text>
        </View>
        <Text style={card.userName} numberOfLines={1}>
          {item.user}
        </Text>
        <Text style={card.timeLeft}>⏱ {item.timeLeft}</Text>
      </View>
    </View>
  </View>
);

// ── Featured list item ─────────────────────────────────────
const FeaturedItem = ({ item }) => (
  <View style={feat.wrap}>
    {/* Thumbnail */}
    <View style={[feat.thumb, { backgroundColor: item.bgColor }]}>
      <Text style={feat.thumbEmoji}>{item.emoji}</Text>
    </View>

    {/* Info */}
    <View style={feat.info}>
      <Text style={feat.title} numberOfLines={1}>
        {item.title}
      </Text>
      <View style={feat.progressBg}>
        <View style={[feat.progressFill, { width: `${item.pct}%` }]} />
      </View>
      <View style={feat.meta}>
        <Text style={feat.raised}>{item.raised}</Text>
        <Text style={feat.time}>{item.time}</Text>
      </View>
    </View>
  </View>
);

// ── Bottom tab bar ─────────────────────────────────────────
const TAB_ITEMS = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'explore', label: 'Explore', icon: '🔍' },
  { id: 'add', label: '', icon: '+' },
  { id: 'saved', label: 'Saved', icon: '🤍' },
  { id: 'me', label: 'Me', icon: '👤' },
];

const BottomTabBar = ({ active, onPress }) => (
  <View style={tab.bar}>
    {TAB_ITEMS.map(t =>
      t.id === 'add' ? (
        <TouchableOpacity
          key={t.id}
          style={tab.fabWrap}
          onPress={() => onPress(t.id)}
          activeOpacity={0.85}
        >
          <LinearGradient colors={[C.teal, C.tealDark]} style={tab.fab}>
            <Text style={tab.fabIcon}>+</Text>
          </LinearGradient>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          key={t.id}
          style={tab.item}
          onPress={() => onPress(t.id)}
          activeOpacity={0.7}
        >
          <Text style={[tab.icon, active === t.id && tab.iconActive]}>
            {t.icon}
          </Text>
          <Text style={[tab.label, active === t.id && tab.labelActive]}>
            {t.label}
          </Text>
        </TouchableOpacity>
      ),
    )}
  </View>
);

// ── Main screen ────────────────────────────────────────────
const HomeScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [activeCategory, setActiveCategory] = useState('medical');
  const [searchText, setSearchText] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[0]} // top bar stays sticky
        >
          {/* ── Sticky Top Bar ── */}
          <View style={s.topBar}>
            <View style={s.topBarLeft}>
              <Text style={s.logoIcon}>🤍</Text>
              <Text style={s.logoText}>FundMe</Text>
            </View>
            <TouchableOpacity style={s.bellWrap} activeOpacity={0.7}>
              <Text style={s.bellIcon}>🔔</Text>
              <View style={s.bellDot} />
            </TouchableOpacity>
          </View>

          {/* ── Search bar ── */}
          <View style={s.searchRow}>
            <Text style={s.searchIcon}>🔍</Text>
            <TextInput
              style={s.searchInput}
              placeholder="Search campaigns..."
              placeholderTextColor={C.textLight}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          {/* ── Hero Banner ── */}
          <LinearGradient
            colors={[C.tealBanner, C.teal]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0.8 }}
            style={s.banner}
          >
            {/* Decorative circle */}
            <View style={s.bannerCircle} />
            <View style={s.bannerContent}>
              <Text style={s.bannerTitle}>
                {"Fund Someone's\nFuture Today"}
              </Text>
              <Text style={s.bannerSub}>100% goes to those in need</Text>
              <TouchableOpacity style={s.exploreBtn} activeOpacity={0.85}>
                <Text style={s.exploreBtnText}>Explore →</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* ── Stats row ── */}
          <View style={s.statsRow}>
            {[
              { val: 'PKR 15M', lbl: 'Raised' },
              { val: '5.2K', lbl: 'Donors' },
              { val: '320', lbl: 'Campaigns' },
            ].map((stat, i) => (
              <View key={i} style={[s.statItem, i < 2 && s.statBorder]}>
                <Text style={s.statVal}>{stat.val}</Text>
                <Text style={s.statLbl}>{stat.lbl}</Text>
              </View>
            ))}
          </View>

          {/* ── Categories ── */}
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Categories</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={s.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.categoriesRow}
          >
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  s.catChip,
                  activeCategory === cat.id && s.catChipActive,
                ]}
                onPress={() => setActiveCategory(cat.id)}
                activeOpacity={0.8}
              >
                <Text style={s.catIcon}>{cat.icon}</Text>
                <Text
                  style={[
                    s.catLabel,
                    activeCategory === cat.id && s.catLabelActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* ── Urgent Campaigns ── */}
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>🔥 Urgent Campaigns</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={s.seeAll}>See All →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.urgentScroll}
          >
            {URGENT_CAMPAIGNS.map(item => (
              <UrgentCard key={item.id} item={item} />
            ))}
          </ScrollView>

          {/* ── Featured ── */}
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>⭐ Featured</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={s.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={s.featuredList}>
            {FEATURED.map(item => (
              <FeaturedItem key={item.id} item={item} />
            ))}
          </View>

          {/* Bottom padding for tab bar */}
          <View style={{ height: 20 }} />
        </ScrollView>
      </Animated.View>

      {/* ── Bottom Tab Bar ── */}
      <BottomTabBar active={activeTab} onPress={setActiveTab} />
    </View>
  );
};

export default HomeScreen;

// ── Urgent card styles ─────────────────────────────────────
const card = StyleSheet.create({
  wrap: {
    width: CARD_W,
    backgroundColor: C.cardBg,
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  imgArea: {
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  imgEmoji: { fontSize: 48 },
  urgentBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: C.red,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  urgentText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  body: { padding: 12 },
  catChip: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 6,
  },
  catText: { fontSize: 11, fontWeight: '700' },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: C.textDark,
    lineHeight: 18,
    marginBottom: 8,
  },
  raised: { fontSize: 13, fontWeight: '800', color: C.teal },
  goal: { fontSize: 11, color: C.textLight, marginBottom: 6 },
  progressBg: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressFill: { height: 4, backgroundColor: C.teal, borderRadius: 2 },
  footer: { flexDirection: 'row', alignItems: 'center' },
  avatarCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  avatarText: { color: '#FFF', fontSize: 10, fontWeight: '700' },
  userName: { flex: 1, fontSize: 11, color: C.textGray },
  timeLeft: { fontSize: 11, color: C.textLight },
});

// ── Featured item styles ───────────────────────────────────
const feat = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.cardBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  thumbEmoji: { fontSize: 28 },
  info: { flex: 1 },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: C.textDark,
    marginBottom: 6,
  },
  progressBg: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressFill: { height: 4, backgroundColor: C.teal, borderRadius: 2 },
  meta: { flexDirection: 'row', justifyContent: 'space-between' },
  raised: { fontSize: 12, color: C.teal, fontWeight: '700' },
  time: { fontSize: 12, color: C.textLight },
});

// ── Tab bar styles ─────────────────────────────────────────
const tab = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.tabBar,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingBottom: 8,
    paddingTop: 8,
    paddingHorizontal: 8,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
  },
  icon: { fontSize: 20, marginBottom: 2 },
  iconActive: { fontSize: 20, marginBottom: 2 },
  label: { fontSize: 10, color: C.tabInactive },
  labelActive: { color: C.tabActive, fontWeight: '700' },

  // FAB
  fabWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22,
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: C.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },
});

// ── Screen styles ──────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 16 },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.white,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logoIcon: { fontSize: 18 },
  logoText: { fontSize: 18, fontWeight: '800', color: C.teal },
  bellWrap: { position: 'relative' },
  bellIcon: { fontSize: 22 },
  bellDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.red,
    borderWidth: 1.5,
    borderColor: C.white,
  },

  // Search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 42,
    borderWidth: 1,
    borderColor: C.border,
  },
  searchIcon: { fontSize: 14, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: C.textDark, paddingVertical: 0 },

  // Banner
  banner: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 20,
    minHeight: 120,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerCircle: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.07)',
    right: -30,
    top: -30,
  },
  bannerContent: { zIndex: 1 },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 26,
    marginBottom: 4,
  },
  bannerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 14,
  },
  exploreBtn: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  exploreBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: C.white,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  statBorder: {
    borderRightWidth: 1,
    borderRightColor: '#F3F4F6',
  },
  statVal: {
    fontSize: 16,
    fontWeight: '800',
    color: C.textDark,
    marginBottom: 2,
  },
  statLbl: { fontSize: 11, color: C.textLight },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: C.textDark },
  seeAll: { fontSize: 13, color: C.teal, fontWeight: '600' },

  // Categories
  categoriesRow: { paddingHorizontal: 16, gap: 8 },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.border,
    gap: 5,
  },
  catChipActive: {
    backgroundColor: C.teal,
    borderColor: C.teal,
  },
  catIcon: { fontSize: 14 },
  catLabel: { fontSize: 13, color: C.textGray, fontWeight: '600' },
  catLabelActive: { color: '#FFFFFF' },

  // Urgent scroll
  urgentScroll: { paddingHorizontal: 16, paddingBottom: 4 },

  // Featured list
  featuredList: { paddingHorizontal: 16 },
});
