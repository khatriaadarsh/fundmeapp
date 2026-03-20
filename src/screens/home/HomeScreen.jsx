// src/screens/home/HomeScreen.jsx
// ─────────────────────────────────────────────────────────────
//  Home Screen — FundMe App (React Native CLI)
//  Rebuilt pixel-perfect from UI screenshot
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
  Image,
  SafeAreaView,
} from 'react-native';
import LogoImg from '../../assets/logo.png';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');
const URGENT_CARD_W = width * 0.6;

// ── Colour tokens (exact from screenshot) ─────────────────
const C = {
  screenBg: '#F4F5F7',
  white: '#FFFFFF',
  teal: '#00B4CC',
  tealDark: '#0097AA',
  bannerTop: '#0B5E6B',
  bannerBot: '#0D8FA0',
  textDark: '#111827',
  textGray: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  searchBg: '#F3F4F6',
  red: '#EF4444',
  tabActive: '#00B4CC',
  tabInactive: '#9CA3AF',
};

// ── Data ──────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'medical', label: 'Medical', icon: '🏥' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'emergency', label: 'Emergency', icon: '🚨' },
  { id: 'food', label: 'Food', icon: '🍲' },
  { id: 'shelter', label: 'Shelter', icon: '🏠' },
];

const URGENT = [
  {
    id: '1',
    imgBg: '#CBD5E1',
    imgEmoji: '🏥',
    badge: 'URGENT',
    category: 'Medical',
    catColor: '#00B4CC',
    title: "Urgent Surgery for Little Ali's Heart Condition",
    raised: 'PKR 325,000',
    goal: '500,000',
    pct: 65,
    user: 'Ali Hassan',
    verified: true,
    timeLeft: '13d left',
  },
  {
    id: '2',
    imgBg: '#D4B8A0',
    imgEmoji: '🤲',
    badge: 'URGENT',
    category: 'Education',
    catColor: '#3B82F6',
    title: 'Help Fatima Get Medical Education',
    raised: 'PKR 128,000',
    goal: '300,000',
    pct: 43,
    user: 'Fatima Malik',
    verified: false,
    timeLeft: '7d left',
  },
  {
    id: '3',
    imgBg: '#B0C4B8',
    imgEmoji: '🌊',
    badge: 'URGENT',
    category: 'Emergency',
    catColor: '#F59E0B',
    title: 'Flood Relief for Balochistan Families',
    raised: 'PKR 89,000',
    goal: '200,000',
    pct: 45,
    user: 'Relief Fund',
    verified: true,
    timeLeft: '3d left',
  },
];

const FEATURED = [
  {
    id: '1',
    imgBg: '#6B9E7A',
    imgEmoji: '💧',
    title: 'Clean Water for Village',
    raised: 'PKR 910K',
    time: '1M',
    pct: 74,
  },
  {
    id: '2',
    imgBg: '#7B9BBF',
    imgEmoji: '🏠',
    title: 'Flood Relief Support',
    raised: 'PKR 256K',
    time: '1M',
    pct: 38,
  },
  {
    id: '3',
    imgBg: '#C4956A',
    imgEmoji: '🍲',
    title: 'Food Drive for Orphanage',
    raised: 'PKR 180K',
    time: '2M',
    pct: 55,
  },
];

// ─────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────

// Top Bar
const TopBar = () => (
  <View style={topBar.wrap}>
    <View style={topBar.left}>
      <Image source={LogoImg} style={topBar.logoIcon} />
      <Text style={topBar.brand}>FundMe</Text>
    </View>
    <TouchableOpacity style={topBar.bellWrap} activeOpacity={0.7}>
      <View style={topBar.bellArc} />
      <View style={topBar.bellBottom} />
      <View style={topBar.dot} />
    </TouchableOpacity>
  </View>
);

