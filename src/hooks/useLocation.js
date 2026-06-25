// src/hooks/useLocation.js
import { useQuery } from '@tanstack/react-query';
import { getProvinces, getCitiesByProvince } from '../services/locationService';

export const useProvinces = () =>
  useQuery({
    queryKey: ['provinces'],
    queryFn:  getProvinces,
    staleTime: 30 * 60 * 1000, // 30 min — barely changes
  });

export const useCities = (provinceId) =>
  useQuery({
    queryKey: ['cities', provinceId],
    queryFn:  () => getCitiesByProvince(provinceId),
    enabled:  !!provinceId,
    staleTime: 30 * 60 * 1000,
  });