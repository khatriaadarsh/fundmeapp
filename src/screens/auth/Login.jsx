// src/screens/auth/Login.jsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  ScrollView,
  Image,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';

import InputField from '../../components/common/InputField';
import GradientButton from '../../components/common/GradientButton';
import { FullScreenLoader } from '../../components/common/Loader';
import { useToast } from '../../components/common/Toast';
import StatusPopup from '../../components/common/StatusPopup';

import { useLogin } from '../../hooks/useAuth';
import { useAppContext } from '../../context/AppContext';

import { COLORS, SPACING, TYPOGRAPHY, scale } from '../../theme';
import LogoImg from '../../assets/logo.png';

const EMAIL_RE = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

const LoginScreen = ({ navigation, route }) => {
  const toast = useToast();
  const { saveUser, currentUser } = useAppContext();
  const { mutate: doLogin, isPending } = useLogin();

  // ── Responsive metrics ──────────────────────────────────────
  // IMPORTANT: we deliberately use Dimensions.get('screen') here, NOT
  // useWindowDimensions()/Dimensions.get('window'). On Android with
  // windowSoftInputMode="adjustResize", the "window" height itself
  // shrinks by the keyboard's height while it's open — so breakpoints
  // driven by window height (e.g. isCompactHeight) would silently
  // flip mid-typing and resize the logo/fonts, which is an extra
  // source of the "blink" being reported. "screen" is the physical
  // device size and never changes when the keyboard shows/hides —
  // only on a real orientation change — so our spacing/sizing stays
  // 100% stable regardless of keyboard state.
  const [screenDims, setScreenDims] = useState(() => Dimensions.get('screen'));

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ screen }) => {
      setScreenDims(screen);
    });
    return () => sub?.remove?.();
  }, []);

  const isCompactHeight = screenDims.height < 700; // small/short phones (e.g. SE-class)
  const isNarrowWidth = screenDims.width < 360;

  // Prefill email from CheckUser/SignUp flow, then from saved user
  const prefilledEmail = route?.params?.email || currentUser?.email || '';

  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Popup state
  const [popup, setPopup] = useState({
    visible: false,
    title: '',
    message: '',
    code: '',
    variant: 'warning',
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scrollRef = useRef(null);

  // ── Scroll-only-when-needed ──────────────────────────────────
  // An enterprise-grade form screen should NOT be swipeable/scrollable
  // when its content already fits on screen, and should NEVER visibly
  // reposition itself in response to the keyboard opening/closing —
  // that reposition (a second, JS-driven layout change layered on top
  // of the OS's own smooth keyboard-resize animation) is exactly what
  // caused the "blink". So this screen's layout style is now 100%
  // static — it never changes based on keyboard state. The ONLY thing
  // we control in JS is whether touch-scrolling is permitted, which we
  // derive by measuring the ScrollView's real visible height against
  // its real content height. Toggling `scrollEnabled` has no visual
  // effect on its own (it doesn't move anything), so it can't blink.
  const [containerHeight, setContainerHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const canScroll = contentHeight > containerHeight + 1; // +1 guards float rounding

  // If content stops overflowing (e.g. keyboard closed, freeing up
  // space), silently snap back to the top with NO animation — this
  // only fires on the true→false transition, so it never fights with
  // the keyboard's own close animation.
  useEffect(() => {
    if (!canScroll) {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  }, [canScroll]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    if (prefilledEmail) setEmail(prefilledEmail);
  }, [prefilledEmail]);

  const closePopup = () => setPopup(p => ({ ...p, visible: false }));

  const handleLogin = useCallback(() => {
    if (!email.trim()) {
      toast.error('Please enter your email.');
      return;
    }
    if (!EMAIL_RE.test(email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (!password) {
      toast.error('Please enter your password.');
      return;
    }

    doLogin(
      { email: email.trim(), password },
      {
        onSuccess: async body => {
          const data = body?.data || {};
          const status = data.accountStatus; // ACTIVE | PENDING | …
          const respCode = body?.responseCode;
          const respMsg = body?.responseMessage;

          // Persist user
          await saveUser({
            id: data.id,
            userId: data.id,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            mobileNumber: data.mobileNumber,
            role: data.role,
            profileImage: data.profileImage,
            bio: data.bio,
            dateOfBirth: data.dateOfBirth,
            gender: data.gender,
            province: data.province,
            city: data.city,
            accountStatus: data.accountStatus,
            registrationStatus: data.registrationStatus,
            emailVerified: data.emailVerified,
            nicVerified: data.nicVerified,
            profile: data,
          });

          // ── Route based on accountStatus ─────────────────
          if (status === 'ACTIVE') {
            toast.success(respMsg || 'Welcome back!');
            navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
            return;
          }

          // Non-active → show themed popup with backend message + code
          setPopup({
            visible: true,
            title: status === 'PENDING' ? 'Account Pending' : 'Account Notice',
            message: respMsg || 'Your account is not active yet.',
            code: respCode || '',
            variant: status === 'PENDING' ? 'warning' : 'info',
          });
        },
        onError: err => {
          // Show popup for known status codes; toast for generic errors
          if (err?.code && err?.message) {
            setPopup({
              visible: true,
              title: 'Login Failed',
              message: err.message,
              code: err.code,
              variant: 'error',
            });
          } else {
            toast.error(err?.message || 'Login failed. Please try again.');
          }
        },
      },
    );
  }, [email, password, doLogin, saveUser, navigation, toast]);

  const handleForgotPassword = useCallback(() => {
    navigation.navigate('EmailVerifyForResetPass');
  }, [navigation]);

  const handleSignUp = useCallback(() => {
    navigation.navigate('CheckUser');
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={[COLORS.primaryLight, '#EBF7FA', COLORS.white]}
        locations={[0, 0.3, 1]}
        style={styles.gradient}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.primaryLight}
          translucent={false}
        />

        <KeyboardAvoidingView
          style={styles.keyboardView}
          // "padding" on iOS lifts content correctly above the keyboard.
          // On Android we deliberately do NOT set a behavior — Android's
          // own windowSoftInputMode="adjustResize" (set in
          // AndroidManifest.xml) already resizes the view when the
          // keyboard opens. Layering KeyboardAvoidingView's "height"
          // behavior on TOP of that native resize is what caused the
          // double-adjustment / jumpy-scroll/blink bug on Android OEM
          // skins like vivo's FuntouchOS. Letting Android's native
          // resize be the ONLY thing that moves the layout — with no
          // JS-driven repositioning of our own — is what keeps this
          // smooth across devices.
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? scale(12) : 0}
        >
          <ScrollView
            ref={scrollRef}
            onLayout={e => setContainerHeight(e.nativeEvent.layout.height)}
            onContentSizeChange={(_w, h) => setContentHeight(h)}
            scrollEnabled={canScroll}
            overScrollMode="never"
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingTop: isCompactHeight ? SPACING.lg : SPACING.xxxl,
              },
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}
            bounces={false}
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          >
            <Animated.View
              style={[
                styles.contentContainer,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
              ]}
            >
              <View
                style={[
                  styles.logoContainer,
                  { marginBottom: isCompactHeight ? SPACING.lg : SPACING.xl },
                ]}
              >
                <Image
                  source={LogoImg}
                  style={[
                    styles.logo,
                    isCompactHeight && { width: scale(58), height: scale(58) },
                  ]}
                />
              </View>

              <View
                style={[
                  styles.headlineContainer,
                  { marginBottom: isCompactHeight ? SPACING.lg : SPACING.xxl },
                ]}
              >
                <Text
                  style={[
                    styles.headline,
                    isNarrowWidth && { fontSize: TYPOGRAPHY.fontSize.xl },
                  ]}
                >
                  Welcome Back
                </Text>
                <Text style={styles.subtitle}>Log in to your account</Text>
              </View>

              <View style={styles.inputsContainer}>
                <InputField
                  label="Email"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  leftIcon="mail"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isPending}
                  returnKeyType="next"
                />

                <InputField
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  leftIcon="lock"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!isPending}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  rightElement={
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      disabled={isPending}
                    >
                      <Icon
                        name={showPassword ? 'eye' : 'eye-off'}
                        size={scale(20)}
                        color={COLORS.textTertiary}
                      />
                    </TouchableOpacity>
                  }
                />
              </View>

              <TouchableOpacity
                onPress={handleForgotPassword}
                style={styles.forgotButton}
                disabled={isPending}
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              <GradientButton
                title={isPending ? 'Signing in…' : 'Log In'}
                onPress={handleLogin}
                variant="primary"
                disabled={isPending}
              />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>Don't have an account? </Text>
                <TouchableOpacity onPress={handleSignUp} disabled={isPending}>
                  <Text style={styles.signUpLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>

      <FullScreenLoader visible={isPending} message="Signing you in…" />

      <StatusPopup
        visible={popup.visible}
        title={popup.title}
        message={popup.message}
        code={popup.code}
        variant={popup.variant}
        onClose={closePopup}
        onButtonPress={closePopup}
        buttonText="OK"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  gradient: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.screenPadding,
    paddingBottom: SPACING.xxxl,
  },
  contentContainer: { width: '100%' },
  logoContainer: { alignItems: 'center' },
  logo: { width: scale(72), height: scale(72), resizeMode: 'contain' },
  headlineContainer: { alignItems: 'center' },
  headline: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontFamily: TYPOGRAPHY.fontFamily.extraBold,
    color: COLORS.textPrimary,
    letterSpacing: TYPOGRAPHY.letterSpacing.normal,
    marginBottom: SPACING.gapSm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textSecondary,
  },
  inputsContainer: { marginBottom: SPACING.xs },
  forgotButton: { alignSelf: 'flex-end', marginBottom: SPACING.xl },
  forgotText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: COLORS.primary,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: {
    marginHorizontal: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textSecondary,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textSecondary,
  },
  signUpLink: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.primary,
  },
});

export default LoginScreen;
