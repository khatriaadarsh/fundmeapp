// src/screens/Profile/CreatorProfileScreen.jsx
// ─────────────────────────────────────────────────────────────
//  CreatorProfileScreen — Main screen
//
//  Architecture:
//  • Header bar (back arrow + title + 3-dot menu)  — FIXED
//  • ScrollView content:
//      - ProfileHeader (hero gradient)
//      - TrustBadges (overlaps hero)
//      - StatsRow
//      - Tab switcher  ← FIXED inside scroll via stickyHeaderIndices
//      - Tab content (About | Campaigns | Reviews)
//  • ReportModal (bottom sheet)
//
//  Tab switching is pure state — NO navigation, NO re-mount.
//  Only the content section below the tab bar changes.
// ─────────────────────────────────────────────────────────────

import React, { useState, useCallback, useRef, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/Feather';

// ── Components ───────────────────────────────────────────────
import ProfileHeader from './components/ProfileHeader';
import TrustBadges from './components/TrustBadges';
import StatsRow from './components/StatsRow';
import ReportModal from './components/ReportModal';

// ── Tabs ─────────────────────────────────────────────────────
import AboutTab from './tabs/AboutTab';
import CampaignsTab from './tabs/CampaignsTab';
import ReviewsTab from './tabs/ReviewsTab';

// ── Scale ────────────────────────────────────────────────────
const { width: SW } = Dimensions.get('window');
const sp = n => (SW / 375) * n;

const STATUSBAR_H =
  Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 0;

// ── Palette ──────────────────────────────────────────────────
const P = {
  darkOcean: '#0A3D62',
  teal: '#00B4CC',
  dark: '#111827',
  gray: '#6B7280',
  light: '#9CA3AF',
  white: '#FFFFFF',
  border: '#E5E7EB',
  bg: '#F4F5F7',
};

// ── Tab definitions ──────────────────────────────────────────
const TABS = [
  { id: 'about', label: 'About' },
  { id: 'campaigns', label: 'Campaigns' },
  { id: 'reviews', label: 'Reviews' },
];

// ── Mock user data — replace with route.params / API ────────
const MOCK_USER = {
  name: 'Sarah Ahmed',
  username: 'sarahahmed',
  avatarUri:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
  location: 'Karachi, Pakistan',
  joinedDate: 'March 2023',
  bio: "Passionate about helping families in need. I started FundMe campaigns in 2023 to support children's medical care in Pakistan. Every donation makes a real difference. Thank you for trusting our cause.",
  trustScore: 92,
};

// ════════════════════════════════════════════════════════════
//  TopBar — fixed header row
// ════════════════════════════════════════════════════════════
const TopBar = memo(({ onBack, onMenuPress }) => (
  <View style={tb.bar}>
    <TouchableOpacity
      style={tb.iconBtn}
      onPress={onBack}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      activeOpacity={0.7}
    >
      <Icons name="arrow-left" size={sp(22)} color={P.dark} />
    </TouchableOpacity>

    <Text style={tb.title}>Creator Profile</Text>

    <TouchableOpacity
      style={tb.iconBtn}
      onPress={onMenuPress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      activeOpacity={0.7}
    >
      <Icons name="more-vertical" size={sp(22)} color={P.dark} />
    </TouchableOpacity>
  </View>
));

const tb = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: P.white,
    paddingHorizontal: sp(16),
    paddingTop: sp(12) + STATUSBAR_H,
    paddingBottom: sp(12),
    borderBottomWidth: 1,
    borderBottomColor: P.border,
  },
  iconBtn: {
    width: sp(36),
    height: sp(36),
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: sp(16),
    fontWeight: '700',
    color: P.dark,
  },
});

// ════════════════════════════════════════════════════════════
//  TabSwitcher — sticky tab bar
// ════════════════════════════════════════════════════════════
const TabSwitcher = memo(({ active, onChange }) => (
  <View style={tbs.wrap}>
    {TABS.map(tab => {
      const isActive = active === tab.id;
      return (
        <TouchableOpacity
          key={tab.id}
          style={tbs.tab}
          onPress={() => onChange(tab.id)}
          activeOpacity={0.75}
        >
          <Text style={[tbs.label, isActive && tbs.labelActive]}>
            {tab.label}
          </Text>
          {isActive && <View style={tbs.indicator} />}
        </TouchableOpacity>
      );
    })}
  </View>
));

const tbs = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: P.white,
    borderBottomWidth: 1,
    borderBottomColor: P.border,
  },
  tab: {
    flex: 1,
    height: sp(48),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  label: {
    fontSize: sp(14),
    fontWeight: '500',
    color: P.light,
  },
  labelActive: {
    fontWeight: '700',
    color: P.darkOcean,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: sp(3),
    backgroundColor: P.teal,
    borderTopLeftRadius: sp(2),
    borderTopRightRadius: sp(2),
  },
});

// ════════════════════════════════════════════════════════════
//  CreatorProfileScreen — main
// ════════════════════════════════════════════════════════════
const CreatorProfileScreen = ({ navigation, route }) => {
  const user = route?.params?.user ?? MOCK_USER;

  const [activeTab, setActiveTab] = useState('about');
  const [modalVisible, setModalVisible] = useState(false);

  const handleTabChange = useCallback(id => setActiveTab(id), []);

  const handleMenuPress = useCallback(() => setModalVisible(true), []);
  const handleModalClose = useCallback(() => setModalVisible(false), []);

  const handleModalAction = useCallback(action => {
    // TODO: wire up report/block/share/copy actions
    console.log('Action:', action);
  }, []);

  const handleCampaignPress = useCallback(
    item => {
      navigation?.navigate?.('CampaignDetail', { id: item.id });
    },
    [navigation],
  );

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'about':
        return <AboutTab user={user} />;
      case 'campaigns':
        return <CampaignsTab onCampaignPress={handleCampaignPress} />;
      case 'reviews':
        return <ReviewsTab />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={P.white} />

      {/* ── Fixed top bar ──────────────────────────────── */}
      <TopBar
        onBack={() => navigation?.goBack?.()}
        onMenuPress={handleMenuPress}
      />

      {/* ── Scrollable body ────────────────────────────── */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        // stickyHeaderIndices={[2]} — tab switcher is index 2 in the list below
        stickyHeaderIndices={[2]}
      >
        {/* index 0 — Hero header */}
        <ProfileHeader user={user} />

        {/* index 1 — Trust badges + Stats (not sticky) */}
        <View>
          <TrustBadges />
          <StatsRow />
          <View style={{ height: sp(20) }} />
        </View>

        {/* index 2 — Tab switcher (STICKY) */}
        <TabSwitcher active={activeTab} onChange={handleTabChange} />

        {/* index 3 — Tab content */}
        <View style={s.tabContent}>{renderTabContent()}</View>
      </ScrollView>

      {/* ── Report / Options modal ─────────────────────── */}
      <ReportModal
        visible={modalVisible}
        onClose={handleModalClose}
        onAction={handleModalAction}
      />
    </SafeAreaView>
  );
};

export default CreatorProfileScreen;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: P.bg },
  scroll: { flex: 1 },
  content: { paddingBottom: sp(24) },
  tabContent: {
    backgroundColor: P.bg,
    minHeight: 400, // ensure scroll works when content is short
  },
});
