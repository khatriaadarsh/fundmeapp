// src/hooks/useCreator.js
import { useQuery } from '@tanstack/react-query';
import {
  getCreatorProfile,
  getCreatorAbout,
  getCreatorCampaigns,
  getCreatorRatings,
  getCreatorStatistics,
} from '../services/creatorService';

const orNA = (value) => {
  if (value === null || value === undefined || value === '') return 'N/A';
  return value;
};

export const useCreatorProfile = (creatorId) => {
  return useQuery({
    queryKey: ['creator-profile', String(creatorId)],
    queryFn: () => getCreatorProfile(creatorId),
    enabled: !!creatorId,
    select: (body) => {
      if (body?.responseCode !== '000' || !body?.data) return null;
      const d = body.data;
      return {
        creatorId: d.creatorId,
        name: orNA(d.fullName),
        nickName: orNA(d.nickName),
        avatarUri: d.profileImage || null,
        location: [d.city, d.country].filter(Boolean).join(', ') || 'N/A',
        joinedDate: orNA(d.joinedDate),
        trustScore: d.trustScore ?? 0,
        trustScoreLabel: orNA(d.trustScoreLabel),
        isVerified: !!d.isVerified,
        cnicVerified: !!d.cnicVerified,
        emailVerified: !!d.emailVerified,
        phoneVerified: !!d.phoneVerified,
        campaignCount: d.campaignCount ?? 0,
        amountRaised: d.amountRaised ?? 0,
        totalDonors: d.totalDonors ?? 0,
        averageRating: d.averageRating ?? 0,
        raw: d,
      };
    },
  });
};

export const useCreatorAbout = (creatorId) => {
  return useQuery({
    queryKey: ['creator-about', String(creatorId)],
    queryFn: () => getCreatorAbout(creatorId),
    enabled: !!creatorId,
    select: (body) => {
      if (body?.responseCode !== '000' || !body?.data) return null;
      const d = body.data;
      return {
        bio: d.bio || '',
        email: orNA(d.email),
        phone: orNA(d.phone),
        website: orNA(d.website),
        language: orNA(d.language),
        trustScore: d.trustScore ?? 0,
        trustScoreLabel: orNA(d.trustScoreLabel),
        trustDescription: d.trustDescription || null,
        achievements: Array.isArray(d.achievements) ? d.achievements : [],
      };
    },
  });
};

const mapCreatorCampaign = (item) => {
  const raised = Number(item?.totalRaised ?? item?.raised ?? 0);
  const goal = Number(item?.fundingGoal ?? item?.goal ?? 0);
  const pct = goal > 0 ? Math.min(Math.round((raised / goal) * 100), 100) : 0;

  return {
    id: String(item?.campaignId ?? item?.id ?? Math.random()),
    title: item?.shortDescription ?? item?.title ?? 'Campaign',
    imageUri: item?.coverImage ?? item?.imageUri ?? null,
    raised: `PKR ${raised.toLocaleString('en-PK')}`,
    goal: `PKR ${goal.toLocaleString('en-PK')}`,
    pct,
    donors: item?.totalDonors ?? item?.donors ?? 0,
    daysLeft: item?.daysLeft ?? 0,
    urgent: !!(item?.isUrgent ?? item?.urgent),
    status: item?.campaignStatus ?? item?.status ?? null,
    tags: item?.category ? [item.category] : [],
  };
};

export const useCreatorCampaigns = (creatorId) => {
  return useQuery({
    queryKey: ['creator-campaigns', String(creatorId)],
    queryFn: () => getCreatorCampaigns(creatorId),
    enabled: !!creatorId,
    select: (body) => {
      if (body?.responseCode !== '000' || !body?.data) {
        return { active: [], past: [] };
      }
      const d = body.data;
      return {
        active: (d.activeCampaigns || []).map(mapCreatorCampaign),
        past: (d.pastCampaigns || []).map(mapCreatorCampaign),
      };
    },
  });
};

export const useCreatorRatings = (creatorId) => {
  return useQuery({
    queryKey: ['creator-ratings', String(creatorId)],
    queryFn: () => getCreatorRatings(creatorId),
    enabled: !!creatorId,
    select: (body) => {
      if (body?.responseCode !== '000' || !body?.data) {
        return { averageRating: 0, totalReviews: 0, distribution: [], reviews: [] };
      }
      const d = body.data;
      const total = d.totalReviews || 0;

      const starCounts = {
        5: d.fiveStar || 0,
        4: d.fourStar || 0,
        3: d.threeStar || 0,
        2: d.twoStar || 0,
        1: d.oneStar || 0,
      };

      const distribution = [5, 4, 3, 2, 1].map((stars) => ({
        stars,
        pct: total > 0 ? Math.round((starCounts[stars] / total) * 100) : 0,
      }));

      const reviews = (d.reviews || []).map((r) => ({
        id: String(r.reviewId),
        name: r.reviewerName || 'Anonymous',
        rating: r.rating || 0,
        text: r.review || '',
        helpful: r.helpfulCount || 0,
        createdDate: r.createdDate,
      }));

      return {
        averageRating: d.averageRating ?? 0,
        totalReviews: total,
        distribution,
        reviews,
      };
    },
  });
};


/**
 * Hook to fetch creator statistics (totalCampaigns, totalDonors, totalRaised)
 */
export const useCreatorStatistics = (userId) => {
  return useQuery({
    queryKey: ['creator-statistics', String(userId)],
    queryFn: async () => {
      const response = await getCreatorStatistics(userId);
      if (response?.responseCode === '000' && response?.data) {
        return response.data;
      }
      throw new Error(response?.responseMessage || 'Failed to load creator statistics');
    },
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
};