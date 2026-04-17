import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';

import Header from '../../components/common/Header';
import ProgressBar from '../../components/common/ProgressBar';
import InputField from '../../components/common/InputField';
import PasswordInput from '../../components/common/PasswordInput';
import PhoneInput from '../../components/forms/PhoneInput';
import RoleSelector from '../../components/auth/RoleSelector';
import GradientButton from '../../components/common/GradientButton';
import FieldLabel from '../../components/common/FieldLabel';

import { COLORS, SPACING, TYPOGRAPHY } from '../../theme';
import {
  validateName,
  validateEmail,
  validatePhone,
  validatePassword,
  validateNameWithMessage,
  validateEmailWithMessage,
  validateRoleWithMessage,
} from '../../utils/validators';

const SignUpScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');

  // Check if form is valid (for button state)
  const isFormValid = useMemo(() => {
    return (
      validateName(firstName) &&
      validateEmail(email) &&
      validatePhone(phone) &&
      validatePassword(password) &&
      confirmPassword &&
      password === confirmPassword &&
      role
    );
  }, [firstName, email, phone, password, confirmPassword, role]);

  const handleContinue = useCallback(() => {
    // Collect all errors
    const errors = [];

    const firstNameError = validateNameWithMessage(firstName, 'First name');
    if (firstNameError) errors.push(firstNameError);

    const emailError = validateEmailWithMessage(email);
    if (emailError) errors.push(emailError);

    if (!phone || phone.length !== 11) {
      errors.push('Phone number must be exactly 11 digits');
    }

    if (!password || password.length < 8) {
      errors.push(`Password must be at least 8 characters`);
    }

    if (!confirmPassword) {
      errors.push('Please confirm your password');
    } else if (password !== confirmPassword) {
      errors.push('Passwords do not match');
    }

    const roleError = validateRoleWithMessage(role);
    if (roleError) errors.push(roleError);

    if (errors.length > 0) {
      Alert.alert(
        'Validation Failed',
        errors.map((err, idx) => `${idx + 1}. ${err}`).join('\n\n'),
        [{ text: 'OK' }]
      );
      return;
    }

    navigation.navigate('OTPVerificationScreen', { email });
  }, [firstName, email, phone, password, confirmPassword, role, navigation]);

  const footerPb = insets.bottom > 0 ? insets.bottom : SPACING.xl;
  const footerHeight = SPACING.md + SPACING.buttonHeight + footerPb;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
        translucent={false}
      />

      <Header
        onBackPress={() => navigation.goBack()}
        step={1}
        totalSteps={4}
      />

      <ProgressBar progress={25} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: footerHeight + SPACING.lg },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={styles.headlineContainer}>
            <Text style={styles.headline}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join thousands making a difference
            </Text>
          </View>

          {/* First Name - Mandatory (Min 3 chars) */}
          <View>
            <FieldLabel label="First Name" mandatory />
            <InputField
              placeholder="First name"
              value={firstName}
              onChangeText={setFirstName}
              leftIcon="user"
              autoCapitalize="words"
              validator={(val) => validateNameWithMessage(val, 'First name')}
              showValidationOnChange={true}
              containerStyle={styles.noMargin}
            />
          </View>

          {/* Last Name - Optional */}
          <View>
            <FieldLabel label="Last Name" optional />
            <InputField
              placeholder="Last name"
              value={lastName}
              onChangeText={setLastName}
              leftIcon="user"
              autoCapitalize="words"
              containerStyle={styles.noMargin}
            />
          </View>

          {/* Email - Mandatory */}
          <View>
            <FieldLabel label="Email" mandatory />
            <InputField
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              leftIcon="mail"
              keyboardType="email-address"
              autoCapitalize="none"
              validator={validateEmailWithMessage}
              showValidationOnChange={true}
              containerStyle={styles.noMargin}
            />
          </View>

          {/* Phone - Mandatory (Exactly 11 digits) */}
          <PhoneInput
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            mandatory
          />

          {/* Password - Mandatory (Min 8 chars) */}
          <View>
            <FieldLabel label="Password" mandatory />
            <PasswordInput
              value={password}
              onChangeText={setPassword}
              showStrength={true}
              containerStyle={styles.noMargin}
            />
          </View>

          {/* Confirm Password - Mandatory */}
          <View>
            <FieldLabel label="Confirm Password" mandatory />
            <PasswordInput
              label=""
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              showStrength={false}
              isConfirmPassword={true}
              originalPassword={password}
              containerStyle={styles.noMargin}
            />
          </View>

          {/* Role Selector - Mandatory */}
          <RoleSelector
            value={role}
            onChange={setRole}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: footerPb }]}>
        <GradientButton
          title="Continue"
          onPress={handleContinue}
          disabled={!isFormValid}
          icon={
            <Icon
              name="arrow-right"
              size={SPACING.iconSize}
              color={COLORS.white}
              style={styles.buttonIcon}
            />
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.screenPadding,
  },
  headlineContainer: {
    marginBottom: SPACING.xl,
  },
  headline: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontFamily: TYPOGRAPHY.fontFamily.extraBold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textSecondary,
  },
  noMargin: {
    marginBottom: SPACING.md,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.md,
    backgroundColor: COLORS.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
  },
  buttonIcon: {
    marginLeft: SPACING.gapSm,
  },
});

export default SignUpScreen;