// src/hooks/useDonation.js
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  initiateDonation,
  confirmDonation,
  getDonationHistory,
  getDonationDetail,
} from '../services/donationService';

const SUCCESS_CODES = ['000', '0', '00', '200'];

const isSuccessCode = code =>
  code === undefined || code === null || code === ''
    ? false
    : SUCCESS_CODES.includes(String(code));

export const useInitiateDonation = () => {
  return useMutation({
    mutationFn: initiateDonation,
    retry: false,
  });
};

export const useConfirmDonation = () => {
  return useMutation({
    mutationFn: confirmDonation,
    retry: false,
  });
};

export const useDonation = (userId) => {
  return useQuery({
    queryKey: ['donation-history', String(userId)],
    queryFn: () => getDonationHistory(userId),
    enabled: !!userId,
    select: (body) => {
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

/**
 * Normalises the donation-detail payload into ONE shape that both the
 * donor ("Donation Successful") and creator ("Donation Received")
 * variants of the receipt can render from.
 *
 * Role is inferred from the payload itself, because the backend returns
 * a different projection per user:
 *   - creator payload  → has a `donor` object, tip/total/txnId are null
 *   - donor payload    → `donor` is null, tip/total/txnId are populated
 * An explicit roleHint (from the notification) always wins when present.
 */
const mapDonationDetail = (raw, roleHint) => {
  if (!raw) return null;

  const hasDonorObject = !!raw.donor && typeof raw.donor === 'object';

  const role =
    roleHint === 'creator' || roleHint === 'donor'
      ? roleHint
      : hasDonorObject
        ? 'creator'
        : 'donor';

  const anonymous = raw.anonymous === true || raw.anonymous === 'true';

  const donorName = anonymous
    ? 'Anonymous'
    : raw.donor?.name || (role === 'donor' ? 'You' : 'Donor');

  return {
    role,
    isCreator: role === 'creator',

    campaignTitle: raw.campaignTitle || 'Campaign',
    donorName,
    anonymous,

    amount: raw.amount != null ? Number(raw.amount) : null,
    platformTip: raw.platformTip != null ? Number(raw.platformTip) : null,
    totalChargedAmount:
      raw.totalChargedAmount != null ? Number(raw.totalChargedAmount) : null,

    paymentMethod: raw.paymentMethod || '',
    paymentStatus: raw.paymentStatus || '',
    transactionId: raw.transactionId || '',
    donorMessage: raw.donorMessage || '',
    donationDate: raw.donationDate || '',

    raw,
  };
};

/**
 * GET /donation/{donationId}/user/{userId}
 * Both IDs arrive from the notification list payload.
 */
export const useDonationDetail = ({ donationId, userId, roleHint } = {}) => {
  return useQuery({
    queryKey: [
      'donation-detail',
      String(donationId || ''),
      String(userId || ''),
      roleHint || '',
    ],
    queryFn: () => getDonationDetail({ donationId, userId }),
    enabled: !!donationId && !!userId,
    retry: false,
    select: (body) => {
      if (!isSuccessCode(body?.responseCode)) {
        return {
          detail: null,
          isNotFound: true,
          message: body?.responseMessage || 'Donation details not found',
          responseCode: body?.responseCode || '',
        };
      }

      return {
        detail: mapDonationDetail(body?.data, roleHint),
        isNotFound: !body?.data,
        message: body?.responseMessage || 'Success',
        responseCode: body?.responseCode || '000',
      };
    },
  });
};