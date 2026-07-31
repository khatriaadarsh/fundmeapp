// src/hooks/useDonation.js
import { useMutation } from '@tanstack/react-query';
import { initiateDonation, confirmDonation } from '../services/donationService';

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