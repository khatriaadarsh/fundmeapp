// src/screens/auth/CheckUser.jsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Dimensions,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';

import {
  HeroSection,
  EmailInputField,
  ContinueButton,
  TrustBadges,
  FooterLinks,
} from './CheckUserComponents';

// ── Responsive scale ────────────────────────────────────────
const { width: SW } = Dimensions.get('window');
const sp = n => Math.round((SW / 375) * n);

// Layout measurements
const HERO_H = sp(260);
const CARD_OVERLAP = sp(30);

// ── Email regex ─────────────────────────────────────────────
const EMAIL_RE = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

// ── API ─────────────────────────────────────────────────────
const checkUserExists = async (email) => {
  try {
    const res = await fetch('https://your-api-domain.com/api/user-exist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    return data.exists ?? false;
  } catch (err) {
    console.error('CheckUser API error:', err);
    return null;
  }
};

// ════════════════════════════════════════════════════════════
//  CheckUser Screen
// ════════════════════════════════════════════════════════════
const CheckUser = ({ navigation }) => {
  // ── State ─────────────────────────────────────────────────
  const [email,        setEmail       ] = useState('');
  const [isFocused,    setIsFocused   ] = useState(false);
  const [isValid,      setIsValid     ] = useState(false);
  const [hasError,     setHasError    ] = useState(false);
  const [errorMsg,     setErrorMsg    ] = useState('');
  const [isLoading,    setIsLoading   ] = useState(false);
  const [networkError, setNetworkError] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // ── Keyboard Listeners ────────────────────────────────────
  useEffect(() => {
    const showListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true),
    );
    const hideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false),
    );

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  // ── Helpers ────────────────────────────────────────────────
  const clearError = () => {
    setHasError(false);
    setErrorMsg('');
  };

  const showError = (msg) => {
    setHasError(true);
    setErrorMsg(msg);
    setIsValid(false);
  };

  // ── Input change ───────────────────────────────────────────
  const handleChange = useCallback((text) => {
    setEmail(text);
    setNetworkError('');

    if (text.length === 0) {
      clearError();
      setIsValid(false);
      return;
    }

    const valid = EMAIL_RE.test(text);
    setIsValid(valid);

    if (!valid && text.length > 5) {
      showError('Please enter a valid email address');
    } else {
      clearError();
    }
  }, []);

  // ── Blur ───────────────────────────────────────────────────
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (email.trim() === '') {
      showError('Email address is required');
      return;
    }
    if (!EMAIL_RE.test(email)) {
      showError('Please enter a valid email address');
    }
  }, [email]);

  // ── Submit ─────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (email.trim() === '') {
      showError('Email address is required');
      return;
    }
    if (!EMAIL_RE.test(email)) {
      showError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setNetworkError('');

    try {
      // const userExists = await checkUserExists(email.trim());
      const userExists = true; // ← mock for testing
      
      if (userExists === true) {
        navigation.replace('Login', { email: email.trim() });
      } else if (userExists === false) {
        navigation.replace('SignupScreen', { email: email.trim() });
      } else {
        setNetworkError('Unable to verify. Please check your connection.');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setNetworkError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [email, navigation]);

  // ── Helper text ────────────────────────────────────────────
  const helperMsg = !hasError && !isLoading
    ? "We'll never share your email"
    : '';

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0A3D62" />

      {/* ── Hero Section (Absolute - never moves) ── */}
      <View style={s.heroContainer}>
        <HeroSection />
      </View>

      {/* ── Main content area (NO ScrollView) ── */}
      <View style={s.mainContent}>
        {/* Spacer pushes card below the logo */}
        <View style={{ height: HERO_H - CARD_OVERLAP }} />

        {/* Floating Card */}
        <View style={s.floatingCardWrapper}>
          <Text style={s.cardTitle}>Welcome to FundMe</Text>
          <Text style={s.cardSubtitle}>
            Enter your email to continue. We'll check if you already have an
            account.
          </Text>

          <EmailInputField
            value={email}
            onChangeText={handleChange}
            onFocus={() => {
              setIsFocused(true);
              setNetworkError('');
            }}
            onBlur={handleBlur}
            isFocused={isFocused}
            isValid={isValid}
            hasError={hasError}
            isLoading={isLoading}
            errorMsg={errorMsg}
            helperMsg={helperMsg}
          />

          <ContinueButton
            onPress={handleSubmit}
            isLoading={isLoading}
            disabled={false}
          />

          <TouchableOpacity
            style={s.skipWrap}
            onPress={() => navigation.replace('HomeScreen')}
            activeOpacity={0.7}
          >
            <Text style={s.skipTxt}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Bottom Footer Area (FIXED — hidden when keyboard opens) ── */}
      {!keyboardVisible && (
        <View style={s.footerContainer}>
          <TrustBadges />
          <FooterLinks />
        </View>
      )}

      {/* ── Network error toast ── */}
      {networkError ? (
        <View style={s.toast}>
          <Icon
            name="alert-circle"
            size={sp(14)}
            color="#FFFFFF"
            style={s.toastIcon}
          />
          <Text style={s.toastTxt}>{networkError}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
};

export default CheckUser;

// ════════════════════════════════════════════════════════════
//  Styles
// ════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F4F5F7',
  },

  // Hero container - absolute, never moves
  heroContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },

  // Main content area
  mainContent: {
    flex: 1,
  },

  // Floating Card
  floatingCardWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: sp(20),
    padding: sp(24),
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    marginHorizontal: sp(20),
    zIndex: 10,
  },

  cardTitle: {
    fontSize: sp(22),
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: sp(8),
    lineHeight: sp(28),
  },
  cardSubtitle: {
    fontSize: sp(13),
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: sp(19),
    marginBottom: sp(24),
    paddingHorizontal: sp(4),
  },

  skipWrap: { alignItems: 'center', marginTop: sp(16) },
  skipTxt: {
    fontSize: sp(13),
    color: '#9CA3AF',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },

  // ✅ Footer pinned to bottom — NOT scrollable
  footerContainer: {
    paddingHorizontal: sp(20),
    paddingBottom: sp(8),
  },

  // Toast
  toast: {
    position: 'absolute',
    bottom: sp(28),
    left: sp(20),
    right: sp(20),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    borderRadius: sp(10),
    padding: sp(13),
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    zIndex: 1000,
  },
  toastIcon: { marginRight: sp(8) },
  toastTxt: {
    fontSize: sp(13),
    color: '#FFFFFF',
    flex: 1,
    lineHeight: sp(18),
  },
});