const topBar = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.white,
    paddingHorizontal: 22,
    paddingTop: 40,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  logoIcon: { width: 22, height: 18, position: 'relative', color: C.teal },
  hL: {
    position: 'absolute',
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: C.teal,
    top: 0,
    left: 0,
  },
  hR: {
    position: 'absolute',
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: C.teal,
    top: 0,
    right: 0,
  },
  hP: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderWidth: 2,
    borderColor: C.teal,
    bottom: -2,
    left: 3,
    transform: [{ rotate: '45deg' }],
  },
  brand: { fontSize: 19, fontWeight: '800', color: C.teal },
  bellWrap: { position: 'relative', padding: 6, alignItems: 'center' },
  bellArc: {
    width: 16,
    height: 14,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 2,
    borderColor: C.textGray,
    borderBottomWidth: 0,
  },
  bellBottom: {
    width: 20,
    height: 4,
    backgroundColor: C.textGray,
    borderRadius: 2,
    marginTop: -1,
  },
  dot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.red,
    borderWidth: 1.5,
    borderColor: C.white,
  },
});

// Section header
const SectionHeader = ({ title, linkText }) => (
  <View style={sh.wrap}>
    <Text style={sh.title}>{title}</Text>
    {linkText && <Text style={sh.link}>{linkText}</Text>}
  </View>
);
const sh = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 22,
    marginBottom: 12,
  },
  title: { fontSize: 15, fontWeight: '800', color: C.textDark },
  link: { fontSize: 13, color: C.teal, fontWeight: '600' },
});

// Urgent card
const UrgentCard = ({ item }) => (
  <TouchableOpacity style={uc.wrap} activeOpacity={0.9}>
    <View style={[uc.img, { backgroundColor: item.imgBg }]}>
      <Text style={uc.imgEmoji}>{item.imgEmoji}</Text>
      <View style={uc.urgentBadge}>
        <Text style={uc.urgentTxt}>{item.badge}</Text>
      </View>
    </View>
    <View style={uc.body}>
      <View style={[uc.catChip, { backgroundColor: item.catColor + '18' }]}>
        <Text style={[uc.catTxt, { color: item.catColor }]}>
          {item.category}
        </Text>
      </View>
      <Text style={uc.title} numberOfLines={2}>
        {item.title}
      </Text>
      <View style={uc.amtRow}>
        <Text style={uc.raised}>{item.raised}</Text>
        <Text style={uc.goal}> / {item.goal}</Text>
      </View>
      <View style={uc.pBg}>
        <View style={[uc.pFill, { width: `${item.pct}%` }]} />
      </View>
      <View style={uc.userRow}>
        <View style={uc.avatar}>
          <Text style={uc.avatarTxt}>{item.user.charAt(0)}</Text>
        </View>
        <Text style={uc.userName} numberOfLines={1}>
          {item.user}
        </Text>
        {item.verified && <Text style={uc.verified}>✓</Text>}
        <Text style={uc.timeLeft}>⏱ {item.timeLeft}</Text>
      </View>
    </View>
  </TouchableOpacity>
);
const uc = StyleSheet.create({
  wrap: {
    width: URGENT_CARD_W,
    backgroundColor: C.white,
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  img: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  imgEmoji: { fontSize: 44 },
  urgentBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: C.red,
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  urgentTxt: {
    color: C.white,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  body: { padding: 11 },
  catChip: {
    alignSelf: 'flex-start',
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginBottom: 6,
  },
  catTxt: { fontSize: 10, fontWeight: '700' },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: C.textDark,
    lineHeight: 18,
    marginBottom: 7,
    minHeight: 36,
  },
  amtRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 5 },
  raised: { fontSize: 13, fontWeight: '800', color: C.teal },
  goal: { fontSize: 11, color: C.textLight },
  pBg: {
    height: 4,
    backgroundColor: C.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  pFill: { height: 4, backgroundColor: C.teal, borderRadius: 2 },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  avatarTxt: { color: C.white, fontSize: 9, fontWeight: '800' },
  userName: { flex: 1, fontSize: 10, color: C.textGray },
  verified: { fontSize: 10, color: C.teal, fontWeight: '700', marginRight: 4 },
  timeLeft: { fontSize: 10, color: C.textLight },
});

// Featured item
const FeaturedItem = ({ item }) => (
  <TouchableOpacity style={fi.wrap} activeOpacity={0.9}>
    <View style={[fi.thumb, { backgroundColor: item.imgBg }]}>
      <Text style={fi.emoji}>{item.imgEmoji}</Text>
    </View>
    <View style={fi.info}>
      <Text style={fi.title} numberOfLines={1}>
        {item.title}
      </Text>
      <View style={fi.pBg}>
        <View style={[fi.pFill, { width: `${item.pct}%` }]} />
      </View>
      <View style={fi.meta}>
        <Text style={fi.raised}>{item.raised}</Text>
        <Text style={fi.sep}> • </Text>
        <Text style={fi.time}>{item.time}</Text>
      </View>
    </View>
  </TouchableOpacity>
);
const fi = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  thumb: {
    width: 62,
    height: 62,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emoji: { fontSize: 28 },
  info: { flex: 1 },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: C.textDark,
    marginBottom: 7,
  },
  pBg: {
    height: 4,
    backgroundColor: C.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  pFill: { height: 4, backgroundColor: C.teal, borderRadius: 2 },
  meta: { flexDirection: 'row', alignItems: 'center' },
  raised: { fontSize: 12, fontWeight: '700', color: C.teal },
  sep: { fontSize: 12, color: C.textLight },
  time: { fontSize: 12, color: C.textLight },
});

