// src/screens/donations/MyDonationsScreen.jsx
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/Feather';

import { sp } from '../../theme/theme';
import { DONATION_HISTORY } from '../../constants/mockData';
import EmptyState from '../../components/shared/EmptyState';
// import SummaryBanner from '../../components/donations/SummaryBanner';
import SummaryBanner from './SummaryBanner';
// import FilterTabs from '../../components/donations/FilterTabs';
import FilterTabs from '../../components/shared/FilterTabs';
// import DonationCard from '../../components/donations/DonationCard';
import DonationCard from './DonationCard';

const TABS = ['All', 'Completed', 'Pending'];
const PAGE_BG = '#F4F6F9';

const MyDonationsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('All');

  // 1. Memoize Calculations & Filtering
  const stats = useMemo(() => {
    const completed = DONATION_HISTORY.filter(d => d.status === 'Completed');
    const total = completed.reduce((s, d) => s + d.amount, 0);
    return { count: completed.length, total };
  }, []);

  const filteredData = useMemo(() => {
    if (activeTab === 'All') return DONATION_HISTORY;
    return DONATION_HISTORY.filter(d => d.status === activeTab);
  }, [activeTab]);

  const handleBack = useCallback(() => navigation?.goBack?.(), [navigation]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={PAGE_BG} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
           <Icons name="arrow-left" size={sp(22)} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Donations</Text>
        <View style={{width: sp(32)}} /> 
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <DonationCard item={item} />}
        ItemSeparatorComponent={() => <View style={{height: sp(2)}} />}
        
        ListHeaderComponent={
          <>
            <SummaryBanner totalAmount={stats.total} totalCount={stats.count} />
            <FilterTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
          </>
        }

        ListEmptyComponent={
          <EmptyState 
             icon="inbox" 
             title={`No ${activeTab} Donations`} 
             subtitle="We couldn't find any donations matching this filter." 
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PAGE_BG },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sp(16),
    paddingVertical: sp(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    backgroundColor: PAGE_BG,
  },
  headerTitle: { fontSize: sp(17), fontWeight: '700', color: '#111827', letterSpacing: -0.2 },
  listContent: { paddingBottom: sp(32), flexGrow: 1 },
});

export default MyDonationsScreen;