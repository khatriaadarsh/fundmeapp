// src/screens/auth/CheckUser.jsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Platform,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
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

import { useAppContext }                  from '../../context/AppContext';
import { useCheckUser, resolveAuthRoute } from '../../hooks/useAuth';
import { FullScreenLoader }               from '../../components/common/Loader';

const { width: SW } = Dimensions.get('window');
const sp = n => Math.round((SW / 375) * n);

const EMAIL_RE = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

const CheckUser = ({ navigation }) => {
  const { saveUser } = useAppContext();
  const { mutate: checkUser, isPending } = useCheckUser();

  const [email,           setEmail]           = useState('');
  const [isFocused,       setIsFocused]       = useState(false);
  const [isValid,         setIsValid]         = useState(false);
  const [hasError,        setHasError]        = useState(false);
  const [errorMsg,        setErrorMsg]        = useState('');
  const [networkError,    setNetworkError]    = useState('');
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const scrollRef = useRef(null);

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        // Android's ScrollView has no built-in "scroll to focused input"
        // behavior (iOS handles this natively) — so without this, the
        // Continue button stays hidden behind the keyboard even though
        // KeyboardAvoidingView has already shrunk the visible area.
        // A short delay lets the keyboard-driven layout shrink settle
        // first, so we scroll to the *final* content height, not a
        // mid-transition one.
        setTimeout(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        }, Platform.OS === 'android' ? 100 : 0);
      },
    );
    const hide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        scrollRef.current?.scrollTo({ y: 0, animated: true });
      },
    );
    return () => { show.remove(); hide.remove(); };
  }, []);

  const clearError = () => { setHasError(false); setErrorMsg(''); };
  const showError  = (msg) => { setHasError(true); setErrorMsg(msg); setIsValid(false); };

  const handleChange = useCallback((text) => {
    setEmail(text);
    setNetworkError('');
    if (text.length === 0) { clearError(); setIsValid(false); return; }
    const valid = EMAIL_RE.test(text);
    setIsValid(valid);
    if (!valid && text.length > 5) showError('Please enter a valid email address');
    else clearError();
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (email.trim() === '')    return showError('Email address is required');
    if (!EMAIL_RE.test(email))  return showError('Please enter a valid email address');
  }, [email]);

  const handleSubmit = useCallback(() => {
    if (email.trim() === '')   return showError('Email address is required');
    if (!EMAIL_RE.test(email)) return showError('Please enter a valid email address');

    setNetworkError('');
    Keyboard.dismiss();

    checkUser(email.trim(), {
      onSuccess: async (result) => {
        await saveUser({
          email:      result.email,
          userId:     result.userId,
          exists:     result.exists,
          step:       result.step,
          stepStatus: result.stepStatus,
          status:     result.registrationStatus,
          profile:    result.profile,
        });

        const { screen, params } = resolveAuthRoute(result);
        navigation.replace(screen, params);
      },
      onError: (err) => {
        setNetworkError(err?.message || 'Something went wrong. Please try again.');
      },
    });
  }, [email, checkUser, navigation, saveUser]);

  const helperMsg = !hasError && !isPending ? "We'll never share your email" : '';

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0A3D62" />

      <KeyboardAvoidingView
        style={s.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <HeroSection />

          <View style={s.floatingCardWrapper}>
            <Text style={s.cardTitle}>Welcome to FundMe</Text>
            <Text style={s.cardSubtitle}>
              Enter your email to continue. We'll check if you already have an account.
            </Text>

            <EmailInputField
              value={email}
              onChangeText={handleChange}
              onFocus={() => { setIsFocused(true); setNetworkError(''); }}
              onBlur={handleBlur}
              isFocused={isFocused}
              isValid={isValid}
              hasError={hasError}
              isLoading={isPending}
              errorMsg={errorMsg}
              helperMsg={helperMsg}
            />

            <ContinueButton
              onPress={handleSubmit}
              isLoading={isPending}
              disabled={isPending}
            />
          </View>

          {!keyboardVisible && (
            <View style={s.footerContainer}>
              <TrustBadges />
              <FooterLinks />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {networkError ? (
        <View style={s.toast}>
          <Icon name="alert-circle" size={sp(14)} color="#FFFFFF" style={s.toastIcon} />
          <Text style={s.toastTxt}>{networkError}</Text>
        </View>
      ) : null}

      <FullScreenLoader visible={isPending} message="Checking your email…" />
    </SafeAreaView>
  );
};

export default CheckUser;

const s = StyleSheet.create({
  safe:               { flex: 1, backgroundColor: '#F4F5F7' },
  kav:                { flex: 1 },
  scrollContent:      { flexGrow: 1, paddingBottom: sp(20) },
  floatingCardWrapper:{
    backgroundColor: '#FFFFFF',
    borderRadius: sp(24),
    padding: sp(24),
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    marginHorizontal: sp(20),
    marginTop: -sp(50),
    zIndex: 10,
  },
  cardTitle:       { fontSize: sp(22), fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: sp(8), lineHeight: sp(28) },
  cardSubtitle:    { fontSize: sp(13), color: '#6B7280', textAlign: 'center', lineHeight: sp(19), marginBottom: sp(24), paddingHorizontal: sp(4) },
  footerContainer: { marginTop: 'auto', paddingHorizontal: sp(20), paddingBottom: sp(8) },
  toast:           {
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
  toastTxt:  { fontSize: sp(13), color: '#FFFFFF', flex: 1, lineHeight: sp(18) },
});