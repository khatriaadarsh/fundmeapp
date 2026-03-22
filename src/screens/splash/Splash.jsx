import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FundMeLogo from '../../assets/logo.png';

// ── Colour tokens (match screenshot exactly) ───────────────
const COLORS = {
  gradientTop: '#0D4F5C', // dark teal top
  gradientMid: '#0A7B8A', // mid teal
  gradientBot: '#05B5CC', // bright teal bottom-left
  white: '#FFFFFF',
  subtitleWhite: 'rgba(255,255,255,0.75)',
  dotActive: '#FFFFFF',
  dotInactive: 'rgba(255,255,255,0.4)',
};

// ── Main Screen ────────────────────────────────────────────
const Splash = ({ navigation }) => {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(24)).current;
  const dotOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo pop-in
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 55,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Text slides up
    Animated.sequence([
      Animated.delay(500),
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(textSlide, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Bottom dot fades in
    Animated.sequence([
      Animated.delay(800),
      Animated.timing(dotOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-navigate to Onboarding after 2.5s
    const timer = setTimeout(() => {
      navigation.navigate('OnboardingScreen1');
    }, 5000);

    return () => clearTimeout(timer);
  });

  return (
    <LinearGradient
      colors={[COLORS.gradientTop, COLORS.gradientMid, COLORS.gradientBot]}
      start={{ x: 0.3, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.gradientTop}
        translucent
      />

      {/* Centre content */}
      <View style={styles.centerContent}>
        {/* Logo */}
        <Animated.View
          style={[
            styles.logoWrap,
            { opacity: logoOpacity, transform: [{ scale: logoScale }] },
          ]}
        >
          <Image source={FundMeLogo} style={{ width: 80, height: 80 }} />
        </Animated.View>

        {/* App name + tagline */}
        <Animated.View
          style={{
            opacity: textOpacity,
            transform: [{ translateY: textSlide }],
            alignItems: 'center',
          }}
        >
          <Text style={styles.appName}>FundMe</Text>
          <Text style={styles.tagline}>"Fund Someone's Future"</Text>
        </Animated.View>
      </View>

      {/* Bottom dots */}
      <Animated.View style={[styles.dotsRow, { opacity: dotOpacity }]}>
        <View style={[styles.dot, styles.dotActive]} />
        <View style={[styles.dot, styles.dotInactive]} />
      </Animated.View>
    </LinearGradient>
  );
};

export default Splash;

// ── Screen styles ──────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  logoWrap: {
    marginBottom: 28,
  },

  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.5,
    marginBottom: 8,
  },

  tagline: {
    fontSize: 14,
    color: COLORS.subtitleWhite,
    letterSpacing: 0.3,
    fontWeight: '400',
  },

  // Bottom dots
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 48,
  },
  dot: {
    height: 4,
    borderRadius: 2,
  },
  dotActive: {
    width: 30,
    backgroundColor: COLORS.dotActive,
  },
  dotInactive: {
    width: 22,
    backgroundColor: COLORS.dotInactive,
  },
});
