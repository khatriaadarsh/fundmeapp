// src/hooks/useDonation.js
import { useMutation } from '@tanstack/react-query';
import { initiateDonation, confirmDonation,getDonationHistory } from '../services/donationService';
import { useQuery } from '@tanstack/react-query';

export const useInitiateDonation = () => {
  return useMutation({
    mutationFn: initiateDonation,
    onError: (error) => {
      console.error('🔴 [useInitiateDonation] Error:', error.message);
    },
  });
};

export const useConfirmDonation = () => {
  return useMutation({
    mutationFn: confirmDonation,
    onError: (error) => {
      console.error('🔴 [useConfirmDonation] Error:', error.message);
    },
  });
};

export const useDonation = (userId) => {
  return useQuery({
    queryKey: ['donation-history', String(userId)],
    queryFn: () => getDonationHistory(userId),
    enabled: !!userId,
    select: (body) => {
      // Handle empty or "023" / "000" responses gracefully
      if (body?.responseCode === '023') {
        return {
          donations: [],
          isNotFound: true,
          message: body?.responseMessage || 'No donations found',
          responseCode: '023',
        };
      }
      if (body?.responseCode === '000') {
        const donationsList = Array.isArray(body?.data) ? body.data : [];
        return {
          donations: donationsList,
          isNotFound: donationsList.length === 0,
          message: body?.responseMessage || 'Success',
          responseCode: '000',
        };
      }
      return {
        donations: [],
        isNotFound: true,
        message: body?.responseMessage || 'No donation history found',
        responseCode: body?.responseCode || '023',
      };
    },
  });
};