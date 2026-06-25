// src/config/session.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_USER = 'current_user';

let cachedUserId = null;

export const getUserId      = () => cachedUserId;
export const setUserIdCache = (id) => { cachedUserId = id; };
export const clearUserIdCache = () => { cachedUserId = null; };

export const hydrateUserIdFromStorage = async () => {
  const raw = await AsyncStorage.getItem(KEY_USER);
  if (raw) {
    try {
      const user = JSON.parse(raw);
      cachedUserId = user?.userId ?? user?.id ?? null;
    } catch (_) {}
  }
  return cachedUserId;
};