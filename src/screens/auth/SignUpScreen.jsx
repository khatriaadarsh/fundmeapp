// src/screens/auth/SignUpScreen.js
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
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
import { FullScreenLoader } from '../../components/common/Loader';
import ResponseModal from '../../components/ResponseModal';

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

import { useRegisterStep1 } from '../../hooks/useRegistration';
import { useAppContext } from '../../context/AppContext';

const SignUpScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { saveUser, currentUser } = useAppContext();
  const { mutate: register, isPending } = useRegisterStep1();

  // Email comes from CheckUser screen (or AppContext if user resumes)
  const prefilledEmail = route?.params?.email || currentUser?.email || '';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(prefilledEmail);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('');

  // Errors only. This is step 1 of 4, so a success dialog here would
  // announce an account that isn't usable until OTP, CNIC and profile
  // are done — the screen just advances instead.
  const [errorModal, setErrorModal] = useState({
    visible: false,
    title: '',
    message: '',
    code: '',
  });

  const closeErrorModal = useCallback(() => {
    setErrorModal(prev => ({ ...prev, visible: false }));
  }, []);

  const showError = useCallback(({ title, message, code = '' }) => {
    setErrorModal({
      visible: true,
      title: title || 'Error',
      message: message || 'Something went wrong. Please try again.',
      code: code ? String(code) : '',
    });
  }, []);

  useEffect(() => {
    if (prefilledEmail) setEmail(prefilledEmail);
  }, [prefilledEmail]);

  const isFormValid = useMemo(
    () =>
      validateName(firstName) &&
      validateEmail(email) &&
      validatePhone(phone) &&
      validatePassword(password) &&
      confirmPassword &&
      password === confirmPassword &&
      role,
    [firstName, email, phone, password, confirmPassword, role],
  );

  const handleContinue = useCallback(() => {
    const errors = [];

    const firstNameError = validateNameWithMessage(firstName, 'First name');
    if (firstNameError) errors.push(firstNameError);

    const emailError = validateEmailWithMessage(email);
    if (emailError) errors.push(emailError);

    if (!phone || phone.length !== 11)
      errors.push('Phone number must be exactly 11 digits');
    if (!password || password.length < 8)
      errors.push('Password must be at least 8 characters');
    if (!confirmPassword) errors.push('Please confirm your password');
    else if (password !== confirmPassword)
      errors.push('Passwords do not match');

    const roleError = validateRoleWithMessage(role);
    if (roleError) errors.push(roleError);

    if (errors.length > 0) {
      showError({
        title: 'Validation Failed',
        message: errors.map((err, idx) => `${idx + 1}. ${err}`).join('\n'),
      });
      return;
    }

    register(
      {
        firstName,
        lastName,
        email,
        mobileNumber: phone,
        password,
        confirmPassword,
        userRole: role,
      },
      {
        onSuccess: async body => {
          try {
            // HTTP 200 alone isn't success — the backend returns
            // failures with a 200 and a non-"000" responseCode.
            if (body?.responseCode && body.responseCode !== '000') {
              showError({
                title: 'Registration Failed',
                message:
                  body?.responseMessage ||
                  'Registration failed. Please try again.',
                code: body?.responseCode,
              });
              return;
            }

            const data = body?.data || {};
            await saveUser({
              email,
              userId: data.userId ?? null,
              step: data.step ?? 1,
              stepStatus: data.stepStatus ?? 'COMPLETED',
              status: 'draft',
              profile: data,
            });

            // Silent success — straight to OTP.
            navigation.navigate('OTPVerificationScreen', { email });
          } catch (e) {
            const data = e?.response?.data || e?.raw;
            showError({
              title: 'Registration Failed',
              message:
                data?.responseMessage ||
                e?.message ||
                'Registration failed. Please try again.',
              code: data?.responseCode || '',
            });
          }
        },
        onError: err => {
          const data = err?.response?.data || err?.raw;
          showError({
            title: 'Registration Failed',
            message:
              data?.responseMessage ||
              err?.message ||
              'Registration failed. Please try again.',
            code: data?.responseCode || err?.code || '',
          });
        },
      },
    );
  }, [
    firstName,
    lastName,
    email,
    phone,
    password,
    confirmPassword,
    role,
    register,
    saveUser,
    navigation,
    showError,
  ]);

  const footerPb = insets.bottom > 0 ? insets.bottom : SPACING.xl;
  const footerHeight = SPACING.md + SPACING.buttonHeight + footerPb;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
        translucent={false}
      />

      <Header onBackPress={() => navigation.goBack()} step={1} totalSteps={4} />

      <ProgressBar progress={25} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: footerHeight + SPACING.xxxl,
              flexGrow: 1,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          automaticallyAdjustKeyboardInsets={true}
          bounces={false}
        >
          <View style={styles.headlineContainer}>
            <Text style={styles.headline}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join thousands making a difference
            </Text>
          </View>

          <View>
            <FieldLabel label="First Name" mandatory />
            <InputField
              placeholder="First name"
              value={firstName}
              onChangeText={setFirstName}
              leftIcon="user"
              autoCapitalize="words"
              validator={val => validateNameWithMessage(val, 'First name')}
              showValidationOnChange={true}
              containerStyle={styles.noMargin}
            />
          </View>

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

          {/* Email — LOCKED (set by CheckUser) */}
          <View>
            <FieldLabel label="Email" mandatory />
            <InputField
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              leftIcon="mail"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={false}
              selectTextOnFocus={false}
              containerStyle={[styles.noMargin, styles.disabledField]}
            />
          </View>

          <PhoneInput
            label="Phone"
            value={phone}
            onChangeText={setPhone}
            mandatory
          />

          <View>
            <FieldLabel label="Password" mandatory />
            <PasswordInput
              value={password}
              onChangeText={setPassword}
              showStrength={true}
              containerStyle={styles.noMargin}
            />
          </View>

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
          <View style={styles.roleWrapper}>
            <RoleSelector value={role} onChange={setRole} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.footer, { paddingBottom: footerPb }]}>
        <GradientButton
          title="Continue"
          onPress={handleContinue}
          disabled={!isFormValid || isPending}
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

      <FullScreenLoader visible={isPending} message="Creating your account…" />

      <ResponseModal
        visible={errorModal.visible}
        variant="error"
        title={errorModal.title}
        message={errorModal.message}
        code={errorModal.code}
        onClose={closeErrorModal}
      />
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
  roleWrapper: {
    marginBottom: SPACING.xs,
  },
  disabledField: { opacity: 0.7 },

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

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 10,
  },
  buttonIcon: { marginLeft: SPACING.gapSm },
});

export default SignUpScreen;