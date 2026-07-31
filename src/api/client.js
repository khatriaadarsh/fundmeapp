// src/api/client.js
import axios from 'axios';
import { Platform } from 'react-native';
import { getUserId } from '../config/session';
import { getDeviceInfo } from '../config/device';
import { parseApiError, buildBusinessError } from '../utils/errorHandler';
import { isSuccessCode } from './responseCodes';
//192.168.0.103 //B-H-WIFI
const BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.78.135.120:8082/api/v1'
    : 'http://localhost:8082/api/v1';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request ─────────────────────────────────────────────────
apiClient.interceptors.request.use(
  async (config) => {
    const userId = getUserId();
    if (userId) config.headers['X-User-Id'] = String(userId);

    try {
      const device = await getDeviceInfo();
      config.headers['X-Device-Id']   = device.deviceId;
      config.headers['X-Device-Type'] = device.deviceType;
    } catch (_) {}

    if (__DEV__) console.log(`➡️  ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response ────────────────────────────────────────────────
// HTTP is always 200 — decision is made from responseCode.
// Only "000" passes through as success. Anything else throws as business error.
apiClient.interceptors.response.use(
  (response) => {
    const body = response.data;
    const code = body?.responseCode;

    if (code && !isSuccessCode(code)) {
      const businessError = buildBusinessError(body);
      if (__DEV__) console.log(`⚠️  ${response.config.url}`, businessError);
      return Promise.reject(businessError);
    }

    if (__DEV__) console.log(`✅ ${response.config.url}`, body);
    return response;
  },
  (error) => {
    // if (error?.isBusiness) return Promise.reject(error);
    // const parsed = parseApiError(error);
    // if (__DEV__) console.log(`❌ ${error.config?.url}`, parsed);
    // return Promise.reject(parsed);
    console.log("========== AXIOS ERROR ==========");
    console.log("Message :", error.message);
    console.log("Code    :", error.code);
    console.log("Response:", error.response);
    console.log("Request :", error.request);
    console.log("Config  :", error.config);
    console.log("=================================");
  },
);

export default apiClient;