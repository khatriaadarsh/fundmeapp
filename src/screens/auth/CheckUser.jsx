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
  ScrollView,
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

const { width: SW, height: SH } = Dimensions.get('window');
const sp = n => Math.round((SW / 375) * n);

const EMAIL_RE = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

const CheckUser = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [networkError, setNetworkError] = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);

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

  const clearError = () => {
    setHasError(false);
    setErrorMsg('');
  };

  const showError = (msg) => {
    setHasError(true);
    setErrorMsg(msg);
    setIsValid(false);
  };

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
      const userExists = true; // Mock
      if (userExists === true) {
        navigation.replace('Login', { email: email.trim() });
      } else {
        navigation.replace('SignupScreen', { email: email.trim() });
      }
    } catch (err) {
      setNetworkError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [email, navigation]);

  const helperMsg = !hasError && !isLoading ? "We'll never share your email" : '';

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0A3D62" />

      <ScrollView 
        bounces={false} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {/* Hero is now part of the flow, not absolute, for better scrolling on Vivo */}
        <HeroSection />

        {/* This card now uses a negative margin to overlap the hero exactly like Figma */}
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
        </View>

        {!keyboardVisible && (
          <View style={s.footerContainer}>
            <TrustBadges />
            <FooterLinks />
          </View>
        )}
      </ScrollView>

      {networkError ? (
        <View style={s.toast}>
          <Icon name="alert-circle" size={sp(14)} color="#FFFFFF" style={s.toastIcon} />
          <Text style={s.toastTxt}>{networkError}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
};

export default CheckUser;

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F4F5F7',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: sp(20),
  },
  floatingCardWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: sp(24),
    padding: sp(24),
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    marginHorizontal: sp(20),
    
    // ✅ THE FIGMA SECRET: Pull the card UP into the hero section
    marginTop: -sp(50), 
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
  footerContainer: {
    marginTop: 'auto', 
    paddingHorizontal: sp(20),
    paddingBottom: sp(8),
  },
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