// src/screens/home/HomeScreen.jsx
// ─────────────────────────────────────────────────────────────
//  Home Screen  |  FundMe App (React Native CLI)
//
//  Layout:
//  ┌─ SafeAreaView ──────────────────────────────────────────┐
//  │  [TopBar — avatar + username + bell]         (fixed)   │
//  │  ┌─ ScrollView ──────────────────────────────────────┐  │
//  │  │  Search · Banner · Stats · Categories ·          │  │
//  │  │  Urgent (horizontal) · Featured (list)           │  │
//  │  └───────────────────────────────────────────────────┘  │
//  │  [BottomTabBar — shared component]           (fixed)   │
//  └─────────────────────────────────────────────────────────┘
//  [ProfileDrawer — slides in from left on avatar tap]
//
//  Imports:
//    BottomTabBar  from '../../components/BottomTabBar'
//    ProfileDrawer from '../../components/ProfileDrawer'
// ─────────────────────────────────────────────────────────────

import React, { useState, memo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Dimensions,
  Image,
  SafeAreaView,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icons from 'react-native-vector-icons/Feather';

// Shared components
import BottomTabBar from '../../components/BottomTabBar';

// ── Responsive scale (base 375 pt) ─────────────────────────
const { width: SW } = Dimensions.get('window');
const sp = n => (SW / 375) * n;

// Android status bar offset
const STATUSBAR_H =
  Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0;

// Urgent card width
const URGENT_W = SW * 0.62;

// ── Palette ─────────────────────────────────────────────────
const P = {
  bg:         '#F4F5F7',
  white:      '#FFFFFF',
  teal:       '#00B4CC',
  tealDark:   '#0097AA',
  tealLight:  'rgba(0,180,204,0.10)',
  bannerFrom: '#0B5E6B',
  bannerTo:   '#0D8FA0',
  dark:       '#111827',
  gray:       '#6B7280',
  light:      '#9CA3AF',
  border:     '#E5E7EB',
  searchBg:   '#F3F4F6',
  red:        '#EF4444',
};

// ── Static data ─────────────────────────────────────────────
const CATEGORIES = [
  { id: 'all',       label: 'All',       icon: '✦'  },
  { id: 'medical',   label: 'Medical',   icon: '🏥' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'emergency', label: 'Emergency', icon: '🚨' },
  { id: 'food',      label: 'Food',      icon: '🍲' },
  { id: 'shelter',   label: 'Shelter',   icon: '🏠' },
];

const URGENT = [
  {
    id: '1', imgBg: '#4A7C8A', imgEmoji: '🏥', badge: 'URGENT',
    category: 'Medical',   catColor: '#00B4CC',
    title: "Help Little Amina Fight Leukemia Before It's Too Late",
    raised: 'PKR 325,000', goal: '500,000', pct: 65,
    user: 'Ali Hassan', verified: true, timeLeft: '12d left',
  },
  {
    id: '2', imgBg: '#7B6FA0', imgEmoji: '🤲', badge: 'URGENT',
    category: 'Orphan Care', catColor: '#8B5CF6',
    title: 'Provide Warm Meals to 200 Street Children This Winter',
    raised: 'PKR 120,000', goal: '250,000', pct: 48,
    user: 'Zara K.', verified: true, timeLeft: '5d left',
  },
  {
    id: '3', imgBg: '#4A8A6A', imgEmoji: '🌊', badge: 'URGENT',
    category: 'Emergency', catColor: '#F59E0B',
    title: 'Flood Relief for Balochistan Families',
    raised: 'PKR 89,000', goal: '200,000', pct: 45,
    user: 'Relief Fund', verified: true, timeLeft: '3d left',
  },
];

const FEATURED = [
  { id: '1', imgBg: '#4A7A5A', imgEmoji: '💧', title: 'Emergency Flood Relief 2024', raised: 'PKR 890K', goal: '1M',   org: 'By Relief PK', pct: 74 },
  { id: '2', imgBg: '#3A6A8A', imgEmoji: '🏫', title: 'Build a Village School',        raised: 'PKR 450K', goal: '1.5M', org: 'By EduTrust',  pct: 38 },
  { id: '3', imgBg: '#8A5A3A', imgEmoji: '🍲', title: 'Food Drive for Orphanage',      raised: 'PKR 180K', goal: '400K', org: 'By CareNow',   pct: 55 },
];

// Mock user — replace with real auth context
const CURRENT_USER = {
  name:      'Ahmed Khan',
  email:     'ahmed@gmail.com',
  avatarUri: null, // set to URI string when available
};

// ════════════════════════════════════════════════════════════
//  TopBar  — NayaPay style: avatar | search bar | scan | bell
//  Single compact row, no greeting text, minimal vertical space
// ════════════════════════════════════════════════════════════
//  TopBar  — avatar + username + bell (no search bar)
// ════════════════════════════════════════════════════════════
const TopBar = memo(({ user, onAvatarPress, onBellPress }) => (
  <View style={tbSt.wrap}>
    {/* Left: avatar + name — both tappable to open profile */}
    <TouchableOpacity
      style={tbSt.left}
      onPress={onAvatarPress}
      activeOpacity={0.8}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
    >
      {user?.avatarUri ? (
        <Image source={{ uri: user.avatarUri }} style={tbSt.avatar} />
      ) : (
        <LinearGradient colors={[P.teal, P.tealDark]} style={tbSt.avatarGrad}>
          <Text style={tbSt.avatarInitial}>
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </Text>
        </LinearGradient>
      )}
      <Text style={tbSt.userName} numberOfLines={1}>{user?.name}</Text>
    </TouchableOpacity>

    {/* Right: bell */}
    <TouchableOpacity
      style={tbSt.bellBtn}
      onPress={onBellPress}
      activeOpacity={0.7}
    >
      <Icons name="bell" size={sp(21)} color={P.gray} />
      <View style={tbSt.bellDot} />
    </TouchableOpacity>
  </View>
));

const tbSt = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: P.white,
    paddingHorizontal: sp(18),
    paddingTop: sp(10) + STATUSBAR_H,
    paddingBottom: sp(10),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: P.border,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp(10),
    flex: 1,
  },
  avatar: {
    width: sp(38),
    height: sp(38),
    borderRadius: sp(19),
  },
  avatarGrad: {
    width: sp(38),
    height: sp(38),
    borderRadius: sp(19),
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: sp(15),
    fontWeight: '800',
    color: P.white,
  },
  userName: {
    fontSize: sp(15),
    fontWeight: '700',
    color: P.dark,
    flex: 1,
  },
  bellBtn: {
    position: 'relative',
    width: sp(38),
    height: sp(38),
    borderRadius: sp(19),
    backgroundColor: P.searchBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: P.border,
  },
  bellDot: {
    position: 'absolute',
    top: sp(7),
    right: sp(7),
    width: sp(7),
    height: sp(7),
    borderRadius: sp(4),
    backgroundColor: P.red,
    borderWidth: 1,
    borderColor: P.white,
  },
});

