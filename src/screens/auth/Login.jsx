// src/screens/auth/Login.jsx

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import LogoImg from '../../assets/logo.png';

const { width } = Dimensions.get('window');

// ── Colour tokens ──────────────────────────────────────────
const COLORS = {
  bgTop: '#D6F0F4',
  bgBot: '#FFFFFF',
  tealPrimary: '#00B4CC',
  tealDark: '#0097AA',
  textDark: '#1A1A2E',
  textGray: '#6B7280',
  textPlaceholder: '#9CA3AF',
  inputBorder: '#D1D5DB',
  inputBg: '#FFFFFF',
  iconColor: '#bec3cd',
  white: '#FFFFFF',
  light: '#9CA3AF',
};

// ── Main Screen ────────────────────────────────────────────
const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  const logoAnim = useRef(new Animated.Value(0)).current;
  const logoSlide = useRef(new Animated.Value(-10)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const formSlide = useRef(new Animated.Value(20)).current;
  const btnScale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(logoSlide, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.delay(250),
      Animated.parallel([
        Animated.timing(formAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.spring(formSlide, {
          toValue: 0,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    Animated.sequence([
      Animated.delay(550),
      Animated.spring(btnScale, {
        toValue: 1,
        tension: 35,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, [logoAnim, logoSlide, formAnim, formSlide, btnScale]);

  const handlePressIn = () =>
    Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }).start();
  const handlePressOut = () =>
    Animated.spring(btnScale, { toValue: 1, useNativeDriver: true }).start();

  const handleLogin = () => navigation.navigate('HomeScreen');
  const handleForgotPassword = () =>
    navigation.navigate('ForgotPasswordScreen');
  const handleSignUp = () => navigation.navigate('SignUpScreen');

  return (
    <LinearGradient
      colors={[COLORS.bgTop, '#EBF7FA', COLORS.bgBot]}
      locations={[0, 0.3, 1]}
      style={styles.gradient}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgTop} />

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Logo ── */}
          <Animated.View
            style={[
              styles.logoWrap,
              { opacity: logoAnim, transform: [{ translateY: logoSlide }] },
            ]}
          >
            <Image source={LogoImg} style={styles.logo} />
          </Animated.View>

          {/* ── Headline ── */}
          <Animated.View
            style={[
              styles.headlineWrap,
              { opacity: formAnim, transform: [{ translateY: formSlide }] },
            ]}
          >
            <Text style={styles.headline}>Welcome Back</Text>
            <Text style={styles.subtitle}>{'Log in to your account'}</Text>
          </Animated.View>

          {/* ── Input fields ── */}
          <Animated.View
            style={[
              styles.fieldsWrap,
              { opacity: formAnim, transform: [{ translateY: formSlide }] },
            ]}
          >
            {/* Email */}
            <View
              style={[styles.fieldRow, emailFocused && styles.fieldFocused]}
            >
              <Icon
                name="email"
                size={22}
                color={COLORS.light}
                style={styles.fieldIcon}
              />
              <TextInput
                style={styles.fieldInput}
                placeholder="Enter your email"
                placeholderTextColor={COLORS.textPlaceholder}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>

            {/* Password */}
            <View style={[styles.fieldRow, passFocused && styles.fieldFocused]}>
              <Icon
                name="lock"
                size={22}
                color={COLORS.light}
                style={styles.fieldIcon}
              />
              <TextInput
                style={styles.fieldInput}
                placeholder="Enter your password"
                placeholderTextColor={COLORS.textPlaceholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                onFocus={() => setPassFocused(true)}
                onBlur={() => setPassFocused(false)}
              />
              {/* ✅ Eye toggle added */}
              <TouchableOpacity
                onPress={() => setShowPassword(prev => !prev)}
                style={styles.eyeBtn}
                activeOpacity={0.7}
              >
                <Icon
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={20}
                  color={COLORS.textPlaceholder}
                />
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* ── Forgot Password ── */}
          <TouchableOpacity
            onPress={handleForgotPassword}
            style={styles.forgotWrap}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* ── Log In button ── */}
          <Animated.View
            style={[styles.btnWrap, { transform: [{ scale: btnScale }] }]}
          >
            <TouchableOpacity
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={handleLogin}
              activeOpacity={1}
            >
              <LinearGradient
                colors={[COLORS.tealPrimary, COLORS.tealDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.btnLogin}
              >
                <Text style={styles.btnLoginText}>Log In</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* ── Divider ── */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* ── Sign Up link ── */}
          {/* ✅ Fixed: onPress only on TouchableOpacity, removed from Text */}
          <View style={styles.signUpRow}>
            <Text style={styles.signUpText}>
              {'Don\u2019t have an account? '}
            </Text>
            <TouchableOpacity onPress={handleSignUp} activeOpacity={0.7}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

export default Login;

// ── Styles ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  // ✅ Root uses LinearGradient flex:1 — fills screen naturally
  gradient: { flex: 1 },
  kav: { flex: 1 },

  // ✅ ScrollView centres content — works on all screen heights
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center', // vertically centres on tall screens
    paddingHorizontal: 28,
    paddingTop: 48,
    paddingBottom: 36,
    gap: 8,
  },

  // Logo
  logoWrap: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 72,
    height: 72,
    resizeMode: 'contain',
  },

  // Headline
  headlineWrap: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headline: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: 0.2,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textGray,
    letterSpacing: 0.1,
  },

  // ✅ Fields use width:'100%' — stretches to parent padding, not 340px
  fieldsWrap: {
    width: '100%',
    gap: 14,
    marginBottom: 8,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    width: '100%',
    height: 60,
  },
  fieldFocused: {
    borderColor: COLORS.tealPrimary,
    elevation: 2,
    shadowColor: COLORS.tealPrimary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  fieldIcon: { marginRight: 10 },
  fieldInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textDark,
    paddingVertical: 0,
  },
  eyeBtn: { padding: 4 },

  // ✅ Forgot — alignSelf flex-end, no hardcoded left/top
  forgotWrap: {
    alignSelf: 'flex-end',
    marginTop: 4,
    marginBottom: 24,
  },
  forgotText: {
    color: COLORS.tealPrimary,
    fontSize: 14,
    fontWeight: '600',
  },

  // ✅ Button — width:'100%', no hardcoded top
  btnWrap: {
    width: '100%',
    marginBottom: 24,
  },
  btnLogin: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 4,
    shadowColor: COLORS.tealPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  btnLoginText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  // ✅ Divider — no hardcoded top
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
    color: COLORS.textGray,
  },

  // ✅ Sign Up row — no hardcoded top
  signUpRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 14,
    color: COLORS.textGray,
  },
  signUpLink: {
    fontSize: 14,
    color: COLORS.tealPrimary,
    fontWeight: '700',
  },
});
