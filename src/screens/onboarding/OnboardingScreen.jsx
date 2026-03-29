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
const scale  = size => (SW / 375) * size;
const vscale = size => (SH / 812) * size;

const C = {
  bg:           '#FFFFFF',
  primary:      '#0A3D62',
  primaryLight: '#15AABF',
  teal:         '#15AABF',
  tealDark:     '#0097AA',
  dark:         '#1A1A2E',
  gray:         '#6B7280',
  lightGray:    '#9CA3AF',
  dotActive:    '#15AABF',
  dotInactive:  '#D1D5DB',
  border:       '#E5E7EB',
  white:        '#FFFFFF',
  swipeTrack:   'rgba(255,255,255,0.15)',
  swipeThumb:   '#FFFFFF',
};

const RING_COLOR = '#15AABF';

// ✅ Gradient colors for AboutScreen bg + CircularProgress inner
// linear-gradient(135deg, #0A3D62 0%, #15AABF 100%)
const GRAD_START = '#0A3D62';
const GRAD_END   = '#15AABF';

const SCREENS = [
  {
    id:          1,
    image:       ImgOnboarding1,
    headline:    "Fund Someone's\nFuture Today",
    description: 'Make a real impact with secure and transparent crowdfunding. Every rupee reaches those who need it.',
  },
  {
    id:          2,
    image:       ImgOnboarding2,
    headline:    'Zero Commission.\nFull Impact.',
    description: 'We charge nothing. 100% of your donation goes directly to the beneficiary. No hidden fees ever.',
  },
  {
    id:          3,
    image:       ImgOnboarding3,
    headline:    'Verified &\nAI-Protected',
    description: 'Every campaign creator is CNIC verified. Our AI fraud detection protects your donations automatically.',
  },
];

const TOTAL = SCREENS.length;

// ════════════════════════════════════════════════════════════
// CircularProgress
// ════════════════════════════════════════════════════════════
const RING_SIZE   = scale(82);
const RING_BORDER = scale(4);
const RING_INNER  = RING_SIZE - RING_BORDER * 2 - scale(8);

