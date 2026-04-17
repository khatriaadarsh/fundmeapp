// src/screens/campaigns/MyCampaignsScreen.jsx
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/Feather';

import { P, sp } from '../../theme/theme';
import { MY_CAMPAIGNS_DATA, CAMPAIGN_TABS } from '../../constants/mockData';
import EmptyState from '../../components/shared/EmptyState';
import FilterTabs from '../../components/shared/FilterTabs';
import CampaignCard from './CampaignCard';

const MyCampaignsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('All');

  // Memoize filtering logic
  const filteredData = useMemo(() => {
    if (activeTab === 'All') return MY_CAMPAIGNS_DATA;
    return MY_CAMPAIGNS_DATA.filter(c => c.status === activeTab);
  }, [activeTab]);

  const handleAction = useCallback((action, item) => {
    console.warn(`Action: ${action} on ID: ${item.id}`);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={P.bg} />

      {/* ✅ INTEGRATED HEADER - Matches MyDonationsScreen EXACTLY */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
           <Icons name="arrow-left" size={sp(22)} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Campaigns</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreateCampaign')}>
          <Text style={styles.newBtn}>+ New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredData || []} 
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        
        renderItem={({ item }) => (
          <CampaignCard item={item} onAction={(act) => handleAction(act, item)} />
        )}
        
        ItemSeparatorComponent={() => <View style={{height: sp(6)}} />}
        
        ListHeaderComponent={
          <View style={styles.tabContainer}>
            {/* ✅ SPACER: Replaces the gap you felt was missing */}
            <View style={styles.topSpacer} />
            
            <FilterTabs tabs={CAMPAIGN_TABS} active={activeTab} onChange={setActiveTab} />
          </View>
        }

        ListEmptyComponent={
          <EmptyState icon="folder" title={`No ${activeTab} Campaigns`} subtitle="We couldn't find any matching campaigns." />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // ✅ MATCHED: Uses P.bg to blend seamlessly (Just like Donations used PAGE_BG)
  safe: { flex: 1, backgroundColor: P.bg },
  
  // ✅ MATCHED: Copied exact properties from MyDonationsScreen
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sp(16),
    paddingVertical: sp(12),
    borderBottomWidth: StyleSheet.hairlineWidth, // Exact property for subtle line
    borderBottomColor: '#E5E7EB',              // Exact color
    backgroundColor: P.bg,                     // Matches body background
  },
  
  headerTitle: { fontSize: sp(17), fontWeight: '700', color: '#111827', letterSpacing: -0.2 },
  newBtn: { fontSize: sp(14), fontWeight: '700', color: P.teal }, // Using Theme Teal
  
  // ✅ FIXED: Removed unnecessary paddingTop here to prevent jumpiness
  listContent: { paddingBottom: sp(32), flexGrow: 1 }, 
  
  tabContainer: { marginBottom: sp(14) },
  
  // NEW: Creates consistent gap between Header and Tabs
  topSpacer: { height: sp(16) },
});

export default MyCampaignsScreen;