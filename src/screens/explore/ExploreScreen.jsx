// src/screens/explore/ExploreScreen.jsx
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { P, sp } from '../../theme/theme';
import { MOCK_CAMPAIGNS } from '../../constants/mockData';

// Import all the new, reusable components
import SearchBarHeader from '../../components/explore/SearchBarHeader';
// import CategoryChips from '../../components/explore/CategoryChips';
import CategoryChips from '../../components/shared/CategoryChips';
import CampaignCard from '../../components/explore/CampaignCard';
import EmptyState from '../../components/shared/EmptyState';

const ExploreScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [activeCat, setActiveCat] = useState('all');

  // Memoized search results for performance
  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    let results = MOCK_CAMPAIGNS;

    // Filter by category first
    if (activeCat !== 'all') {
      results = results.filter(c => c.category === activeCat);
    }

    // Then filter by search query
    if (q) {
      results = results.filter(
        c => c.title.toLowerCase().includes(q) || c.user.toLowerCase().includes(q)
      );
    }
    return results;
  }, [query, activeCat]);

  // Handlers are kept in the container component
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
    navigation?.navigate?.('CampaignDetail', { id: item.id });
  }, [navigation]);

  const ListHeader = useCallback(() => (
    <View>
      <CategoryChips active={activeCat} onChange={handleCatChange} />
      <Text style={styles.resultCount}>
        {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} found
      </Text>
    </View>
  ), [activeCat, handleCatChange, filteredResults.length]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={P.white} />

      <SearchBarHeader
        query={query}
        onQueryChange={handleQueryChange}
        onCancel={handleCancel}
        onSearch={() => {}} // onSearch can be used for API calls in the future
      />

      <FlatList
        data={filteredResults}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <CampaignCard item={item} onPress={handleCardPress} />}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={<EmptyState query={query} />}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.listContent}
        bounces={false}
        overScrollMode="never"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: P.bg,
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
  },
});

export default ExploreScreen;