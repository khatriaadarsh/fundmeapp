// src/screens/home/HomeScreen.jsx

import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  StatusBar, 
  Text,
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { P, sp } from '../../theme/theme';
import { FEATURED } from '../../constants/mockData';

import TopBar          from '../../components/TopBar';
import SearchBar       from '../../components/SearchBar';
import HeroBanner      from '../../components/HeroBanner';
import StatsRow        from '../../components/StatsRow';
import SectionHeader   from '../../components/SectionHeader';
import CategoryChips   from '../../components/shared/CategoryChips';
import UrgentCard      from '../../components/UrgentCard';
import FeaturedItem    from '../../components/FeaturedItem';

import { useAppContext } from '../../context/AppContext';
import {
  URGENT_CAMPAIGN_LIMIT,
  useCategories,
  useUrgentCampaigns,
} from '../../hooks/useCampaign';

const HomeScreen = ({ navigation }) => {
  const { currentUser } = useAppContext();

  const [activeCat, setActiveCat] = useState('all');
  const [search,    setSearch]    = useState('');

  const {
    data: categories = [{ id: 'all', name: 'All', label: 'All' }],
    isLoading: categoriesLoading,
  } = useCategories();

  const {
    data: urgentData = { campaigns: [], isNotFound: false, message: '' },
    isLoading: urgentLoading,
    isError: urgentError,
  } = useUrgentCampaigns({
    category: activeCat,
    limit: URGENT_CAMPAIGN_LIMIT,
  });

  // Build user object for TopBar from real API data
  const user = useMemo(() => {
    const firstName = currentUser?.firstName || '';
    const lastName  = currentUser?.lastName  || '';
    const fullName  = `${firstName} ${lastName}`.trim() || 'User';

    return {
      name:      fullName,
      avatarUri: currentUser?.profileImage || null,
      role:      currentUser?.role || 'user',
    };
  }, [currentUser]);

  const isCreator = (currentUser?.role || '').toLowerCase() === 'creator';

  const handleCatChange    = useCallback((id)   => setActiveCat(id), []);
  const handleSearchChange = useCallback((text) => setSearch(text),  []);

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
  const handleCampaignPress = useCallback((campaign) => {
    navigation.navigate('CampaignDetailScreen', { 
      campaignId: campaign.campaignId,
      campaign: campaign.raw 
    });
  }, [navigation]);

  // Render urgent campaigns section — vertical stacked list (image-left cards)
  const renderUrgentCampaigns = () => {
    if (urgentLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={P.teal} />
          <Text style={styles.loadingText}>Loading urgent campaigns...</Text>
        </View>
      );
    }

    if (urgentError) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>⚠️</Text>
          <Text style={styles.emptyTitle}>Something went wrong</Text>
          <Text style={styles.emptySubtitle}>Unable to load urgent campaigns</Text>
        </View>
      );
    }

    // Handle "Not Found" response code 023 or empty campaigns
    if (urgentData?.isNotFound || urgentData?.campaigns?.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>Not Found</Text>
          <Text style={styles.emptySubtitle}>
            {urgentData?.message || 'Campaign not found'}
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.urgentList}>
        {urgentData.campaigns.map((item) => (
          <UrgentCard 
            key={item.id} 
            item={item} 
            onPress={handleCampaignPress}
          />
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
        bounces={false}
        overScrollMode="never"
      >
        <SearchBar value={search} onChange={handleSearchChange} />
        <HeroBanner />

        <StatsRow />

        <SectionHeader
          title="Categories"
          linkText="See All"
          onPress={handleSeeAll}
        />

        {categoriesLoading ? (
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
          onPress={() => navigation.navigate('UrgentCampaignsScreen')}
        />

        {renderUrgentCampaigns()}

        <SectionHeader
          title="⭐ Featured"
          linkText="See All"
          onPress={() => {}}
        />

        <View style={styles.featuredList}>
          {FEATURED.map((item) => (
            <FeaturedItem key={item.id} item={item} />
          ))}
        </View>
      </ScrollView>
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
});

export default HomeScreen;