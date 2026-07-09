// src/hooks/useCampaigns.js

import { useQuery } from '@tanstack/react-query';
import {
  getCategories,
  getUrgentCampaigns,
  getAllCampaigns,
  getMyCampaigns,
} from '../services/campaignService';

// Change this number to 8 if you want 8 urgent campaigns on home.
export const URGENT_CAMPAIGN_LIMIT = 6;

export const useUrgentCampaigns = ({
  category = 'all',
  limit = URGENT_CAMPAIGN_LIMIT,
} = {}) => {
  return useQuery({
    queryKey: ['urgent-campaigns', category, limit],
    queryFn: () => getUrgentCampaigns({ category }),
    select: (body) => {
      // Handle "Campaign not found" response code 023
      if (body?.responseCode === '023') {
        return {
          campaigns: [],
          isNotFound: true,
          message: body?.responseMessage || 'Campaign not found',
          responseCode: '023',
        };
      }

      // Handle success response code 000
      if (body?.responseCode === '000') {
        const campaigns = Array.isArray(body?.data) ? body.data : [];
        return {
          campaigns: campaigns.slice(0, limit).map(mapUrgentCampaignToCard),
          isNotFound: false,
          message: body?.responseMessage || 'Success',
          responseCode: '000',
        };
      }

      // Default fallback for any other response
      return {
        campaigns: [],
        isNotFound: true,
        message: body?.responseMessage || 'Campaign not found',
        responseCode: body?.responseCode || '023',
      };
    },
  });
};


// ─── All Campaigns Hook (Explore Screen) ────────────────────
export const useAllCampaigns = ({ category = 'all' } = {}) => {
  return useQuery({
    queryKey: ['all-campaigns', category],
    queryFn: () => getAllCampaigns({ category }),
    select: (body) => {
      // Handle "Campaign not found" response code 023
      if (body?.responseCode === '023') {
        return {
          campaigns: [],
          isNotFound: true,
          message: body?.responseMessage || 'Campaign not found',
          responseCode: '023',
        };
      }

      // Handle success response code 000
      if (body?.responseCode === '000') {
        const campaigns = Array.isArray(body?.data) ? body.data : [];
        return {
          campaigns: campaigns.map(mapAllCampaignToCard),
          isNotFound: false,
          message: body?.responseMessage || 'Success',
          responseCode: '000',
        };
      }

      // Default fallback
      return {
        campaigns: [],
        isNotFound: true,
        message: body?.responseMessage || 'Campaign not found',
        responseCode: body?.responseCode || '023',
      };
    },
  });
};


export const useMyCampaigns = () => {
  return useQuery({
    queryKey: ['my-campaigns'],
    queryFn: getMyCampaigns,

    select: (body) => {
      if (body?.responseCode === '023') {
        return {
          campaigns: [],
          isNotFound: true,
          message: body?.responseMessage || 'Campaign not found',
        };
      }

      if (body?.responseCode === '000') {
        const campaigns = Array.isArray(body?.data) ? body.data : [];

        return {
          campaigns: campaigns.map(mapMyCampaignToCard),
          isNotFound: false,
          message: body?.responseMessage || 'Success',
        };
      }

      return {
        campaigns: [],
        isNotFound: true,
        message: body?.responseMessage || 'Campaign not found',
      };
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    select: (body) => {
      const categories = Array.isArray(body?.data) ? body.data : [];

      return [
        {
          id: 'all',
          name: 'All',
          label: 'All',
        },
        ...categories
          .filter((item) => item?.active)
          .map((item) => ({
            id: item.name,
            name: item.name,
            label: item.name,
          })),
      ];
    },
  });
};

const mapUrgentCampaignToCard = (item) => {
  const raisedAmount = Number(item?.totalRaised || 0);
  const goalAmount = Number(item?.fundingGoal || 0);

  const pct =
    goalAmount > 0
      ? Math.min(Math.round((raisedAmount / goalAmount) * 100), 100)
      : 0;

  const category = item?.category || 'Emergency';

  return {
    id: String(item?.campaignId),
    campaignId: item?.campaignId,

    title: item?.shortDescription || 'Urgent campaign needs support',
    category,
    catColor: getCategoryColor(category),

    raised: formatCurrency(raisedAmount),
    goal: formatCurrency(goalAmount),
    pct,

    user: item?.beneficiaryName || 'Beneficiary',
    verified: true,
    timeLeft: 'Urgent',

    badge: 'URGENT',
    imgBg: '#FEE2E2',
    imgEmoji: '!',
    coverImage: item?.coverImage || null,

    raw: item,
  };
};


const mapAllCampaignToCard = (item) => {
  const raisedAmount = Number(item?.totalRaised || 0);
  const goalAmount = Number(item?.fundingGoal || 0);

  const pct =
    goalAmount > 0
      ? Math.min(Math.round((raisedAmount / goalAmount) * 100), 100)
      : 0;

  const category = item?.category || 'General';

  return {
    id: String(item?.campaignId),
    campaignId: item?.campaignId,
    title: item?.shortDescription || item?.title || 'Campaign needs support',
    category,
    catColor: getCategoryColor(category),
    raised: raisedAmount, // Return number for CampaignCard
    goal: goalAmount,     // Return number for CampaignCard
    pct,
    
    // For CampaignCard compatibility
    image: item?.coverImage || null,
    status: 'Active',
    daysLeft: item?.daysLeft || '30',
    
    user: item?.beneficiaryName || item?.creatorName || 'Organizer',
    verified: item?.verified || false,
    badge: item?.isUrgent ? 'URGENT' : null,
    
    raw: item,
  };
};

const mapMyCampaignToCard = (item) => {
  const raisedAmount = Number(item?.totalRaised || 0);
  const goalAmount = Number(item?.fundingGoal || 0);

  const statusMap = {
    APPROVED: 'Active',
    PENDING: 'Pending',
    REJECTED: 'Rejected',
    DRAFT: 'Draft',
  };

  const status = statusMap[item?.campaignStatus] || 'Draft';

  const actionsMap = {
    Active: ['View', 'Withdraw'],
    Pending: ['View'],
    Draft: ['Edit', 'Delete'],
    Rejected: ['Edit & Resubmit', 'Delete'],
  };

  return {
    id: String(item?.campaignId),
    campaignId: item?.campaignId,

    title: item?.shortDescription || 'Campaign',

    image: item?.coverImage,
    coverImage: item?.coverImage,

    status,

    raised: raisedAmount,
    goal: goalAmount,

    daysLeft: 30,

    submittedOn: item?.createdDate
      ? new Date(item.createdDate).toLocaleDateString()
      : '',

    lastEdited: item?.createdDate
      ? new Date(item.createdDate).toLocaleDateString()
      : '',

    note: 'Awaiting admin approval',

    reason: item?.rejectionReason || '',

    actions: actionsMap[status] || [],

    raw: item,
  };
};


const formatCurrency = (value) => {
  const amount = Number(value || 0);

  if (amount >= 1000000) {
    return `Rs ${(amount / 1000000).toFixed(1)}M`;
  }

  if (amount >= 1000) {
    return `Rs ${(amount / 1000).toFixed(1)}K`;
  }

  return `Rs ${amount.toLocaleString('en-PK')}`;
};

const getCategoryColor = (category = '') => {
  const key = category.toLowerCase();

  if (key.includes('medical')) return '#EF4444';
  if (key.includes('education')) return '#3B82F6';
  if (key.includes('food')) return '#F59E0B';
  if (key.includes('flood')) return '#00B4CC';
  if (key.includes('emergency')) return '#EF4444';

  return '#00B4CC';
};