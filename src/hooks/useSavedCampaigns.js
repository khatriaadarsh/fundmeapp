// src/hooks/useSavedCampaigns.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSavedCampaigns,
  unsaveCampaign,
  saveCampaign,
  unsaveCampaignByCampaignId,
} from '../services/savedCampaignService';

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
      const response = await getSavedCampaigns(userId);

      if (response?.responseCode === '023') {
        return [];
      }

      if (response?.responseCode === '000' && Array.isArray(response?.data)) {
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

      return [];
    },
    enabled:        !!userId,
    refetchOnMount: true,
    staleTime:      0,
    retry:          false,
  });
};

/**
 * Hook to unsave a campaign by favouriteId
 */
export const useUnsaveCampaign = (userId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (favouriteId) => unsaveCampaign(favouriteId),
    onSuccess: (_data, _favouriteId) => {
      queryClient.invalidateQueries({
        queryKey: ['saved-campaigns', userId],
      });
    },
  });
};

/**
 * Hook to save a campaign by userId + campaignId
 */
export const useSaveCampaign = (userId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars) => saveCampaign(vars),
    onMutate: async ({ campaignId }) => {
      // Optimistically update all campaign lists to avoid UI flicker
      const queryKeys = ['urgent-campaigns', 'all-campaigns'];
      const previousData = [];

      queryKeys.forEach((key) => {
        const queries = queryClient.getQueriesData({ queryKey: [key] });
        queries.forEach(([queryKeyObj, oldData]) => {
          if (oldData && Array.isArray(oldData.campaigns)) {
            const newData = {
              ...oldData,
              campaigns: oldData.campaigns.map((c) =>
                c.campaignId === campaignId ? { ...c, isSaved: true } : c
              ),
            };
            queryClient.setQueryData(queryKeyObj, newData);
            previousData.push({ queryKeyObj, oldData });
          }
        });
      });

      return { previousData };
    },
    onError: (error, vars, context) => {
      // Revert cache on failure
      if (context?.previousData) {
        context.previousData.forEach(({ queryKeyObj, oldData }) => {
          queryClient.setQueryData(queryKeyObj, oldData);
        });
      }
    },
    onSettled: () => {
      // Refetch in background to ensure server sync
      queryClient.invalidateQueries({ queryKey: ['urgent-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['all-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['saved-campaigns', userId] });
    },
  });
};

/**
 * Hook to unsave a campaign by userId + campaignId
 */
export const useUnsaveCampaignByCampaignId = (userId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars) => unsaveCampaignByCampaignId(vars),
    onMutate: async ({ campaignId }) => {
      const queryKeys = ['urgent-campaigns', 'all-campaigns'];
      const previousData = [];

      queryKeys.forEach((key) => {
        const queries = queryClient.getQueriesData({ queryKey: [key] });
        queries.forEach(([queryKeyObj, oldData]) => {
          if (oldData && Array.isArray(oldData.campaigns)) {
            const newData = {
              ...oldData,
              campaigns: oldData.campaigns.map((c) =>
                c.campaignId === campaignId ? { ...c, isSaved: false } : c
              ),
            };
            queryClient.setQueryData(queryKeyObj, newData);
            previousData.push({ queryKeyObj, oldData });
          }
        });
      });

      return { previousData };
    },
    onError: (error, vars, context) => {
      if (context?.previousData) {
        context.previousData.forEach(({ queryKeyObj, oldData }) => {
          queryClient.setQueryData(queryKeyObj, oldData);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['urgent-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['all-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['saved-campaigns', userId] });
    },
  });
};