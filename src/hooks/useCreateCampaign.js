// src/hooks/useCreateCampaign.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createCampaignStep1,
  createCampaignStep2,
  createCampaignStep3,
  createCampaignStep4,
  submitCampaignForReview,
  resubmitCampaignStep1,
  resubmitCampaignStep2,
  resubmitCampaignStep3,
} from '../services/campaignService';

export const useCreateCampaignStep1 = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCampaignStep1,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-campaigns'] });
    },
  });
};

export const useCreateCampaignStep2 = () => {
  return useMutation({
    mutationFn: createCampaignStep2,
  });
};

export const useCreateCampaignStep3 = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCampaignStep3,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-campaigns'] });
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
  });
};

/**
 * Final submit — flips the campaign from draft to PENDING review.
 *
 * The caches are only invalidated on a genuine "000": the backend
 * returns failures with HTTP 200 too, so refetching on every resolved
 * promise would refresh lists that never actually changed.
 */
export const useSubmitCampaignForReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (campaignId) => submitCampaignForReview(campaignId),
    retry: false,
    onSuccess: (body) => {
      if (body?.responseCode === '000') {
        queryClient.invalidateQueries({ queryKey: ['my-campaigns'] });
        queryClient.invalidateQueries({ queryKey: ['urgent-campaigns'] });
        queryClient.invalidateQueries({ queryKey: ['all-campaigns'] });
      }
    },
  });
};

// ─── Resubmit after rejection ───────────────────────────────
// Separate hooks from the create ones so the normal creation flow keeps
// its exact behaviour and cannot accidentally hit a resubmit endpoint.

/**
 * Matched by predicate rather than an exact key, because the
 * notification list is keyed with the userId and this module has no
 * business knowing it. Refetching is what flips the rejection card from
 * clickable to handled — the backend sets isClickable=false during the
 * resubmit, so a stale list would keep the card live.
 */
const invalidateNotifications = queryClient => {
  queryClient.invalidateQueries({
    predicate: query =>
      String(query.queryKey?.[0] ?? '')
        .toLowerCase()
        .includes('notification'),
  });
};

const invalidateAfterResubmit = (queryClient, body, campaignId) => {
  if (body?.responseCode && body.responseCode !== '000') return;

  queryClient.invalidateQueries({ queryKey: ['my-campaigns'] });
  queryClient.invalidateQueries({ queryKey: ['urgent-campaigns'] });
  queryClient.invalidateQueries({ queryKey: ['all-campaigns'] });

  if (campaignId) {
    queryClient.invalidateQueries({
      queryKey: ['campaign-detail', String(campaignId)],
    });
  }

  invalidateNotifications(queryClient);
};

export const useResubmitCampaignStep1 = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resubmitCampaignStep1,
    retry: false,
    onSuccess: (body, variables) =>
      invalidateAfterResubmit(queryClient, body, variables?.campaignId),
  });
};

export const useResubmitCampaignStep2 = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resubmitCampaignStep2,
    retry: false,
    onSuccess: (body, variables) =>
      invalidateAfterResubmit(queryClient, body, variables?.campaignId),
  });
};

export const useResubmitCampaignStep3 = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: resubmitCampaignStep3,
    retry: false,
    onSuccess: (body, variables) =>
      invalidateAfterResubmit(queryClient, body, variables?.campaignId),
  });
};