// ════════════════════════════════════════════════════════════
//  SearchBar
// ════════════════════════════════════════════════════════════
const SearchBar = memo(({ value, onChange }) => (
  <View style={srSt.wrap}>
    <Icons name="search" size={sp(15)} color={P.light} style={srSt.icon} />
    <TextInput
      style={srSt.input}
      placeholder="Search campaigns..."
      placeholderTextColor={P.light}
      value={value}
      onChangeText={onChange}
      returnKeyType="search"
    />
  </View>
));

const srSt = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: P.searchBg,
    borderRadius: sp(10),
    marginHorizontal: sp(16),
    marginTop: sp(14),
    marginBottom: sp(16),
    paddingHorizontal: sp(13),
    height: sp(44),
    borderWidth: 1,
    borderColor: P.border,
  },
  icon:  { marginRight: sp(8) },
  input: { flex: 1, fontSize: sp(14), color: P.dark, paddingVertical: 0 },
});

// ════════════════════════════════════════════════════════════
//  HeroBanner
// ════════════════════════════════════════════════════════════
const HeroBanner = memo(() => (
  <LinearGradient
    colors={[P.bannerFrom, P.bannerTo]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={bnSt.wrap}
  >
    <View style={bnSt.circle1} />
    <View style={bnSt.circle2} />
    <View style={bnSt.graphic}>
      <Text style={bnSt.graphicIcon}>🤲</Text>
    </View>
    <Text style={bnSt.title}>{"Fund Someone's\nFuture Today"}</Text>
    <Text style={bnSt.sub}>100% goes to those in need</Text>
    <TouchableOpacity style={bnSt.exploreBtn} activeOpacity={0.8}>
      <Text style={bnSt.exploreTxt}>Explore →</Text>
    </TouchableOpacity>
  </LinearGradient>
));

const bnSt = StyleSheet.create({
  wrap: {
    marginHorizontal: sp(16),
    borderRadius: sp(16),
    padding: sp(22),
    paddingRight: sp(100),
    overflow: 'hidden',
    minHeight: sp(138),
    position: 'relative',
    justifyContent: 'center',
  },
  circle1: {
    position: 'absolute', width: sp(160), height: sp(160),
    borderRadius: sp(80), borderWidth: sp(22),
    borderColor: 'rgba(255,255,255,0.07)', right: sp(-30), top: sp(-30),
  },
  circle2: {
    position: 'absolute', width: sp(100), height: sp(100),
    borderRadius: sp(50), borderWidth: sp(16),
    borderColor: 'rgba(255,255,255,0.05)', right: sp(20), bottom: sp(-30),
  },
  graphic: {
    position: 'absolute', right: sp(18), top: 0, bottom: 0,
    justifyContent: 'center',
  },
  graphicIcon: { fontSize: sp(52) },
  title: {
    fontSize: sp(20), fontWeight: '800', color: P.white,
    lineHeight: sp(27), marginBottom: sp(5),
  },
  sub: { fontSize: sp(12), color: 'rgba(255,255,255,0.72)', marginBottom: sp(16) },
  exploreBtn: {
    alignSelf: 'flex-start',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.55)',
    borderRadius: sp(20), paddingHorizontal: sp(16), paddingVertical: sp(6),
  },
  exploreTxt: { color: P.white, fontSize: sp(13), fontWeight: '600' },
});

