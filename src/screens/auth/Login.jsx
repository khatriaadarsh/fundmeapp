import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';

import InputField from '../../components/common/InputField';
import GradientButton from '../../components/common/GradientButton';
import { COLORS, SPACING, TYPOGRAPHY, scale } from '../../theme';
import LogoImg from '../../assets/logo.png';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Single fade animation for entire screen
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Smooth fade-in for entire screen at once
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleLogin = useCallback(() => {
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  }, [navigation]);

  const handleForgotPassword = useCallback(() => {
    navigation.navigate('ForgotPasswordScreen');
  }, [navigation]);

  const handleSignUp = useCallback(() => {
    navigation.navigate('SignUpScreen');
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={[COLORS.primaryLight, '#EBF7FA', COLORS.white]}
        locations={[0, 0.3, 1]}
        style={styles.gradient}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor={COLORS.primaryLight}
          translucent={false}
        />

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* All content in single animated view */}
            <Animated.View
              style={[
                styles.contentContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Logo */}
              <View style={styles.logoContainer}>
                <Image source={LogoImg} style={styles.logo} />
              </View>

              {/* Headline */}
              <View style={styles.headlineContainer}>
                <Text style={styles.headline}>Welcome Back</Text>
                <Text style={styles.subtitle}>Log in to your account</Text>
              </View>

              {/* Inputs */}
              <View style={styles.inputsContainer}>
                <InputField
                  label="Email"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  leftIcon="mail"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <InputField
                  label="Password"
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  leftIcon="lock"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  rightElement={
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Icon
                        name={showPassword ? 'eye' : 'eye-off'}
                        size={scale(20)}
                        color={COLORS.textTertiary}
                      />
                    </TouchableOpacity>
                  }
                />
              </View>

              {/* Forgot Password */}
              <TouchableOpacity
                onPress={handleForgotPassword}
                style={styles.forgotButton}
              >
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <GradientButton
                title="Log In"
                onPress={handleLogin}
                variant="primary"
              />

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Sign Up Link */}
              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>
                  Don't have an account?{' '}
                </Text>
                <TouchableOpacity onPress={handleSignUp}>
                  <Text style={styles.signUpLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.screenPadding,
    paddingVertical: SPACING.xxxl,
  },
  contentContainer: {
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logo: {
    width: scale(72),
    height: scale(72),
    resizeMode: 'contain',
  },
  headlineContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  headline: {
    fontSize: TYPOGRAPHY.fontSize.display,
    fontFamily: TYPOGRAPHY.fontFamily.extraBold,
    color: COLORS.textPrimary,
    letterSpacing: TYPOGRAPHY.letterSpacing.normal,
    marginBottom: SPACING.gapSm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textSecondary,
  },
  inputsContainer: {
    marginBottom: SPACING.xs,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.xl,
  },
  forgotText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    color: COLORS.primary,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: SPACING.md,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textSecondary,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textSecondary,
  },
  signUpLink: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.primary,
  },
});

export default LoginScreen;