// src/services/campaignService.js

import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { getUserId } from '../config/session';

export const getUrgentCampaigns = async ({ category } = {}) => {
  const params = { isUrgent: true };

  if (category && category !== 'all') {
    params.category = category;
  }

  const res = await apiClient.get(ENDPOINTS.CAMPAIGNS.URGENT, { params });
  return res.data;
};

// ─── All Campaigns (Explore Screen) ─────────────────────────
export const getAllCampaigns = async ({ category } = {}) => {
  const params = {};

  if (category && category !== 'all') {
    params.category = category;
  }

  const res = await apiClient.get(ENDPOINTS.CAMPAIGNS.URGENT, { params });
  return res.data;
};

export const getMyCampaigns = async () => {
  const userId = getUserId();

  const res = await apiClient.get(
    `${ENDPOINTS.CAMPAIGNS.MY_CAMPAIGNS}/${userId}`,
  );

  return res.data;
};

export const getCategories = async () => {
  const res = await apiClient.get(ENDPOINTS.CATEGORY.LIST);
  return res.data;
};

/**
 * Create/Update Campaign — Step 1 (Basic Info)
 * POST /create-campaign  (multipart/form-data)
 *
 * Fresh campaign  -> sends userId, no campaignId
 * Existing (edit) -> sends campaignId, no userId
 */
export const createCampaignStep1 = async (payload) => {
  const formData = new FormData();
  formData.append('step', '1');

  if (payload.campaignId) {
    formData.append('campaignId', String(payload.campaignId));
  } else {
    formData.append('userId', String(payload.userId));
  }

  formData.append('title', payload.title);
  formData.append('category', payload.category);
  formData.append('fundingGoal', String(payload.fundingGoal));
  formData.append('endDate', payload.endDate);
  formData.append('isUrgent', String(payload.isUrgent));

  const res = await apiClient.post(ENDPOINTS.CAMPAIGNS.CREATE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    transformRequest: (data) => data,
  });

  return res.data;
};

/**
 * Create/Update Campaign — Step 2 (Campaign Details)
 * POST /create-campaign  (multipart/form-data)
 */
export const createCampaignStep2 = async (payload) => {
  const formData = new FormData();
  formData.append('step', '2');
  formData.append('campaignId', String(payload.campaignId));
  formData.append('shortDescription', payload.shortDescription);
  formData.append('description', payload.description);
  formData.append('beneficiaryName', payload.beneficiaryName);
  formData.append('relationships', payload.relationships);
  formData.append('city', payload.city);
  formData.append('province', payload.province);

  const res = await apiClient.post(ENDPOINTS.CAMPAIGNS.CREATE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    transformRequest: (data) => data,
  });

  return res.data;
};

/**
 * Shared media/document body for step 3.
 *
 * Create and resubmit hit different endpoints but carry an identical
 * file payload, so the builder is shared to keep the two in sync — the
 * only difference is the `step` field, which resubmit doesn't send.
 */
const buildStep3FormData = (payload, includeStepField) => {
  const formData = new FormData();

  if (includeStepField) {
    formData.append('step', '3');
  }

  formData.append('campaignId', String(payload.campaignId));

  if (payload.coverPhoto) {
    formData.append('coverPhoto', {
      uri: payload.coverPhoto.uri,
      name: payload.coverPhoto.name || 'cover.jpg',
      type: payload.coverPhoto.type || 'image/jpeg',
    });
  }

  if (Array.isArray(payload.additionalImages)) {
    payload.additionalImages.forEach((img, idx) => {
      formData.append('additionalImages', {
        uri: img.uri,
        name: img.name || `additional_${idx}.jpg`,
        type: img.type || 'image/jpeg',
      });
    });
  }

  if (Array.isArray(payload.campaignDocuments)) {
    payload.campaignDocuments.forEach((doc, idx) => {
      formData.append('campaignDocuments', {
        uri: doc.uri,
        name: doc.name || `document_${idx}`,
        type: doc.type || 'application/octet-stream',
      });
    });
  }

  return formData;
};

/**
 * Create/Update Campaign — Step 3 (Photos & Documents)
 * POST /create-campaign  (multipart/form-data)
 */
export const createCampaignStep3 = async (payload) => {
  const formData = buildStep3FormData(payload, true);

  const res = await apiClient.post(ENDPOINTS.CAMPAIGNS.CREATE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    transformRequest: (data) => data,
  });

  return res.data;
};

/**
 * Create/Update Campaign — Step 4
 * POST /create-campaign  (multipart/form-data)
 */
export const createCampaignStep4 = async (payload) => {
  const formData = new FormData();
  formData.append('step', '4');
  formData.append('campaignId', String(payload.campaignId));

  const res = await apiClient.post(ENDPOINTS.CAMPAIGNS.CREATE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    transformRequest: (data) => data,
  });

  return res.data;
};

/**
 * Get Campaign Detail
 * GET /campaign/detail/{campaignId}
 */
export const getCampaignDetail = async (campaignId) => {
  if (!campaignId) {
    throw new Error('campaignId is required');
  }

  const res = await apiClient.get(ENDPOINTS.CAMPAIGNS.DETAIL(campaignId));
  return res.data;
};

/**
 * Submit Campaign for Review
 * POST /campaign/{campaignId}/submit-review
 */
export const submitCampaignForReview = async (campaignId) => {
  if (!campaignId) {
    throw new Error('campaignId is required');
  }

  const res = await apiClient.post(
    ENDPOINTS.CAMPAIGNS.SUBMIT_REVIEW(campaignId),
  );

  return res.data;
};

// ─── Resubmit after rejection ───────────────────────────────
// Same data as the creation steps, different endpoints, and steps 1-2
// are JSON here rather than multipart.

/**
 * POST /campaigns/resubmit/step-1  (application/json)
 */
export const resubmitCampaignStep1 = async (payload) => {
  if (!payload?.campaignId) {
    throw new Error('campaignId is required');
  }

  const res = await apiClient.post(ENDPOINTS.CAMPAIGNS.RESUBMIT_STEP1, {
    campaignId: Number(payload.campaignId),
    title: payload.title,
    category: payload.category,
    fundingGoal: Number(payload.fundingGoal),
    endDate: payload.endDate,
    isUrgent: !!payload.isUrgent,
  });

  return res.data;
};

/**
 * POST /campaigns/resubmit/step-2  (application/json)
 */
export const resubmitCampaignStep2 = async (payload) => {
  if (!payload?.campaignId) {
    throw new Error('campaignId is required');
  }

  const res = await apiClient.post(ENDPOINTS.CAMPAIGNS.RESUBMIT_STEP2, {
    campaignId: Number(payload.campaignId),
    shortDescription: payload.shortDescription,
    description: payload.description,
    beneficiaryName: payload.beneficiaryName,
    relationships: payload.relationships,
    province: payload.province,
    city: payload.city,
  });

  return res.data;
};

/**
 * POST /campaigns/resubmit/step-3  (multipart/form-data)
 */
export const resubmitCampaignStep3 = async (payload) => {
  if (!payload?.campaignId) {
    throw new Error('campaignId is required');
  }

  const formData = buildStep3FormData(payload, false);

  const res = await apiClient.post(
    ENDPOINTS.CAMPAIGNS.RESUBMIT_STEP3,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      transformRequest: (data) => data,
    },
  );

  return res.data;
};