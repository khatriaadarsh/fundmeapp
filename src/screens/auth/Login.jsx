// src/screens/auth/Login.jsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Dimensions,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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

// How far the logo is allowed to shrink when the keyboard is open — kept
// mild (60%) so the brand mark stays recognizable. Vertical spacing
// compresses far more aggressively (down to 20%), and the purely
// decorative rows (subtitle, divider, sign-up prompt) are hidden
// entirely while typing — between the three, the form should always
// fit above the keyboard without needing to scroll.
const COMPACT_FLOOR = 0.6;
const SPACING_FLOOR = 0.2;

// Fallback duration for Android, which doesn't reliably report keyboard
// animation duration the way iOS does. Deliberately kept short — the
// goal is for the compaction to feel like it happens IN THE SAME INSTANT
// as the keyboard, not as its own visible tween. A duration close to (or
// even slightly under) the keyboard's own animation reads as "instant"
// to the eye, whereas anything noticeably longer reads as "adjusting".
const ANDROID_KB_DURATION = 180;
const IOS_KB_DURATION_FALLBACK = 200;

const lerp = (min, max, t) => min + (max - min) * t;
const clamp01 = v => Math.min(1, Math.max(0, v));

const LoginScreen = ({ navigation, route }) => {
  const toast = useToast();
  const { saveUser, currentUser } = useAppContext();
  const { mutate: doLogin, isPending } = useLogin();
  const insets = useSafeAreaInsets();

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
  // separate from the compact-scaling logic below.
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scrollRef = useRef(null);

  // ── Compact-on-keyboard scaling, synced to the keyboard's own timing ──
  // Instead of reacting AFTER the keyboard finishes resizing the view
  // (which is what made the previous version feel like two separate
  // motions), we listen to the keyboard show/hide events directly and
  // kick off our own LayoutAnimation at the EXACT same moment, using the
  // keyboard's own reported duration on iOS (Android doesn't reliably
  // report one, so we use a matching fixed fallback). Result: the logo
  // shrinking, the spacing tightening, and the keyboard rising all
  // happen as ONE continuous motion instead of a visible two-step jump.
  const [scaleFactor, setScaleFactor] = useState(1);
  const [kbVisible, setKbVisible] = useState(false);
  const baseContentHeightRef = useRef(0);
  const hasMeasuredBaseRef = useRef(false);

  const handleContentSizeChange = useCallback((_w, h) => {
    if (!hasMeasuredBaseRef.current && h > 0) {
      baseContentHeightRef.current = h;
      hasMeasuredBaseRef.current = true;
    }
    setContentHeight(h);
  }, []);

  const [containerHeight, setContainerHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);

  const handleContainerLayout = useCallback((e) => {
    setContainerHeight(e.nativeEvent.layout.height);
  }, []);

  useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const applyCompact = (keyboardHeight, duration) => {
      LayoutAnimation.configureNext(
        LayoutAnimation.create(
          duration,
          LayoutAnimation.Types.linear,
          LayoutAnimation.Properties.opacity,
        ),
      );

      if (hasMeasuredBaseRef.current && keyboardHeight > 0) {
        const availableHeight =
          screenDims.height - insets.top - insets.bottom - keyboardHeight;
        const target = Math.min(
          1,
          Math.max(COMPACT_FLOOR, availableHeight / baseContentHeightRef.current),
        );
        setScaleFactor(target);
      }
      setKbVisible(keyboardHeight > 0);
    };

    const showSub = Keyboard.addListener(showEvt, (e) => {
      const height = e?.endCoordinates?.height ?? 0;
      const duration =
        Platform.OS === 'ios'
          ? e?.duration || IOS_KB_DURATION_FALLBACK
          : ANDROID_KB_DURATION;
      applyCompact(height, duration);
    });

    const hideSub = Keyboard.addListener(hideEvt, (e) => {
      const duration =
        Platform.OS === 'ios'
          ? e?.duration || IOS_KB_DURATION_FALLBACK
          : ANDROID_KB_DURATION;
      LayoutAnimation.configureNext(
        LayoutAnimation.create(
          duration,
          LayoutAnimation.Types.linear,
          LayoutAnimation.Properties.opacity,
        ),
      );
      setScaleFactor(1);
      setKbVisible(false);
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [screenDims, insets]);

  // Safety net only, for genuinely extreme cases where even the combined
  // compaction (logo shrink + spacing shrink + hidden decorative rows)
  // still isn't enough — e.g. a very tall keyboard on a very short
  // device. Toggling scrollEnabled has no visual effect by itself, so it
  // can't cause a jump; it just permits/blocks a touch gesture.
  const canScroll = contentHeight > containerHeight + 1;

  // Plain-number interpolation (no Animated) for the logo/spacing, driven
  // by scaleFactor which is now set directly by the keyboard listener
  // above, in sync with the keyboard's own animation.
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
                  {/* Purely decorative — hidden while the keyboard is open
                      to reclaim vertical space, restored the instant it
                      closes. LayoutAnimation (configured in the keyboard
                      listener above) animates this removal/insertion in
                      sync with everything else. */}
                  {!kbVisible && (
                    <Text style={styles.subtitle}>Log in to your account</Text>
                  )}
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

                {/* Purely decorative — same hide-while-typing treatment. */}
                {!kbVisible && (
                  <>
                    <View style={styles.divider}>
                      <View style={styles.dividerLine} />
                      <Text style={styles.dividerText}>or</Text>
                      <View style={styles.dividerLine} />
                    </View>

                    <View style={styles.signUpContainer}>
                      <Text style={styles.signUpText}>
                        Don't have an account?{' '}
                      </Text>
                      <TouchableOpacity onPress={handleSignUp} disabled={isPending}>
                        <Text style={styles.signUpLink}>Sign Up</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
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