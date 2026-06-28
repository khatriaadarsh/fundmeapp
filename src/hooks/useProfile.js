// src/hooks/useProfile.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfileDetails, updateProfileDetails } from '../services/profileService';

/**
 * Hook to fetch profile details
 */
export const useProfileDetails = (userId) => {
  return useQuery({
    queryKey: ['profile-details', userId],
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
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateProfileDetails,
    onSuccess: (data, variables) => {
      console.log('🟢 [useUpdateProfile] Success:', data);
      if (variables?.userId) {
        queryClient.invalidateQueries({ 
          queryKey: ['profile-details', variables.userId] 
        });
      }
    },
    onError: (error) => {
      // 🔥 FIX: Log the actual error details
      console.error('🔴 [useUpdateProfile] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
    },
  });
};