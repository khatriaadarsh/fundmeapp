// src/utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USER_ID:   'user_id',
  USER_DATA: 'user_data',
  AUTH_TOKEN:'auth_token',
};

/**
 * Store userId after successful login
 */
export const storeUserId = async (userId) => {
  try {
    if (userId) {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, String(userId));
      console.log('✅ [Storage] userId stored:', userId);
    }
  } catch (error) {
    console.error('🔴 [Storage] Failed to store userId:', error);
  }
};

/**
 * Get userId from storage
 */
export const getUserId = async () => {
  try {
    const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
    console.log('🔵 [Storage] Retrieved userId:', userId);
    return userId ? Number(userId) : null;
  } catch (error) {
    console.error('🔴 [Storage] Failed to get userId:', error);
    return null;
  }
};

/**
 * Store full user data
 */
export const storeUserData = async (userData) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    console.log('✅ [Storage] User data stored');
  } catch (error) {
    console.error('🔴 [Storage] Failed to store user data:', error);
  }
};

/**
 * Get user data from storage
 */
export const getUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('🔴 [Storage] Failed to get user data:', error);
    return null;
  }
};

/**
 * Clear all stored data (on logout)
 */
export const clearStorage = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_ID,
      STORAGE_KEYS.USER_DATA,
      STORAGE_KEYS.AUTH_TOKEN,
    ]);
    console.log('✅ [Storage] Storage cleared');
  } catch (error) {
    console.error('🔴 [Storage] Failed to clear storage:', error);
  }
};

export { STORAGE_KEYS };

// ✅ FIX: Named object export so `import { storage } from './storage'` works
export const storage = {
  getUserId,
  storeUserId,
  getUserData,
  storeUserData,
  clearStorage,
};