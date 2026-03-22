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
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ImgOnboarding1 from '../../assets/onBoardScreenImg01.jpeg';
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
        <Image source={ImgOnboarding1} style={styles.imgOnboard} />
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
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 140,
    paddingBottom: 40,
  },

  imgOnboard: {
    width: 280,
    height: 280,
    borderRadius: 20,
  },

  contentWrap: {
    width: '100%',
    alignItems: 'center',
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
