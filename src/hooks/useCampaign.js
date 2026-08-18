// src/hooks/useCampaign.js

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import {
  getCategories,
  getMyCampaigns,
  getCampaignDetail,
  deleteCampaign,
  getCampaignReview,
  getCampaignUpdates,
    createCampaignUpdate,
} from '../services/campaignService';

// Change this number to 8 if you want 8 urgent campaigns on home.
export const URGENT_CAMPAIGN_LIMIT = 6;

export const useUrgentCampaigns = ({
  category = 'all',
  limit = URGENT_CAMPAIGN_LIMIT,
  userId,
  isUrgent = true,
} = {}) => {
  return useQuery({
    queryKey: ['urgent-campaigns', category, limit, userId, isUrgent],
    queryFn: async () => {
      let url = `/urgent-campaigns?isUrgent=${isUrgent}&userId=${userId}`;
      if (category && category !== 'all') {
        url += `&category=${encodeURIComponent(category)}`;
      }
      const res = await apiClient.get(url);
      return res.data;
    },
    enabled: !!userId,
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
export const useAllCampaigns = ({ category = 'all', userId, isUrgent = false } = {}) => {
  return useQuery({
    queryKey: ['all-campaigns', category, userId, isUrgent],
    queryFn: async () => {
      let url = `/urgent-campaigns?isUrgent=${isUrgent}&userId=${userId}`;
      if (category && category !== 'all') {
        url += `&category=${encodeURIComponent(category)}`;
      }
      const res = await apiClient.get(url);
      return res.data;
    },
    enabled: !!userId,
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

// ─── Campaign Detail Hook ────────────────────────────────────
export const useCampaignDetail = (campaignId) => {
  return useQuery({
    queryKey: ['campaign-detail', String(campaignId)],
    queryFn: () => getCampaignDetail(campaignId),
    enabled: !!campaignId,
    select: (body) => {
      if (body?.responseCode !== '000' || !body?.data) {
        return null;
      }
      return mapCampaignDetail(body.data);
    },
  });
};

// ─── Campaign Updates ────────────────────────────────────────
/**
 * Creator progress posts for a campaign.
 *
 * "Not found" resolves to an empty array rather than an error: a
 * campaign with no updates yet is the common case, and the section
 * simply hides itself instead of reporting a failure.
 */
export const useCampaignUpdates = (campaignId) => {
  return useQuery({
    queryKey: ['campaign-updates', String(campaignId || '')],
    queryFn: async () => {
      try {
        return await getCampaignUpdates(campaignId);
      } catch (error) {
        const code = String(
          error?.code ?? error?.response?.data?.responseCode ?? '',
        );
        const message = String(
          error?.message ?? error?.response?.data?.responseMessage ?? '',
        );

        if (code === '023' || /not\s*found/i.test(message)) {
          return { responseCode: '023', data: [] };
        }
        throw error;
      }
    },
    enabled: !!campaignId,
    retry: false,
    select: (body) => {
      if (body?.responseCode !== '000' || !Array.isArray(body?.data)) {
        return [];
      }

      return body.data.map((item, idx) => ({
        id: String(item?.id ?? idx),
        campaignId: item?.campaignId ?? null,
        userId: item?.userId ?? null,
        text: item?.update || '',
        createdDate: item?.createdDate || null,
        age: item?.updateAge || '',
      }));
    },
  });
};

/**
 * Post a campaign update.
 *
 * Invalidates the update list for this campaign on success so the new
 * post appears immediately if the creator opens the detail screen —
 * only on a genuine "000", since the backend returns failures with a
 * 200 and refetching after one would just re-render the same list.
 */
export const useCreateCampaignUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars) => createCampaignUpdate(vars),
    retry: false,
    onSuccess: (body, variables) => {
      if (body?.responseCode && body.responseCode !== '000') return;

      queryClient.invalidateQueries({
        queryKey: ['campaign-updates', String(variables?.campaignId ?? '')],
      });
    },
  });
};
// ─── Delete Campaign ─────────────────────────────────────────
/**
 * The raw body is returned untouched so the caller can distinguish a
 * real "000" from a backend rejection that still arrives with HTTP 200,
 * and caches are only invalidated on genuine success — refetching after
 * a failed delete would just re-render the same list.
 */
export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (campaignId) => deleteCampaign(campaignId),
    retry: false,
    onSuccess: (body) => {
      if (body?.responseCode && body.responseCode !== '000') return;

      queryClient.invalidateQueries({ queryKey: ['my-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['urgent-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['all-campaigns'] });
    },
  });
};

// ─── Campaign Review (edit / resume) ─────────────────────────
/**
 * Fetched on demand as a mutation rather than a query: it fires from a
 * button press, so a query would need an enabled flag plus an effect to
 * navigate once data lands — which races with the fetch itself.
 */
export const useFetchCampaignReview = () => {
  return useMutation({
    mutationFn: (campaignId) => getCampaignReview(campaignId),
    retry: false,
  });
};

const CAMPAIGN_FLOW_SCREENS = {
  1: 'CreateCampaign',
  2: 'CampaignDetails',
  3: 'PhotosDocuments',
  4: 'ReviewSubmit',
};

/**
 * stepNumber is the last COMPLETED step, so the user resumes at the one
 * after it. Capped at 4 because ReviewSubmit is the final screen, and
 * floored at 1 for a campaign that has nothing saved yet.
 */
