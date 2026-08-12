// src/services/savedCampaignService.js
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

const CATEGORY_COLORS = {
  Medical: '#EF4444',
  Education: '#3B82F6',
  Emergency: '#F59E0B',
  Food: '#10B981',
  Flood: '#00B4CC',
  Shelter: '#EC4899',
  Default: '#00B4CC',
};

const formatCurrency = (amount) => {
  if (amount == null || isNaN(amount)) return '0';
  return Number(amount).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

/**
 * Fetch saved campaigns for a user
 * GET /saved/campaign/{userId}
 */
export const getSavedCampaigns = async (userId) => {
  if (!userId) {
    throw new Error('userId is required');
  }

  const endpoint = ENDPOINTS.SAVED_CAMPAIGNS.LIST(userId);

  try {
    const res = await apiClient.get(endpoint);

    if (res.data?.responseCode === '023') {
      return {
        responseCode: '023',
        responseMessage: res.data.responseMessage || 'No saved campaigns',
        data: [],
      };
    }

    return res.data;
  } catch (error) {
    const errorResponse = error?.response?.data || error?.raw || error;

    if (errorResponse?.responseCode === '023') {
      return {
        responseCode: '023',
        responseMessage: errorResponse.responseMessage || 'No saved campaigns',
        data: [],
      };
    }

    throw error;
  }
};

/**
 * Unsave a campaign by favouriteId
 * GET /unsaved/campaign/{favouriteId}
 */
export const unsaveCampaign = async (favouriteId) => {
  if (!favouriteId) {
    throw new Error('favouriteId is required');
  }

  const endpoint = ENDPOINTS.SAVED_CAMPAIGNS.UNSAVE(favouriteId);

  try {
    const res = await apiClient.get(endpoint);
    return res.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Save a campaign 
 * POST /api/v1/save/campaign
 */
export const saveCampaign = async ({ userId, campaignId }) => {
  if (!userId || !campaignId) {
    throw new Error('userId and campaignId are required');
  }

  const endpoint = '/save/campaign';

  try {
    const res = await apiClient.post(endpoint, { userId, campaignId });
    const data = res.data;

    if (data?.responseCode && data.responseCode !== '000') {
      throw new Error(data.responseMessage || 'Failed to save campaign');
    }

    return data;
  } catch (error) {
    const errorData = error?.response?.data;
    if (errorData?.responseMessage) {
      throw new Error(errorData.responseMessage);
    }
    throw error;
  }
};

/**
 * Unsave a campaign by campaignId
 * GET /api/v1/campaign/{campaignId}/unsave?userId={userId}
 */
export const unsaveCampaignByCampaignId = async ({ userId, campaignId }) => {
  if (!userId || !campaignId) {
    throw new Error('userId and campaignId are required');
  }

  const endpoint = `/campaign/${campaignId}/unsave?userId=${userId}`;

  try {
    const res = await apiClient.get(endpoint);
    const data = res.data;

    if (data?.responseCode && data.responseCode !== '000') {
      throw new Error(data.responseMessage || 'Failed to unsave campaign');
    }

    return data;
  } catch (error) {
    const errorData = error?.response?.data;
    if (errorData?.responseMessage) {
      throw new Error(errorData.responseMessage);
    }
    throw error;
  }
};

export { CATEGORY_COLORS, formatCurrency };