// Bottom tab bar
const BottomTabBar = ({ active, onPress }) => (
  <View style={tb.bar}>
    {[
      { id: 'home', icon: '⌂', label: 'Home' },
      { id: 'explore', icon: '⊙', label: 'Explore' },
    ].map(t => (
      <TouchableOpacity
        key={t.id}
        style={tb.tab}
        onPress={() => onPress(t.id)}
        activeOpacity={0.7}
      >
        <Text style={[tb.icon, active === t.id && tb.iconActive]}>
          {t.icon}
        </Text>
        <Text style={[tb.label, active === t.id && tb.labelActive]}>
          {t.label}
        </Text>
      </TouchableOpacity>
    ))}

    {/* FAB */}
    <View style={tb.fabWrap}>
      <TouchableOpacity onPress={() => onPress('add')} activeOpacity={0.85}>
        <LinearGradient colors={[C.teal, C.tealDark]} style={tb.fab}>
          <Text style={tb.fabIcon}>+</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>

    {[
      { id: 'saved', icon: '♡', label: 'Saved' },
      { id: 'me', icon: '◎', label: 'Me' },
    ].map(t => (
      <TouchableOpacity
        key={t.id}
        style={tb.tab}
        onPress={() => onPress(t.id)}
        activeOpacity={0.7}
      >
        <Text style={[tb.icon, active === t.id && tb.iconActive]}>
          {t.icon}
        </Text>
        <Text style={[tb.label, active === t.id && tb.labelActive]}>
          {t.label}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);
const tb = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    paddingBottom: 8,
    paddingTop: 6,
    paddingHorizontal: 6,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 2 },
  icon: { fontSize: 20, color: C.tabInactive, marginBottom: 2 },
  iconActive: { color: C.tabActive },
  label: { fontSize: 10, color: C.tabInactive },
  labelActive: { color: C.tabActive, fontWeight: '700' },
  fabWrap: { flex: 1, alignItems: 'center', marginTop: -22 },
  fab: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: C.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  fabIcon: { color: C.white, fontSize: 30, fontWeight: '300', lineHeight: 34 },
});

