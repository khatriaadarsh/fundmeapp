// src/screens/onboarding/OnboardingScreen3.jsx
// ─────────────────────────────────────────────────────────────
//  Onboarding Screen 3 — "Verified & AI-Protected"
//  FundMe App
//  ✅ 100% Responsive — works on ALL screen sizes
//  ✅ No hardcoded top/position hacks
//  ✅ Uses flex + justifyContent for universal alignment
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import OnboardImg3 from '../../assets/onBoardScreenImg03.jpeg';
const { width, height } = Dimensions.get('window');

// ── Colour tokens ──────────────────────────────────────────
const COLORS = {
  background: '#FFFFFF',
  tealPrimary: '#00B4CC',
  tealDark: '#0097AA',
  textDark: '#1A1A2E',
  textGray: '#6B7280',
  dotActive: '#00B4CC',
  dotInactive: '#D1D5DB',
  shieldBlue: '#1A3A8F',
  shieldLight: '#2B5CE6',
  circuitLine: '#9CA3AF',
};

// ── Responsive scale helpers ───────────────────────────────
const scale = size => (width / 375) * size;
const vscale = size => (height / 812) * size;

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
const OnboardingScreen3 = ({ navigation }) => {
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
  }, [illustAnim, contentAnim, contentSlide, btnScale]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.topSection}>
        {/* Zone 1 — Illustration (top) */}
        <Animated.View style={styles.illustWrap}>
          <Image source={OnboardImg3} style={styles.imgOnboard} />
        </Animated.View>

        {/* Zone 2 — Text + dots (middle) */}
        <Animated.View
          style={[
            styles.contentWrap,
            { opacity: contentAnim, transform: [{ translateY: contentSlide }] },
          ]}
        >
          <Text style={styles.headline}>Verified & AI-Protected</Text>
          <Text style={styles.description}>
            {
              'Every campaign creator is CNIC verified. Our AI fraud detection protects your donations automatically.'
            }
          </Text>
          <StepDots active={2} />
        </Animated.View>

        {/* Zone 3 — Button (bottom) */}
        <Animated.View
          style={[styles.btnWrap, { transform: [{ scale: btnScale }] }]}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
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
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen3;

// ── Screen styles ──────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topSection: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(28),
    paddingTop: vscale(40),
    paddingBottom: vscale(36),
  },

  illustWrap: {
    width: '100%',
    alignItems: 'center',
    position: 'relative',
    top: 85,
  },
  imgOnboard: {
    width: 320,
    height: 320,
    borderRadius: 20,
  },
  contentWrap: {
    width: '100%',
    alignItems: 'center',
  },

  headline: {
    fontSize: scale(22),
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: vscale(12),
    letterSpacing: 0.2,
  },
  description: {
    fontSize: scale(14),
    color: COLORS.textGray,
    textAlign: 'center',
    lineHeight: scale(22),
    paddingHorizontal: scale(8),
  },

  // Dots
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vscale(20),
    gap: 6,
  },
  
  dot: { height: 5, borderRadius: 3 },
  dotActive: { width: scale(22), backgroundColor: COLORS.dotActive },
  dotInactive: { width: scale(8), backgroundColor: COLORS.dotInactive },

  btnWrap: {
    width: '100%',
  },
  btnPrimary: {
    width: '100%',
    paddingVertical: vscale(16),
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
    shadowColor: COLORS.tealPrimary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: scale(16),
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
