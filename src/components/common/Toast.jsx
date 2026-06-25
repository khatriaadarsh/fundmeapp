// src/components/common/Toast.jsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';

const TOAST_TYPES = {
  success: { bg: '#10B981', icon: 'check-circle'  },
  error:   { bg: '#EF4444', icon: 'alert-circle'  },
  warning: { bg: '#F59E0B', icon: 'alert-triangle'},
  info:    { bg: '#15AABF', icon: 'info'          },
};

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null); // { type, message, id }
  const translateY = useRef(new Animated.Value(-120)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const hideTimer  = useRef(null);

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -120,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => setToast(null));
  }, [translateY, opacity]);

  const show = useCallback((type, message, duration = 3500) => {
    if (!message) return;
    if (hideTimer.current) clearTimeout(hideTimer.current);

    setToast({ type, message, id: Date.now() });
    translateY.setValue(-120);
    opacity.setValue(0);

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 14,
        stiffness: 140,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    hideTimer.current = setTimeout(hide, duration);
  }, [translateY, opacity, hide]);

  useEffect(() => {
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, []);

  const api = {
    show,
    hide,
    success: (msg, dur) => show('success', msg, dur),
    error:   (msg, dur) => show('error',   msg, dur),
    warning: (msg, dur) => show('warning', msg, dur),
    info:    (msg, dur) => show('info',    msg, dur),
  };

  const cfg = toast ? TOAST_TYPES[toast.type] || TOAST_TYPES.info : null;

  return (
    <ToastContext.Provider value={api}>
      {children}

      {toast && (
        <SafeAreaView style={s.safeWrapper} pointerEvents="box-none" edges={['top']}>
          <Animated.View
            style={[
              s.toast,
              { backgroundColor: cfg.bg, transform: [{ translateY }], opacity },
            ]}
          >
            <Icon name={cfg.icon} size={20} color="#FFFFFF" style={s.icon} />
            <Text style={s.message} numberOfLines={3}>{toast.message}</Text>
            <TouchableOpacity onPress={hide} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon name="x" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        </SafeAreaView>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
};

const s = StyleSheet.create({
  safeWrapper: {
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  toast: {
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
  },
  icon:    { marginRight: 10 },
  message: { flex: 1, color: '#FFFFFF', fontSize: 13, fontWeight: '600', marginRight: 8, lineHeight: 18 },
});