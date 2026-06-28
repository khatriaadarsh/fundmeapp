// src/services/profileService.js
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

/**
 * Get Profile Details
 * POST /profileDetails
 * Body: { userId: string }
 */
export const getProfileDetails = async (userId) => {
  if (!userId) {
    throw new Error('userId is required');
  }

  console.log('🔵 [profileService] Getting profile for userId:', userId);
  
  try {
    const res = await apiClient.post(ENDPOINTS.USER.PROFILE_DETAILS, {
      userId: String(userId)
    });
    
    console.log('🟢 [profileService] Profile response:', res.data);
    return res.data;
  } catch (error) {
    console.error('🔴 [profileService] Get profile error:', error.message);
    throw error;
  }
};

/**
 * Update Profile Details
 * POST /update/profileDetails
 * Body: complete profile object
 */
export const updateProfileDetails = async (profileData) => {
  console.log('🔵 [profileService] Updating profile:', profileData);
  
  try {
    const res = await apiClient.post(ENDPOINTS.USER.UPDATE_PROFILE, profileData);
    console.log('🟢 [profileService] Update response:', res.data);
    return res.data;
  } catch (error) {
    console.error('🔴 [profileService] Update profile error:', error.message);
    throw error;
  }
};