// src/screens/auth/CNICUploadScreen.js
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Header           from '../../components/common/Header';
import ProgressBar      from '../../components/common/ProgressBar';
import UploadSlot       from '../../components/auth/UploadSlot';
import SecurityBanner   from '../../components/auth/SecurityBanner';
import SuccessModal     from '../../components/auth/SuccessModal';
import GradientButton   from '../../components/common/GradientButton';
import FieldLabel       from '../../components/common/FieldLabel';
import { FullScreenLoader } from '../../components/common/Loader';

import { COLORS, SPACING, TYPOGRAPHY } from '../../theme';
import { formatCNIC }   from '../../utils/formatters';
import { validateCNIC } from '../../utils/validators';
import { fileFromUri }  from '../../utils/formData';

import { useRegisterStep3 } from '../../hooks/useRegistration';
import { useAppContext }    from '../../context/AppContext';
import { useToast }         from '../../components/common/Toast';

const CNICUploadScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const toast  = useToast();
  const { currentUser } = useAppContext();
  const { mutate: submitStep3, isPending } = useRegisterStep3();

  const email = route?.params?.email || currentUser?.email || '';

  const [cnic,       setCnic]       = useState('');
  const [frontUri,   setFrontUri]   = useState(null);
  const [backUri,    setBackUri]    = useState(null);
  const [focused,    setFocused]    = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [showModal,  setShowModal]  = useState(false);
  const [errors,     setErrors]     = useState({});

  const modalShown = useRef(false);

  useEffect(() => {
    if (frontUri && backUri && !modalShown.current) {
      modalShown.current = true;
      setTimeout(() => setShowModal(true), 300);
    }
  }, [frontUri, backUri]);

  const handleCnicChange = useCallback((text) => {
    setCnic(formatCNIC(text));
    if (errors.cnic) setErrors({ ...errors, cnic: null });
  }, [errors]);

  const isFormValid = useMemo(() => (
    cnic.length === 15 && validateCNIC(cnic) && frontUri && backUri
  ), [cnic, frontUri, backUri]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!cnic.trim())                newErrors.cnic = 'CNIC number is required';
    else if (!validateCNIC(cnic))    newErrors.cnic = 'Invalid CNIC format';
    if (!frontUri)                   newErrors.front = 'Please upload CNIC front side';
    if (!backUri)                    newErrors.back  = 'Please upload CNIC back side';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [cnic, frontUri, backUri]);

  const handleContinue = useCallback(() => {
    if (!validateForm()) return;
    if (!email) {
      toast.error('Missing email. Please restart registration.');
      return;
    }

    // UploadSlot may pass a string URI OR an object {uri,...}
    const frontUriValue = typeof frontUri === 'string' ? frontUri : frontUri?.uri;
    const backUriValue  = typeof backUri  === 'string' ? backUri  : backUri?.uri;

    submitStep3(
      {
        email,
        nicNumber: cnic.replace(/-/g, ''), // backend wants raw 13 digits
        nicFront:  fileFromUri(frontUriValue, 'nic_front.jpg'),
        nicBack:   fileFromUri(backUriValue,  'nic_back.jpg'),
      },
      {
        onSuccess: (body) => {
          toast.success(body?.responseMessage || 'CNIC uploaded successfully.');
          navigation.navigate('ProfileCompletionScreen', { email });
        },
        onError: (err) => {
          toast.error(err?.message || 'Upload failed.');
        },
      },
    );
  }, [validateForm, email, cnic, frontUri, backUri, submitStep3, navigation, toast]);

  const footerPb     = insets.bottom > 0 ? insets.bottom : SPACING.xl;
  const footerHeight = SPACING.md + SPACING.buttonHeight + footerPb;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} translucent={false} />

      <Header onBackPress={() => navigation.goBack()} step={3} totalSteps={4} />
      <ProgressBar progress={75} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: footerHeight + SPACING.lg }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={styles.headlineContainer}>
            <Text style={styles.headline}>Verify Your Identity</Text>
            <Text style={styles.subtitle}>Upload your CNIC for verification</Text>
          </View>

          <View style={styles.cnicFieldContainer}>
            <FieldLabel label="CNIC Number" mandatory />
            <TextInput
              style={[
                styles.cnicInput,
                focused && styles.cnicInputFocused,
                errors.cnic && styles.cnicInputError,
              ]}
              placeholder="XXXXX-XXXXXXX-X"
              placeholderTextColor={COLORS.textPlaceholder}
              value={cnic}
              onChangeText={handleCnicChange}
              keyboardType="number-pad"
              maxLength={15}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              editable={!isPending}
            />
            {errors.cnic && <Text style={styles.errorText}>{errors.cnic}</Text>}
          </View>

          <UploadSlot label="CNIC Front Side" uri={frontUri} onPick={setFrontUri} mandatory />
          {errors.front && !frontUri && <Text style={styles.uploadError}>{errors.front}</Text>}

          <UploadSlot label="CNIC Back Side" uri={backUri} onPick={setBackUri} mandatory />
          {errors.back && !backUri && <Text style={styles.uploadError}>{errors.back}</Text>}

          {showBanner && <SecurityBanner onDismiss={() => setShowBanner(false)} />}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.footer, { paddingBottom: footerPb }]}>
        <GradientButton
          title="Continue"
          onPress={handleContinue}
          disabled={!isFormValid || isPending}
        />
      </View>

      <SuccessModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        title="CNIC Uploaded Successfully!"
        message="Both sides of your CNIC have been uploaded. Tap Continue to verify."
        tips={[
          'Images are clear and not blurry',
          'All four corners are visible',
          'No glare or shadows on the card',
        ]}
      />

      <FullScreenLoader visible={isPending} message="Uploading CNIC…" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:               { flex: 1, backgroundColor: COLORS.background },
  keyboardView:       { flex: 1 },
  scroll:             { flex: 1 },
  scrollContent:      { paddingHorizontal: SPACING.screenPadding },
  headlineContainer:  { marginBottom: SPACING.xl },
  headline:           { fontSize: TYPOGRAPHY.fontSize.xxxl, fontFamily: TYPOGRAPHY.fontFamily.extraBold, color: COLORS.textPrimary, marginBottom: SPACING.xs },
  subtitle:           { fontSize: TYPOGRAPHY.fontSize.sm, fontFamily: TYPOGRAPHY.fontFamily.regular, color: COLORS.textSecondary },
  cnicFieldContainer: { marginBottom: SPACING.lg },
  cnicInput: {
    borderWidth: SPACING.borderWidth,
    borderColor: COLORS.border,
    borderRadius: SPACING.borderRadiusSm,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    minHeight: SPACING.inputHeight,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textPrimary,
  },
  cnicInputFocused: { borderColor: COLORS.success },
  cnicInputError:   { borderColor: COLORS.error },
  errorText:    { fontSize: TYPOGRAPHY.fontSize.xs, fontFamily: TYPOGRAPHY.fontFamily.regular, color: COLORS.error, marginTop: SPACING.xs, marginLeft: SPACING.xs },
  uploadError:  { fontSize: TYPOGRAPHY.fontSize.xs, fontFamily: TYPOGRAPHY.fontFamily.regular, color: COLORS.error, marginTop: -SPACING.sm, marginBottom: SPACING.md, marginLeft: SPACING.xs },
  footer: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.md,
    backgroundColor: COLORS.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
  },
});

export default CNICUploadScreen;