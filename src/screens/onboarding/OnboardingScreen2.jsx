// src/screens/onboarding/OnboardingScreen2.jsx
// ─────────────────────────────────────────────────────────────
//  Onboarding Screen 2 — "Zero Commission. Full Impact."
//  FundMe App
//
//  White background, 100% illustration with coins/family,
//  headline, description, 3 step dots (2nd active),
//  teal "Next" button
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
  green100: '#2DB84B',
  coinGold: '#F5A623',
  coinDark: '#E08A00',
};

// ── Illustration: 100% text + coins + family ───────────────
const HundredPercentIllustration = () => {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [floatAnim]);

  return (
    <View style={illus.wrap}>
      {/* Light green background circle */}
      <View style={illus.bgCircle} />

      {/* 100% big text */}
      <Animated.View
        style={[illus.percentWrap, { transform: [{ translateY: floatAnim }] }]}
      >
        <Text style={illus.percentText}>100%</Text>
      </Animated.View>

      {/* Floating coins */}
      <View style={[illus.coin, illus.coin1]}>
        <LinearGradient
          colors={[COLORS.coinGold, COLORS.coinDark]}
          style={illus.coinInner}
        >
          <Text style={illus.coinText}>$</Text>
        </LinearGradient>
      </View>
      <View style={[illus.coin, illus.coin2]}>
        <LinearGradient
          colors={[COLORS.coinGold, COLORS.coinDark]}
          style={illus.coinInner}
        >
          <Text style={illus.coinText}>$</Text>
        </LinearGradient>
      </View>
      <View style={[illus.coin, illus.coin3]}>
        <LinearGradient
          colors={[COLORS.coinGold, COLORS.coinDark]}
          style={illus.coinInner}
        >
          <Text style={illus.coinText}>$</Text>
        </LinearGradient>
      </View>
      <View style={[illus.coin, illus.coin4]}>
        <LinearGradient
          colors={[COLORS.coinGold, COLORS.coinDark]}
          style={illus.coinInner}
        >
          <Text style={illus.coinText}>$</Text>
        </LinearGradient>
      </View>

      {/* Family silhouette */}
      <View style={illus.familyRow}>
        {/* Child left */}
        <View style={illus.personWrap}>
          <View
            style={[illus.head, { width: 18, height: 18, borderRadius: 9 }]}
          />
          <View
            style={[illus.body, { width: 22, height: 28, borderRadius: 5 }]}
          />
        </View>
        {/* Parent left (taller) */}
        <View style={illus.personWrap}>
          <View
            style={[illus.head, { width: 22, height: 22, borderRadius: 11 }]}
          />
          <View
            style={[illus.body, { width: 26, height: 38, borderRadius: 6 }]}
          />
        </View>
        {/* Parent right (tallest) */}
        <View style={illus.personWrap}>
          <View
            style={[illus.head, { width: 24, height: 24, borderRadius: 12 }]}
          />
          <View
            style={[illus.body, { width: 28, height: 42, borderRadius: 6 }]}
          />
        </View>
        {/* Child right */}
        <View style={illus.personWrap}>
          <View
            style={[illus.head, { width: 18, height: 18, borderRadius: 9 }]}
          />
          <View
            style={[illus.body, { width: 22, height: 28, borderRadius: 5 }]}
          />
        </View>
      </View>

      {/* Ground line */}
      <View style={illus.ground} />
    </View>
  );
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
const OnboardingScreen2 = ({ navigation }) => {
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

  // Added navigation to dependencies for auto-navigation effect

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Illustration */}
      <Animated.View style={[styles.illustWrap, { opacity: illustAnim }]}>
        <HundredPercentIllustration />
      </Animated.View>

      {/* Text content */}
      <Animated.View
        style={[
          styles.contentWrap,
          { opacity: contentAnim, transform: [{ translateY: contentSlide }] },
        ]}
      >
        <Text style={styles.headline}>Zero Commission.{'\n'}Full Impact.</Text>
        <Text style={styles.description}>
          We charge nothing. '100%' of your donation goes directly to the
          beneficiary. No hidden fees ever.
        </Text>
      </Animated.View>

      {/* Step dots */}
      <StepDots active={1} />

      {/* Next button */}
      <Animated.View
        style={[styles.btnWrap, { transform: [{ scale: btnScale }] }]}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('OnboardingScreen3')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={[COLORS.tealPrimary, COLORS.tealDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btnPrimary}
          >
            <Text style={styles.btnPrimaryText}>Next</Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default OnboardingScreen2;

// ── Illustration styles ────────────────────────────────────
const illus = StyleSheet.create({
  wrap: {
    width: '100%',
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 10,
  },
  bgCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(45,184,75,0.10)',
    alignSelf: 'center',
    top: 20,
  },

  // 100% text
  percentWrap: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
  },
  percentText: {
    fontSize: 52,
    fontWeight: '900',
    color: COLORS.green100,
    letterSpacing: -1,
  },

  // Coins
  coin: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  coin1: { top: 30, left: width * 0.1 },
  coin2: { top: 55, right: width * 0.08 },
  coin3: { top: 90, left: width * 0.15 },
  coin4: { top: 110, right: width * 0.18 },
  coinInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },

  // Family
  familyRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    position: 'absolute',
    bottom: 28,
    alignSelf: 'center',
  },
  personWrap: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  head: {
    backgroundColor: '#0097AA',
    marginBottom: 2,
  },
  body: {
    backgroundColor: '#00B4CC',
  },
  ground: {
    position: 'absolute',
    bottom: 20,
    width: '60%',
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(0,180,204,0.2)',
  },
});

// ── Screen styles ──────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    // paddingTop: 48,
    paddingHorizontal: 28,
    paddingBottom: 90,
  },

  illustWrap: {
    width: '100%',
    marginBottom: 30,
  },

  contentWrap: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  headline: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.2,
    lineHeight: 30,
  },
  description: {
    fontSize: 14,
    color: COLORS.textGray,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 8,
  },

  // Dots
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 6,
  },
  dot: { height: 5, borderRadius: 3 },
  dotActive: { width: 22, backgroundColor: COLORS.dotActive },
  dotInactive: { width: 8, backgroundColor: COLORS.dotInactive },

  // Button
  btnWrap: { width: '100%' },
  btnPrimary: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    position: 'absolute',
    top: 150,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
