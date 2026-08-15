// src/hooks/useDonor.js
import { useQuery } from '@tanstack/react-query';
import { getRecentDonors, getDonorProfile,getDonorSummary } from '../services/donorService';

const orNA = (value) => {
  if (value === null || value === undefined || value === '') return 'N/A';
  return value;
};

const mapRecentDonor = (item) => ({
  id: String(item?.userId ?? `${item?.name || 'donor'}-${item?.donationDate}`),
  userId: item?.userId ?? null,
  name: item?.isAnonymous ? 'Anonymous' : orNA(item?.name),
  amount: item?.amount ?? 0,
  message: item?.message || null,
  time: item?.timeAgo || '',
  avatar: item?.isAnonymous ? null : (item?.profileImage || null),
  isAnonymous: !!item?.isAnonymous,
  paymentMethod: item?.paymentMethod || null,
  donationDate: item?.donationDate || null,
});

export const useRecentDonors = (campaignId) => {
  return useQuery({
    queryKey: ['recent-donors', String(campaignId)],
    queryFn: () => getRecentDonors(campaignId),
    enabled: !!campaignId,
    select: (body) => {
      if (body?.responseCode !== '000' || !body?.data) {
        return { totalDonors: 0, donors: [] };
      }
      const d = body.data;
      return {
        totalDonors: d.totalDonors ?? 0,
        donors: (d.recentDonors || []).map(mapRecentDonor),
      };
    },
  });
};

// ⚠️ FIELD-NAME ASSUMPTION: the sample response provided for
// /donor/profile/{id} was identical to /recent-donors (very likely a
// copy-paste mistake, since a single-donor endpoint returning a list
// of donors doesn't make sense). Field names below (name, location,
// age, gender, occupation, phone, totalDonated, memberSince,
// totalCampaigns) are a best guess based on what DonorInfoModal
// already expects. Once the real payload is shared, adjust the `d.*`
// keys in the `select` below to match exactly.
export const useDonorProfile = (donorId) => {
  return useQuery({
    queryKey: ['donor-profile', String(donorId)],
    queryFn: () => getDonorProfile(donorId),
    enabled: !!donorId,
    select: (body) => {
      if (body?.responseCode !== '000' || !body?.data) return null;
      const d = body.data;
      return {
        userId: d.userId ?? donorId,
        name: orNA(d.name ?? d.fullName),
        avatar: d.profileImage || null,
        location: d.location ?? d.city ?? null,
        age: d.age ?? null,
        gender: d.gender ?? null,
        occupation: d.occupation ?? null,
        phone: d.phone ?? null,
        totalDonated: d.totalDonated ?? d.amountDonated ?? null,
        memberSince: d.memberSince ?? d.joinedDate ?? null,
        totalCampaigns: d.totalCampaigns ?? d.campaignsSupported ?? 0,
        raw: d,
      };
    },
  });
};

/**
 * Donor summary for the home stats row.
 *
 * `enabled` is exposed so the caller can keep this mounted but dormant:
 * StatsRow has to call both this and useCreatorStatistics on every
 * render (hooks can't be conditional), and firing the wrong one would
 * mean a guaranteed-useless request on every home load.
 */
export const useDonorSummary = (userId, { enabled = true } = {}) => {
  return useQuery({
    queryKey: ['donor-summary', String(userId || '')],
    queryFn: () => getDonorSummary(userId),
    enabled: !!userId && enabled,
    retry: false,
    select: (body) => {
      if (body?.responseCode !== '000' || !body?.data) return null;

      const d = body.data;
      return {
        donorId: d.donorId ?? null,
        totalCampaignsSupported: Number(d.totalCampaignsSupported ?? 0),
        totalDonations: Number(d.totalDonations ?? 0),
        totalAmount: Number(d.totalAmount ?? 0),
        raw: d,
      };
    },
  });
};