const CircularProgress = memo(({ progress, onPress }) => {
  const pressScale   = useRef(new Animated.Value(1)).current;
  const animProgress = useRef(new Animated.Value(progress)).current;
  const textOpacity  = useRef(new Animated.Value(1)).current;
  const [showDone, setShowDone] = useState(false);

  useEffect(() => {
    Animated.timing(animProgress, {
      toValue:         progress,
      duration:        600,
      easing:          Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (!finished) return;
      if (progress >= 1 && !showDone) {
        Animated.sequence([
          Animated.timing(textOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
          Animated.timing(textOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]).start();
        setShowDone(true);
      }
      if (progress < 1 && showDone) setShowDone(false);
    });
  }, [progress]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePressIn = useCallback(() => {
    Animated.spring(pressScale, {
      toValue: 0.93, tension: 200, friction: 12, useNativeDriver: true,
    }).start();
  }, [pressScale]);

  const handlePressOut = useCallback(() => {
    Animated.spring(pressScale, {
      toValue: 1, tension: 200, friction: 12, useNativeDriver: true,
    }).start();
  }, [pressScale]);

  const topColor = animProgress.interpolate({
    inputRange:  [0, 0.001, 1],
    outputRange: [C.border, RING_COLOR, RING_COLOR],
    extrapolate: 'clamp',
  });
  const rightColor = animProgress.interpolate({
    inputRange:  [0, 0.25, 0.251, 1],
    outputRange: [C.border, C.border, RING_COLOR, RING_COLOR],
    extrapolate: 'clamp',
  });
  const bottomColor = animProgress.interpolate({
    inputRange:  [0, 0.50, 0.501, 1],
    outputRange: [C.border, C.border, RING_COLOR, RING_COLOR],
    extrapolate: 'clamp',
  });
  const leftColor = animProgress.interpolate({
    inputRange:  [0, 0.75, 0.751, 1],
    outputRange: [C.border, C.border, RING_COLOR, RING_COLOR],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View style={{ transform: [{ scale: pressScale }] }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={cpr.wrapper}
      >
        <Animated.View
          style={[
            cpr.ring,
            {
              borderTopColor:    topColor,
              borderRightColor:  rightColor,
              borderBottomColor: bottomColor,
              borderLeftColor:   leftColor,
            },
          ]}
        />
        {/*
          ✅ CircularProgress inner button gradient:
          linear-gradient(135deg, #0A3D62 0%, #15AABF 100%)
          start:{x:0,y:0} end:{x:1,y:1} = 135deg diagonal
        */}
        <LinearGradient
          colors={[GRAD_START, GRAD_END]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={cpr.inner}
        >
          <Animated.Text style={[cpr.btnText, { opacity: textOpacity }]}>
            {showDone ? 'Done' : 'Next'}
          </Animated.Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
});

const cpr = StyleSheet.create({
  wrapper: {
    width:          RING_SIZE,
    height:         RING_SIZE,
    alignItems:     'center',
    justifyContent: 'center',
  },
  ring: {
    position:     'absolute',
    width:        RING_SIZE,
    height:       RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth:  RING_BORDER,
    borderColor:  C.border,
  },
  inner: {
    width:          RING_INNER,
    height:         RING_INNER,
    borderRadius:   RING_INNER / 2,
    alignItems:     'center',
    justifyContent: 'center',
    elevation:      6,
    shadowColor:    C.primary,
    shadowOffset:   { width: 0, height: 3 },
    shadowOpacity:  0.3,
    shadowRadius:   6,
    zIndex:         10,
  },
  btnText: {
    fontSize:      scale(13),
    fontWeight:    '800',
    color:         C.white,
    letterSpacing: 0.5,
  },
});

// ════════════════════════════════════════════════════════════
// StepDots
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
          tension: 60, friction: 8, useNativeDriver: false,
        }),
        Animated.timing(dotOpacities[i], {
          toValue: i === active ? 1 : 0.4,
          duration: 300, useNativeDriver: false,
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
              width:           dotWidths[i],
              backgroundColor: i === active ? C.dotActive : C.dotInactive,
              opacity:         dotOpacities[i],
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
    alignItems:    'center',
    gap:           scale(6),
  },
  dot: {
    height:       scale(5),
    borderRadius: scale(3),
  },
});

// ════════════════════════════════════════════════════════════
// SwipeToStart
// ════════════════════════════════════════════════════════════
const SWIPE_TRACK_WIDTH = SW - scale(80);
const SWIPE_THUMB_SIZE  = scale(52);
const SWIPE_MAX         = SWIPE_TRACK_WIDTH - SWIPE_THUMB_SIZE - scale(10);

const SwipeToStart = memo(({ onSwipeComplete }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const [swiped, setSwiped] = useState(false);
  const pulseAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!swiped) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1, duration: 1200,
            easing: Easing.inOut(Easing.ease), useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0, duration: 1200,
            easing: Easing.inOut(Easing.ease), useNativeDriver: true,
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
      onMoveShouldSetPanResponder:  (_, g) => !swiped && g.dx > 5,
      onPanResponderMove: (_, g) => {
        translateX.setValue(Math.max(0, Math.min(g.dx, SWIPE_MAX)));
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx >= SWIPE_MAX * 0.65) {
          Animated.spring(translateX, {
            toValue: SWIPE_MAX, tension: 50, friction: 8, useNativeDriver: true,
          }).start(() => setSwiped(true));
        } else {
          Animated.spring(translateX, {
            toValue: 0, tension: 60, friction: 8, useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  const hintOpacity = translateX.interpolate({
    inputRange: [0, SWIPE_MAX * 0.4], outputRange: [1, 0], extrapolate: 'clamp',
  });
  const arrowBounce = pulseAnim.interpolate({
    inputRange: [0, 1], outputRange: [0, scale(8)],
  });

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

  return (
    <View style={swSt.wrapper}>
      <View style={swSt.track}>
        <Animated.View style={[swSt.hintRow, { opacity: hintOpacity }]}>
          <Animated.View style={{ transform: [{ translateX: arrowBounce }] }}>
            <Icons name="chevrons-right" size={scale(18)} color="rgba(255,255,255,0.45)" />
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
    width:          '100%',
    alignItems:     'center',
    minHeight:      SWIPE_THUMB_SIZE + scale(16),
    justifyContent: 'center',
  },
  track: {
    width:             SWIPE_TRACK_WIDTH,
    height:            SWIPE_THUMB_SIZE + scale(8),
    backgroundColor:   C.swipeTrack,
    borderRadius:      (SWIPE_THUMB_SIZE + scale(8)) / 2,
    justifyContent:    'center',
    paddingHorizontal: scale(4),
  },
  hintRow: {
    position:       'absolute',
    width:          '100%',
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            scale(6),
  },
  hintText: {
    fontSize:      scale(14),
    fontWeight:    '600',
    color:         'rgba(255,255,255,0.55)',
    letterSpacing: 0.5,
  },
  thumb: {
    width:           SWIPE_THUMB_SIZE,
    height:          SWIPE_THUMB_SIZE,
    borderRadius:    SWIPE_THUMB_SIZE / 2,
    backgroundColor: C.swipeThumb,
    alignItems:      'center',
    justifyContent:  'center',
    elevation:       6,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 3 },
    shadowOpacity:   0.2,
    shadowRadius:    6,
  },
  startContent: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            scale(8),
    flex:           1,
  },
  startText: {
    fontSize:      scale(17),
    fontWeight:    '800',
    color:         C.white,
    letterSpacing: 0.5,
  },
});

// ════════════════════════════════════════════════════════════
// AboutScreen
// ════════════════════════════════════════════════════════════
const AboutScreen = memo(({ visible, onStart }) => {
  const slideAnim    = useRef(new Animated.Value(SH)).current;
  const contentFade  = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(scale(50))).current;
  const feat1        = useRef(new Animated.Value(0)).current;
  const feat2        = useRef(new Animated.Value(0)).current;
  const feat3        = useRef(new Animated.Value(0)).current;
  const featSlide1   = useRef(new Animated.Value(scale(20))).current;
  const featSlide2   = useRef(new Animated.Value(scale(20))).current;
  const featSlide3   = useRef(new Animated.Value(scale(20))).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0, tension: 40, friction: 10, useNativeDriver: true,
      }).start(() => {
        Animated.parallel([
          Animated.timing(contentFade,  { toValue: 1, duration: 500, useNativeDriver: true }),
          Animated.spring(contentSlide, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
        ]).start(() => {
          Animated.stagger(120, [
            Animated.parallel([
              Animated.timing(feat1,      { toValue: 1, duration: 350, useNativeDriver: true }),
              Animated.spring(featSlide1, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
            ]),
            Animated.parallel([
              Animated.timing(feat2,      { toValue: 1, duration: 350, useNativeDriver: true }),
              Animated.spring(featSlide2, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
            ]),
            Animated.parallel([
              Animated.timing(feat3,      { toValue: 1, duration: 350, useNativeDriver: true }),
              Animated.spring(featSlide3, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
            ]),
          ]).start();
        });
      });
    } else {
      slideAnim.setValue(SH);
      contentFade.setValue(0);
      contentSlide.setValue(scale(50));
      feat1.setValue(0); feat2.setValue(0); feat3.setValue(0);
      featSlide1.setValue(scale(20));
      featSlide2.setValue(scale(20));
      featSlide3.setValue(scale(20));
    }
  }, [
    visible, slideAnim, contentFade, contentSlide,
    feat1, feat2, feat3, featSlide1, featSlide2, featSlide3,
  ]);

  if (!visible) return null;

  const features = [
    { icon: 'shield', text: 'CNIC Verified Creators', desc: 'Every fundraiser is identity verified',       anim: feat1, slide: featSlide1 },
    { icon: 'zap',    text: 'AI Fraud Protection',    desc: 'Smart detection keeps donations safe',         anim: feat2, slide: featSlide2 },
    { icon: 'heart',  text: '0% Platform Fee',        desc: '100% of your donation reaches those in need', anim: feat3, slide: featSlide3 },
  ];

  return (
    <Animated.View
      style={[abSt.fullScreen, { transform: [{ translateY: slideAnim }] }]}
    >
      {/*
        ✅ AboutScreen background:
        linear-gradient(135deg, #0A3D62 0%, #15AABF 100%)
        Covers the entire screen behind all content.
      */}
      <LinearGradient
        colors={[GRAD_START, GRAD_END]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <StatusBar barStyle="light-content" backgroundColor={GRAD_START} />
      <View style={abSt.decoCircle1} />
      <View style={abSt.decoCircle2} />

      <Animated.View
        style={[
          abSt.content,
          { opacity: contentFade, transform: [{ translateY: contentSlide }] },
        ]}
      >
        {/* Logo */}
        <View style={abSt.logoWrap}>
          <LinearGradient
            colors={['rgba(255,255,255,0.25)', 'rgba(255,255,255,0.10)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
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
                <Icons name={f.icon} size={scale(18)} color={C.white} />
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
  // ✅ fullScreen: no backgroundColor — LinearGradient handles it
  fullScreen: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  decoCircle1: {
    position:     'absolute',
    top:          -scale(60),
    right:        -scale(40),
    width:        scale(180),
    height:       scale(180),
    borderRadius: scale(90),
    borderWidth:  scale(25),
    borderColor:  'rgba(255,255,255,0.06)',
  },
  decoCircle2: {
    position:     'absolute',
    top:          scale(80),
    left:         -scale(50),
    width:        scale(120),
    height:       scale(120),
    borderRadius: scale(60),
    borderWidth:  scale(18),
    borderColor:  'rgba(255,255,255,0.04)',
  },
  content: {
    flex:              1,
    alignItems:        'center',
    justifyContent:    'center',
    paddingHorizontal: scale(28),
    paddingTop:        vscale(50),
  },
  logoWrap:     { marginBottom: scale(22) },
  logoGradient: {
    width:          scale(76),
    height:         scale(76),
    borderRadius:   scale(22),
    alignItems:     'center',
    justifyContent: 'center',
    elevation:      8,
    shadowColor:    '#000',
    shadowOffset:   { width: 0, height: 4 },
    shadowOpacity:  0.25,
    shadowRadius:   10,
    borderWidth:    1.5,
    borderColor:    'rgba(255,255,255,0.20)',
  },
  logoEmoji: { fontSize: scale(38) },

  title: {
    fontSize:     scale(26),
    fontWeight:   '800',
    color:        C.white,
    textAlign:    'center',
    marginBottom: scale(6),
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize:      scale(13),
    fontWeight:    '600',
    color:         'rgba(255,255,255,0.80)',
    textAlign:     'center',
    marginBottom:  scale(18),
    letterSpacing: 0.3,
  },
  description: {
    fontSize:          scale(13.5),
    color:             'rgba(255,255,255,0.65)',
    textAlign:         'center',
    lineHeight:        scale(21),
    marginBottom:      scale(26),
    paddingHorizontal: scale(4),
  },

  featureList:  { width: '100%', gap: scale(10), marginBottom: scale(22) },
  featureCard: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius:    scale(14),
    padding:         scale(14),
    borderWidth:     1,
    borderColor:     'rgba(255,255,255,0.12)',
  },
  featureIcon: {
    width:           scale(40),
    height:          scale(40),
    borderRadius:    scale(12),
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems:      'center',
    justifyContent:  'center',
    marginRight:     scale(12),
  },
  featureTextWrap: { flex: 1 },
  featureTitle: {
    fontSize:     scale(13.5),
    fontWeight:   '700',
    color:        C.white,
    marginBottom: scale(2),
  },
  featureDesc: {
    fontSize:   scale(11.5),
    color:      'rgba(255,255,255,0.55)',
    lineHeight: scale(16),
  },
  tagline: {
    fontSize:   scale(12),
    fontStyle:  'italic',
    color:      'rgba(255,255,255,0.40)',
    textAlign:  'center',
  },
  bottomWrap: {
    paddingBottom:     Platform.OS === 'android' ? scale(28) : scale(40),
    paddingHorizontal: scale(16),
  },
});

// ════════════════════════════════════════════════════════════
// MAIN OnboardingScreen — unchanged
// ════════════════════════════════════════════════════════════
const OnboardingScreen = ({ navigation }) => {
  const [currentIndex,    setCurrentIndex]    = useState(0);
  const [showAbout,       setShowAbout]       = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const imageOpacity = useRef(new Animated.Value(1)).current;
  const imageScale   = useRef(new Animated.Value(1)).current;
  const textOpacity  = useRef(new Animated.Value(1)).current;
  const textSlide    = useRef(new Animated.Value(0)).current;
  const mountFade    = useRef(new Animated.Value(0)).current;
  const mountSlide   = useRef(new Animated.Value(scale(30))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(mountFade, {
        toValue: 1, duration: 600,
        easing: Easing.out(Easing.cubic), useNativeDriver: true,
      }),
      Animated.spring(mountSlide, {
        toValue: 0, tension: 50, friction: 8, useNativeDriver: true,
      }),
    ]).start();
  }, [mountFade, mountSlide]);

  const animateTransition = useCallback(newIndex => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    Animated.parallel([
      Animated.timing(imageOpacity, { toValue: 0, duration: 250, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      Animated.timing(imageScale,   { toValue: 0.88, duration: 250, useNativeDriver: true }),
      Animated.timing(textOpacity,  { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(textSlide,    { toValue: scale(-20), duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setCurrentIndex(newIndex);
      textSlide.setValue(scale(30));
      imageScale.setValue(1.08);

      Animated.parallel([
        Animated.timing(imageOpacity, { toValue: 1, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.spring(imageScale,   { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
        Animated.timing(textOpacity,  { toValue: 1, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.spring(textSlide,    { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
      ]).start(() => setIsTransitioning(false));
    });
  }, [isTransitioning, imageOpacity, imageScale, textOpacity, textSlide]);

  const handleNext = useCallback(() => {
    if (isTransitioning) return;
    if (currentIndex < TOTAL - 1) {
      animateTransition(currentIndex + 1);
    } else {
      setShowAbout(true);
    }
  }, [currentIndex, isTransitioning, animateTransition]);

  const handleStart = useCallback(() => {
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  }, [navigation]);

  const currentScreen = SCREENS[currentIndex];
  const progress      = (currentIndex + 1) / TOTAL;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <Animated.View
        style={[
          s.container,
          { opacity: mountFade, transform: [{ translateY: mountSlide }] },
        ]}
      >
        <TouchableOpacity
          style={s.skipBtn}
          onPress={() => setShowAbout(true)}
          activeOpacity={0.7}
          hitSlop={{ top:10, bottom:10, left:10, right:10 }}
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
          <CircularProgress
            progress={progress}
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

// ════════════════════════════════════════════════════════════
// STYLES — unchanged
// ════════════════════════════════════════════════════════════
const s = StyleSheet.create({

  safe: {
    flex:            1,
    backgroundColor: C.bg,
  },

  container: {
    flex:              1,
    alignItems:        'center',
    paddingHorizontal: scale(24),
    paddingTop:        vscale(8),
  },

  skipBtn: {
    position:          'absolute',
    top:               vscale(16),
    right:             scale(24),
    zIndex:            10,
    paddingHorizontal: scale(16),
    paddingVertical:   vscale(8),
    borderRadius:      scale(20),
    backgroundColor:   'rgba(10,61,98,0.07)',
  },
  skipText: {
    fontSize:   scale(13),
    fontWeight: '600',
    color:      C.gray,
  },

  imageSection: {
    flex:           4,
    justifyContent: 'center',
    alignItems:     'center',
    width:          '100%',
    paddingTop:     vscale(48),
  },
  imageWrap: { position: 'relative' },
  image: {
    width:        scale(272),
    height:       scale(272),
    borderRadius: scale(28),
  },
  cornerDot: {
    position:        'absolute',
    width:           scale(10),
    height:          scale(10),
    borderRadius:    scale(5),
    backgroundColor: C.teal,
    opacity:         0.3,
  },
  cornerDotTL: { top: scale(-5),    left:  scale(-5) },
  cornerDotBR: { bottom: scale(-5), right: scale(-5) },

  textSection: {
    flex:           2,
    justifyContent: 'center',
    alignItems:     'center',
    width:          '100%',
    paddingTop:     vscale(8),
  },
  headline: {
    fontSize:      scale(24),
    fontWeight:    '800',
    color:         C.dark,
    textAlign:     'center',
    marginBottom:  vscale(10),
    letterSpacing: -0.3,
    lineHeight:    scale(32),
  },
  description: {
    fontSize:          scale(14),
    color:             C.gray,
    textAlign:         'center',
    lineHeight:        scale(21),
    paddingHorizontal: scale(4),
  },

  bottomSection: {
    flex:           2,
    alignItems:     'center',
    justifyContent: 'center',
    gap:            vscale(12),
  },

  counter:       { marginTop: vscale(4) },
  counterActive: { fontSize: scale(16), fontWeight: '800', color: C.primary },
  counterSep:    { fontSize: scale(14), color: C.lightGray },
  counterTotal:  { fontSize: scale(14), fontWeight: '600', color: C.lightGray },

  loginRow: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingBottom:  Platform.OS === 'ios' ? vscale(8) : vscale(16),
    paddingTop:     vscale(4),
  },
  loginText: { fontSize: scale(14), color: C.gray },
  loginLink: { fontSize: scale(14), color: C.teal, fontWeight: '700' },
});