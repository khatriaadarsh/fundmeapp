// src/screens/home/HomeScreen.jsx

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { P, sp } from '../../theme/theme';
import { FEATURED } from '../../constants/mockData';

import TopBar from '../../components/TopBar';
import SearchBar from '../../components/SearchBar';
import HeroBanner from '../../components/HeroBanner';
import StatsRow from '../../components/StatsRow';
import SectionHeader from '../../components/SectionHeader';
import CategoryChips from '../../components/shared/CategoryChips';
import UrgentCard from '../../components/UrgentCard';
import FeaturedItem from '../../components/FeaturedItem';
import RatingModal from '../../components/rating/RatingModal';

import { useAppContext } from '../../context/AppContext';
import {
  URGENT_CAMPAIGN_LIMIT,
  useCategories,
  useUrgentCampaigns,
} from '../../hooks/useCampaign';

const HomeScreen = ({ navigation }) => {
  const { currentUser } = useAppContext();

  const [activeCat, setActiveCat] = useState('all');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // ── TEMPORARY — for previewing RatingModal against the reference
  // screenshots only. Remove this block once you wire the real triggers:
  //   - "app" should open once per user, gated by a hasRatedApp flag
  //     you check on load (see chat notes for the exact pattern).
  //   - "creator" should open right after a successful donation, gated
  //     by a server-side can-rate check per (donorId, creatorId).
  const [ratingVisible, setRatingVisible] = useState(false);
  const [ratingContext, setRatingContext] = useState('app');

  const openRatingTest = useCallback(context => {
    setRatingContext(context);
    setRatingVisible(true);
  }, []);

  const handleRateNow = useCallback(() => {
    // Would open store link here
  }, []);

  const handleRatingSubmit = useCallback(async payload => {
    // Simulate a network call so the SUBMIT button's loading state is
    // visible during testing too.
    await new Promise(resolve => setTimeout(resolve, 600));
  }, []);

  const handleRatingClose = useCallback(reason => {
    setRatingVisible(false);
  }, []);
  // ── END TEMPORARY BLOCK ──────────────────────────────────────────

  const {
    data: categories = [{ id: 'all', name: 'All', label: 'All' }],
    isLoading: categoriesLoading,
    refetch: refetchCategories,
  } = useCategories();

  const {
    data: urgentData = { campaigns: [], isNotFound: false, message: '' },
    isLoading: urgentLoading,
    isError: urgentError,
    error: urgentErrorObj,
    refetch: refetchUrgentCampaigns,
  } = useUrgentCampaigns({
    category: activeCat,
    limit: URGENT_CAMPAIGN_LIMIT,
    userId: currentUser?.id,
    isUrgent: true,
  });

  // Build user object for TopBar from real API data
  const user = useMemo(() => {
    const firstName = currentUser?.firstName || '';
    const lastName = currentUser?.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim() || 'User';

    return {
      name: fullName,
      avatarUri: currentUser?.profileImage || null,
      role: currentUser?.role || 'user',
    };
  }, [currentUser]);

  const isCreator = (currentUser?.role || '').toLowerCase() === 'creator';

  const handleCatChange = useCallback(id => setActiveCat(id), []);
  const handleSearchChange = useCallback(text => setSearch(text), []);

  const openProfile = useCallback(() => {
    navigation?.navigate?.('ProfileTab');
  }, [navigation]);

  const openNotifications = useCallback(() => {
    if (isCreator) {
      navigation?.navigate?.('NotificationsScreen');
    } else {
      navigation?.navigate?.('NotificationsTab');
    }
  }, [navigation, isCreator]);

  const handleSeeAll = useCallback(() => {
    navigation.navigate('ExploreScreen');
  }, [navigation]);

  // Navigate to campaign details
  const handleCampaignPress = useCallback(
    campaign => {
      navigation.navigate('CampaignDetail', {
        campaignId: campaign.campaignId,
        campaign: campaign.raw,
      });
    },
    [navigation],
  );

  // Pull to refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchCategories(), refetchUrgentCampaigns()]);
    } catch (error) {
      // Error is handled by React Query states
    } finally {
      setRefreshing(false);
    }
  }, [refetchCategories, refetchUrgentCampaigns]);

  // Render urgent campaigns section — vertical stacked list (image-left cards)
  const renderUrgentCampaigns = () => {
    if (urgentLoading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={P.teal} />
          <Text style={styles.loadingText}>Loading urgent campaigns...</Text>
        </View>
      );
    }

    // "Campaign not found" (023) is a valid empty result, not a failure.
    // It can arrive two ways depending on the interceptor: mapped by the
    // hook's select into isNotFound, or rejected as an error carrying the
    // same code — so both paths are treated as empty rather than broken.
    const errorBody =
      urgentErrorObj?.response?.data || urgentErrorObj?.raw || null;

    const isNotFoundError =
      errorBody?.responseCode === '023' || urgentErrorObj?.code === '023';

    const isEmptyResult =
      urgentData?.isNotFound ||
      urgentData?.campaigns?.length === 0 ||
      isNotFoundError;

    if (isEmptyResult) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>Campaign Not Found</Text>
          <Text style={styles.emptySubtitle}>
            {errorBody?.responseMessage ||
              urgentData?.message ||
              'Campaign not found'}
          </Text>
        </View>
      );
    }

    if (urgentError) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>⚠️</Text>
          <Text style={styles.emptyTitle}>Something went wrong</Text>
          <Text style={styles.emptySubtitle}>
            {errorBody?.responseMessage ||
              urgentErrorObj?.message ||
              'Unable to load urgent campaigns'}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.urgentList}>
        {urgentData.campaigns.map(item => (
          <UrgentCard key={item.id} item={item} onPress={handleCampaignPress} />
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={P.white} />

      <TopBar
        user={user}
        onAvatarPress={openProfile}
        onBellPress={openNotifications}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[P.teal]}
            tintColor={P.teal}
          />
        }
      >
        <SearchBar value={search} onChange={handleSearchChange} />
        <HeroBanner onExplore={() => navigation.navigate('ExploreScreen')} />

        {/* userId + role passed from currentUser so StatsRow can fetch
            the right stats: /creator/statistics/{userId} for creators,
            /donor/summary/{userId} for everyone else. */}
        <StatsRow userId={currentUser?.id} role={currentUser?.role} />

        <SectionHeader
          title="Categories"
          linkText="See All"
          onPress={handleSeeAll}
        />

        {categoriesLoading && !refreshing ? (
          <ActivityIndicator style={styles.catLoading} color={P.teal} />
        ) : (
          <CategoryChips
            active={activeCat}
            onChange={handleCatChange}
            categories={categories}
          />
        )}

        <SectionHeader
          title="🔥 Urgent Campaigns"
          linkText="See All"
          onPress={() =>
            navigation.navigate('ExploreScreen', { category: activeCat })
          }
        />

        {renderUrgentCampaigns()}
      </ScrollView>

      {/* TEMPORARY test triggers — remove once real gating is wired up */}
      <View style={styles.testDock} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.testBtn}
          activeOpacity={0.85}
          onPress={() => openRatingTest('app')}
        >
          <Text style={styles.testBtnTxt}>Test: App Rating</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.testBtn, styles.testBtnAlt]}
          activeOpacity={0.85}
          onPress={() => openRatingTest('creator')}
        >
          <Text style={styles.testBtnTxt}>Test: Creator Rating</Text>
        </TouchableOpacity>
      </View>

      <RatingModal
        visible={ratingVisible}
        context={ratingContext}
        targetName="Ahmed Khan"
        onRateNow={handleRateNow}
        onSubmit={handleRatingSubmit}
        onClose={handleRatingClose}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: P.white,
  },
  scroll: {
    flex: 1,
    backgroundColor: P.bg,
  },
  content: {
    paddingBottom: sp(28),
  },
  urgentList: {
    paddingHorizontal: sp(16),
    paddingBottom: sp(4),
  },
  featuredList: {
    paddingHorizontal: sp(16),
    backgroundColor: P.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: P.border,
  },
  catLoading: {
    marginVertical: sp(12),
  },
  loadingContainer: {
    paddingVertical: sp(40),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: sp(200),
  },
  loadingText: {
    marginTop: sp(12),
    fontSize: sp(14),
    color: P.gray,
  },
  emptyContainer: {
    paddingVertical: sp(40),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: sp(200),
    paddingHorizontal: sp(20),
  },
  emptyIcon: {
    fontSize: sp(48),
    marginBottom: sp(12),
  },
  emptyTitle: {
    fontSize: sp(16),
    fontWeight: '700',
    color: P.dark,
    marginBottom: sp(6),
  },
  emptySubtitle: {
    fontSize: sp(13),
    color: P.light,
    textAlign: 'center',
  },
  // TEMPORARY — test dock styles, remove alongside the block above
  testDock: {
    position: 'absolute',
    right: sp(16),
    bottom: sp(24),
    gap: sp(10),
  },
  testBtn: {
    backgroundColor: '#0A3D62',
    paddingVertical: sp(10),
    paddingHorizontal: sp(16),
    borderRadius: sp(24),
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  testBtnAlt: {
    backgroundColor: '#15AABF',
  },
  testBtnTxt: {
    color: '#FFFFFF',
    fontSize: sp(12),
    fontWeight: '700',
  },
});

export default HomeScreen;
