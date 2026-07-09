// src/hooks/useProfile.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfileDetails, updateProfileDetails } from '../services/profileService';

/**
 * Hook to fetch profile details
 */
export const useProfileDetails = (userId) => {
  return useQuery({
    // Always use a normalized string key so it matches whatever key
    // useUpdateProfile writes back into the cache after a save.
    queryKey: ['profile-details', String(userId)],
    queryFn: async () => {
      console.log('🔵 [useProfile] Fetching for userId:', userId);
      const response = await getProfileDetails(userId);

      if (response?.responseCode === '000' && response?.data) {
        console.log('🟢 [useProfile] Profile loaded:', response.data);
        return response.data;
      }

      throw new Error(response?.responseMessage || 'Failed to load profile');
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
  });
};

/**
 * Hook to update profile
 *
 * After a successful update, this immediately hits GET profileDetails again
 * and writes the fresh data straight into the react-query cache for that
 * userId. This guarantees the Profile screen shows the latest data the
 * moment it's read, regardless of whether it was mounted/active at the time
 * of the update (which was the root cause of "changes not reflected").
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfileDetails,
    onSuccess: async (data, variables) => {
      console.log('🟢 [useUpdateProfile] Update success:', data);

      const uid = variables?.userId;
      if (!uid) return;

      try {
        console.log('🔵 [useUpdateProfile] Re-fetching profile immediately for userId:', uid);
        const freshResponse = await getProfileDetails(uid);

        if (freshResponse?.responseCode === '000' && freshResponse?.data) {
          queryClient.setQueryData(['profile-details', String(uid)], freshResponse.data);
          console.log('🟢 [useUpdateProfile] Cache updated with fresh profile data');
        } else {
          // fallback: at least mark it stale so next read refetches
          queryClient.invalidateQueries({ queryKey: ['profile-details', String(uid)] });
        }
      } catch (err) {
        console.error('🔴 [useUpdateProfile] Failed to refresh profile after update:', err.message);
        // fallback so UI doesn't stay stuck on old data
        queryClient.invalidateQueries({ queryKey: ['profile-details', String(uid)] });
      }
    },
    onError: (error) => {
      console.error('🔴 [useUpdateProfile] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
    },
  });
};