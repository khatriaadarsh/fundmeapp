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
 * 
 * Handles responseCode 023 (no saved campaigns) as valid empty response
 * even if axios throws it as an error
 */
export const getSavedCampaigns = async (userId) => {
  if (!userId) {
    console.error('🔴 [savedCampaignService] userId is required');
    throw new Error('userId is required');
  }

  const endpoint = ENDPOINTS.SAVED_CAMPAIGNS.LIST(userId);
  console.log(' [savedCampaignService] GET', endpoint);

  try {
    const res = await apiClient.get(endpoint);
    console.log('🟢 [savedCampaignService] Response:', res.data);
    
    // Check if backend returned 023 (no saved campaigns)
    if (res.data?.responseCode === '023') {
      console.log(' [savedCampaignService] No saved campaigns (023) - returning empty array');
      return {
        responseCode: '023',
        responseMessage: res.data.responseMessage || 'No saved campaigns',
        data: []
      };
    }

    // Return the raw response
    return res.data;
  } catch (error) {
    // ✅ CRITICAL FIX: Check if error contains 023 response
    const errorResponse = error?.response?.data || error?.raw || error;
    
    if (errorResponse?.responseCode === '023') {
      console.log('🟡 [savedCampaignService] Caught 023 error - treating as empty list');
      return {
        responseCode: '023',
        responseMessage: errorResponse.responseMessage || 'No saved campaigns',
        data: []
      };
    }
    
    // Real error - throw it
    console.error('🔴 [savedCampaignService] getSavedCampaigns error:', error.message);
    throw error;
  }
};

/**
 * Unsave a campaign
 * GET /unsaved/campaign/{favouriteId}
 */
export const unsaveCampaign = async (favouriteId) => {
  if (!favouriteId) {
    console.error(' [savedCampaignService] favouriteId is required');
    throw new Error('favouriteId is required');
  }

  const endpoint = ENDPOINTS.SAVED_CAMPAIGNS.UNSAVE(favouriteId);
  console.log('🔵 [savedCampaignService] GET (unsave)', endpoint);

  try {
    const res = await apiClient.get(endpoint);
    console.log('🟢 [savedCampaignService] Unsave response:', res.data);
    return res.data;
  } catch (error) {
    console.error('🔴 [savedCampaignService] unsaveCampaign error:', error.message);
    throw error;
  }
};

export { CATEGORY_COLORS, formatCurrency };