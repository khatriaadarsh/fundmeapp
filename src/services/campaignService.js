// src/services/campaignService.js
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoint';
import { unwrap } from '../utils/apiHandler';

export const listCampaigns        = async (params = {}) => unwrap(await apiClient.get(ENDPOINTS.CAMPAIGN.LIST, { params }));
export const getCampaignDetails   = async (id)          => unwrap(await apiClient.get(ENDPOINTS.CAMPAIGN.DETAILS(id)));
export const createCampaign       = async (payload)     => unwrap(await apiClient.post(ENDPOINTS.CAMPAIGN.CREATE, payload));
export const toggleSaveCampaign   = async (campaignId)  => unwrap(await apiClient.post(ENDPOINTS.CAMPAIGN.SAVE, { campaignId }));
export const getMyCampaigns       = async ()            => unwrap(await apiClient.get(ENDPOINTS.CAMPAIGN.MY_CAMPAIGNS));