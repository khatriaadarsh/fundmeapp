// src/services/campaignService.js

import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

export const getUrgentCampaigns = async ({ category } = {}) => {
  const params = {
    isUrgent: true,
  };

  if (category && category !== 'all') {
    params.category = category;
  }

  console.log('🟠 urgent campaigns params:', params);

  const res = await apiClient.get(ENDPOINTS.CAMPAIGNS.URGENT, {
    params,
  });

  console.log('🟢 urgent campaigns response:', res.data);

  return res.data;
};

// ─── All Campaigns (Explore Screen) ─────────────────────────
// GET /urgent-campaigns (no params - gets all)
// GET /urgent-campaigns?category=Flood (with category filter)
export const getAllCampaigns = async ({ category } = {}) => {
  const params = {};

  // Only add category if not 'all'
  if (category && category !== 'all') {
    params.category = category;
  }

  console.log('🟠 all campaigns params:', params);

  // Uses same endpoint as urgent but WITHOUT isUrgent=true
  const res = await apiClient.get(ENDPOINTS.CAMPAIGNS.URGENT, {
    params,
  });

  console.log('🟢 all campaigns response:', res.data);

  return res.data;
};

export const getCategories = async () => {
  const res = await apiClient.get(ENDPOINTS.CATEGORY.LIST);
  return res.data;
};