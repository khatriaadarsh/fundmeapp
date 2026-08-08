// src/services/donorService.js
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

/**
 * Get Recent Donors for a campaign
 * GET /{campaignId}/recent-donors
 */
export const getRecentDonors = async (campaignId) => {
  if (!campaignId) throw new Error('campaignId is required');
  console.log('🔵 [donorService] Getting recent donors for campaignId:', campaignId);
  try {
    const res = await apiClient.get(ENDPOINTS.DONOR.RECENT(campaignId));
    console.log('🟢 [donorService] Recent donors response:', res.data);
    return res.data;
  } catch (error) {
    console.error('🔴 [donorService] Get recent donors error:', error.message);
    throw error;
  }
};

/**
 * Get individual Donor Profile
 * GET /donor/profile/{donorId}
 */
export const getDonorProfile = async (donorId) => {
  if (!donorId) throw new Error('donorId is required');
  console.log('🔵 [donorService] Getting donor profile for donorId:', donorId);
  try {
    const res = await apiClient.get(ENDPOINTS.DONOR.PROFILE(donorId));
    console.log('🟢 [donorService] Donor profile response:', res.data);
    return res.data;
  } catch (error) {
    console.error('🔴 [donorService] Get donor profile error:', error.message);
    throw error;
  }
};