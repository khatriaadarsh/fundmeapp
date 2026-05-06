// src/screens/home/HomeScreen.jsx

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { P, sp } from '../../theme/theme';
import { URGENT, FEATURED, CURRENT_USER } from '../../constants/mockData';

import TopBar from '../../components/TopBar';
import SearchBar from '../../components/SearchBar';
import HeroBanner from '../../components/HeroBanner';
import StatsRow from '../../components/StatsRow';
import SectionHeader from '../../components/SectionHeader';
import CategoryChips from '../../components/shared/CategoryChips';
import UrgentCard from '../../components/UrgentCard';
import FeaturedItem from '../../components/FeaturedItem';

const HomeScreen = ({ navigation }) => {
  const [activeCat, setActiveCat] = useState('all');
  const [search, setSearch] = useState('');

  const handleCatChange = useCallback(id => setActiveCat(id), []);
  const handleSearchChange = useCallback(text => setSearch(text), []);

  const openProfile = useCallback(() => {
    navigation?.navigate?.('ProfileTab');
  }, [navigation]);

  const handleSeeAll = () => {
    navigation.navigate('ExploreScreen');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={P.white} />
      <TopBar
        user={CURRENT_USER}
        onAvatarPress={openProfile}
        onBellPress={() => {
          /* Handle notification press */
        }}
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
        <CategoryChips active={activeCat} onChange={handleCatChange} />

        {/* ✅ FIX: "linkText" is now identical to the one above, ensuring perfect alignment. */}
        <SectionHeader
          title="🔥 Urgent Campaigns"
          linkText="See All"
          onPress={() => {}}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {URGENT.map(item => (
            <UrgentCard key={item.id} item={item} />
          ))}
        </ScrollView>

        <SectionHeader
          title="⭐ Featured"
          linkText="See All"
          onPress={() => {}}
        />
        <View style={styles.featuredList}>
          {FEATURED.map(item => (
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
  horizontalList: {
    paddingLeft: sp(16),
    paddingRight: sp(2),
  },
  featuredList: {
    paddingHorizontal: sp(16),
    backgroundColor: P.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: P.border,
  },
});

export default HomeScreen;
