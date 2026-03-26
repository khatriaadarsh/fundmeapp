// src/screens/onboarding/OnboardingScreen.jsx
import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  memo,
} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  PanResponder,
  Easing,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icons from 'react-native-vector-icons/Feather';

import ImgOnboarding1 from '../../assets/onBoardScreenImg01.jpeg';
import ImgOnboarding2 from '../../assets/onBoardScreenImg02.jpeg';
import ImgOnboarding3 from '../../assets/onBoardScreenImg03.jpeg';

const { width: SW, height: SH } = Dimensions.get('window');
const scale = size => (SW / 375) * size;
const vscale = size => (SH / 812) * size;

const C = {
  bg: '#FFFFFF',
  primary: '#0A3D62',
  primaryLight: '#15AABF',
  teal: '#00B4CC',
  tealDark: '#0097AA',
  dark: '#1A1A2E',
  gray: '#6B7280',
  lightGray: '#9CA3AF',
  dotActive: '#00B4CC',
  dotInactive: '#D1D5DB',
  border: '#E5E7EB',
  overlay: 'rgba(0,0,0,0.6)',
  white: '#FFFFFF',
  swipeTrack: 'rgba(255,255,255,0.15)',
  swipeThumb: '#FFFFFF',
  successGreen: '#22C55E',
};

const SCREENS = [
  {
    id: 1,
    image: ImgOnboarding1,
    headline: "Fund Someone's\nFuture Today",
    description:
      'Make a real impact with secure and transparent crowdfunding. Every rupee reaches those who need it.',
  },
  {
    id: 2,
    image: ImgOnboarding2,
    headline: 'Zero Commission.\nFull Impact.',
    description:
      'We charge nothing. 100% of your donation goes directly to the beneficiary. No hidden fees ever.',
  },
  {
    id: 3,
    image: ImgOnboarding3,
    headline: 'Verified &\nAI-Protected',
    description:
      'Every campaign creator is CNIC verified. Our AI fraud detection protects your donations automatically.',
  },
];

const TOTAL = SCREENS.length;

// ── Circle Progress Constants ──────────────────────────────
const CIRCLE_SIZE = scale(82);
const BORDER_WIDTH = scale(3);
const INNER_SIZE = CIRCLE_SIZE - BORDER_WIDTH * 2 - scale(6);

