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
import PhotoPicker from '../../components/auth/PhotoPicker';
import GenderToggle from '../../components/auth/GenderToggle';
import Dropdown from '../../components/forms/Dropdown';
import GradientButton from '../../components/common/GradientButton';
import FieldLabel from '../../components/common/FieldLabel';

import { COLORS, SPACING, TYPOGRAPHY } from '../../theme';
import { PROVINCES, CITIES_BY_PROVINCE } from '../../constants/data';
import { formatDateOfBirth } from '../../utils/formatters';
import { validateDOBWithMessage, validateGenderWithMessage } from '../../utils/validators';

const ProfileCompletionScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  // Form State
  const [photoUri, setPhotoUri] = useState(null);
  const [bio, setBio] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');

  // Error State
  const [errors, setErrors] = useState({});

  const handleDobChange = useCallback((text) => {
    const formatted = formatDateOfBirth(text);
    setDob(formatted);
  }, []);

  const handleProvinceChange = useCallback((value) => {
    setProvince(value);
    // Reset city when province changes
    setCity('');
    // Clear city error if exists
    if (errors.city) {
      setErrors({ ...errors, city: null });
    }
  }, [errors]);

  const handleCityChange = useCallback((value) => {
    setCity(value);
    if (errors.city) {
      setErrors({ ...errors, city: null });
    }
  }, [errors]);

  // Handle when user tries to select city without province
  const handleCityDisabledPress = useCallback(() => {
    setErrors({ ...errors, city: 'Please select province first' });
  }, [errors]);

  // Get cities based on selected province
  const availableCities = useMemo(() => {
    if (!province) return [];
    return CITIES_BY_PROVINCE[province] || [];
  }, [province]);

  // Form validation
  const isFormValid = useMemo(() => {
    return (
      dob.length === 14 && // DD / MM / YYYY
      gender &&
      province &&
      city
    );
  }, [dob, gender, province, city]);

  const handleComplete = useCallback(() => {
    // Validate all fields
    const validationErrors = [];

    const dobError = validateDOBWithMessage(dob);
    if (dobError) validationErrors.push(dobError);

    const genderError = validateGenderWithMessage(gender);
    if (genderError) validationErrors.push(genderError);

    if (!province) {
      validationErrors.push('Please select your province');
    }

    if (!city) {
      validationErrors.push('Please select your city');
    }

    if (validationErrors.length > 0) {
      Alert.alert(
        'Please Complete Required Fields',
        validationErrors.map((err, idx) => `${idx + 1}. ${err}`).join('\n\n'),
        [{ text: 'OK' }]
      );
      return;
    }

    // Success - navigate to login
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  }, [dob, gender, province, city, navigation]);

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
        step={4}
        totalSteps={4}
      />

      <ProgressBar progress={100} variant="success" />

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
            <Text style={styles.headline}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>Just a few more details!</Text>
          </View>

          {/* Photo Picker - Optional */}
          <PhotoPicker uri={photoUri} onPick={setPhotoUri} />

          {/* Bio - Optional */}
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

          {/* Date of Birth - Mandatory */}
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

          {/* Gender - Mandatory */}
          <GenderToggle
            value={gender}
            onChange={setGender}
            mandatory
          />

          {/* Province - Mandatory */}
          <Dropdown
            label="Province"
            placeholder="Select Province"
            value={province}
            options={PROVINCES}
            onSelect={handleProvinceChange}
            mandatory
          />

          {/* City - Mandatory (depends on Province) */}
          <Dropdown
            label="City"
            placeholder="Select City"
            value={city}
            options={availableCities}
            onSelect={handleCityChange}
            disabled={!province}
            onDisabledPress={handleCityDisabledPress}
            error={errors.city}
            mandatory
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: footerPb }]}>
        <GradientButton
          title="Complete Signup"
          onPress={handleComplete}
          disabled={!isFormValid}
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
    marginBottom: SPACING.lg,
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
  fieldMargin: {
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

export default ProfileCompletionScreen;