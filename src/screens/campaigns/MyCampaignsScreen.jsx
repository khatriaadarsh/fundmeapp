// src/screens/campaigns/MyCampaignsScreen.jsx

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/Feather';

import { P, sp } from '../../theme/theme';
import { CAMPAIGN_TABS } from '../../constants/mockData';
import EmptyState from '../../components/shared/EmptyState';
import FilterTabs from '../../components/shared/FilterTabs';
import CampaignCard from './CampaignCard';
// import { useMyCampaigns } from '../../hooks/useCampaigns';
import {useMyCampaigns} from '../../hooks/useCampaign';

const MyCampaignsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('All');

  // API
  const {data,isLoading,refetch,} = useMyCampaigns();
  const [refreshing, setRefreshing] = useState(false);

   const handleRefresh = useCallback(async () => {
  try {
    setRefreshing(true);
    await refetch();
  } finally {
    setRefreshing(false);
  }
}, [refetch]);
  

  // Memoize filtering logic
  const filteredData = useMemo(() => {
    const campaigns = data?.campaigns || [];

  

    if (activeTab === 'All') {
      return campaigns;
    }

    return campaigns.filter(c => c.status === activeTab);
  }, [activeTab, data]);

  const handleAction = useCallback(
    (action, item) => {
      switch (action) {
        case 'View':
          navigation.navigate('CampaignDetails', { campaign: item });
          break;

        case 'Update':
          navigation.navigate('CreateCampaign', {
            editMode: true,
            campaign: item,
          });
          break;

        case 'Withdraw':
          // campaignId comes straight from the campaign list item (item.id),
          // exactly as returned by the campaign service — RequestWithdrawalScreen
          // uses this to fetch the withdrawal summary and submit the request.
          navigation.navigate('RequestWithdrawalScreen', {
            campaignId: item.id,
            campaignTitle: item.title,
          });
          break;

        case 'Edit':
          navigation.navigate('CreateCampaign', {
            editMode: true,
            campaign: item,
          });
          break;

        case 'Delete':
          console.warn('Delete Campaign:', item.id);
          break;

        case 'Edit & Resubmit':
          navigation.navigate('CreateCampaign', {
            editMode: true,
            campaign: item,
            resubmit: true,
          });
          break;

        default:
          break;
      }
    },
    [navigation],
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={P.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icons name="arrow-left" size={sp(22)} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Campaigns</Text>

        <TouchableOpacity
          onPress={() => navigation.navigate('CreateCampaign')}
        >
          <Text style={styles.newBtn}>+ New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={item => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        renderItem={({ item }) => (
          <CampaignCard
            item={item}
            onAction={act => handleAction(act, item)}
          />
        )}
        ItemSeparatorComponent={() => <View style={{ height: sp(6) }} />}
        ListHeaderComponent={
          <View style={styles.tabContainer}>
            <View style={styles.topSpacer} />

            <FilterTabs
              tabs={CAMPAIGN_TABS}
              active={activeTab}
              onChange={setActiveTab}
            />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="folder"
            title={`No ${activeTab} Campaigns`}
            subtitle="We couldn't find any matching campaigns."
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: P.bg,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sp(16),
    paddingVertical: sp(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    backgroundColor: P.bg,
  },

  headerTitle: {
    fontSize: sp(17),
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.2,
  },

  newBtn: {
    fontSize: sp(14),
    fontWeight: '700',
    color: P.teal,
  },

  listContent: {
    paddingBottom: sp(32),
    flexGrow: 1,
  },

  tabContainer: {
    marginBottom: sp(14),
  },

  topSpacer: {
    height: sp(16),
  },
});

export default MyCampaignsScreen;