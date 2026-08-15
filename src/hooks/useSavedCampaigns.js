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
 * Pulls the response code out of whatever shape the rejection arrives in.
 *
 * The client rejects with three different shapes depending on where the
 * failure happened — an axios error, a pre-unwrapped { code, raw }, or a
 * plain Error — so reading only error.response.data misses two of them.
 */
const readResponseCode = (error) => {
  const body = error?.response?.data || error?.raw || error;
  return String(body?.responseCode ?? error?.code ?? '');
};

/**
 * "023" = record not found.
 *
 * For a save/unsave that's the state the user asked for, so it's absorbed
 * as success here rather than escaping to onError. Doing it in the hook
 * (not just the service) keeps the behaviour correct even if the service
 * or an interceptor changes how it reports that code.
 */
const isNotFoundCode = (error) => readResponseCode(error) === '023';

/**
 * Response codes that mean "nothing matched", not "something broke".
 *
 * The saved-campaigns endpoint returns one of these once a user unsaves
 * their last item. Treating them as an empty array — rather than letting
 * them escape as a query error — is what keeps the screen on its empty
 * state instead of throwing an error dialog over it.
 */
const EMPTY_RESULT_CODES = ['023', '024', '404'];

const readResponseBody = (source) =>
  source?.response?.data || source?.raw || source || null;

const isEmptyResultCode = (source) => {
  const body = readResponseBody(source);
  const code = String(body?.responseCode ?? source?.code ?? '');
  return EMPTY_RESULT_CODES.includes(code);
};

/**
 * Hook to fetch saved campaigns
 */
export const useSavedCampaigns = (userId) => {
  return useQuery({
    queryKey: ['saved-campaigns', userId],
    queryFn: async () => {
      try {
        const response = await getSavedCampaigns(userId);

        if (isEmptyResultCode(response)) {
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

        // A success code with no array, or any other shape, is still
        // just "no saved campaigns" as far as this screen is concerned.
        return [];
      } catch (error) {
        if (isEmptyResultCode(error)) return [];
        throw error;
      }
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
    mutationFn: async (favouriteId) => {
      try {
        return await unsaveCampaign(favouriteId);
      } catch (error) {
        if (isNotFoundCode(error)) return { responseCode: '023' };
        throw error;
      }
    },
    retry: false,
    onSuccess: () => {
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
    mutationFn: async (vars) => {
      try {
        return await saveCampaign(vars);
      } catch (error) {
        // Already saved — the heart is already where the user wants it.
        if (isNotFoundCode(error)) return { responseCode: '023' };
        throw error;
      }
    },
    retry: false,
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
                Number(c.campaignId) === Number(campaignId)
                  ? { ...c, isSaved: true }
                  : c,
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
      // Deliberately not returned: React Query awaits a promise returned
      // from a callback, and a refetch that rejects would then fail the
      // mutation itself — surfacing an error for a write that succeeded.
      queryClient.invalidateQueries({ queryKey: ['urgent-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['all-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['saved-campaigns', userId] });
    },
  });
};

/**
 * Hook to unsave a campaign by userId + campaignId
 */
/**
 * Hook to unsave a campaign by userId + campaignId
 */
export const useUnsaveCampaignByCampaignId = (userId) => {
  const queryClient = useQueryClient();

  return useMutation({
    /**
     * Swallows "not found" rather than rejecting.
     *
     * The row is gone either way — whether this call removed it or a
     * previous one already did — so surfacing a failure here reports a
     * problem the user cannot act on, over a screen that's already
     * showing the correct result.
     */
    mutationFn: async (vars) => {
      try {
        return await unsaveCampaignByCampaignId(vars);
      } catch (error) {
        if (isEmptyResultCode(error)) {
          return { responseCode: '023', handled: true };
        }
        throw error;
      }
    },
    retry: false,
    onMutate: async ({ campaignId }) => {
      const savedKey = ['saved-campaigns', userId];

      await queryClient.cancelQueries({ queryKey: savedKey });

      const previousData = [];

      const previousSaved = queryClient.getQueryData(savedKey);
      if (Array.isArray(previousSaved)) {
        queryClient.setQueryData(
          savedKey,
          previousSaved.filter(
            (c) => Number(c?.campaignId) !== Number(campaignId),
          ),
        );
        previousData.push({ queryKeyObj: savedKey, oldData: previousSaved });
      }

      const queryKeys = ['urgent-campaigns', 'all-campaigns'];

      queryKeys.forEach((key) => {
        const queries = queryClient.getQueriesData({ queryKey: [key] });
        queries.forEach(([queryKeyObj, oldData]) => {
          if (oldData && Array.isArray(oldData.campaigns)) {
            const newData = {
              ...oldData,
              campaigns: oldData.campaigns.map((c) =>
                Number(c.campaignId) === Number(campaignId)
                  ? { ...c, isSaved: false }
                  : c,
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
      // Not returned on purpose: React Query awaits a promise returned
      // from onSettled, so a refetch that rejects would fail a mutation
      // whose write already succeeded.
      queryClient.invalidateQueries({ queryKey: ['urgent-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['all-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['saved-campaigns', userId] });
    },
  });
};