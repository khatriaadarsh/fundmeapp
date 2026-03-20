// src/screens/onboarding/OnboardingScreen3.jsx
// ─────────────────────────────────────────────────────────────
//  Onboarding Screen 3 — "Verified & AI-Protected"
//  FundMe App
//
//  White background, shield + checkmark + circuit board
//  illustration, headline, description,
//  3 step dots (3rd active), teal "Get Started" button
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
  shieldBlue: '#1A3A8F',
  shieldLight: '#2B5CE6',
  checkGreen: '#2DB84B',
  circuitGray: '#E5E7EB',
  circuitLine: '#9CA3AF',
};

// ── Illustration: shield + check + circuit ─────────────────
const ShieldIllustration = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.8,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.4,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulseAnim, glowAnim]);

  return (
    <View style={illus.wrap}>
      {/* Light grey card background (like screenshot) */}
      <View style={illus.card}>
        {/* Circuit board lines in background */}
        <View style={illus.circuitWrap}>
          {[0, 1, 2, 3].map(i => (
            <View
              key={i}
              style={[
                illus.circuitLine,
                { top: 20 + i * 30, width: 60 + i * 20 },
              ]}
            />
          ))}
          {[0, 1, 2].map(i => (
            <View
              key={i}
              style={[
                illus.circuitDot,
                { top: 20 + i * 30, left: 20 + i * 25 },
              ]}
            />
          ))}
        </View>

        {/* Glow ring */}
        <Animated.View style={[illus.glowRing, { opacity: glowAnim }]} />

        {/* Shield */}
        <Animated.View
          style={[illus.shieldWrap, { transform: [{ scale: pulseAnim }] }]}
        >
          <LinearGradient
            colors={[COLORS.shieldLight, COLORS.shieldBlue]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={illus.shield}
          >
            {/* Checkmark */}
            <View style={illus.checkWrap}>
              <View style={illus.checkLeft} />
              <View style={illus.checkRight} />
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Credit card / fingerprint icons */}
        <View style={illus.cardIconTopRight}>
          <View style={illus.creditCard}>
            <View style={illus.cardStripe} />
            <View style={illus.cardChip} />
          </View>
        </View>

        {/* Fingerprint dots pattern */}
        <View style={illus.fingerprintWrap}>
          {[0, 1, 2, 3].map(row => (
            <View key={row} style={illus.fpRow}>
              {[0, 1, 2, 3, 4].map(col => (
                <View
                  key={col}
                  style={[
                    illus.fpDot,
                    { opacity: 0.3 + ((row + col) % 3) * 0.2 },
                  ]}
                />
              ))}
            </View>
          ))}
        </View>
      </View>
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
  }, [navigation, illustAnim, contentAnim, contentSlide, btnScale]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Illustration */}
      <Animated.View style={[styles.illustWrap, { opacity: illustAnim }]}>
        <ShieldIllustration />
      </Animated.View>

      {/* Text content */}
      <Animated.View
        style={[
          styles.contentWrap,
          { opacity: contentAnim, transform: [{ translateY: contentSlide }] },
        ]}
      >
        <Text style={styles.headline}>Verified & AI-Protected</Text>
        <Text style={styles.description}>
          Every campaign creator is CNIC verified. Our AI fraud detection
          protects your donations automatically.
        </Text>
        {/* Step dots — 3rd dot active */}
        <StepDots active={2} />
      </Animated.View>

      {/* Get Started button */}
      <Animated.View
        style={[styles.btnWrap, { transform: [{ scale: btnScale }] }]}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate('SignUpScreen')}
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
  );
};

export default OnboardingScreen3;

// ── Illustration styles ────────────────────────────────────
const illus = StyleSheet.create({
  wrap: {
    width: '100%',
    height: 240,
    alignItems: 'center',
    position: 'relative',
    bottom: 55,
  },
  // Card
  card: {
    width: 220,
    height: 210,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },

  // Circuit lines
  circuitWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  circuitLine: {
    position: 'absolute',
    height: 1.5,
    left: 10,
    backgroundColor: COLORS.circuitLine,
    opacity: 0.25,
    borderRadius: 1,
  },
  circuitDot: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.circuitLine,
    opacity: 0.35,
  },

  // Glow ring behind shield
  glowRing: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(43,92,230,0.12)',
  },

  // Shield
  shieldWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shield: {
    width: 80,
    height: 90,
    borderRadius: 12,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: COLORS.shieldBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },

  // Checkmark
  checkWrap: {
    width: 36,
    height: 28,
    position: 'relative',
  },
  checkLeft: {
    position: 'absolute',
    width: 3,
    height: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    bottom: 0,
    left: 8,
    transform: [{ rotate: '45deg' }],
  },
  checkRight: {
    position: 'absolute',
    width: 3,
    height: 22,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    bottom: 0,
    right: 6,
    transform: [{ rotate: '-45deg' }],
  },

  // Credit card top-right
  cardIconTopRight: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  creditCard: {
    width: 44,
    height: 30,
    borderRadius: 5,
    backgroundColor: '#1A3A8F',
    padding: 4,
  },
  cardStripe: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginBottom: 4,
  },
  cardChip: {
    width: 12,
    height: 9,
    borderRadius: 2,
    backgroundColor: 'rgba(245,166,35,0.9)',
  },

  // Fingerprint dots
  fingerprintWrap: {
    position: 'absolute',
    bottom: 14,
    right: 14,
  },
  fpRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  fpDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.tealPrimary,
    marginRight: 3,
  },
});

// ── Screen styles ──────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 48,
    paddingHorizontal: 28,
    paddingBottom: 40,
  },

  illustWrap: {
    width: '100%',
    marginBottom: 16,
  },

  contentWrap: {
    width: '100%',
    alignItems: 'center',
    position: 'relative',
    bottom: 20,
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
    lineHeight: 22,
    paddingHorizontal: 8,
  },

  // Dots
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
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
    top: 145,
  },
  btnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
