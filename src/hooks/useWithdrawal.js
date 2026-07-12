// src/hooks/useWithdrawal.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCampaignWithdrawalSummary,
  submitWithdrawalRequest,
  getUserWithdrawalSummary, 
  getMyWithdrawals, 
} from '../services/withdrawalService';

/**
 * Hook to fetch campaign withdrawal summary
 * (availableFunds, totalRaised, campaignTitle, withdrawalAmount)
 */
export const useCampaignWithdrawalSummary = (campaignId) => {
  return useQuery({
    queryKey: ['withdrawal-summary', String(campaignId)],
    queryFn: async () => {
      console.log('🔵 [useWithdrawal] Fetching summary for campaignId:', campaignId);
      const response = await getCampaignWithdrawalSummary(campaignId);

      if (response?.responseCode === '000' && response?.data) {
        console.log('🟢 [useWithdrawal] Summary loaded:', response.data);
        return response.data;
      }

      throw new Error(response?.responseMessage || 'Failed to load withdrawal summary');
    },
    enabled: !!campaignId,
    staleTime: 1000 * 30,
  });
};

/**
 * Hook to submit a withdrawal request
 */
export const useSubmitWithdrawalRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitWithdrawalRequest,
    onSuccess: (data, variables) => {
      console.log('🟢 [useSubmitWithdrawalRequest] Success:', data);
      // Refresh the summary (available balance changes after a request)
      // and the campaigns list (status may change to reflect the request).
      if (variables?.campaignId) {
        queryClient.invalidateQueries({
          queryKey: ['withdrawal-summary', String(variables.campaignId)],
        });
      }
      queryClient.invalidateQueries({ queryKey: ['my-campaigns'] });
    },
    onError: (error) => {
      console.error('🔴 [useSubmitWithdrawalRequest] Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
    },
  });
};


/**
 * Hook to fetch the logged-in user's withdrawal statistics
 * (totalApprovedWithdrawal, totalPendingWithdrawals, totalRejectWithdrawal, withdrawalAmount)
 */
export const useUserWithdrawalSummary = (userId) => {
  return useQuery({
    queryKey: ['user-withdrawal-summary', String(userId)],
    queryFn: async () => {
      console.log('🔵 [useWithdrawal] Fetching user summary for userId:', userId);
      const response = await getUserWithdrawalSummary(userId);

      if (response?.responseCode === '000' && response?.data) {
        console.log('🟢 [useWithdrawal] User summary loaded:', response.data);
        return response.data;
      }

      throw new Error(response?.responseMessage || 'Failed to load withdrawal statistics');
    },
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
};

/**
 * Hook to fetch the logged-in user's withdrawal history
 */
export const useMyWithdrawals = (userId) => {
  return useQuery({
    queryKey: ['my-withdrawals', String(userId)],
    queryFn: async () => {
      console.log('🔵 [useWithdrawal] Fetching withdrawal history for userId:', userId);
      const response = await getMyWithdrawals(userId);

      if (response?.responseCode === '000' && Array.isArray(response?.data)) {
        console.log('🟢 [useWithdrawal] History loaded:', response.data.length, 'items');
        return response.data;
      }

      throw new Error(response?.responseMessage || 'Failed to load withdrawal history');
    },
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
};