// src/screens/auth/Login.jsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Dimensions,
  LayoutAnimation,
  UIManager,
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

// Required on Android (older architecture) for LayoutAnimation to work at
// all — harmless no-op on iOS / new-architecture Android where it's
// already enabled by default.
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const EMAIL_RE = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

// How far the layout is allowed to compress when the keyboard eats into
// the available space. 1 = full size (keyboard closed / plenty of room).
// COMPACT_FLOOR = the smallest fraction we'll ever shrink the LOGO to —
// kept mild (70%) so the brand mark stays recognizable. Vertical spacing
// is allowed to compress much more aggressively (down to 25%) since that's
// where most of the reclaimed space should come from, not the logo.
const COMPACT_FLOOR = 0.7;
const SPACING_FLOOR = 0.25;

const lerp = (min, max, t) => min + (max - min) * t;
const clamp01 = v => Math.min(1, Math.max(0, v));

const LAYOUT_ANIM_CONFIG = LayoutAnimation.create(
  220,
  LayoutAnimation.Types.easeInEaseOut,
  LayoutAnimation.Properties.opacity,
);

const LoginScreen = ({ navigation, route }) => {
  const toast = useToast();
  const { saveUser, currentUser } = useAppContext();
  const { mutate: doLogin, isPending } = useLogin();

  // ── Static, screen-size-based baseline (never changes with keyboard) ──
  // Uses Dimensions.get('screen') — the physical device size — not
  // useWindowDimensions()/'window', which can shift when the keyboard
  // opens on Android and would cause this baseline to jitter mid-typing.
  const [screenDims, setScreenDims] = useState(() => Dimensions.get('screen'));

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ screen }) => {
      setScreenDims(screen);
    });
    return () => sub?.remove?.();
  }, []);

  const isCompactHeight = screenDims.height < 700; // small/short phones
  const isNarrowWidth = screenDims.width < 360;

  const BASE_LOGO_SIZE = isCompactHeight ? scale(58) : scale(72);
  const BASE_LOGO_MARGIN = isCompactHeight ? SPACING.lg : SPACING.xl;
  const BASE_HEADLINE_MARGIN = isCompactHeight ? SPACING.lg : SPACING.xxl;
  const BASE_TOP_PADDING = isCompactHeight ? SPACING.lg : SPACING.xxxl;

  // Prefill email from CheckUser/SignUp flow, then from saved user
  const prefilledEmail = route?.params?.email || currentUser?.email || '';

  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [popup, setPopup] = useState({
    visible: false,
    title: '',
    message: '',
    code: '',
    variant: 'warning',
  });

  // Entrance fade/slide — Animated API, native driver, completely
  // separate from the compact-scaling logic below. This is the ONLY
  // place Animated.Value is used in this screen.
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scrollRef = useRef(null);

  // ── Dynamic "compact when keyboard opens" scaling ───────────────────
  // Instead of scrolling (or fighting React Native's Animated native/JS
  // driver restrictions), this uses LayoutAnimation: whenever the target
  // scale changes, we call LayoutAnimation.configureNext() and then just
  // update PLAIN numeric state. React Native then animates the resulting
  // layout change (width/height/margin/padding) natively and smoothly —
  // no Animated.Value involved for these props at all, so there is no
  // possibility of the native/JS driver conflict.
  //
  // We measure the REAL space left after the keyboard opens
  // (containerHeight, via onLayout — reflects the KeyboardAvoidingView's
  // shrunk size) against the form's natural full-size height
  // (baseContentHeight, captured once on first layout while the keyboard
  // is closed). The ratio drives a single scale factor (0..1) that
  // compresses the logo and vertical spacing — never the input fields or
  // button, which stay full-size and tappable at all times.
  const [containerHeight, setContainerHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [scaleFactor, setScaleFactor] = useState(1);
  const baseContentHeightRef = useRef(0);
  const hasMeasuredBaseRef = useRef(false);

  const handleContentSizeChange = useCallback((_w, h) => {
    setContentHeight(h);
    if (!hasMeasuredBaseRef.current && h > 0) {
      baseContentHeightRef.current = h;
      hasMeasuredBaseRef.current = true;
    }
  }, []);

  const handleContainerLayout = useCallback((e) => {
    setContainerHeight(e.nativeEvent.layout.height);
  }, []);

  useEffect(() => {
    if (!hasMeasuredBaseRef.current || containerHeight === 0) return;

    const target = Math.min(
      1,
      Math.max(COMPACT_FLOOR, containerHeight / baseContentHeightRef.current),
    );

    if (Math.abs(target - scaleFactor) < 0.01) return; // avoid churn

    LayoutAnimation.configureNext(LAYOUT_ANIM_CONFIG);
    setScaleFactor(target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerHeight]);

  // Safety net only — with compacting active, content should virtually
  // always fit. This only enables scrolling on genuinely extreme cases
  // (very tall keyboard + very short device) where even COMPACT_FLOOR
  // isn't enough.
  const canScroll = contentHeight > containerHeight + 1;

  useEffect(() => {
    if (!canScroll) {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }
  }, [canScroll]);

  // Plain-number interpolation (no Animated) — logo shrinks mildly
  // (floor 0.7), vertical spacing shrinks aggressively (floor 0.25) so
  // most of the reclaimed room comes from whitespace, not the logo.
  const t = clamp01((scaleFactor - COMPACT_FLOOR) / (1 - COMPACT_FLOOR));
  const logoSize = lerp(BASE_LOGO_SIZE * COMPACT_FLOOR, BASE_LOGO_SIZE, t);
  const logoMargin = lerp(BASE_LOGO_MARGIN * SPACING_FLOOR, BASE_LOGO_MARGIN, t);
  const headlineMargin = lerp(
    BASE_HEADLINE_MARGIN * SPACING_FLOOR,
    BASE_HEADLINE_MARGIN,
    t,
  );
  const topPadding = lerp(BASE_TOP_PADDING * SPACING_FLOOR, BASE_TOP_PADDING, t);

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

          if (status === 'ACTIVE') {
            toast.success(respMsg || 'Welcome back!');
            navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
            return;
          }

          setPopup({
            visible: true,
            title: status === 'PENDING' ? 'Account Pending' : 'Account Notice',
            message: respMsg || 'Your account is not active yet.',
            code: respCode || '',
            variant: status === 'PENDING' ? 'warning' : 'info',
          });
        },
        onError: err => {
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
          // Both platforms actively shrink this view when the keyboard
          // opens (rather than passively depending on native OS resize):
          //  - iOS: "padding" adds bottom padding equal to keyboard height.
          //  - Android: "height" makes RN track the keyboard via its own
          //    JS listener and shrink this view directly — required so
          //    that `containerHeight` below actually reflects the real
          //    reduced space, which is what drives the compact-scaling.
          //
          // Pair this with android:windowSoftInputMode="adjustPan" in
          // AndroidManifest.xml (on the main Activity) so the native OS
          // does NOT also resize the window — otherwise you'd get two
          // systems shrinking the view at once.
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? scale(12) : 0}
        >
          <ScrollView
            ref={scrollRef}
            onLayout={handleContainerLayout}
            onContentSizeChange={handleContentSizeChange}
            scrollEnabled={canScroll}
            overScrollMode="never"
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}
            bounces={false}
            automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          >
            {/* Entrance animation — Animated API, native driver only,
                fully isolated from the plain-number compact-scaling
                logic below (no Animated.Value used for layout metrics
                anywhere in this screen). */}
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              <View style={[styles.contentContainer, { paddingTop: topPadding }]}>
                <View style={[styles.logoContainer, { marginBottom: logoMargin }]}>
                  <Image
                    source={LogoImg}
                    style={{ width: logoSize, height: logoSize, resizeMode: 'contain' }}
                  />
                </View>

                <View
                  style={[
                    styles.headlineContainer,
                    { marginBottom: headlineMargin },
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