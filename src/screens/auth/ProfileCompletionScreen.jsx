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
  TouchableOpacity, // ← add
  Modal, // ← add (for iOS confirm sheet)
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Feather';

import Header from '../../components/common/Header';
import ProgressBar from '../../components/common/ProgressBar';
import InputField from '../../components/common/InputField';
import PhotoPicker from '../../components/auth/PhotoPicker';
import GenderToggle from '../../components/auth/GenderToggle';
import Dropdown from '../../components/forms/Dropdown';
import GradientButton from '../../components/common/GradientButton';
import FieldLabel from '../../components/common/FieldLabel';
import { FullScreenLoader } from '../../components/common/Loader';
import ResponseModal from '../../components/ResponseModal';

import { COLORS, SPACING, TYPOGRAPHY } from '../../theme';
import { formatDateOfBirth, dobUiToApi } from '../../utils/formatters';
import {
  validateDOBWithMessage,
  validateGenderWithMessage,
} from '../../utils/validators';
import { fileFromUri } from '../../utils/formData';

import { useRegisterStep4 } from '../../hooks/useRegistration';
import { useProvinces, useCities } from '../../hooks/useLocation';
import { useAppContext } from '../../context/AppContext';

// Matches your existing UI format: "DD / MM / YYYY" (length 14)
const formatDobFromDate = date => {
  if (!date) return '';
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d} / ${m} / ${y}`;
};

const parseDobToDate = dobStr => {
  if (!dobStr || dobStr.length !== 14) return new Date(2000, 0, 1);
  const [dd, mm, yyyy] = dobStr.split(' / ').map(Number);
  if (!dd || !mm || !yyyy) return new Date(2000, 0, 1);
  return new Date(yyyy, mm - 1, dd);
};

// Reasonable bounds for DOB
const MAX_DOB = new Date(); // today
const MIN_DOB = new Date();
MIN_DOB.setFullYear(MAX_DOB.getFullYear() - 100);

const ProfileCompletionScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { currentUser } = useAppContext();
  const { mutate: submitStep4, isPending } = useRegisterStep4();

  const email = route?.params?.email || currentUser?.email || '';

  // Cached API data
  const { data: provinces = [], isLoading: loadingProvinces } = useProvinces();

  // Form State
  const [photoUri, setPhotoUri] = useState(null);
  const [bio, setBio] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [provinceId, setProvinceId] = useState(null);
  const [province, setProvince] = useState('');
  const [cityId, setCityId] = useState(null);
  const [city, setCity] = useState('');
  const [errors, setErrors] = useState({});

  // Unlike steps 1-3, this IS the end of registration, so success gets a
  // real confirmation — the account now exists but is pending review, and
  // the user needs to know that before being dropped on the login screen.
  const [responseModal, setResponseModal] = useState({
    visible: false,
    variant: 'error',
    title: '',
    message: '',
    code: '',
    closeAction: null,
  });

  const closeResponseModal = useCallback(() => {
    const action = responseModal.closeAction;
    setResponseModal(prev => ({ ...prev, visible: false, closeAction: null }));

    if (action === 'login') {
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
  }, [responseModal.closeAction, navigation]);

  const showResponse = useCallback(
    ({ variant = 'error', title, message, code = '', closeAction = null }) => {
      setResponseModal({
        visible: true,
        variant,
        title: title || (variant === 'success' ? 'Success' : 'Error'),
        message: message || 'Something went wrong. Please try again.',
        code: code ? String(code) : '',
        closeAction,
      });
    },
    [],
  );

  const { data: cities = [], isLoading: loadingCities } = useCities(provinceId);

  // Convert backend list → Dropdown options
  // Your existing Dropdown receives string[]. We'll pass names and look up IDs separately.
  const provinceNames = useMemo(
    () => (Array.isArray(provinces) ? provinces.map(p => p.name) : []),
    [provinces],
  );

  const cityNames = useMemo(
    () => (Array.isArray(cities) ? cities.map(c => c.name) : []),
    [cities],
  );

  const handleProvinceChange = useCallback(
    name => {
      const found = provinces.find(p => p.name === name);
      setProvinceId(found?.id ?? null);
      setProvince(name);
      setCity('');
      setCityId(null);
      if (errors.city) setErrors({ ...errors, city: null });
    },
    [provinces, errors],
  );

  const handleCityChange = useCallback(
    name => {
      const found = cities.find(c => c.name === name);
      setCityId(found?.id ?? null);
      setCity(name);
      if (errors.city) setErrors({ ...errors, city: null });
    },
    [cities, errors],
  );

  const handleCityDisabledPress = useCallback(() => {
    setErrors({ ...errors, city: 'Please select province first' });
  }, [errors]);

  const isFormValid = useMemo(
    () => dob.length === 14 && gender && province && city,
    [dob, gender, province, city],
  );

  const handleComplete = useCallback(() => {
    const validationErrors = [];

    const dobError = validateDOBWithMessage(dob);
    const genderError = validateGenderWithMessage(gender);
    if (dobError) validationErrors.push(dobError);
    if (genderError) validationErrors.push(genderError);
    if (!province) validationErrors.push('Please select your province');
    if (!city) validationErrors.push('Please select your city');

    if (validationErrors.length > 0) {
      showResponse({
        variant: 'error',
        title: 'Validation Failed',
        message: validationErrors
          .map((err, idx) => `${idx + 1}. ${err}`)
          .join('\n'),
      });
      return;
    }

    if (!email) {
      showResponse({
        variant: 'error',
        title: 'Error',
        message: 'Missing email. Please restart registration.',
      });
      return;
    }

    const photoUriValue =
      typeof photoUri === 'string' ? photoUri : photoUri?.uri;

    submitStep4(
      {
        email,
        profileImage: fileFromUri(photoUriValue, 'profile.jpg'),
        bio,
        dateOfBirth: dobUiToApi(dob),
        gender,
        province,
        city,
      },
      {
        onSuccess: body => {
          // HTTP 200 alone isn't success — the backend returns failures
          // with a 200 and a non-"000" responseCode.
          if (body?.responseCode && body.responseCode !== '000') {
            showResponse({
              variant: 'error',
              title: 'Submission Failed',
              message:
                body?.responseMessage || 'Submission failed. Please try again.',
              code: body?.responseCode,
            });
            return;
          }

          showResponse({
            variant: 'success',
            title: 'Account Created',
            message:
              'Your account has been created successfully and is now under review. You will be notified once it is approved.',
            closeAction: 'login',
          });
        },
        onError: err => {
          const data = err?.response?.data || err?.raw;
          showResponse({
            variant: 'error',
            title: 'Submission Failed',
            message:
              data?.responseMessage ||
              err?.message ||
              'Submission failed. Please try again.',
            code: data?.responseCode || err?.code || '',
          });
        },
      },
    );
  }, [
    dob,
    gender,
    province,
    city,
    email,
    photoUri,
    bio,
    submitStep4,
    showResponse,
  ]);

  const footerPb = insets.bottom > 0 ? insets.bottom : SPACING.xl;
  const footerHeight = SPACING.md + SPACING.buttonHeight + footerPb;
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [tempDobDate, setTempDobDate] = useState(() => parseDobToDate(dob));
  const openDobPicker = useCallback(() => {
    setTempDobDate(parseDobToDate(dob));
    setShowDobPicker(true);
  }, [dob]);

  const onDobChange = useCallback((event, selectedDate) => {
    // Android: fires once and closes; iOS: fires on every spin
    if (Platform.OS === 'android') {
      setShowDobPicker(false);
      if (event.type === 'dismissed') return;
      if (selectedDate) {
        setDob(formatDobFromDate(selectedDate));
      }
      return;
    }
    // iOS — only update temp until user taps Confirm
    if (selectedDate) {
      setTempDobDate(selectedDate);
    }
  }, []);

  const confirmIosDob = useCallback(() => {
    setDob(formatDobFromDate(tempDobDate));
    setShowDobPicker(false);
  }, [tempDobDate]);

  const cancelIosDob = useCallback(() => {
    setShowDobPicker(false);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
        translucent={false}
      />

      <Header onBackPress={() => navigation.goBack()} step={4} totalSteps={4} />
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
            <TouchableOpacity
              style={styles.dobField}
              onPress={openDobPicker}
              activeOpacity={0.75}
            >
              <Text
                style={[styles.dobText, !dob && styles.dobPlaceholder]}
                numberOfLines={1}
              >
                {dob || 'DD / MM / YYYY'}
              </Text>
              <Icon
                name="calendar"
                size={SPACING.iconSize}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <GenderToggle value={gender} onChange={setGender} mandatory />

          <Dropdown
            label="Province"
            placeholder={
              loadingProvinces ? 'Loading provinces…' : 'Select Province'
            }
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

      <FullScreenLoader
        visible={isPending}
        message="Completing your profile…"
      />
      {showDobPicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={parseDobToDate(dob)}
          mode="date"
          display="default"
          onChange={onDobChange}
          maximumDate={MAX_DOB}
          minimumDate={MIN_DOB}
        />
      )}

      {/* iOS */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={showDobPicker}
          transparent
          animationType="slide"
          onRequestClose={cancelIosDob}
        >
          <View style={styles.iosPickerOverlay}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={cancelIosDob}
            />
            <View
              style={[
                styles.iosPickerSheet,
                { paddingBottom: Math.max(insets.bottom, 16) },
              ]}
            >
              <View style={styles.iosPickerHeader}>
                <TouchableOpacity onPress={cancelIosDob} hitSlop={12}>
                  <Text style={styles.iosPickerCancel}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.iosPickerTitle}>Date of Birth</Text>
                <TouchableOpacity onPress={confirmIosDob} hitSlop={12}>
                  <Text style={styles.iosPickerDone}>Confirm</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDobDate}
                mode="date"
                display="spinner"
                onChange={onDobChange}
                maximumDate={MAX_DOB}
                minimumDate={MIN_DOB}
                style={styles.iosSpinner}
              />
            </View>
          </View>
        </Modal>
      )}

      <ResponseModal
        visible={responseModal.visible}
        variant={responseModal.variant}
        title={responseModal.title}
        message={responseModal.message}
        code={responseModal.code}
        onClose={closeResponseModal}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  keyboardView: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: SPACING.screenPadding },
  headlineContainer: { marginBottom: SPACING.lg },
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
  fieldMargin: { marginBottom: SPACING.md },
  dobField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white, // or COLORS.inputBg if you have it
    borderRadius: SPACING.radiusMd || 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: SPACING.inputHeight || 48,
    paddingHorizontal: SPACING.md || 14,
    marginBottom: SPACING.md,
  },
  dobText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.md || 15,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textPrimary,
  },
  dobPlaceholder: {
    color: COLORS.textSecondary,
  },

  iosPickerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  iosPickerSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  iosPickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  iosPickerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  iosPickerCancel: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  iosPickerDone: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  iosSpinner: {
    height: 200,
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
  buttonIcon: { marginLeft: SPACING.gapSm },
});

export default ProfileCompletionScreen;
