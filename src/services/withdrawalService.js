// src/services/withdrawalService.js
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

/**
 * Get Campaign Withdrawal Summary
 * GET /withdrawal/campaign/summary/{campaignId}
 */
export const getCampaignWithdrawalSummary = async (campaignId) => {
  if (!campaignId) {
    throw new Error('campaignId is required');
  }

  console.log('🔵 [withdrawalService] Getting summary for campaignId:', campaignId);

  try {
    const res = await apiClient.get(ENDPOINTS.WITHDRAWAL.CAMPAIGN_SUMMARY(campaignId));
    console.log('🟢 [withdrawalService] Summary response:', res.data);
    return res.data;
  } catch (error) {
    console.error('🔴 [withdrawalService] Get summary error:', error.message);
    throw error;
  }
};


/**
 * Get User Withdrawal Statistics
 * GET /withdrawal/user/summary/{userId}
 */
export const getUserWithdrawalSummary = async (userId) => {
  if (!userId) {
    throw new Error('userId is required');
  }

  console.log('🔵 [withdrawalService] Getting user summary for userId:', userId);

  try {
    const res = await apiClient.get(ENDPOINTS.WITHDRAWAL.USER_SUMMARY(userId));
    console.log('🟢 [withdrawalService] User summary response:', res.data);
    return res.data;
  } catch (error) {
    console.error('🔴 [withdrawalService] Get user summary error:', error.message);
    throw error;
  }
};

/**
 * Get My Withdrawals (history)
 * GET /my/withdrawals/{userId}
 */
export const getMyWithdrawals = async (userId) => {
  if (!userId) {
    throw new Error('userId is required');
  }

  console.log('🔵 [withdrawalService] Getting withdrawal history for userId:', userId);

  try {
    const res = await apiClient.get(ENDPOINTS.WITHDRAWAL.MY_WITHDRAWALS(userId));
    console.log('🟢 [withdrawalService] History response:', res.data);
    return res.data;
  } catch (error) {
    console.error('🔴 [withdrawalService] Get history error:', error.message);
    throw error;
  }
};

/**
 * Submit Withdrawal Request
 * POST /withdrawal/request
 * Content-Type: multipart/form-data
 *
 * Matches curl:
 * --form 'campaignId="1"'
 * --form 'userId="9"'
 * --form 'amount="500"'
 * --form 'accountType="EASYPAISA"'
 * --form 'accountNumber="03451234567"'
 * --form 'accountTitle="Jhaman Khatri"'
 * --form 'withdrawalProf=@"...pdf"'
 */
export const submitWithdrawalRequest = async (payload) => {
  console.log('🔵 [withdrawalService] Submitting withdrawal:', payload);

  try {
    const formData = new FormData();

    formData.append('campaignId', String(payload.campaignId));
    formData.append('userId', String(payload.userId));
    formData.append('amount', String(payload.amount));
    formData.append('accountType', payload.accountType);
    formData.append('accountNumber', payload.accountNumber);
    formData.append('accountTitle', payload.accountTitle);

    // Document is always a LOCAL file picked from device storage via
    // react-native-document-picker, so the {uri, name, type} object
    // works directly here (this is the same reliable pattern used for
    // locally-picked images — no remote-url edge case to worry about).
    if (payload.document) {
      formData.append('withdrawalProf', {
        uri: payload.document.uri,
        name: payload.document.name,
        type: payload.document.type || 'application/octet-stream',
      });
    }

    const res = await apiClient.post(ENDPOINTS.WITHDRAWAL.REQUEST, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      transformRequest: (data) => data,
    });

    console.log('🟢 [withdrawalService] Submit response:', res.data);
    return res.data;
  } catch (error) {
    console.error('🔴 [withdrawalService] Submit error:', error.message);
    throw error;
  }
};