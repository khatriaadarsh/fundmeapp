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
      userId: String(userId),
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
 * Content-Type: multipart/form-data
 *
 * Matches curl:
 * --form 'userId="9"'
 * --form 'profileImageUrl=@"...jpg"'
 * --form 'firstName="Joti"'
 * --form 'lastName="Khatri"'
 * --form 'bio="..."'
 * --form 'dateOfBirth="1996-09-20"'
 * --form 'gender="Female"'
 * --form 'city="Karachi"'
 * --form 'province="Sindh"'
 *
 * NOTE: email & mobileNumber are intentionally NOT sent (backend doesn't need them).
 * NOTE: ALL other fields are always sent, whether changed or not (including profileImageUrl).
 */
export const updateProfileDetails = async (profileData) => {
  console.log('🔵 [profileService] Updating profile:', profileData);

  try {
    const formData = new FormData();

    formData.append('userId', String(profileData.userId));
    formData.append('firstName', profileData.firstName ?? '');
    formData.append('lastName', profileData.lastName ?? '');
    formData.append('bio', profileData.bio ?? '');
    formData.append('dateOfBirth', profileData.dateOfBirth ?? '');
    formData.append('gender', profileData.gender ?? '');
    formData.append('city', profileData.city ?? '');
    formData.append('province', profileData.province ?? '');

    // Always attach the profile image field — whether the user picked a new
    // local image or it's still the existing remote URL from get-profile.
    if (profileData.profileImageUrl) {
      const uri = profileData.profileImageUrl;
      const filenameFromUri = uri.split('/').pop() || `profile_${Date.now()}.jpg`;
      // strip query params if the uri is a remote https url with query string
      const cleanFilename = filenameFromUri.split('?')[0];
      const extMatch = /\.(\w+)$/.exec(cleanFilename);
      const ext = extMatch ? extMatch[1].toLowerCase() : 'jpg';
      const mimeType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;

      formData.append('profileImageUrl', {
        uri,
        name: cleanFilename.includes('.') ? cleanFilename : `${cleanFilename}.${ext}`,
        type: mimeType,
      });
    }

    const res = await apiClient.post(ENDPOINTS.USER.UPDATE_PROFILE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      transformRequest: (data) => data, // don't let axios try to JSON.stringify FormData
    });

    console.log('🟢 [profileService] Update response:', res.data);
    return res.data;
  } catch (error) {
    console.error('🔴 [profileService] Update profile error:', error.message);
    throw error;
  }
};