// ════════════════════════════════════════════════════════════
//  StatsRow
// ════════════════════════════════════════════════════════════
const StatsRow = memo(() => (
  <View style={stSt.card}>
    {[
      { val: 'PKR 15M', lbl: 'Raised'    },
      { val: '5.2K',    lbl: 'Donors'    },
      { val: '320',     lbl: 'Campaigns' },
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
    flexDirection: 'row', backgroundColor: P.white,
    marginHorizontal: sp(16), marginTop: sp(14),
    borderRadius: sp(12), elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4,
  },
  item:    { flex: 1, alignItems: 'center', paddingVertical: sp(14) },
  divider: { borderRightWidth: 1, borderRightColor: P.border },
  val:     { fontSize: sp(15), fontWeight: '800', color: P.dark, marginBottom: sp(2) },
  lbl:     { fontSize: sp(11), color: P.light },
});

// ════════════════════════════════════════════════════════════
//  SectionHeader
// ════════════════════════════════════════════════════════════
const SectionHeader = memo(({ title, linkText, onPress }) => (
  <View style={shSt.wrap}>
    <Text style={shSt.title}>{title}</Text>
    {linkText && (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <Text style={shSt.link}>{linkText}</Text>
      </TouchableOpacity>
    )}
  </View>
));

const shSt = StyleSheet.create({
  wrap: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: sp(16), marginTop: sp(22), marginBottom: sp(12),
  },
  title: { fontSize: sp(15), fontWeight: '800', color: P.dark },
  link:  { fontSize: sp(13), color: P.teal, fontWeight: '600' },
});

