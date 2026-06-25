// src/screens/splash/Splash.jsx
//
// THE FIX — why the old version got stuck:
//
//   The setTimeout closure captured onboardingSeen / currentUser /
//   isBootstrapping at mount time — all still at their initial values
//   (false / null / true) because AsyncStorage hadn't finished reading.
//   So navigate() always saw stale data and either routed wrong or
//   did nothing useful.
//
// THE SOLUTION — two independent gates, both must pass:
//
//   Gate 1 → timerDone ref  (set by the 3.6 s setTimeout)
//   Gate 2 → isBootstrapping flips false  (AsyncStorage finished)
//
//   tryNavigate() is called from BOTH places.
//   It reads fresh context values passed as arguments (no stale closure).
//   It only proceeds when BOTH gates are open, and only once (navigated ref).
//
//   Normal case  : storage finishes in ~50 ms → timer fires at 3.6 s →
//                  tryNavigate sees both gates open → navigates.
//   Slow storage : storage takes > 3.6 s (edge case) → timer fires first,
//                  gate 1 opens; when storage finally resolves, the
//                  bootstrap useEffect calls tryNavigate again → navigates.
//
import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Easing,
  StatusBar,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import FundMeLogo from '../../assets/logo.png';
import { useAppContext } from '../../context/AppContext';

const { width: SW, height: SH } = Dimensions.get('window');
const scale  = size => (SW / 375) * size;
const vscale = size => (SH / 812) * size;

const C = {
  gradStart:  '#0A3D62',
  gradEnd:    '#15AABF',
  blob1:      'rgba(10,61,98,0.70)',
  blob2:      'rgba(21,170,191,0.45)',
  blobGlow1:  '#0A3D62',
  blobGlow2:  '#15AABF',
  glowColor:  'rgba(21,170,191,0.50)',
  glowShadow: '#15AABF',
  track:      'rgba(255,255,255,0.18)',
  shimmer:    'rgba(255,255,255,0.80)',
  barGlow:    'rgba(21,170,191,0.60)',
  white:      '#FFFFFF',
  whiteMid:   'rgba(255,255,255,0.65)',
  whiteLow:   'rgba(255,255,255,0.30)',
};

// ═══════════════════════════════════════════════════════════
// SHIMMER LOADING BAR  (unchanged)
// ═══════════════════════════════════════════════════════════
const LoadingBar = ({ fillAnim }) => {
  const shimmerX = useRef(new Animated.Value(-scale(130))).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerX, {
        toValue:         scale(130) * 2,
        duration:        1000,
        easing:          Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [shimmerX]);

  const fillW = fillAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [0, scale(130)],
    extrapolate: 'clamp',
  });

  const glowW = fillAnim.interpolate({
    inputRange:  [0, 1],
    outputRange: [0, scale(130)],
    extrapolate: 'clamp',
  });

  return (
    <View style={lb.wrap}>
      <View style={lb.track}>
        <Animated.View style={[lb.fill, { width: fillW }]}>
          <Animated.View
            style={[
              lb.shimmer,
              { transform: [{ translateX: shimmerX }, { skewX: '-15deg' }] },
            ]}
          />
        </Animated.View>
      </View>
      <Animated.View style={[lb.glow, { width: glowW }]} />
    </View>
  );
};

const lb = StyleSheet.create({
  wrap:    { alignItems: 'center' },
  track: {
    width:           scale(130),
    height:          scale(3),
    backgroundColor: C.track,
    borderRadius:    scale(4),
    overflow:        'hidden',
  },
  fill: {
    height:          scale(3),
    backgroundColor: C.white,
    borderRadius:    scale(4),
    overflow:        'hidden',
  },
  shimmer: {
    position:        'absolute',
    top:             0,
    bottom:          0,
    width:           scale(50),
    backgroundColor: C.shimmer,
  },
  glow: {
    marginTop:       scale(3),
    height:          scale(6),
    borderRadius:    scale(3),
    backgroundColor: C.barGlow,
    opacity:         0.7,
    shadowColor:     C.glowShadow,
    shadowOffset:    { width: 0, height: 0 },
    shadowOpacity:   1,
    shadowRadius:    scale(6),
    elevation:       0,
  },
});

