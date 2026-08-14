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


export const getDonationDetail = async ({ donationId, userId }) => {
  if (!donationId) throw new Error('donationId is required');
  if (!userId) throw new Error('userId is required');

  // DONATION (singular) — matches the key used by INITIATE / CONFIRM /
  // HISTORY above. Using DONATIONS here throws
  // "Cannot read property 'DETAIL' of undefined" synchronously, so the
  // request never leaves the app and the screen shows that TypeError
  // instead of a backend message.
  const res = await apiClient.get(
    ENDPOINTS.DONATION.DETAIL(donationId, userId),
  );
  return res?.data;
};
