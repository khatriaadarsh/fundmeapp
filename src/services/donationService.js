// src/services/donationService.js
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

/**
 * Initiate Donation
 * POST /campaign/donate
 */
export const initiateDonation = async (payload) => {
  console.log('🔵 [donationService] Initiate donation payload:', payload);

  try {
    const res = await apiClient.post(ENDPOINTS.DONATION.INITIATE, payload);
    console.log('🟢 [donationService] Initiate donation response:', res.data);
    return res.data;
  } catch (error) {
    console.error('🔴 [donationService] Initiate donation error:', error.message);
    throw error;
  }
};

/**
 * Confirm Donation
 * POST /campaign/donate/confirm
 */
export const confirmDonation = async ({ paymentReference, pin }) => {
  console.log('🔵 [donationService] Confirm donation for ref:', paymentReference);

  try {
    const res = await apiClient.post(ENDPOINTS.DONATION.CONFIRM, {
      paymentReference,
      pin,
    });
    console.log('🟢 [donationService] Confirm donation response:', res.data);
    return res.data;
  } catch (error) {
    console.error('🔴 [donationService] Confirm donation error:', error.message);
    throw error;
  }
};

export const getDonationHistory = async (userId) => {
  if (!userId) {
    throw new Error('userId is required');
  }
  const endpointUrl = ENDPOINTS.DONATION.HISTORY(userId);
  const res = await apiClient.get(endpointUrl);
  return res.data;
};