// ════════════════════════════════════════════════════════════
//  ✅ Progress Circle — unchanged
// ════════════════════════════════════════════════════════════
const SimpleCircularProgress = memo(({ progress, isLast, onPress }) => {
  const pressScale = useRef(new Animated.Value(1)).current;
  const rotateRight = useRef(new Animated.Value(0)).current;
  const rotateLeft = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (progress <= 0.5) {
      Animated.parallel([
        Animated.timing(rotateRight, {
          toValue: progress * 2,
          duration: 500,  // Slightly longer for smoother feel
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(rotateLeft, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(rotateRight, {
          toValue: 1,
          duration: 0,
          useNativeDriver: true,
        }),
        Animated.timing(rotateLeft, {
          toValue: (progress - 0.5) * 2,
          duration: 500,  // Smooth continuation
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [progress, rotateRight, rotateLeft ]);

  const handlePressIn = useCallback(() => {
    Animated.spring(pressScale, {
      toValue: 0.94,
      tension: 200,
      friction: 12,
      useNativeDriver: true,
    }).start();
  }, [pressScale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(pressScale, {
      toValue: 1,
      tension: 200,
      friction: 12,
      useNativeDriver: true,
    }).start();
  }, [pressScale]);

  // FIXED: Precise rotation range — starts FULLY HIDDEN (-90°), sweeps CW to visible (90°)
  // Ensures 0% = empty, smooth proportional growth from TOP-RIGHT clockwise
  const rightAngle = rotateRight.interpolate({
    inputRange: [0, 1],
    outputRange: ['-90deg', '90deg'],
  });

  const leftAngle = rotateLeft.interpolate({
    inputRange: [0, 1],
    outputRange: ['-90deg', '90deg'],
  });

  return (
    <Animated.View style={{ transform: [{ scale: pressScale }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={cpSt.wrapper}
      >
        <View style={cpSt.baseRing} />

        {/* Right arc: First 50% (top → bottom CW) */}
        <View style={cpSt.rightContainer}>
          <Animated.View
            style={[
              cpSt.rightHalf,
              {
                transform: [{ rotate: rightAngle }],
              },
            ]}
          />
        </View>

        {/* Left arc: Second 50% (top → bottom CCW via flip + rotate) */}
        <View style={cpSt.leftContainer}>
          <Animated.View
            style={[
              cpSt.leftHalf,
              {
                transform: [
                  { scaleX: -1 },  // Flip for CCW mirror effect
                  { rotate: leftAngle },
                ],
              },
            ]}
          />
        </View>

        <LinearGradient
          colors={[C.primary, C.primaryLight]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={cpSt.innerBtn}
        >
          <Text style={cpSt.btnText}>{isLast ? 'Done' : 'Next'}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
});

const cpSt = StyleSheet.create({
  wrapper: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  baseRing: {
    position: 'absolute',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: BORDER_WIDTH,
    borderColor: C.border,
  },
  rightContainer: {
    position: 'absolute',
    width: CIRCLE_SIZE / 2,
    height: CIRCLE_SIZE,
    right: 0,
    overflow: 'hidden',
  },
  rightHalf: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: BORDER_WIDTH,
    borderColor: C.teal,
    borderLeftWidth: 0,
    borderBottomWidth: 0,  // Top + right teal: perfect top-start semicircle
    position: 'absolute',
    right: 0,
  },
  leftContainer: {
    position: 'absolute',
    width: CIRCLE_SIZE / 2,
    height: CIRCLE_SIZE,
    left: 0,
    overflow: 'hidden',
  },
  leftHalf: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: BORDER_WIDTH,
    borderColor: C.teal,
    borderRightWidth: 0,
    borderBottomWidth: 0,  // Top + left teal (flipped to top + right visually)
    position: 'absolute',
    left: 0,
  },
  innerBtn: {
    width: INNER_SIZE,
    height: INNER_SIZE,
    borderRadius: INNER_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 10,
  },
  btnText: {
    fontSize: scale(13),
    fontWeight: '800',
    color: C.white,
    letterSpacing: 0.5,
  },
});

// ════════════════════════════════════════════════════════════
//  StepDots — unchanged
// ════════════════════════════════════════════════════════════
const StepDots = memo(({ active }) => {
  const dotWidths = useRef(
    [0, 1, 2].map(i => new Animated.Value(i === 0 ? scale(22) : scale(8))),
  ).current;

  const dotOpacities = useRef(
    [0, 1, 2].map(i => new Animated.Value(i === 0 ? 1 : 0.4)),
  ).current;

  useEffect(() => {
    [0, 1, 2].forEach(i => {
      Animated.parallel([
        Animated.spring(dotWidths[i], {
          toValue: i === active ? scale(22) : scale(8),
          tension: 60,
          friction: 8,
          useNativeDriver: false,
        }),
        Animated.timing(dotOpacities[i], {
          toValue: i === active ? 1 : 0.4,
          duration: 300,
          useNativeDriver: false,
        }),
      ]).start();
    });
  }, [active, dotWidths, dotOpacities]);

  return (
    <View style={dotSt.row}>
      {[0, 1, 2].map(i => (
        <Animated.View
          key={i}
          style={[
            dotSt.dot,
            {
              width: dotWidths[i],
              backgroundColor: i === active ? C.dotActive : C.dotInactive,
              opacity: dotOpacities[i],
            },
          ]}
        />
      ))}
    </View>
  );
});

const dotSt = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(6),
    marginTop: vscale(18),
  },
  dot: {
    height: scale(5),
    borderRadius: scale(3),
  },
});

// ════════════════════════════════════════════════════════════
//  ✅ SwipeToStart — FIXED: same button shows "Start" after swipe
// ════════════════════════════════════════════════════════════
const SWIPE_TRACK_WIDTH = SW - scale(80);
const SWIPE_THUMB_SIZE = scale(52);
const SWIPE_MAX = SWIPE_TRACK_WIDTH - SWIPE_THUMB_SIZE - scale(10);

const SwipeToStart = memo(({ onSwipeComplete }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const [swiped, setSwiped] = useState(false);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!swiped) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }
  }, [swiped, pulseAnim]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !swiped,
      onMoveShouldSetPanResponder: (_, g) => !swiped && g.dx > 5,
      onPanResponderMove: (_, g) => {
        const x = Math.max(0, Math.min(g.dx, SWIPE_MAX));
        translateX.setValue(x);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx >= SWIPE_MAX * 0.65) {
          Animated.spring(translateX, {
            toValue: SWIPE_MAX,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          }).start(() => setSwiped(true));
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            tension: 60,
            friction: 8,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  const hintOpacity = translateX.interpolate({
    inputRange: [0, SWIPE_MAX * 0.4],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const arrowBounce = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, scale(8)],
  });

  // ── After successful swipe: same track becomes "Start" button ──
  if (swiped) {
    return (
      <View style={swSt.wrapper}>
        <TouchableOpacity
          onPress={onSwipeComplete}
          activeOpacity={0.85}
          style={swSt.track}
        >
          <View style={swSt.startContent}>
            <Icons name="log-in" size={scale(18)} color={C.white} />
            <Text style={swSt.startText}>Start</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Before swipe: shows swipe track with thumb ──
  return (
    <View style={swSt.wrapper}>
      <View style={swSt.track}>
        <Animated.View style={[swSt.hintRow, { opacity: hintOpacity }]}>
          <Animated.View style={{ transform: [{ translateX: arrowBounce }] }}>
            <Icons
              name="chevrons-right"
              size={scale(18)}
              color="rgba(255,255,255,0.45)"
            />
          </Animated.View>
          <Text style={swSt.hintText}>Swipe to Start</Text>
        </Animated.View>

        <Animated.View
          {...panResponder.panHandlers}
          style={[swSt.thumb, { transform: [{ translateX }] }]}
        >
          <Icons name="arrow-right" size={scale(22)} color={C.primary} />
        </Animated.View>
      </View>
    </View>
  );
});

const swSt = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
    minHeight: SWIPE_THUMB_SIZE + scale(16),
    justifyContent: 'center',
  },
  // Same track used for both swipe state and swiped (Start) state
  track: {
    width: SWIPE_TRACK_WIDTH,
    height: SWIPE_THUMB_SIZE + scale(8),
    backgroundColor: C.swipeTrack,
    borderRadius: (SWIPE_THUMB_SIZE + scale(8)) / 2,
    justifyContent: 'center',
    paddingHorizontal: scale(4),
  },
  hintRow: {
    position: 'absolute',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(6),
  },
  hintText: {
    fontSize: scale(14),
    fontWeight: '600',
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 0.5,
  },
  thumb: {
    width: SWIPE_THUMB_SIZE,
    height: SWIPE_THUMB_SIZE,
    borderRadius: SWIPE_THUMB_SIZE / 2,
    backgroundColor: C.swipeThumb,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  // "Start" content shown inside same track after swipe
  startContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scale(8),
    flex: 1,
  },
  startText: {
    fontSize: scale(17),
    fontWeight: '800',
    color: C.white,
    letterSpacing: 0.5,
  },
});

// ════════════════════════════════════════════════════════════
//  AboutScreen — unchanged
// ════════════════════════════════════════════════════════════
const AboutScreen = memo(({ visible, onStart }) => {
  const slideAnim = useRef(new Animated.Value(SH)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(scale(50))).current;

  const feat1 = useRef(new Animated.Value(0)).current;
  const feat2 = useRef(new Animated.Value(0)).current;
  const feat3 = useRef(new Animated.Value(0)).current;
  const featSlide1 = useRef(new Animated.Value(scale(20))).current;
  const featSlide2 = useRef(new Animated.Value(scale(20))).current;
  const featSlide3 = useRef(new Animated.Value(scale(20))).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 10,
        useNativeDriver: true,
      }).start(() => {
        Animated.parallel([
          Animated.timing(contentFade, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.spring(contentSlide, {
            toValue: 0,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start(() => {
          Animated.stagger(120, [
            Animated.parallel([
              Animated.timing(feat1, { toValue: 1, duration: 350, useNativeDriver: true }),
              Animated.spring(featSlide1, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
            ]),
            Animated.parallel([
              Animated.timing(feat2, { toValue: 1, duration: 350, useNativeDriver: true }),
              Animated.spring(featSlide2, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
            ]),
            Animated.parallel([
              Animated.timing(feat3, { toValue: 1, duration: 350, useNativeDriver: true }),
              Animated.spring(featSlide3, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
            ]),
          ]).start();
        });
      });
    } else {
      slideAnim.setValue(SH);
      contentFade.setValue(0);
      contentSlide.setValue(scale(50));
      feat1.setValue(0);
      feat2.setValue(0);
      feat3.setValue(0);
      featSlide1.setValue(scale(20));
      featSlide2.setValue(scale(20));
      featSlide3.setValue(scale(20));
    }
  }, [visible, slideAnim, contentFade, contentSlide, feat1, feat2, feat3, featSlide1, featSlide2, featSlide3]);

  if (!visible) return null;

  const features = [
    { icon: 'shield', text: 'CNIC Verified Creators', desc: 'Every fundraiser is identity verified', anim: feat1, slide: featSlide1 },
    { icon: 'zap', text: 'AI Fraud Protection', desc: 'Smart detection keeps donations safe', anim: feat2, slide: featSlide2 },
    { icon: 'heart', text: '0% Platform Fee', desc: '100% of your donation reaches those in need', anim: feat3, slide: featSlide3 },
  ];

  return (
    <Animated.View
      style={[abSt.fullScreen, { transform: [{ translateY: slideAnim }] }]}
    >
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />
      <View style={abSt.decoCircle1} />
      <View style={abSt.decoCircle2} />

      <Animated.View
        style={[
          abSt.content,
          { opacity: contentFade, transform: [{ translateY: contentSlide }] },
        ]}
      >
        <View style={abSt.logoWrap}>
          <LinearGradient
            colors={[C.teal, C.tealDark]}
            style={abSt.logoGradient}
          >
            <Text style={abSt.logoEmoji}>🤲</Text>
          </LinearGradient>
        </View>

        <Text style={abSt.title}>Welcome to FundMe</Text>
        <Text style={abSt.subtitle}>Pakistan's Most Trusted Crowdfunding Platform</Text>
        <Text style={abSt.description}>
          We connect generous hearts with verified campaigns — from life-saving
          medical treatments to education scholarships and disaster relief.
          Together, we're building a more compassionate Pakistan.
        </Text>

        <View style={abSt.featureList}>
          {features.map((f, i) => (
            <Animated.View
              key={i}
              style={[
                abSt.featureCard,
                { opacity: f.anim, transform: [{ translateY: f.slide }] },
              ]}
            >
              <View style={abSt.featureIcon}>
                <Icons name={f.icon} size={scale(18)} color={C.teal} />
              </View>
              <View style={abSt.featureTextWrap}>
                <Text style={abSt.featureTitle}>{f.text}</Text>
                <Text style={abSt.featureDesc}>{f.desc}</Text>
              </View>
            </Animated.View>
          ))}
        </View>

        <Text style={abSt.tagline}>Every rupee counts. Every life matters.</Text>
      </Animated.View>

      <View style={abSt.bottomWrap}>
        <SwipeToStart onSwipeComplete={onStart} />
      </View>
    </Animated.View>
  );
});

const abSt = StyleSheet.create({
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: C.primary,
    zIndex: 100,
  },
  decoCircle1: {
    position: 'absolute',
    top: -scale(60),
    right: -scale(40),
    width: scale(180),
    height: scale(180),
    borderRadius: scale(90),
    borderWidth: scale(25),
    borderColor: 'rgba(255,255,255,0.04)',
  },
  decoCircle2: {
    position: 'absolute',
    top: scale(80),
    left: -scale(50),
    width: scale(120),
    height: scale(120),
    borderRadius: scale(60),
    borderWidth: scale(18),
    borderColor: 'rgba(255,255,255,0.03)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(28),
    paddingTop: vscale(50),
  },
  logoWrap: { marginBottom: scale(22) },
  logoGradient: {
    width: scale(76),
    height: scale(76),
    borderRadius: scale(22),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: C.teal,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  logoEmoji: { fontSize: scale(38) },
  title: {
    fontSize: scale(26),
    fontWeight: '800',
    color: C.white,
    textAlign: 'center',
    marginBottom: scale(6),
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: scale(13),
    fontWeight: '600',
    color: C.teal,
    textAlign: 'center',
    marginBottom: scale(18),
    letterSpacing: 0.3,
  },
  description: {
    fontSize: scale(13.5),
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    lineHeight: scale(21),
    marginBottom: scale(26),
    paddingHorizontal: scale(4),
  },
  featureList: {
    width: '100%',
    gap: scale(10),
    marginBottom: scale(22),
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: scale(14),
    padding: scale(14),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  featureIcon: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(12),
    backgroundColor: 'rgba(0,180,204,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  featureTextWrap: { flex: 1 },
  featureTitle: {
    fontSize: scale(13.5),
    fontWeight: '700',
    color: C.white,
    marginBottom: scale(2),
  },
  featureDesc: {
    fontSize: scale(11.5),
    color: 'rgba(255,255,255,0.5)',
    lineHeight: scale(16),
  },
  tagline: {
    fontSize: scale(12),
    fontStyle: 'italic',
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
  },
  bottomWrap: {
    paddingBottom: Platform.OS === 'android' ? scale(28) : scale(40),
    paddingHorizontal: scale(16),
  },
});

// ════════════════════════════════════════════════════════════
//  OnboardingScreen — Main, unchanged
// ════════════════════════════════════════════════════════════
const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAbout, setShowAbout] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const imageOpacity = useRef(new Animated.Value(1)).current;
  const imageScale = useRef(new Animated.Value(1)).current;
  const textOpacity = useRef(new Animated.Value(1)).current;
  const textSlide = useRef(new Animated.Value(0)).current;
  const mountFade = useRef(new Animated.Value(0)).current;
  const mountSlide = useRef(new Animated.Value(scale(30))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(mountFade, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(mountSlide, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [mountFade, mountSlide]);

  const animateTransition = useCallback(
    newIndex => {
      if (isTransitioning) return;
      setIsTransitioning(true);

      Animated.parallel([
        Animated.timing(imageOpacity, {
          toValue: 0,
          duration: 250,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(imageScale, {
          toValue: 0.88,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(textSlide, {
          toValue: scale(-20),
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentIndex(newIndex);
        textSlide.setValue(scale(30));
        imageScale.setValue(1.08);

        Animated.parallel([
          Animated.timing(imageOpacity, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.spring(imageScale, {
            toValue: 1,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(textOpacity, {
            toValue: 1,
            duration: 350,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.spring(textSlide, {
            toValue: 0,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start(() => setIsTransitioning(false));
      });
    },
    [isTransitioning, imageOpacity, imageScale, textOpacity, textSlide],
  );

  const handleNext = useCallback(() => {
    if (isTransitioning) return;
    if (currentIndex < TOTAL - 1) {
      animateTransition(currentIndex + 1);
    } else {
      setShowAbout(true);
    }
  }, [currentIndex, isTransitioning, animateTransition]);

  const handleStart = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  }, [navigation]);

  const currentScreen = SCREENS[currentIndex];
  const progress = (currentIndex + 1) / TOTAL;
  const isLast = currentIndex === TOTAL - 1;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <Animated.View
        style={[
          s.mainContainer,
          { opacity: mountFade, transform: [{ translateY: mountSlide }] },
        ]}
      >
        <TouchableOpacity
          style={s.skipBtn}
          onPress={() => setShowAbout(true)}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={s.skipText}>Skip</Text>
        </TouchableOpacity>

        <View style={s.imageSection}>
          <Animated.View
            style={[
              s.imageWrap,
              { opacity: imageOpacity, transform: [{ scale: imageScale }] },
            ]}
          >
            <Image
              source={currentScreen.image}
              style={s.image}
              resizeMode="cover"
            />
            <View style={[s.cornerDot, s.cornerDotTL]} />
            <View style={[s.cornerDot, s.cornerDotBR]} />
          </Animated.View>
        </View>

        <Animated.View
          style={[
            s.textSection,
            { opacity: textOpacity, transform: [{ translateY: textSlide }] },
          ]}
        >
          <Text style={s.headline}>{currentScreen.headline}</Text>
          <Text style={s.description}>{currentScreen.description}</Text>
        </Animated.View>

        <View style={s.bottomSection}>
          <StepDots active={currentIndex} />
          <Text style={s.counter}>
            <Text style={s.counterActive}>{currentIndex + 1}</Text>
            <Text style={s.counterSep}> / </Text>
            <Text style={s.counterTotal}>{TOTAL}</Text>
          </Text>
          <SimpleCircularProgress
            progress={progress}
            isLast={isLast}
            onPress={handleNext}
          />
        </View>

        <View style={s.loginRow}>
          <Text style={s.loginText}>Already have an account? </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.7}
          >
            <Text style={s.loginLink}>Log In</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <AboutScreen visible={showAbout} onStart={handleStart} />
    </SafeAreaView>
  );
};

export default OnboardingScreen;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: scale(24),
  },
  skipBtn: {
    position: 'absolute',
    top: vscale(35),
    right: scale(24),
    zIndex: 10,
    paddingHorizontal: scale(14),
    paddingVertical: scale(7),
    borderRadius: scale(20),
    backgroundColor: 'rgba(10,61,98,0.06)',
  },
  skipText: {
    fontSize: scale(13),
    fontWeight: '600',
    color: C.gray,
  },
  imageSection: {
    flex: 4,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: vscale(20),
  },
  imageWrap: { position: 'relative' },
  image: {
    width: scale(280),
    height: scale(280),
    borderRadius: scale(24),
  },
  cornerDot: {
    position: 'absolute',
    width: scale(10),
    height: scale(10),
    borderRadius: scale(5),
    backgroundColor: C.teal,
    opacity: 0.3,
  },
  cornerDotTL: { top: scale(-5), left: scale(-5) },
  cornerDotBR: { bottom: scale(-5), right: scale(-5) },
  textSection: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  headline: {
    fontSize: scale(24),
    fontWeight: '800',
    color: C.dark,
    textAlign: 'center',
    marginBottom: vscale(12),
    letterSpacing: -0.3,
    lineHeight: scale(32),
  },
  description: {
    fontSize: scale(14),
    color: C.gray,
    textAlign: 'center',
    lineHeight: scale(22),
    paddingHorizontal: scale(8),
  },
  bottomSection: {
    flex: 2.2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: vscale(10),
  },
  counter: { marginBottom: vscale(4) },
  counterActive: {
    fontSize: scale(16),
    fontWeight: '800',
    color: C.primary,
  },
  counterSep: { fontSize: scale(14), color: C.lightGray },
  counterTotal: {
    fontSize: scale(14),
    fontWeight: '600',
    color: C.lightGray,
  },
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: vscale(16),
  },
  loginText: { fontSize: scale(14), color: C.gray },
  loginLink: {
    fontSize: scale(14),
    color: C.teal,
    fontWeight: '700',
  },
});