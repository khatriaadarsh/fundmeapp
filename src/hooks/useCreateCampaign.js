// src/hooks/useCreateCampaign.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createCampaignStep1,
  createCampaignStep2,
  createCampaignStep3,
createCampaignStep4,
} from '../services/campaignService';

export const useCreateCampaignStep1 = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCampaignStep1,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-campaigns'] });
    },
    onError: (error) => {
      console.error('🔴 [useCreateCampaignStep1] Error:', error.message);
    },
  });
};

export const useCreateCampaignStep2 = () => {
  return useMutation({
    mutationFn: createCampaignStep2,
    onError: (error) => {
      console.error('🔴 [useCreateCampaignStep2] Error:', error.message);
    },
  });
};

export const useCreateCampaignStep3 = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCampaignStep3,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-campaigns'] });
    },
    onError: (error) => {
      console.error('🔴 [useCreateCampaignStep3] Error:', error.message);
    },
  });
};

export const useCreateCampaignStep4 = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCampaignStep4,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-campaigns'] });
    },
    onError: (error) => {
      console.error('🔴 [useCreateCampaignStep4] Error:', error.message);
    },
  });
};