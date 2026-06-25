// src/init/Firebase.jsx
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, PermissionsAndroid } from 'react-native';
import DeviceInfo from 'react-native-device-info';

const KEY_DEVICE_ID = 'device_id';
const KEY_FCM_TOKEN = 'fcm_token';

let cachedDeviceInfo = null;

// ─── FCM Token Management ──────────────────────────────────────
export const fetchFcmToken = async () => {
  try {
    // Android 13+ runtime permission request
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        // Don't crash if denied, just log
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('⚠️  Notification permission denied');
        }
      } catch (e) {
        console.log('⚠️  Permission check error:', e.message);
      }
    }

    // iOS permission
    if (Platform.OS === 'ios') {
      try {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        if (!enabled) console.log('⚠️  iOS notification permission denied');
      } catch (e) {
        console.log('⚠️  iOS perm error:', e.message);
      }
    }

    // Register for remote messages (iOS requirement)
    if (!messaging().isDeviceRegisteredForRemoteMessages) {
      try {
        await messaging().registerDeviceForRemoteMessages();
      } catch (e) {
        console.log('⚠️  registerDeviceForRemoteMessages error:', e.message);
      }
    }

    // Get token
    const token = await messaging().getToken();
    if (token) {
      await AsyncStorage.setItem(KEY_FCM_TOKEN, token);
      if (cachedDeviceInfo) cachedDeviceInfo.fcmToken = token;
      console.log(`🟢 [Firebase] FCM Token ready`);
      return token;
    }
    return null;
  } catch (err) {
    console.error('🔴 [Firebase] Failed:', err?.message || err);
    return null;
  }
};

// ─── Device Info ──────────────────────────────────────────────────
export const getDeviceInfo = async () => {
  if (cachedDeviceInfo) return cachedDeviceInfo;

  let deviceId = await AsyncStorage.getItem(KEY_DEVICE_ID);
  if (!deviceId) {
    deviceId = `${Date.now()}-${Math.random()}`;
    await AsyncStorage.setItem(KEY_DEVICE_ID, deviceId);
  }

  let fcmToken = await AsyncStorage.getItem(KEY_FCM_TOKEN);
  if (!fcmToken) fcmToken = await fetchFcmToken();
  if (fcmToken && !cachedDeviceInfo) cachedDeviceInfo.fcmToken = fcmToken;

  let deviceName = 'Unknown';
  try { deviceName = await DeviceInfo.getDeviceName(); } catch (_) {}

  cachedDeviceInfo = {
    deviceId,
    deviceType: Platform.OS === 'ios' ? 'IOS' : 'ANDROID',
    deviceName,
    fcmToken: fcmToken || '',
  };

  return cachedDeviceInfo;
};

export const setFcmToken = async (token) => {
  await AsyncStorage.setItem(KEY_FCM_TOKEN, token);
  if (cachedDeviceInfo) cachedDeviceInfo.fcmToken = token;
};

// Listen for token refresh (non-blocking, runs in background)
export const startFcmListener = () => {
  // Add small delay to avoid blocking initial render
  setTimeout(() => {
    messaging().onTokenRefresh((token) => {
      setFcmToken(token).catch(() => {});
    });
  }, 3000); // 3 seconds after app launch
};