// ═══════════════════════════════════════════════════════════
// MAIN SPLASH SCREEN
// ═══════════════════════════════════════════════════════════
const Splash = ({ navigation }) => {
  // ── Context (re-renders when storage finishes) ────────────
  const { isBootstrapping, onboardingSeen, currentUser } = useAppContext();

  // ── Refs: never cause re-renders, safe to read anywhere ──
  const timerDone = useRef(false);  // true once 3.6 s elapses
  const navigated = useRef(false);  // true once we've called replace()

  // ── Animations ───────────────────────────────────────────
  const blob1Scale  = useRef(new Animated.Value(1)).current;
  const blob1X      = useRef(new Animated.Value(0)).current;
  const blob1Y      = useRef(new Animated.Value(0)).current;
  const blob2Scale  = useRef(new Animated.Value(1)).current;
  const blob2X      = useRef(new Animated.Value(0)).current;
  const blob2Y      = useRef(new Animated.Value(0)).current;
  const logoScale   = useRef(new Animated.Value(0.82)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoGlow    = useRef(new Animated.Value(0)).current;
  const glowPulse   = useRef(new Animated.Value(1)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY       = useRef(new Animated.Value(scale(16))).current;
  const tagOpacity  = useRef(new Animated.Value(0)).current;
  const tagY        = useRef(new Animated.Value(scale(10))).current;
  const barFill     = useRef(new Animated.Value(0)).current;
  const barOpacity  = useRef(new Animated.Value(0)).current;
  const loadTextOp  = useRef(new Animated.Value(0)).current;

  // ── tryNavigate ───────────────────────────────────────────
  // Receives current values as arguments so it is never stale.
  // Called from two places; only the first call that finds both
  // gates open will actually navigate.
  const tryNavigate = useCallback(
    (bootstrapFinished, seenOnboarding, user) => {
      if (navigated.current)   return; // already gone
      if (!timerDone.current)  return; // timer not done yet
      if (!bootstrapFinished)  return; // storage not done yet

      navigated.current = true;

      if (!seenOnboarding) {
        // First install / after resetAll
        navigation.replace('OnboardingScreen');
        return;
      }

      if (!user) {
        // Onboarding seen but no saved session
        navigation.replace('CheckUser');
        return;
      }

      if (user.registrationStatus === 'complete') {
        // Fully registered → skip to Login
        navigation.replace('Login', { email: user.email });
        return;
      }

      // Draft registration or unknown status → CheckUser handles resume
      navigation.replace('CheckUser');
    },
    [navigation],
  );

  // ── Mount: start all animations + the timer ───────────────
  useEffect(() => {
    const floatBlob = (tx, ty, sc, d1, d2) =>
      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(tx, { toValue: scale(20),   duration: d1, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(ty, { toValue: vscale(16),  duration: d1, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(sc, { toValue: 1.10,        duration: d1, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(tx, { toValue: -scale(16),  duration: d2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(ty, { toValue: -vscale(12), duration: d2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(sc, { toValue: 0.95,        duration: d2, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          ]),
          Animated.parallel([
            Animated.timing(tx, { toValue: 0, duration: d1, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(ty, { toValue: 0, duration: d1, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            Animated.timing(sc, { toValue: 1, duration: d1, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          ]),
        ]),
      );

    floatBlob(blob1X, blob1Y, blob1Scale, 4200, 4800).start();
    floatBlob(blob2X, blob2Y, blob2Scale, 5200, 4600).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1.22, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 1.0,  duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    ).start();

    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 700, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.spring(logoScale,   { toValue: 1, tension: 50, friction: 7,                       useNativeDriver: true }),
        Animated.timing(logoGlow,    { toValue: 1, duration: 900, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ]),
    ]).start();

    Animated.sequence([
      Animated.delay(850),
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 600, easing: Easing.out(Easing.ease),  useNativeDriver: true }),
        Animated.timing(titleY,       { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();

    Animated.sequence([
      Animated.delay(1250),
      Animated.parallel([
        Animated.timing(tagOpacity, { toValue: 1, duration: 700, easing: Easing.out(Easing.ease),  useNativeDriver: true }),
        Animated.timing(tagY,       { toValue: 0, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();

    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(barOpacity, { toValue: 1, duration: 400, easing: Easing.ease, useNativeDriver: true }),
        Animated.timing(barFill,    { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.ease), useNativeDriver: false }),
      ]),
    ]).start();

    Animated.sequence([
      Animated.delay(600),
      Animated.timing(loadTextOp, { toValue: 1, duration: 500, easing: Easing.ease, useNativeDriver: true }),
    ]).start();

    // ── Timer gate ─────────────────────────────────────────
    // Does NOT read context values — just sets the flag and
    // calls tryNavigate. The bootstrap useEffect below supplies
    // the fresh context values when it fires.
    const timer = setTimeout(() => {
      timerDone.current = true;
      // At this moment the bootstrap useEffect may or may not
      // have already fired. We call tryNavigate here so that if
      // bootstrap already finished (isBootstrapping === false),
      // we navigate right away. If not, the bootstrap effect
      // will call tryNavigate when it resolves.
      //
      // We use the module-level ref trick: read the LATEST
      // context through a small indirection via the latestCtx ref
      // defined below.
      tryNavigate(
        latestCtxRef.current.bootstrapFinished,
        latestCtxRef.current.onboardingSeen,
        latestCtxRef.current.currentUser,
      );
    }, 3600);

    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Keep a ref that always holds the LATEST context values ─
  // This is the key pattern: a ref updated on every render
  // so the setTimeout callback (which has a stale closure) can
  // read fresh values through it.
  const latestCtxRef = useRef({
    bootstrapFinished: !isBootstrapping,
    onboardingSeen,
    currentUser,
  });
  useEffect(() => {
    latestCtxRef.current = {
      bootstrapFinished: !isBootstrapping,
      onboardingSeen,
      currentUser,
    };
  }); // no dep array — runs after every render to stay in sync

  // ── Bootstrap gate ─────────────────────────────────────────
  // Fires when isBootstrapping flips to false (storage done).
  // If the timer already elapsed, navigates immediately.
  // If not, the timer's callback will navigate when it fires.
  useEffect(() => {
    if (!isBootstrapping) {
      tryNavigate(true, onboardingSeen, currentUser);
    }
  }, [isBootstrapping, onboardingSeen, currentUser, tryNavigate]);

  const glowOpacity = logoGlow.interpolate({
    inputRange:  [0, 1],
    outputRange: [0, 1],
  });

  return (
    <LinearGradient
      colors={[C.gradStart, C.gradEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={s.container}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Blob 1 — top right */}
      <Animated.View
        style={[
          s.blob1,
          {
            transform: [
              { translateX: blob1X },
              { translateY: blob1Y },
              { scale: blob1Scale },
            ],
          },
        ]}
      />

      {/* Blob 2 — bottom left */}
      <Animated.View
        style={[
          s.blob2,
          {
            transform: [
              { translateX: blob2X },
              { translateY: blob2Y },
              { scale: blob2Scale },
            ],
          },
        ]}
      />

      {/* Center content */}
      <View style={s.center}>

        <Animated.View
          style={[
            s.logoWrap,
            {
              opacity:   logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Animated.View
            style={[
              s.glowRing,
              {
                opacity:   glowOpacity,
                transform: [{ scale: glowPulse }],
              },
            ]}
          />
          <Animated.View style={[s.glowInner, { opacity: glowOpacity }]} />
          <View style={s.logoCircle}>
            <Image
              source={FundMeLogo}
              style={s.logoImg}
              resizeMode="contain"
            />
          </View>
        </Animated.View>

        <Animated.Text
          style={[
            s.appName,
            {
              opacity:   titleOpacity,
              transform: [{ translateY: titleY }],
            },
          ]}
        >
          FundMe
        </Animated.Text>

        <Animated.Text
          style={[
            s.tagline,
            {
              opacity:   tagOpacity,
              transform: [{ translateY: tagY }],
            },
          ]}
        >
          Fund Someone's Future
        </Animated.Text>

      </View>

      {/* Bottom loading bar */}
      <Animated.View style={[s.bottom, { opacity: barOpacity }]}>
        <LoadingBar fillAnim={barFill} />
        <Animated.Text style={[s.loadText, { opacity: loadTextOp }]}>
          LOADING
        </Animated.Text>
      </Animated.View>

    </LinearGradient>
  );
};

// ═══════════════════════════════════════════════════════════
// STYLES — zero changes from original
// ═══════════════════════════════════════════════════════════
const s = StyleSheet.create({

  container: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
  },

  blob1: {
    position:        'absolute',
    top:             -vscale(70),
    right:           -scale(70),
    width:           scale(290),
    height:          scale(290),
    borderRadius:    scale(145),
    backgroundColor: C.blob1,
    shadowColor:     C.blobGlow1,
    shadowOffset:    { width: 0, height: 0 },
    shadowOpacity:   0.75,
    shadowRadius:    scale(55),
    elevation:       0,
  },

  blob2: {
    position:        'absolute',
    bottom:          -vscale(90),
    left:            -scale(90),
    width:           scale(320),
    height:          scale(320),
    borderRadius:    scale(160),
    backgroundColor: C.blob2,
    shadowColor:     C.blobGlow2,
    shadowOffset:    { width: 0, height: 0 },
    shadowOpacity:   0.65,
    shadowRadius:    scale(65),
    elevation:       0,
  },

  center: {
    flex:           1,
    alignItems:     'center',
    justifyContent: 'center',
  },

  logoWrap: {
    width:          scale(120),
    height:         scale(120),
    alignItems:     'center',
    justifyContent: 'center',
    marginBottom:   vscale(28),
  },

  glowRing: {
    position:        'absolute',
    width:           scale(120),
    height:          scale(120),
    borderRadius:    scale(60),
    backgroundColor: C.glowColor,
    shadowColor:     C.glowShadow,
    shadowOffset:    { width: 0, height: 0 },
    shadowOpacity:   1,
    shadowRadius:    scale(28),
    elevation:       0,
  },

  glowInner: {
    position:        'absolute',
    width:           scale(90),
    height:          scale(90),
    borderRadius:    scale(45),
    backgroundColor: 'rgba(21,170,191,0.18)',
  },

  logoCircle: {
    width:           scale(80),
    height:          scale(80),
    borderRadius:    scale(40),
    backgroundColor: C.white,
    alignItems:      'center',
    justifyContent:  'center',
    elevation:       6,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 3 },
    shadowOpacity:   0.15,
    shadowRadius:    8,
  },

  logoImg: {
    width:  scale(56),
    height: scale(56),
  },

  appName: {
    fontSize:           scale(40),
    fontWeight:         '800',
    color:              C.white,
    letterSpacing:      scale(0.5),
    marginBottom:       vscale(10),
    includeFontPadding: false,
  },

  tagline: {
    fontSize:           scale(14),
    fontWeight:         '400',
    color:              C.whiteMid,
    letterSpacing:      scale(0.5),
    includeFontPadding: false,
  },

  bottom: {
    alignItems:    'center',
    paddingBottom: vscale(60),
    gap:           vscale(14),
  },

  loadText: {
    fontSize:           scale(10),
    fontWeight:         '600',
    color:              C.whiteLow,
    letterSpacing:      scale(2.5),
    includeFontPadding: false,
  },
});

export default Splash;