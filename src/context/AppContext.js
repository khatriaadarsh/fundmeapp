// src/context/AppContext.js
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setUserIdCache, clearUserIdCache } from '../config/session';

const KEY_ONBOARDING = 'onboarding_seen';
const KEY_USER       = 'current_user';

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [onboardingSeen,  setOnboardingSeen]  = useState(false);
  const [currentUser,     setCurrentUser]     = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [seen, userJson] = await Promise.all([
          AsyncStorage.getItem(KEY_ONBOARDING),
          AsyncStorage.getItem(KEY_USER),
        ]);
        if (seen === 'true') setOnboardingSeen(true);
        if (userJson) {
          const user = JSON.parse(userJson);
          setCurrentUser(user);
          setUserIdCache(user?.userId ?? user?.id ?? null);
        }
      } catch (_) {
        // ignore
      } finally {
        setIsBootstrapping(false);
      }
    })();
  }, []);

  const markOnboardingSeen = useCallback(async () => {
    setOnboardingSeen(true);
    await AsyncStorage.setItem(KEY_ONBOARDING, 'true');
  }, []);

  const saveUser = useCallback(async (user) => {
    setCurrentUser(user);
    setUserIdCache(user?.userId ?? user?.id ?? null);
    await AsyncStorage.setItem(KEY_USER, JSON.stringify(user));
  }, []);

  const clearUser = useCallback(async () => {
    setCurrentUser(null);
    clearUserIdCache();
    await AsyncStorage.removeItem(KEY_USER);
  }, []);

  const resetAll = useCallback(async () => {
    setOnboardingSeen(false);
    setCurrentUser(null);
    clearUserIdCache();
    await AsyncStorage.multiRemove([KEY_ONBOARDING, KEY_USER]);
  }, []);

  return (
    <AppContext.Provider
      value={{
        isBootstrapping,
        onboardingSeen,
        currentUser,
        markOnboardingSeen,
        saveUser,
        clearUser,
        resetAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside AppProvider');
  return ctx;
};