// ════════════════════════════════════════════════════════════
//  CategoryChips
// ════════════════════════════════════════════════════════════
const CategoryChips = memo(({ active, onChange }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={ccSt.list}
  >
    {CATEGORIES.map(cat => {
      const isActive = active === cat.id;
      return (
        <TouchableOpacity
          key={cat.id}
          style={[ccSt.chip, isActive && ccSt.chipActive]}
          onPress={() => onChange(cat.id)}
          activeOpacity={0.8}
        >
          <Text style={ccSt.icon}>{cat.icon}</Text>
          <Text style={[ccSt.label, isActive && ccSt.labelActive]}>{cat.label}</Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
));

const ccSt = StyleSheet.create({
  list: { paddingHorizontal: sp(16), paddingBottom: sp(4) },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: sp(14), paddingVertical: sp(7),
    borderRadius: sp(20), borderWidth: 1.5, borderColor: P.border,
    backgroundColor: P.white, marginRight: sp(8), gap: sp(5),
  },
  chipActive:  { backgroundColor: P.teal, borderColor: P.teal },
  icon:        { fontSize: sp(13) },
  label:       { fontSize: sp(13), fontWeight: '600', color: P.gray },
  labelActive: { color: P.white },
});

// ════════════════════════════════════════════════════════════
//  ProgressBar
// ════════════════════════════════════════════════════════════
const ProgressBar = memo(({ pct, color = P.teal }) => (
  <View style={pbSt.bg}>
    <View style={[pbSt.fill, { width: `${pct}%`, backgroundColor: color }]} />
  </View>
));

const pbSt = StyleSheet.create({
  bg:   { height: 4, backgroundColor: P.border, borderRadius: 2, overflow: 'hidden' },
  fill: { height: 4, borderRadius: 2 },
});

// ════════════════════════════════════════════════════════════
//  UrgentCard
// ════════════════════════════════════════════════════════════
const UrgentCard = memo(({ item }) => (
  <TouchableOpacity style={ucSt.wrap} activeOpacity={0.9}>
    <View style={[ucSt.imgBox, { backgroundColor: item.imgBg }]}>
      <Text style={ucSt.imgEmoji}>{item.imgEmoji}</Text>
      <View style={ucSt.badge}>
        <Text style={ucSt.badgeTxt}>{item.badge}</Text>
      </View>
      <TouchableOpacity style={ucSt.heartBtn} activeOpacity={0.8}>
        <Icons name="heart" size={sp(14)} color={P.white} />
      </TouchableOpacity>
    </View>
    <View style={ucSt.body}>
      <View style={[ucSt.catChip, { backgroundColor: item.catColor + '18' }]}>
        <Text style={[ucSt.catTxt, { color: item.catColor }]}>{item.category}</Text>
      </View>
      <Text style={ucSt.title} numberOfLines={2}>{item.title}</Text>
      <View style={ucSt.amtRow}>
        <Text style={ucSt.raised}>{item.raised}</Text>
        <Text style={ucSt.goal}> / {item.goal}</Text>
      </View>
      <ProgressBar pct={item.pct} />
      <View style={ucSt.userRow}>
        <View style={ucSt.avatar}>
          <Text style={ucSt.avatarTxt}>{item.user.charAt(0)}</Text>
        </View>
        <Text style={ucSt.userName} numberOfLines={1}>{item.user}</Text>
        {item.verified && (
          <View style={ucSt.verifiedBadge}>
            <Icons name="check" size={sp(8)} color={P.white} />
          </View>
        )}
        <View style={ucSt.timePill}>
          <Icons name="clock" size={sp(9)} color={P.light} />
          <Text style={ucSt.timeTxt}> {item.timeLeft}</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
));

const ucSt = StyleSheet.create({
  wrap: {
    width: URGENT_W, backgroundColor: P.white, borderRadius: sp(14),
    overflow: 'hidden', marginRight: sp(14), elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6,
  },
  imgBox: {
    height: sp(130), alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  imgEmoji: { fontSize: sp(48) },
  badge: {
    position: 'absolute', top: sp(10), left: sp(10),
    backgroundColor: P.red, borderRadius: sp(5),
    paddingHorizontal: sp(7), paddingVertical: sp(3),
  },
  badgeTxt: { color: P.white, fontSize: sp(9), fontWeight: '800', letterSpacing: 0.8 },
  heartBtn: {
    position: 'absolute', top: sp(10), right: sp(10),
    width: sp(28), height: sp(28), borderRadius: sp(14),
    backgroundColor: 'rgba(0,0,0,0.28)', alignItems: 'center', justifyContent: 'center',
  },
  body:    { padding: sp(11) },
  catChip: { alignSelf: 'flex-start', borderRadius: sp(5), paddingHorizontal: sp(7), paddingVertical: sp(2), marginBottom: sp(6) },
  catTxt:  { fontSize: sp(10), fontWeight: '700' },
  title: {
    fontSize: sp(13), fontWeight: '700', color: P.dark,
    lineHeight: sp(18), marginBottom: sp(7), minHeight: sp(36),
  },
  amtRow:  { flexDirection: 'row', alignItems: 'baseline', marginBottom: sp(6) },
  raised:  { fontSize: sp(13), fontWeight: '800', color: P.teal },
  goal:    { fontSize: sp(11), color: P.light },
  userRow: { flexDirection: 'row', alignItems: 'center', marginTop: sp(8) },
  avatar: {
    width: sp(20), height: sp(20), borderRadius: sp(10),
    backgroundColor: P.teal, alignItems: 'center', justifyContent: 'center', marginRight: sp(5),
  },
  avatarTxt: { color: P.white, fontSize: sp(9), fontWeight: '800' },
  userName:  { flex: 1, fontSize: sp(11), color: P.gray },
  verifiedBadge: {
    width: sp(14), height: sp(14), borderRadius: sp(7),
    backgroundColor: P.teal, alignItems: 'center', justifyContent: 'center', marginRight: sp(5),
  },
  timePill: { flexDirection: 'row', alignItems: 'center' },
  timeTxt:  { fontSize: sp(10), color: P.light },
});

// ════════════════════════════════════════════════════════════
//  FeaturedItem
// ════════════════════════════════════════════════════════════
const FeaturedItem = memo(({ item }) => (
  <TouchableOpacity style={fiSt.wrap} activeOpacity={0.9}>
    <View style={[fiSt.thumb, { backgroundColor: item.imgBg }]}>
      <Text style={fiSt.emoji}>{item.imgEmoji}</Text>
    </View>
    <View style={fiSt.info}>
      <Text style={fiSt.title} numberOfLines={1}>{item.title}</Text>
      <ProgressBar pct={item.pct} />
      <View style={fiSt.meta}>
        <Text style={fiSt.raised}>{item.raised}</Text>
        <Text style={fiSt.sep}> / </Text>
        <Text style={fiSt.goal}>{item.goal}</Text>
        <View style={{ flex: 1 }} />
        <Text style={fiSt.org}>{item.org}</Text>
      </View>
    </View>
  </TouchableOpacity>
));

const fiSt = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: P.white,
    borderRadius: sp(12), padding: sp(12), marginBottom: sp(10),
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3,
  },
  thumb: {
    width: sp(64), height: sp(64), borderRadius: sp(10),
    alignItems: 'center', justifyContent: 'center', marginRight: sp(12),
  },
  emoji: { fontSize: sp(28) },
  info:  { flex: 1 },
  title: { fontSize: sp(14), fontWeight: '700', color: P.dark, marginBottom: sp(8) },
  meta:  { flexDirection: 'row', alignItems: 'center', marginTop: sp(6) },
  raised:{ fontSize: sp(12), fontWeight: '700', color: P.teal },
  sep:   { fontSize: sp(12), color: P.light },
  goal:  { fontSize: sp(12), color: P.light },
  org:   { fontSize: sp(11), color: P.light },
});

// ════════════════════════════════════════════════════════════
//  HomeScreen — main
// ════════════════════════════════════════════════════════════
const HomeScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [activeCat, setActiveCat] = useState('all');
  const [search,    setSearch   ] = useState('');

  const handleTab = useCallback(id => setActiveTab(id), []);
  const handleCat = useCallback(id => setActiveCat(id), []);

  // Opens ProfileScreen as a full screen sliding from right
  const openProfile = useCallback(() => {
    navigation?.navigate?.('ProfileScreen');
  }, [navigation]);

  return (
    <SafeAreaView style={scSt.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={P.white} />

      {/* ══ FIXED TOPBAR ════════════════════════════════════ */}
      <TopBar
        user={CURRENT_USER}
        onAvatarPress={openProfile}
        onBellPress={() => {}}
      />

      {/* ══ SCROLLABLE CONTENT ══════════════════════════════ */}
      <ScrollView
        style={scSt.scroll}
        contentContainerStyle={scSt.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
        <SearchBar value={search} onChange={setSearch} />
        <HeroBanner />
        <StatsRow />

        <SectionHeader title="Categories" linkText="See All" />
        <CategoryChips active={activeCat} onChange={handleCat} />

        <SectionHeader title="🔥 Urgent Campaigns" linkText="See All →" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={scSt.hPad}
        >
          {URGENT.map(item => <UrgentCard key={item.id} item={item} />)}
        </ScrollView>

        <SectionHeader title="⭐ Featured" linkText="See All" />
        <View style={scSt.featList}>
          {FEATURED.map(item => <FeaturedItem key={item.id} item={item} />)}
        </View>

        <View style={{ height: sp(20) }} />
      </ScrollView>

      {/* ══ SHARED BOTTOM TAB BAR ═══════════════════════════ */}
      <BottomTabBar active={activeTab} onPress={handleTab} />
    </SafeAreaView>
  );
};

export default HomeScreen;

// ── Screen styles ────────────────────────────────────────────
const scSt = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: P.white },
  scroll:   { flex: 1, backgroundColor: P.bg    },
  content:  { paddingBottom: sp(8)               },
  hPad:     { paddingHorizontal: sp(16), paddingBottom: sp(4) },
  featList: { paddingHorizontal: sp(16) },
});