// ─────────────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────────────
const HomeScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [activeCat, setActiveCat] = useState('medical');
  const [searchText, setSearchText] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />
      <Animated.View style={[s.flex, { opacity: fadeAnim }]}>
        {/* Fixed top bar */}
        <TopBar />

        {/* Scrollable body */}
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Search */}
          <View style={s.searchWrap}>
            <Text style={s.searchIcon}>🔍</Text>
            <TextInput
              style={s.searchInput}
              placeholder="Search campaigns..."
              placeholderTextColor={C.textLight}
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          {/* Hero Banner */}
          <LinearGradient
            colors={[C.bannerTop, C.bannerBot]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.banner}
          >
            <View style={s.bannerCircle1} />
            <View style={s.bannerCircle2} />
            <Text style={s.bannerTitle}>{"Fund Someone's\nFuture Today"}</Text>
            <Text style={s.bannerSub}>{'100% goes to those in need'}</Text>
            <TouchableOpacity style={s.exploreBtn} activeOpacity={0.8}>
              <Text style={s.exploreTxt}>Explore →</Text>
            </TouchableOpacity>
          </LinearGradient>

          {/* Stats */}
          <View style={s.statsCard}>
            {[
              { val: 'PKR 15M', lbl: 'Raised' },
              { val: '5.2K', lbl: 'Donors' },
              { val: '320', lbl: 'Campaigns' },
            ].map((st, i) => (
              <View key={i} style={[s.statItem, i < 2 && s.statDiv]}>
                <Text style={s.statVal}>{st.val}</Text>
                <Text style={s.statLbl}>{st.lbl}</Text>
              </View>
            ))}
          </View>

          {/* Categories */}
          <SectionHeader title="Categories" linkText="See All" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.hScroll}
          >
            {CATEGORIES.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[s.catChip, activeCat === item.id && s.catChipActive]}
                onPress={() => setActiveCat(item.id)}
                activeOpacity={0.8}
              >
                <Text style={s.catIcon}>{item.icon}</Text>
                <Text
                  style={[
                    s.catLabel,
                    activeCat === item.id && s.catLabelActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Urgent Campaigns */}
          <SectionHeader title="🔥 Urgent Campaigns" linkText="See All →" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.hScroll}
          >
            {URGENT.map(item => (
              <UrgentCard key={item.id} item={item} />
            ))}
          </ScrollView>

          {/* Featured */}
          <SectionHeader title="⭐ Featured" linkText="See All" />
          <View style={s.featList}>
            {FEATURED.map(item => (
              <FeaturedItem key={item.id} item={item} />
            ))}
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>
      </Animated.View>

      {/* Bottom tab bar */}
      <BottomTabBar active={activeTab} onPress={setActiveTab} />
    </SafeAreaView>
  );
};

export default HomeScreen;

// ── Screen styles ──────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.white },
  flex: { flex: 1, backgroundColor: C.screenBg },
  scroll: { flex: 1 },
  content: { paddingBottom: 8 },

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.searchBg,
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 14,
    paddingHorizontal: 13,
    height: 42,
    borderWidth: 1,
    borderColor: C.border,
  },
  searchIcon: { fontSize: 13, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: C.textDark, paddingVertical: 0 },

  // Banner
  banner: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 22,
    paddingRight: 90,
    overflow: 'hidden',
    minHeight: 130,
    position: 'relative',
  },
  bannerCircle1: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 20,
    borderColor: 'rgba(255,255,255,0.08)',
    right: -20,
    top: -20,
  },
  bannerCircle2: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 14,
    borderColor: 'rgba(255,255,255,0.06)',
    right: 30,
    bottom: -20,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 27,
    marginBottom: 5,
    zIndex: 2,
  },
  bannerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.72)',
    marginBottom: 16,
    zIndex: 2,
  },
  exploreBtn: {
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.55)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    zIndex: 2,
  },
  exploreTxt: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },

  // Stats
  statsCard: {
    flexDirection: 'row',
    backgroundColor: C.white,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statDiv: { borderRightWidth: 1, borderRightColor: C.border },
  statVal: {
    fontSize: 16,
    fontWeight: '800',
    color: C.textDark,
    marginBottom: 2,
  },
  statLbl: { fontSize: 11, color: C.textLight },

  // Categories
  hScroll: { paddingHorizontal: 16, paddingBottom: 4 },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
    marginRight: 8,
    gap: 5,
  },
  catChipActive: { backgroundColor: C.teal, borderColor: C.teal },
  catIcon: { fontSize: 13 },
  catLabel: { fontSize: 13, fontWeight: '600', color: C.textGray },
  catLabelActive: { color: '#FFFFFF' },

  // Featured list
  featList: { paddingHorizontal: 16 },
});