export const resolveCampaignResumeStep = (data) => {
  const completed = Number(data?.stepNumber);

  if (!Number.isFinite(completed) || completed <= 0) return 1;

  return Math.min(completed + 1, 4);
};

export const getCampaignFlowScreen = (step) =>
  CAMPAIGN_FLOW_SCREENS[step] || CAMPAIGN_FLOW_SCREENS[1];

const formatFlowDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${String(d.getDate()).padStart(2, '0')} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const fileNameFromUrl = (url, fallback) => {
  if (!url) return fallback;
  try {
    const parts = String(url).split('?')[0].split('/');
    return decodeURIComponent(parts[parts.length - 1]) || fallback;
  } catch {
    return fallback;
  }
};

/**
 * Reshapes the review payload into the exact param names each screen of
 * the creation flow already reads, so no screen has to learn a second
 * data shape.
 *
 * Media comes back as remote URLs, which display fine but cannot be
 * re-uploaded as multipart. They're passed as display-only and flagged
 * with remoteMedia so step 3 can tell a restored file from a picked one.
 */
export const mapCampaignReviewToFlowParams = (data) => {
  if (!data) return {};

  const campaignId = data.campaignId ?? data.id;
  const goalValue = Number(data.fundingGoal);

  return {
    campaignId: campaignId ? String(campaignId) : null,
    editMode: true,

    // Step 1
    title: data.title || '',
    category: data.category || '',
    goal: Number.isFinite(goalValue) && goalValue > 0
      ? String(Math.trunc(goalValue))
      : '',
    endDate: formatFlowDate(data.endDate),
    endDateISO: data.endDate || null,
    urgent: !!data.isUrgent,

    // Step 2
    shortDesc: data.shortDescription || '',
    fullDesc: data.description || '',
    beneficiary: data.beneficiaryName || '',
    relationship: data.relationships || '',
    province: data.province || '',
    city: data.city || '',

    // Step 3 — display only
    coverUri: data.coverImage || null,
    coverFile: null,
    images: Array.isArray(data.additionalImages)
      ? data.additionalImages.map((img, idx) => ({
          id: String(img.id ?? `img_${idx}`),
          uri: img.url,
          isRemote: true,
        }))
      : [],
    docs: Array.isArray(data.documents)
      ? data.documents.map((doc, idx) => ({
          id: String(doc.id ?? `doc_${idx}`),
          uri: doc.url,
          name: fileNameFromUrl(doc.url, `Document ${idx + 1}`),
          size: 'Uploaded',
          type: 'application/pdf',
          isRemote: true,
        }))
      : [],
    remoteMedia: true,

    raw: data,
  };
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

    isSaved: !!item?.isSaved, // Added isSaved flag

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

    isSaved: !!item?.isSaved, // Added isSaved flag

    raw: item,
  };
};

const mapMyCampaignToCard = (item) => {
  const raisedAmount = Number(item?.totalRaised || 0);
  const goalAmount = Number(item?.fundingGoal || 0);

  const statusMap = {
    ACTIVE: 'Active',
    PENDING: 'Pending',
    REJECTED: 'Rejected',
    DRAFT: 'Draft',
  };

  const status = statusMap[item?.campaignStatus] || 'Draft';

  const actionsMap = {
    Active: ['View','Post Update', 'Withdraw'],
    // Pending is read-only: nothing is editable while an admin has it
    // under review, so there's no action worth surfacing.
    Pending: [],
    Draft: ['Edit', 'Delete'],
    // Rejected campaigns are reopened from the rejection notification,
    // which carries the specific rejectedStep. A generic resubmit button
    // here has no way of knowing which step actually needs fixing.
    Rejected: ['Delete'],
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

const mapCampaignDetail = (item) => {
  const raisedAmount = Number(item?.raisedAmount || 0);
  const goalAmount = Number(item?.fundingGoal || 0);

  const pct =
    goalAmount > 0
      ? Math.min(Math.round((raisedAmount / goalAmount) * 100), 100)
      : 0;

  return {
    campaignId: item?.campaignId ?? item?.id,
    title: item?.name || 'Campaign',
    category: item?.category || 'General',
    image: item?.coverImage || null,
    coverImage: item?.coverImage || null,

    raised: raisedAmount,
    goal: goalAmount,
    pct,
    remainingTime: item?.remainingTime || '',
    urgent: !!item?.urgent,
    story: item?.description || '',

    city: item?.city || '',
    province: item?.location || '',

    creator: {
      userId: item?.userId,
      name: item?.userName || 'Organizer',
      location: [item?.city, item?.location].filter(Boolean).join(', '),
      avatar: item?.userProfileImage || null,
    },

    media: Array.isArray(item?.additionalImages)
      ? item.additionalImages.map((img) => ({
          id: String(img.id),
          uri: img.url,
        }))
      : [],

    documents: Array.isArray(item?.documents)
      ? item.documents.map((doc) => ({
          id: String(doc.id),
          url: doc.url,
          title: getDocFileName(doc.url),
        }))
      : [],

    raw: item,
  };
};

const getDocFileName = (url) => {
  if (!url) return 'Document';
  try {
    const parts = url.split('/');
    return decodeURIComponent(parts[parts.length - 1]) || 'Document';
  } catch {
    return 'Document';
  }
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