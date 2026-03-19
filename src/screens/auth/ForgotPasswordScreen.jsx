// src/screens/auth/ForgotPassword.jsx
// ─────────────────────────────────────────────────────────────
//  Forgot Password — FundMe App (React Native CLI)
//
//  Back arrow
//  Amber key icon in light circle
//  "Reset Password" headline + subtitle
//  Email input
//  "Send Reset Code" teal button
//  "← Back to Log In" teal link
// ─────────────────────────────────────────────────────────────

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

// ── Colours ────────────────────────────────────────────────
const C = {
  bg: '#FFFFFF',
  teal: '#00B4CC',
  tealDark: '#0097AA',
  amber: '#F59E0B',
  amberLight: '#FEF3C7',
  textDark: '#111827',
  textGray: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  inputBg: '#FFFFFF',
};

const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [focused, setFocused] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const iconScale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(iconScale, {
        toValue: 1,
        tension: 55,
        friction: 6,
        delay: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, iconScale]);

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={s.inner}>
          {/* Back button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={s.backBtn}
          >
            <Text style={s.backArrow}>←</Text>
          </TouchableOpacity>

          <Animated.View
            style={[
              s.content,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            {/* Amber key icon */}
            <Animated.View
              style={[s.iconCircle, { transform: [{ scale: iconScale }] }]}
            >
              <Text style={s.keyEmoji}>🔑</Text>
            </Animated.View>

            {/* Headline */}
            <Text style={s.headline}>Reset Password</Text>
            <Text style={s.subtitle}>
              {'Enter your email and we will send you a code'}
            </Text>

            {/* Email input */}
            <View style={s.fieldWrap}>
              <View style={[s.inputRow, focused && s.inputFocused]}>
                <Text style={s.inputIcon}>✉️</Text>
                <TextInput
                  style={s.input}
                  placeholder="name@example.com"
                  placeholderTextColor={C.textLight}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                />
              </View>
            </View>

            {/* Send Reset Code button */}
            <TouchableOpacity
              onPress={() => navigation.navigate('NewPassword')}
              activeOpacity={0.85}
              style={{ width: '100%' }}
            >
              <LinearGradient
                colors={[C.teal, C.tealDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.sendBtn}
              >
                <Text style={s.sendBtnText}>Send Reset Code</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Back to Log In */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={s.backLoginBtn}
              activeOpacity={0.7}
            >
              <Text style={s.backLoginText}>← Back to Log In</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ForgotPassword;

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 36,
  },

  backBtn: { marginBottom: 48 },
  backArrow: { fontSize: 22, color: C.textDark, fontWeight: '600' },

  content: { alignItems: 'center', width: '100%' },

  // Key icon
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.amberLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  keyEmoji: { fontSize: 34 },

  // Text
  headline: {
    fontSize: 24,
    fontWeight: '800',
    color: C.textDark,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: C.textGray,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 32,
    paddingHorizontal: 12,
  },

  // Input
  fieldWrap: { width: '100%', marginBottom: 20 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 10,
    backgroundColor: C.inputBg,
    paddingHorizontal: 14,
    height: 50,
  },
  inputFocused: { borderColor: C.teal },
  inputIcon: { fontSize: 15, marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: C.textDark, paddingVertical: 0 },

  // Button
  sendBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
    shadowColor: C.teal,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    marginBottom: 20,
  },
  sendBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  // Back to login
  backLoginBtn: { marginTop: 4 },
  backLoginText: { fontSize: 14, color: C.teal, fontWeight: '600' },
});
