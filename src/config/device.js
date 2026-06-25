// src/config/device.js
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';
import messaging from '@react-native-firebase/messaging';

const KEY_DEVICE_ID = 'device_id';
const KEY_FCM_TOKEN = 'fcm_token';

let cachedDeviceInfo = null;

// ─── FCM Token ───────────────────────────────────────────────
export const fetchFcmToken = async () => {
  try {
    // Android 13+ runtime permission
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.log('⚠️  Notification permission denied');
      }
    }

    // iOS permission
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      if (!enabled) console.log('⚠️  iOS notification permission denied');
    }

    // iOS register for remote messages
    if (!messaging().isDeviceRegisteredForRemoteMessages) {
      await messaging().registerDeviceForRemoteMessages();
    }

    // Get token
    const token = await messaging().getToken();
    if (token) {
      await AsyncStorage.setItem(KEY_FCM_TOKEN, token);
      if (cachedDeviceInfo) cachedDeviceInfo.fcmToken = token;
      console.log('🟢 FCM Token:', token);
      return token;
    }
    return null;
  } catch (err) {
    console.log('🔴 Failed to fetch FCM token:', err?.message);
    return null;
  }
};

// ─── Device Info ─────────────────────────────────────────────
export const getDeviceInfo = async () => {
  if (cachedDeviceInfo) {
    if (!cachedDeviceInfo.fcmToken) {
      const token = await AsyncStorage.getItem(KEY_FCM_TOKEN);
      if (token) cachedDeviceInfo.fcmToken = token;
      else {
        const fresh = await fetchFcmToken();
        if (fresh) cachedDeviceInfo.fcmToken = fresh;
      }
    }
    return cachedDeviceInfo;
  }

  let deviceId = await AsyncStorage.getItem(KEY_DEVICE_ID);
  if (!deviceId) {
    deviceId = uuidv4();
    await AsyncStorage.setItem(KEY_DEVICE_ID, deviceId);
  }

  let fcmToken = await AsyncStorage.getItem(KEY_FCM_TOKEN);
  if (!fcmToken) {
    fcmToken = await fetchFcmToken();
  }

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