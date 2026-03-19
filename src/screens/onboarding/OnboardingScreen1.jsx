// src/screens/onboarding/OnboardingScreen1.jsx
// ─────────────────────────────────────────────────────────────
//  Onboarding Screen 1 — "Fund Someone's Future"
//  FundMe App
//
//  White background, phone+heart illustration placeholder,
//  headline, description, 3 step dots (1 active),
//  teal "Get Started" button, "Already have account? Log In"
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

// ── Colour tokens ──────────────────────────────────────────
const COLORS = {
  background: '#FFFFFF',
  tealPrimary: '#00B4CC',
  tealDark: '#0097AA',
  textDark: '#1A1A2E',
  textGray: '#6B7280',
  dotActive: '#00B4CC',
  dotInactive: '#D1D5DB',
  logIn: '#00B4CC',
};

// ── Illustration placeholder (phone + heart visual) ────────
const PhoneIllustration = () => (
  <View style={illus.wrap}>
    {/* Teal glow background circle */}
    <View style={illus.glowCircle} />

    {/* Phone shape */}
    <View style={illus.phone}>
      <View style={illus.phoneScreen}>
        {/* Heart on phone screen */}
        <View style={illus.heartOnPhone}>
          <View style={illus.heartL} />
          <View style={illus.heartR} />
          <View style={illus.heartB} />
        </View>
        {/* Energy lines */}
        <View style={illus.line1} />
        <View style={illus.line2} />
        <View style={illus.line3} />
      </View>
    </View>

    {/* People silhouette group */}
    <View style={illus.peopleRow}>
      {[28, 36, 44, 36, 28].map((h, i) => (
        <View key={i} style={[illus.person, { height: h }]}>
          <View
            style={[
              illus.personHead,
              { width: h * 0.45, height: h * 0.45, borderRadius: h * 0.225 },
            ]}
          />
          <View style={[illus.personBody, { height: h * 0.5 }]} />
        </View>
      ))}
    </View>
  </View>
);

// ── Step dots ──────────────────────────────────────────────
const StepDots = ({ active }) => (
  <View style={styles.dotsRow}>
    {[0, 1, 2].map(i => (
      <View
        key={i}
        style={[
          styles.dot,
          i === active ? styles.dotActive : styles.dotInactive,
        ]}
      />
    ))}
  </View>
);

// ── Main Screen ────────────────────────────────────────────
const OnboardingScreen1 = ({ navigation }) => {
  const illustAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(30)).current;
  const btnScale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.timing(illustAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(contentAnim, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.spring(contentSlide, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    Animated.sequence([
      Animated.delay(600),
      Animated.spring(btnScale, {
        toValue: 1,
        tension: 55,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, [navigation, illustAnim, contentAnim, contentSlide, btnScale]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Illustration area */}
      <Animated.View style={[styles.illustWrap, { opacity: illustAnim }]}>
        <PhoneIllustration />
      </Animated.View>

      {/* Text content */}
      <Animated.View
        style={[
          styles.contentWrap,
          { opacity: contentAnim, transform: [{ translateY: contentSlide }] },
        ]}
      >
        <Text style={styles.headline}>Fund Someone Future </Text>
        <Text style={styles.description}>
          Make a real impact with secure and transparent crowdfunding. Every
          rupee reaches those who need it.
        </Text>
        <StepDots active={0} />
      </Animated.View>

      {/* Step dots */}

      {/* Buttons */}
      <Animated.View
        style={[styles.btnWrap, { transform: [{ scale: btnScale }] }]}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('OnboardingScreen2')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[COLORS.tealPrimary, COLORS.tealDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btnPrimary}
          >
            <Text style={styles.btnPrimaryText}>Get Started</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Log In link */}
      <View style={styles.loginRow}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.7}
        >
          <Text style={styles.loginLink}>Log In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OnboardingScreen1;

// ── Illustration styles ────────────────────────────────────
const illus = StyleSheet.create({
  wrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 20,
    position: 'relative',
    bottom: 25,
    height: 220,
  },
  glowCircle: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(0,180,204,0.12)',
    top: 10,
    alignSelf: 'center',
  },

  // Phone
  phone: {
    width: 68,
    height: 110,
    borderRadius: 10,
    backgroundColor: '#1A1A2E',
    position: 'absolute',
    left: width * 0.28,
    top: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  phoneScreen: {
    flex: 1,
    margin: 4,
    borderRadius: 7,
    backgroundColor: '#0D6B7A',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  // Heart on phone
  heartOnPhone: {
    width: 28,
    height: 24,
    alignItems: 'center',
    marginBottom: 8,
  },
  heartL: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    top: 0,
    left: 0,
  },
  heartR: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    top: 0,
    right: 0,
  },
  heartB: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: '#FFFFFF',
    bottom: 0,
    transform: [{ rotate: '45deg' }],
  },

  // Energy lines
  line1: {
    width: 40,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(0,220,255,0.6)',
    marginVertical: 2,
  },
  line2: {
    width: 30,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(0,220,255,0.4)',
    marginVertical: 2,
  },
  line3: {
    width: 20,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(0,220,255,0.3)',
    marginVertical: 2,
  },

  // People
  peopleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    position: 'absolute',
    right: width * 0.1,
    bottom: 20,
  },
  person: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  personHead: {
    backgroundColor: '#0097AA',
    marginBottom: 2,
  },
  personBody: {
    width: 14,
    backgroundColor: '#00B4CC',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
});

// ── Screen styles ──────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
  },

  illustWrap: {
    paddingBottom: 40,
    width: '100%',
    marginBottom: 8,
    marginTop: 140,
  },

  contentWrap: {
    width: '100%',
    alignItems: 'center',
    // mariginTop: 20,
    // marginBottom: 20,
    position: 'relative',
    top: 28,
  },
  headline: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  description: {
    fontSize: 14,
    color: COLORS.textGray,
    textAlign: 'center',
    lineHeight: 23,
    paddingHorizontal: 8,
  },

  // Dots
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    gap: 6,
    marginTop: 15,
  },
  dot: { height: 5, borderRadius: 3 },
  dotActive: { width: 22, backgroundColor: COLORS.dotActive },
  dotInactive: { width: 8, backgroundColor: COLORS.dotInactive },

  // Button
  btnWrap: { width: '100%', marginBottom: 16 },
  btnPrimary: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 150,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Log in
  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 15,
    color: COLORS.textGray,
  },
  loginLink: {
    fontSize: 15,
    color: COLORS.logIn,
    fontWeight: '700',
    cursor: 'pointer',
  },
});
