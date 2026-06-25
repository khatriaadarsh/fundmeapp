// src/services/locationService.js
import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

export const getProvinces = async () => {
  const res = await apiClient.get(ENDPOINTS.LOCATION.PROVINCES);
  return res.data?.data ?? [];
};

export const getCitiesByProvince = async (provinceId) => {
  const res = await apiClient.get(ENDPOINTS.LOCATION.CITIES(provinceId));
  return res.data?.data ?? [];
};