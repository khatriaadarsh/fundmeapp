// src/hooks/useSavedCampaigns.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSavedCampaigns, unsaveCampaign } from '../services/savedCampaignService';

const CATEGORY_COLORS = {
  Medical:   '#EF4444',
  Education: '#3B82F6',
  Emergency: '#F59E0B',
  Food:      '#10B981',
  Flood:     '#00B4CC',
  Shelter:   '#EC4899',
  Default:   '#00B4CC',
};

const formatCurrency = (amount) => {
  if (amount == null || isNaN(amount)) return '0';
  return Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

/**
 * Hook to fetch saved campaigns
 */
export const useSavedCampaigns = (userId) => {
  return useQuery({
    queryKey: ['saved-campaigns', userId],
    queryFn: async () => {
      console.log(' [useSavedCampaigns] Fetching for userId:', userId);
      
      const response = await getSavedCampaigns(userId);

      // 023 = No saved campaigns — valid response, return empty array
      if (response?.responseCode === '023') {
        console.log('🟡 [useSavedCampaigns] No saved campaigns (023), returning []');
        return [];
      }

      // 000 = Success with data
      if (response?.responseCode === '000' && Array.isArray(response?.data)) {
        console.log(' [useSavedCampaigns] Mapping', response.data.length, 'campaigns');
        
        return response.data.map((item) => {
          const raisedNum = Number(item.totalRaised || 0);
          const goalNum   = Number(item.fundingGoal || 1);
          const pctVal    = Math.min(Math.round((raisedNum / goalNum) * 100), 100);
          const catName   = item.category || 'General';
          
          return {
            id:          String(item.favouriteId),
            favouriteId: Number(item.favouriteId),
            campaignId:  item.campaignId,
            imageUri:    item.coverImage || null,
            title:       item.campaignTitle || 'Campaign',
            category:    catName.toLowerCase(),
            catColor:    CATEGORY_COLORS[catName] || CATEGORY_COLORS.Default,
            raised:      formatCurrency(raisedNum),
            goal:        formatCurrency(goalNum),
            pct:         pctVal,
            user:        item.beneficiaryName || 'Anonymous',
            verified:    true,
            raw:         item,
          };
        });
      }

      // Fallback: return empty array
      console.log('🟡 [useSavedCampaigns] Unexpected response, returning []');
      return [];
    },
    enabled:        !!userId,
    refetchOnMount: true,
    staleTime:      0,
    retry:          false, // Don't retry on 023
  });
};

/**
 * Hook to unsave a campaign
 * Accepts userId for proper cache invalidation
 */
export const useUnsaveCampaign = (userId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (favouriteId) => unsaveCampaign(favouriteId),
    onSuccess: (_data, favouriteId) => {
      console.log(' [useUnsaveCampaign] Success for favouriteId:', favouriteId);
      
      // Invalidate cache for this user's saved campaigns
      queryClient.invalidateQueries({ 
        queryKey: ['saved-campaigns', userId] 
      });
    },
    onError: (error) => {
      console.warn('🔴 [useUnsaveCampaign] Error:', error.message);
    },
  });
};