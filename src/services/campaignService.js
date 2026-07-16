// src/services/campaignService.js

import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { getUserId } from '../config/session';

export const getUrgentCampaigns = async ({ category } = {}) => {
  const params = {
    isUrgent: true,
  };

  if (category && category !== 'all') {
    params.category = category;
  }

  console.log('🟠 urgent campaigns params:', params);

  const res = await apiClient.get(ENDPOINTS.CAMPAIGNS.URGENT, {
    params,
  });

  console.log('🟢 urgent campaigns response:', res.data);

  return res.data;
};

// ─── All Campaigns (Explore Screen) ─────────────────────────
// GET /urgent-campaigns (no params - gets all)
// GET /urgent-campaigns?category=Flood (with category filter)
export const getAllCampaigns = async ({ category } = {}) => {
  const params = {};

  // Only add category if not 'all'
  if (category && category !== 'all') {
    params.category = category;
  }

  console.log('🟠 all campaigns params:', params);

  // Uses same endpoint as urgent but WITHOUT isUrgent=true
  const res = await apiClient.get(ENDPOINTS.CAMPAIGNS.URGENT, {
    params,
  });

  console.log('🟢 all campaigns response:', res.data);

  return res.data;
};

export const getMyCampaigns = async () => {
  const userId = getUserId();

  console.log('🟠 My Campaigns UserId:', userId);

  const res = await apiClient.get(
    `${ENDPOINTS.CAMPAIGNS.MY_CAMPAIGNS}/${userId}`,
  );

  console.log('🟢 My Campaigns Response:', res.data);

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
  console.log('🔵 [campaignService] Step1 payload:', payload);

  try {
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

    console.log('🟢 [campaignService] Step1 response:', res.data);
    return res.data;
  } catch (error) {
    console.error('🔴 [campaignService] Step1 error:', error.message);
    throw error;
  }
};

/**
 * Create/Update Campaign — Step 2 (Campaign Details)
 * POST /create-campaign  (multipart/form-data)
 * campaignId is mandatory here.
 */
export const createCampaignStep2 = async (payload) => {
  console.log('🔵 [campaignService] Step2 payload:', payload);

  try {
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

    console.log('🟢 [campaignService] Step2 response:', res.data);
    return res.data;
  } catch (error) {
    console.error('🔴 [campaignService] Step2 error:', error.message);
    throw error;
  }
};

/**
 * Create/Update Campaign — Step 3 (Photos & Documents)
 * POST /create-campaign  (multipart/form-data)
 * campaignId is mandatory here.
 *
 * payload.coverPhoto        -> { uri, name, type }
 * payload.additionalImages  -> [{ uri, name, type }, ...]
 * payload.campaignDocuments -> [{ uri, name, type }, ...]
 */
export const createCampaignStep3 = async (payload) => {
  console.log('🔵 [campaignService] Step3 payload:', {
    campaignId: payload.campaignId,
    hasCover: !!payload.coverPhoto,
    imageCount: payload.additionalImages?.length || 0,
    docCount: payload.campaignDocuments?.length || 0,
  });

  try {
    const formData = new FormData();
    formData.append('step', '3');
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

    const res = await apiClient.post(ENDPOINTS.CAMPAIGNS.CREATE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      transformRequest: (data) => data,
    });

    console.log('🟢 [campaignService] Step3 response:', res.data);
    return res.data;
  } catch (error) {
    console.error('🔴 [campaignService] Step3 error:', error.message);
    throw error;
  }
};

/**
 * Create/Update Campaign — Step 4 (Submit for Review)
 * POST /create-campaign  (multipart/form-data)
 * campaignId is mandatory here.
 *
 * ⚠️ ASSUMPTION: no explicit payload/endpoint was given for the final
 * submit action, so this follows the same step-based pattern as
 * steps 1-3 on the same /create-campaign endpoint. Confirm with backend
 * and adjust if the real contract differs.
 */
export const createCampaignStep4 = async (payload) => {
  console.log('🔵 [campaignService] Step4 (submit) payload:', payload);

  try {
    const formData = new FormData();
    formData.append('step', '4');
    formData.append('campaignId', String(payload.campaignId));

    const res = await apiClient.post(ENDPOINTS.CAMPAIGNS.CREATE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      transformRequest: (data) => data,
    });

    console.log('🟢 [campaignService] Step4 response:', res.data);
    return res.data;
  } catch (error) {
    console.error('🔴 [campaignService] Step4 error:', error.message);
    throw error;
  }
};

/**
 * Get Campaign Detail
 * GET /campaign/detail/{campaignId}
 */
export const getCampaignDetail = async (campaignId) => {
  if (!campaignId) {
    throw new Error('campaignId is required');
  }

  console.log('🔵 [campaignService] Getting campaign detail for campaignId:', campaignId);

  try {
    const res = await apiClient.get(ENDPOINTS.CAMPAIGNS.DETAIL(campaignId));
    console.log('🟢 [campaignService] Campaign detail response:', res.data);
    return res.data;
  } catch (error) {
    console.error('🔴 [campaignService] Get campaign detail error:', error.message);
    throw error;
  }
};