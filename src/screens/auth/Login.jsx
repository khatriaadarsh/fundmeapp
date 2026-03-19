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
import LogoImg from '../../assets/logo.png';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

// ── Colour tokens (match screenshot exactly) ───────────────
const COLORS = {
  bgGradientTop: '#D6F0F4', // very light teal top
  bgGradientBot: '#FFFFFF', // pure white bottom
  tealPrimary: '#00B4CC', // button + links
  tealDark: '#0097AA', // button gradient end
  tealLogo: '#0D6B7A', // logo icon colour
  tealLogoText: '#7BBFC8', // muted "FundMe" text
  textDark: '#1A1A2E', // "Welcome Back"
  textGray: '#6B7280', // subtitle + "or"
  textPlaceholder: '#474a4f', // input placeholders
  inputBorder: '#606265', // input border
  inputBg: '#FFFFFF', // input background
  iconColor: '#9CA3AF', // envelope / lock icons
  white: '#FFFFFF',
};
const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  const logoAnim = useRef(new Animated.Value(0)).current;
  const logoSlide = useRef(new Animated.Value(-20)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const formSlide = useRef(new Animated.Value(30)).current;
  const btnScale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    // Logo drops in
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

    // Form slides up
    Animated.sequence([
      Animated.delay(250),
      Animated.parallel([
        Animated.timing(formAnim, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.spring(formSlide, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Button pops
    Animated.sequence([
      Animated.delay(550),
      Animated.spring(btnScale, {
        toValue: 1,
        tension: 55,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, [logoAnim, logoSlide, formAnim, formSlide, btnScale]);

  const handlePressIn = () =>
    Animated.spring(btnScale, { toValue: 0.96, useNativeDriver: true }).start();
  const handlePressOut = () =>
    Animated.spring(btnScale, { toValue: 1, useNativeDriver: true }).start();

  const handleLogin = () => {
    // Add your auth logic here
    // navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <Image source={LogoImg} style={styles.fundmeLogo} />

      <View style={styles.contentWrap}>
        <Text style={styles.headline}>Welcome Back</Text>
        <Text style={styles.subTitle}>Login in to your account</Text>
      </View>

      <View style={styles.inputFieldWrap}>
        {/* Input fields will go here */}
        <View style={styles.fieldWrap}>
          <Icon
            name="email"
            size={25}
            style={styles.inputIcon}
            color="#253133"
          />
          <TextInput
            style={styles.inputField}
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
        <View style={styles.fieldWrap}>
          <Icon
            name="password"
            size={25}
            style={styles.inputIcon}
            color="#253133"
          />
          <TextInput
            style={styles.inputField}
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
        </View>
      </View>
      <Text
        style={styles.forgetPassText}
        onPress={() => navigation.navigate('ForgotPasswordScreen')}
      >
        Forgot Password?
      </Text>
      {/* Log In button */}
      <Animated.View style={{ transform: [{ scale: btnScale }] }}>
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
            <Text
              style={styles.btnLoginText}
              onPress={() => navigation.navigate('HomeScreen')}
            >
              Log In
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {/* Divider */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Sign Up link */}
      <View style={styles.signUpRow}>
        <Text style={styles.signUpText}>Don{'\u2019'}t have an account? </Text>
        <TouchableOpacity
          onPress={() => navigation?.navigate('SignUp')}
          activeOpacity={0.7}
        >
          <Text
            style={styles.signUpLink}
            onPress={() => navigation.navigate('SignUpScreen')}
          >
            Sign Up
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    gap: 20,
    position: 'relative',
    top: 160,
  },

  fundmeLogo: {
    width: 70,
    height: 70,
  },
  contentWrap: {
    marginTop: 30,
    alignItems: 'center',
    gap: 6,
  },
  headline: {
    fontSize: 30,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  subTitle: {
    fontSize: 16,
    color: '#707070',
    letterSpacing: 0.2,
  },
  inputFieldWrap: {
    position: 'relative',
    top: 60,
    gap: 18,
  },
  inputIcon: {
    paddingLeft: 10,
  },
  fieldWrap: {
    paddingHorizontal: 5,
    backgroundColor: COLORS.inputBg,
    width: 340,
    fontSize: 15,
    color: COLORS.textDark,
    borderBlockColor: COLORS.inputBorder,
    borderWidth: 1,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  forgetPassText: {
    color: COLORS.tealPrimary,
    fontSize: 15,
    fontWeight: '500',
    position: 'relative',
    left: 108,
    top: 55,
  },

  // Log In button
  btnLogin: {
    position: 'relative',
    top: 75,
    width: width - 56,
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
  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
    top: 90,
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
  // Sign Up
  signUpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    top: 110,
  },
  signUpText: {
    fontSize: 15,
    color: COLORS.textGray,
  },
  signUpLink: {
    fontSize: 14,
    color: COLORS.tealPrimary,
    fontWeight: '700',
  },
});
