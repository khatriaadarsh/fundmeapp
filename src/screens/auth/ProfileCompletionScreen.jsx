// src/screens/auth/ProfileCompletionScreen.js
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';

import Header           from '../../components/common/Header';
import ProgressBar      from '../../components/common/ProgressBar';
import InputField       from '../../components/common/InputField';
import PhotoPicker      from '../../components/auth/PhotoPicker';
import GenderToggle     from '../../components/auth/GenderToggle';
import Dropdown         from '../../components/forms/Dropdown';
import GradientButton   from '../../components/common/GradientButton';
import FieldLabel       from '../../components/common/FieldLabel';
import { FullScreenLoader } from '../../components/common/Loader';

import { COLORS, SPACING, TYPOGRAPHY } from '../../theme';
import { formatDateOfBirth, dobUiToApi } from '../../utils/formatters';
import {
  validateDOBWithMessage,
  validateGenderWithMessage,
} from '../../utils/validators';
import { fileFromUri } from '../../utils/formData';

import { useRegisterStep4 }            from '../../hooks/useRegistration';
import { useProvinces, useCities }     from '../../hooks/useLocation';
import { useAppContext }               from '../../context/AppContext';
import { useToast }                    from '../../components/common/Toast';

const ProfileCompletionScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const toast  = useToast();
  const { currentUser } = useAppContext();
  const { mutate: submitStep4, isPending } = useRegisterStep4();

  const email = route?.params?.email || currentUser?.email || '';

  // Cached API data
  const { data: provinces = [], isLoading: loadingProvinces } = useProvinces();

  // Form State
  const [photoUri,   setPhotoUri]   = useState(null);
  const [bio,        setBio]        = useState('');
  const [dob,        setDob]        = useState('');
  const [gender,     setGender]     = useState('');
  const [provinceId, setProvinceId] = useState(null);
  const [province,   setProvince]   = useState('');
  const [cityId,     setCityId]     = useState(null);
  const [city,       setCity]       = useState('');
  const [errors,     setErrors]     = useState({});

  const { data: cities = [], isLoading: loadingCities } = useCities(provinceId);

  // Convert backend list → Dropdown options
  // Your existing Dropdown receives string[]. We'll pass names and look up IDs separately.
  // 
  const provinceNames = useMemo(
  () => Array.isArray(provinces) ? provinces.map(p => p.name) : [],
  [provinces]
);

  // const cityNames     = useMemo(() => cities.map(c => c.name), [cities]);
  const cityNames = useMemo(
  () => Array.isArray(cities) ? cities.map(c => c.name) : [],
  [cities]
);

  const handleDobChange = useCallback((text) => {
    setDob(formatDateOfBirth(text));
  }, []);

  const handleProvinceChange = useCallback((name) => {
    const found = provinces.find(p => p.name === name);
    setProvinceId(found?.id ?? null);
    setProvince(name);
    setCity('');
    setCityId(null);
    if (errors.city) setErrors({ ...errors, city: null });
  }, [provinces, errors]);

  const handleCityChange = useCallback((name) => {
    const found = cities.find(c => c.name === name);
    setCityId(found?.id ?? null);
    setCity(name);
    if (errors.city) setErrors({ ...errors, city: null });
  }, [cities, errors]);

  const handleCityDisabledPress = useCallback(() => {
    setErrors({ ...errors, city: 'Please select province first' });
  }, [errors]);

  const isFormValid = useMemo(() => (
    dob.length === 14 && gender && province && city
  ), [dob, gender, province, city]);

  const handleComplete = useCallback(() => {
    const validationErrors = [];

    const dobError    = validateDOBWithMessage(dob);
    const genderError = validateGenderWithMessage(gender);
    if (dobError)    validationErrors.push(dobError);
    if (genderError) validationErrors.push(genderError);
    if (!province)   validationErrors.push('Please select your province');
    if (!city)       validationErrors.push('Please select your city');

    if (validationErrors.length > 0) {
      toast.error(validationErrors[0]);
      return;
    }

    if (!email) {
      toast.error('Missing email. Please restart registration.');
      return;
    }

    const photoUriValue = typeof photoUri === 'string' ? photoUri : photoUri?.uri;

    submitStep4(
      {
        email,
        profileImage: fileFromUri(photoUriValue, 'profile.jpg'),
        bio,
        dateOfBirth:  dobUiToApi(dob),
        gender,
        province,
        city,
      },
      {
        onSuccess: (body) => {
          toast.success(body?.responseMessage || 'Profile completed successfully!');
          setTimeout(() => {
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          }, 1200);
        },
        onError: (err) => {
          toast.error(err?.message || 'Submission failed.');
        },
      },
    );
  }, [dob, gender, province, city, email, photoUri, bio, submitStep4, navigation, toast]);

  const footerPb     = insets.bottom > 0 ? insets.bottom : SPACING.xl;
  const footerHeight = SPACING.md + SPACING.buttonHeight + footerPb;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} translucent={false} />

      <Header onBackPress={() => navigation.goBack()} step={4} totalSteps={4} />
      <ProgressBar progress={100} variant="success" />

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
            <Text style={styles.headline}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>Just a few more details!</Text>
          </View>

          <PhotoPicker uri={photoUri} onPick={setPhotoUri} />

          <View>
            <FieldLabel label="Bio" optional />
            <InputField
              placeholder="Tell us about yourself..."
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
              containerStyle={styles.fieldMargin}
            />
          </View>

          <View>
            <FieldLabel label="Date of Birth" mandatory />
            <InputField
              placeholder="DD / MM / YYYY"
              value={dob}
              onChangeText={handleDobChange}
              keyboardType="number-pad"
              maxLength={14}
              validator={validateDOBWithMessage}
              leftIcon="calendar"
              containerStyle={styles.fieldMargin}
            />
          </View>

          <GenderToggle value={gender} onChange={setGender} mandatory />

          <Dropdown
            label="Province"
            placeholder={loadingProvinces ? 'Loading provinces…' : 'Select Province'}
            value={province}
            options={provinceNames}
            onSelect={handleProvinceChange}
            mandatory
          />

          <Dropdown
            label="City"
            placeholder={loadingCities ? 'Loading cities…' : 'Select City'}
            value={city}
            options={cityNames}
            onSelect={handleCityChange}
            disabled={!province}
            onDisabledPress={handleCityDisabledPress}
            error={errors.city}
            mandatory
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.footer, { paddingBottom: footerPb }]}>
        <GradientButton
          title="Complete Signup"
          onPress={handleComplete}
          disabled={!isFormValid || isPending}
          variant="success"
          icon={
            <Icon
              name="check"
              size={SPACING.iconSize}
              color={COLORS.white}
              style={styles.buttonIcon}
            />
          }
        />
      </View>

      <FullScreenLoader visible={isPending} message="Completing your profile…" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:               { flex: 1, backgroundColor: COLORS.background },
  keyboardView:       { flex: 1 },
  scroll:             { flex: 1 },
  scrollContent:      { paddingHorizontal: SPACING.screenPadding },
  headlineContainer:  { marginBottom: SPACING.lg },
  headline:           { fontSize: TYPOGRAPHY.fontSize.xxxl, fontFamily: TYPOGRAPHY.fontFamily.extraBold, color: COLORS.textPrimary, marginBottom: SPACING.xs },
  subtitle:           { fontSize: TYPOGRAPHY.fontSize.sm, fontFamily: TYPOGRAPHY.fontFamily.regular, color: COLORS.textSecondary },
  fieldMargin:        { marginBottom: SPACING.md },
  footer: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    paddingHorizontal: SPACING.screenPadding,
    paddingTop: SPACING.md,
    backgroundColor: COLORS.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
  },
  buttonIcon: { marginLeft: SPACING.gapSm },
});

export default ProfileCompletionScreen;