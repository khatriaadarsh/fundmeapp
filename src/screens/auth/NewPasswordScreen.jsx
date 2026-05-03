import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import Icons from 'react-native-vector-icons/Feather';

const COLORS = {
  bg: '#FFFFFF',
  teal: '#00B4CC',
  tealDark: '#0097AA',
  tealLight: 'rgba(0,180,204,0.12)',
  green: '#22C55E',
  red: '#EF4444',
  amber: '#F59E0B',
  textDark: '#111827',
  textGray: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
};

const getPasswordStrength = password => {
  if (!password) return { score: 0, label: '', color: COLORS.border };

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const strengthMap = [
    { label: '', color: COLORS.border },
    { label: 'Weak', color: COLORS.red },
    { label: 'Fair', color: COLORS.amber },
    { label: 'Good', color: COLORS.teal },
    { label: 'Strong', color: COLORS.green },
  ];

  return { score, ...strengthMap[score] };
};

const StrengthBar = ({ password }) => {
  const { score, label, color } = getPasswordStrength(password);
  if (!password) return null;

  return (
    <View style={styles.strengthWrap}>
      <View style={styles.strengthTrack}>
        {[1, 2, 3, 4].map(i => (
          <View
            key={i}
            style={[
              styles.strengthSegment,
              { backgroundColor: i <= score ? color : COLORS.border },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.strengthLabel, { color }]}>{label}</Text>
    </View>
  );
};

const NewPasswordScreen = ({ navigation }) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passFocused, setPassFocused] = useState(false);
  const [confFocused, setConfFocused] = useState(false);

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

  const passwordsMatch = confirm.length > 0 && password === confirm;
  const passwordMismatch = confirm.length > 0 && password !== confirm;

  const handleResetPassword = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.inner}>
          <Animated.View
            style={[
              styles.content,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Animated.View
              style={[styles.iconCircle, { transform: [{ scale: iconScale }] }]}
            >
              <Icons name="lock" size={28} color={COLORS.teal} />
            </Animated.View>

            <Text style={styles.headline}>New Password</Text>
            <Text style={styles.subtitle}>
              Your new password must be different from previous used passwords.
            </Text>

            <View style={styles.fieldWrap}>
              <View
                style={[styles.inputRow, passFocused && styles.inputFocused]}
              >
                <Icons name="lock" size={16} color={COLORS.textGray} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••••••"
                  placeholderTextColor={COLORS.textLight}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                  onFocus={() => setPassFocused(true)}
                  onBlur={() => setPassFocused(false)}
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                  <Icons
                    name={showPass ? 'eye-off' : 'eye'}
                    size={18}
                    color={COLORS.textGray}
                  />
                </TouchableOpacity>
              </View>

              <StrengthBar password={password} />
            </View>

            <View style={styles.fieldWrap}>
              <View
                style={[
                  styles.inputRow,
                  confFocused && styles.inputFocused,
                  passwordMismatch && styles.inputError,
                ]}
              >
                <Icons name="lock" size={16} color={COLORS.textGray} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••••••"
                  placeholderTextColor={COLORS.textLight}
                  value={confirm}
                  onChangeText={setConfirm}
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                  onFocus={() => setConfFocused(true)}
                  onBlur={() => setConfFocused(false)}
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                  <Icons
                    name={showConfirm ? 'eye-off' : 'eye'}
                    size={18}
                    color={COLORS.textGray}
                  />
                </TouchableOpacity>
              </View>

              {passwordsMatch && (
                <Text style={styles.matchText}>✓ Passwords match</Text>
              )}
              {passwordMismatch && (
                <Text style={styles.mismatchText}>
                  ✗ Passwords do not match
                </Text>
              )}
            </View>

            <TouchableOpacity
              onPress={handleResetPassword}
              activeOpacity={0.85}
              style={styles.buttonWrap}
            >
              <LinearGradient
                colors={[COLORS.teal, COLORS.tealDark]}
                style={styles.resetBtn}
              >
                <Text style={styles.resetBtnText}>Reset Password</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  keyboardView: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 20,
    marginBottom: 45,
  },
  content: {
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
  },
  headline: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textGray,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  fieldWrap: {
    width: '100%',
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 10,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 14,
    height: 50,
  },
  inputFocused: {
    borderColor: COLORS.teal,
  },
  inputError: {
    borderColor: COLORS.red,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textDark,
    marginLeft: 10,
  },
  strengthWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  strengthTrack: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '700',
    minWidth: 50,
    textAlign: 'right',
  },
  matchText: {
    marginTop: 6,
    fontSize: 12,
    color: COLORS.green,
    fontWeight: '600',
  },
  mismatchText: {
    marginTop: 6,
    fontSize: 12,
    color: COLORS.red,
    fontWeight: '600',
  },
  buttonWrap: {
    width: '100%',
  },
  resetBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  resetBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default NewPasswordScreen;
