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
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
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

// ── API wiring ───────────────────────────────────────────────
import { useCreatorProfile } from '../../hooks/useCreator';

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
  red: '#EF4444',
};

// ── Tab definitions ──────────────────────────────────────────
const TABS = [
  { id: 'about', label: 'About' },
  { id: 'campaigns', label: 'Campaigns' },
  { id: 'reviews', label: 'Reviews' },
];

// ── Fallback used only if the profile API hasn't returned yet /
//    fails — keeps ProfileHeader/TrustBadges/StatsRow from ever
//    receiving `undefined`. ─────────────────────────────────────
const EMPTY_USER = {
  name: '',
  username: '',
  avatarUri: null,
  location: '',
  joinedDate: '',
  bio: '',
  trustScore: 0,
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
    paddingTop: STATUSBAR_H,
    paddingBottom: sp(10),
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
  const creatorId = route?.params?.creatorId
    ? String(route.params.creatorId)
    : null;

  const {
    data: creatorProfile,
    isLoading: profileLoading,
    isError: profileError,
    error: profileErrorObj,
    refetch: refetchProfile,
  } = useCreatorProfile(creatorId);

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

  const handleBack = useCallback(() => navigation?.goBack?.(), [navigation]);

  // Build the `user` object ProfileHeader expects — same shape it
  // always used, just sourced from the live API instead of mock data.
  const user = creatorProfile
    ? {
        name: creatorProfile.name,
        username: creatorProfile.nickName,
        avatarUri: creatorProfile.avatarUri,
        location: creatorProfile.location,
        joinedDate: creatorProfile.joinedDate,
        bio: '',
        trustScore: creatorProfile.trustScore,
      }
    : EMPTY_USER;

  // Render active tab content — each tab now fetches its own data
  // by creatorId, independent of the profile-summary fetch above.
  const renderTabContent = () => {
    switch (activeTab) {
      case 'about':
        return <AboutTab creatorId={creatorId} />;
      case 'campaigns':
        return (
          <CampaignsTab
            creatorId={creatorId}
            onCampaignPress={handleCampaignPress}
          />
        );
      case 'reviews':
        return <ReviewsTab creatorId={creatorId} />;
      default:
        return null;
    }
  };

  if (!creatorId) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={P.white} />
        <TopBar onBack={handleBack} onMenuPress={handleMenuPress} />
        <View style={s.centerState}>
          <Icons name="alert-triangle" size={sp(32)} color={P.red} />
          <Text style={s.centerStateTxt}>Missing creator reference.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (profileLoading) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={P.white} />
        <TopBar onBack={handleBack} onMenuPress={handleMenuPress} />
        <View style={s.centerState}>
          <ActivityIndicator size="large" color={P.teal} />
        </View>
      </SafeAreaView>
    );
  }

  if (profileError || !creatorProfile) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={P.white} />
        <TopBar onBack={handleBack} onMenuPress={handleMenuPress} />
        <View style={s.centerState}>
          <Icons name="alert-triangle" size={sp(32)} color={P.red} />
          <Text style={s.centerStateTxt}>
            {profileErrorObj?.message || 'Could not load this profile.'}
          </Text>
          <TouchableOpacity
            style={s.retryBtn}
            onPress={refetchProfile}
            activeOpacity={0.8}
          >
            <Text style={s.retryBtnTxt}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={P.white} />

      {/* ── Fixed top bar ──────────────────────────────── */}
      <TopBar onBack={handleBack} onMenuPress={handleMenuPress} />

      {/* ── Scrollable body ────────────────────────────── */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        stickyHeaderIndices={[2]}
      >
        {/* index 0 — Hero header */}
        <ProfileHeader user={user} />

        {/* index 1 — Trust badges + Stats (not sticky) */}
        <TrustBadges
          isVerified={creatorProfile.isVerified}
          cnicVerified={creatorProfile.cnicVerified}
          emailVerified={creatorProfile.emailVerified}
          phoneVerified={creatorProfile.phoneVerified}
        />

        <StatsRow
          campaignCount={creatorProfile.campaignCount}
          amountRaised={creatorProfile.amountRaised}
          totalDonors={creatorProfile.totalDonors}
          averageRating={creatorProfile.averageRating}
        />

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
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: sp(32),
  },
  centerStateTxt: {
    fontSize: sp(13),
    color: P.gray,
    textAlign: 'center',
    marginTop: sp(10),
  },
  retryBtn: {
    marginTop: sp(16),
    paddingHorizontal: sp(20),
    paddingVertical: sp(10),
    borderRadius: sp(50),
    backgroundColor: P.teal,
  },
  retryBtnTxt: { fontSize: sp(13), fontWeight: '700', color: P.white },
});
