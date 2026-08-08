// src/services/creatorService.js
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

/**
 * Get Creator Profile Summary
 * GET /creator/{creatorId}
 */
export const getCreatorProfile = async (creatorId) => {
  if (!creatorId) throw new Error('creatorId is required');
  console.log('🔵 [creatorService] Getting profile for creatorId:', creatorId);
  try {
    const res = await apiClient.get(ENDPOINTS.CREATOR.PROFILE(creatorId));
    console.log('🟢 [creatorService] Profile response:', res.data);
    return res.data;
  } catch (error) {
    console.error('🔴 [creatorService] Get profile error:', error.message);
    throw error;
  }
};

/**
 * Get Creator About
 * GET /creator/{creatorId}/about
 */
export const getCreatorAbout = async (creatorId) => {
  if (!creatorId) throw new Error('creatorId is required');
  console.log('🔵 [creatorService] Getting about for creatorId:', creatorId);
  try {
    const res = await apiClient.get(ENDPOINTS.CREATOR.ABOUT(creatorId));
    console.log('🟢 [creatorService] About response:', res.data);
    return res.data;
  } catch (error) {
    console.error('🔴 [creatorService] Get about error:', error.message);
    throw error;
  }
};

/**
 * Get Creator Campaigns
 * GET /creator/{creatorId}/campaigns
 */
export const getCreatorCampaigns = async (creatorId) => {
  if (!creatorId) throw new Error('creatorId is required');
  console.log('🔵 [creatorService] Getting campaigns for creatorId:', creatorId);
  try {
    const res = await apiClient.get(ENDPOINTS.CREATOR.CAMPAIGNS(creatorId));
    console.log('🟢 [creatorService] Campaigns response:', res.data);
    return res.data;
  } catch (error) {
    console.error('🔴 [creatorService] Get campaigns error:', error.message);
    throw error;
  }
};

/**
 * Get Creator Ratings
 * GET /rating/creator/{creatorId}
 */
export const getCreatorRatings = async (creatorId) => {
  if (!creatorId) throw new Error('creatorId is required');
  console.log('🔵 [creatorService] Getting ratings for creatorId:', creatorId);
  try {
    const res = await apiClient.get(ENDPOINTS.RATING.CREATOR(creatorId));
    console.log('🟢 [creatorService] Ratings response:', res.data);
    return res.data;
  } catch (error) {
    console.error('🔴 [creatorService] Get ratings error:', error.message);
    throw error;
  }
};