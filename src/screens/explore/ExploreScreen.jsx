// src/screens/explore/ExploreScreen.jsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { P, sp } from '../../theme/theme';

// Import components
import SearchBarHeader from '../../components/explore/SearchBarHeader';
import CategoryChips from '../../components/shared/CategoryChips';
import CampaignCard from '../../components/explore/CampaignCard';
import ResponseModal from '../../components/ResponseModal';

// Import hooks & context
import { useCategories, useAllCampaigns } from '../../hooks/useCampaign';
import { useAppContext } from '../../context/AppContext';

const ExploreScreen = ({ navigation }) => {
  const { currentUser } = useAppContext();
  
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });

  // Fetch categories from API
  const {
    data: categories = [{ id: 'all', name: 'All', label: 'All' }],
    isLoading: categoriesLoading,
    refetch: refetchCategories,
  } = useCategories();

  // Fetch all campaigns from API (isUrgent=false for explore screen)
  const {
    data: campaignsData = { campaigns: [], isNotFound: false, message: '' },
    isLoading: campaignsLoading,
    isError: campaignsError,
    error: campaignErrorObj,
    refetch: refetchCampaigns,
  } = useAllCampaigns({
    category: activeCat,
    userId: currentUser?.id,
    isUrgent: false,
  });

  // Show ResponseModal if API fetch fails
  useEffect(() => {
    if (campaignsError) {
      const backendMsg = campaignErrorObj?.response?.data?.responseMessage;
      setErrorModal({ 
        visible: true, 
        message: backendMsg || 'Unable to load campaigns. Please try again.' 
      });
    }
  }, [campaignsError, campaignErrorObj]);

  // Client-side search on API results
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    let results = campaignsData?.campaigns || [];

    if (q) {
      results = results.filter(
        c => 
          (c.title || '').toLowerCase().includes(q) || 
          (c.user || '').toLowerCase().includes(q) ||
          (c.category || '').toLowerCase().includes(q)
      );
    }
    return results;
  }, [query, campaignsData]);

  // Handlers
  const handleQueryChange = useCallback(text => {
    setQuery(text);
  }, []);

  const handleCatChange = useCallback(cat => {
    setActiveCat(cat);
  }, []);

  const handleCancel = useCallback(() => {
    setQuery('');
    setActiveCat('all');
  }, []);

  const handleCardPress = useCallback(item => {
    navigation?.navigate?.('CampaignDetail', { 
      campaignId: item.campaignId,
      campaign: item.raw 
    });
  }, [navigation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchCategories(),
        refetchCampaigns(),
      ]);
    } catch (e) {
      // Silently handle, error modal will catch it via useEffect
    } finally {
      setRefreshing(false);
    }
  }, [refetchCategories, refetchCampaigns]);

  // Render List Header with Category Chips
  const ListHeader = useCallback(() => (
    <View>
      {categoriesLoading && !refreshing ? (
        <ActivityIndicator style={styles.catLoading} color={P.teal} />
      ) : (
        <CategoryChips 
          active={activeCat} 
          onChange={handleCatChange} 
          categories={categories}
        />
      )}
      <Text style={styles.resultCount}>
        {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} found
      </Text>
    </View>
  ), [activeCat, handleCatChange, categories, categoriesLoading, filteredResults.length, refreshing]);

  // Render Empty State
  const renderEmptyState = useCallback(() => {
    if (campaignsLoading && !refreshing) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={P.teal} />
          <Text style={styles.loadingText}>Loading campaigns...</Text>
        </View>
      );
    }

    // Show "Not Found" for response code 023 or empty results
    if (campaignsData?.isNotFound || filteredResults.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>Not Found</Text>
          <Text style={styles.emptySubtitle}>
            {campaignsData?.message || 'No campaigns found'}
          </Text>
        </View>
      );
    }

    return <View style={styles.centerContainer} />;
  }, [campaignsLoading, campaignsData, filteredResults.length, refreshing]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={P.white} />

      <SearchBarHeader
        query={query}
        onQueryChange={handleQueryChange}
        onCancel={handleCancel}
        onSearch={() => {}}
      />

      <FlatList
        data={filteredResults}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <CampaignCard item={item} onPress={handleCardPress} />}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={[
          styles.listContent,
          filteredResults.length === 0 && styles.emptyListContent
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[P.teal]}
            tintColor={P.teal}
          />
        }
      />

      <ResponseModal
        visible={errorModal.visible}
        variant="error"
        title="Error"
        message={errorModal.message}
        onClose={() => setErrorModal({ visible: false, message: '' })}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: P.bg,
  },
  catLoading: {
    marginVertical: sp(12),
  },
  resultCount: {
    fontSize: sp(12),
    color: P.gray,
    fontWeight: '500',
    paddingHorizontal: sp(16),
    paddingBottom: sp(8),
  },
  listContent: {
    paddingBottom: sp(16),
    marginTop: sp(10),
  },
  emptyListContent: {
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: sp(60),
    paddingHorizontal: sp(20),
  },
  loadingText: {
    marginTop: sp(12),
    fontSize: sp(14),
    color: P.gray,
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

export default ExploreScreen;