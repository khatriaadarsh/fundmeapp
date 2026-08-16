// src/screens/profile/EditProfile.jsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Platform,
  StatusBar,
  Image,
  Modal,
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/Feather';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { useUpdateProfile } from '../../hooks/useProfile';
import { useQuery } from '@tanstack/react-query';
import { getProvinces, getCities } from '../../services/locationService';

const { width: SW, height: SH } = Dimensions.get('window');
const scale = size => (SW / 375) * size;
const vscale = size => (SH / 812) * size;

const C = {
  bg: '#FFFFFF',
  primary: '#0A3D62',
  primaryMid: '#1A6EA8',
  primaryLight: 'rgba(10,61,98,0.08)',
  textDark: '#1A1A2E',
  textGray: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  inputBg: '#FFFFFF',
  disabledBg: '#F3F4F6',
  white: '#FFFFFF',
  overlay: 'rgba(10,20,40,0.60)',
  avatarBg: '#B0BEC5',
  stripBg: '#D6E8F7',
  teal: '#00B4CC',
};

const GENDER_OPTIONS = ['Male', 'Female', 'Other'];

// ═══════════════════════════════════════════════════════════
// SUCCESS MODAL - ORIGINAL WITH FULL ANIMATIONS
// ═══════════════════════════════════════════════════════════
const SuccessModal = ({ visible, onClose }) => {
  const masterAnim = useRef(new Animated.Value(0)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      masterAnim.setValue(0);
      checkAnim.setValue(0);
      return;
    }
    masterAnim.setValue(0);
    checkAnim.setValue(0);

    Animated.sequence([
      Animated.timing(masterAnim, {
        toValue: 0.4,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(masterAnim, {
        toValue: 0.7,
        duration: 280,
        easing: Easing.out(Easing.back(1.4)),
        useNativeDriver: true,
      }),
      Animated.timing(masterAnim, {
        toValue: 1.0,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      Animated.spring(checkAnim, {
        toValue: 1,
        tension: 180,
        friction: 7,
        useNativeDriver: true,
      }).start();
    });
  }, [visible, masterAnim, checkAnim]);

  const backdropOpacity = masterAnim.interpolate({
    inputRange: [0, 0.4],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const cardScale = masterAnim.interpolate({
    inputRange: [0, 0.4],
    outputRange: [0.8, 1],
    extrapolate: 'clamp',
  });
  const cardOpacity = masterAnim.interpolate({
    inputRange: [0, 0.25],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const ringScale = masterAnim.interpolate({
    inputRange: [0.4, 0.65, 0.7],
    outputRange: [0, 1.15, 1],
    extrapolate: 'clamp',
  });
  const ringOpacity = masterAnim.interpolate({
    inputRange: [0.4, 0.55],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const circleScale = masterAnim.interpolate({
    inputRange: [0.45, 0.68, 0.7],
    outputRange: [0, 1.1, 1],
    extrapolate: 'clamp',
  });
  const circleOpacity = masterAnim.interpolate({
    inputRange: [0.45, 0.58],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const textOpacity = masterAnim.interpolate({
    inputRange: [0.7, 0.92],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const textTranslate = masterAnim.interpolate({
    inputRange: [0.7, 1.0],
    outputRange: [20, 0],
    extrapolate: 'clamp',
  });
  const checkScale = checkAnim.interpolate({
    inputRange: [0, 0.6, 0.8, 1],
    outputRange: [0, 1.3, 0.85, 1],
  });
  const checkOpacity = checkAnim.interpolate({
    inputRange: [0, 0.2],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View style={[s.successOverlay, { opacity: backdropOpacity }]}>
        <Animated.View
          style={[
            s.successCard,
            { opacity: cardOpacity, transform: [{ scale: cardScale }] },
          ]}
        >
          <TouchableOpacity
            style={s.successClose}
            onPress={onClose}
            hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
          >
            <View style={s.successCloseInner}>
              <Icons name="x" size={scale(14)} color={C.textGray} />
            </View>
          </TouchableOpacity>

          <View style={s.successStrip}>
            <View style={[s.stripBlob, s.stripBlob1]} />
            <View style={[s.stripBlob, s.stripBlob2]} />
            <View style={[s.stripBlob, s.stripBlob3]} />
            <View style={[s.stripBlob, s.stripBlob4]} />
            <View style={[s.stripBlob, s.stripBlob5]} />
          </View>

          <View style={s.iconArea}>
            <Animated.View
              style={[
                s.ringOuter,
                { opacity: ringOpacity, transform: [{ scale: ringScale }] },
              ]}
            />
            <Animated.View
              style={[
                s.ringMiddle,
                { opacity: ringOpacity, transform: [{ scale: ringScale }] },
              ]}
            />
            <Animated.View
              style={[
                s.successCircle,
                { opacity: circleOpacity, transform: [{ scale: circleScale }] },
              ]}
            >
              <Animated.View
                style={{
                  opacity: checkOpacity,
                  transform: [{ scale: checkScale }],
                }}
              >
                <Icons name="check" size={scale(30)} color={C.white} />
              </Animated.View>
            </Animated.View>
          </View>

          <Animated.View
            style={[
              s.successBody,
              {
                opacity: textOpacity,
                transform: [{ translateY: textTranslate }],
              },
            ]}
          >
            <Text style={s.successTitle}>
              Profile Updated{'\n'}Successfully
            </Text>
            <Text style={s.successSub}>
              Your profile changes have been saved
            </Text>
            <TouchableOpacity
              style={s.successBtn}
              onPress={onClose}
              activeOpacity={0.85}
            >
              <Text style={s.successBtnText}>Done</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const EditProfile = ({ navigation, route }) => {
  const userId = route.params?.userId;
  const initialData = route.params?.profileData || {};

  // Fetch provinces
  const { data: provinces = [] } = useQuery({
    queryKey: ['provinces'],
    queryFn: getProvinces,
  });

  // Initialize form with API data
  const [formData, setFormData] = useState({
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    bio: initialData.bio || '',
    dateOfBirth: initialData.dateOfBirth
      ? formatDateForDisplay(initialData.dateOfBirth)
      : '',
    gender: initialData.gender ? capitalizeFirst(initialData.gender) : '',
    city: initialData.city || '',
    province: initialData.province || '',
    email: initialData.email || '',
    mobileNumber: initialData.mobileNumber || '',
    avatar: initialData.profileImageUrl || initialData.profileImage || null,
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showProvincePicker, setShowProvincePicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);

  // Fetch cities when province changes
  const { data: cities = [] } = useQuery({
    queryKey: ['cities', formData.province],
    queryFn: () => getCities(formData.province),
    enabled: !!formData.province,
  });

  // Update mutation
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();

  // Helper to capitalize first letter
  function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  // Helper to format date from API (1996-09-20) to display (20 / 09 / 1996)
  function formatDateForDisplay(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day} / ${month} / ${year}`;
  }

  // Helper to format date for API (20 / 09 / 1996) to (1996-09-20)
  function formatDateForAPI(displayDate) {
    if (!displayDate) return '';
    const parts = displayDate.split(' / ');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return displayDate;
  }

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const getInitials = () => {
    return `${formData.firstName?.[0] || ''}${
      formData.lastName?.[0] || ''
    }`.toUpperCase();
  };

  const handleImagePicker = useCallback(
    async type => {
      setShowImagePicker(false);
      const options = {
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 800,
        maxHeight: 800,
      };

      try {
        const result =
          type === 'camera'
            ? await launchCamera(options)
            : await launchImageLibrary(options);

        if (!result.didCancel && result.assets?.[0]?.uri) {
          updateField('avatar', result.assets[0].uri);
        }
      } catch (error) {
        Alert.alert('Error', 'Unable to select image');
      }
    },
    [updateField],
  );

  const handleProvinceSelect = useCallback(province => {
    setFormData(prev => ({ ...prev, province, city: '' }));
    setShowProvincePicker(false);
  }, []);

  const handleSave = useCallback(() => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      Alert.alert('Required', 'First name and last name are required.');
      return;
    }

    // Complete payload — every field is always sent (updated or not),
    // matching the backend's multipart/form-data update endpoint.
    // email & mobileNumber are intentionally excluded — backend doesn't
    // need them and they're locked/uneditable fields on this screen anyway.
    const payload = {
      userId: Number(userId),
      profileImageUrl: formData.avatar || '',
      firstName: formData.firstName,
      lastName: formData.lastName,
      bio: formData.bio || '',
      dateOfBirth: formatDateForAPI(formData.dateOfBirth),
      gender: formData.gender,
      city: formData.city,
      province: formData.province,
    };

    console.log(
      '🔵 [EditProfile] Sending payload:',
      JSON.stringify(payload, null, 2),
    );

    updateProfile(payload, {
      onSuccess: response => {
        console.log('🟢 [EditProfile] Update success:', response);
        if (response?.responseCode === '000') {
          setShowSuccess(true);
        } else {
          Alert.alert('Error', response?.responseMessage || 'Update failed');
        }
      },
      onError: error => {
        console.error('🔴 [EditProfile] Update error:', error);
        Alert.alert('Error', error.message || 'Failed to update profile');
      },
    });
  }, [formData, userId, updateProfile]);

  const handleSuccessClose = useCallback(() => {
    setShowSuccess(false);
    navigation.goBack();
  }, [navigation]);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.headerBtn}
        >
          <Icons name="arrow-left" size={scale(22)} color={C.textDark} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Edit Profile</Text>
        <View style={{ width: scale(48) }} />
      </View>

      <KeyboardAvoidingView
        style={s.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent}>
          {/* Avatar */}
          <View style={s.avatarSection}>
            <View style={s.avatarContainer}>
              {formData.avatar ? (
                <Image
                  source={{ uri: formData.avatar }}
                  style={s.avatar}
                  resizeMode="cover"
                />
              ) : (
                <View style={[s.avatar, s.avatarFallback]}>
                  <Text style={s.avatarInitials}>{getInitials()}</Text>
                </View>
              )}
              <TouchableOpacity
                style={s.cameraBadge}
                onPress={() => setShowImagePicker(true)}
              >
                <Icons name="camera" size={scale(13)} color={C.white} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => setShowImagePicker(true)}>
              <Text style={s.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <InputField
            label="First Name"
            value={formData.firstName}
            onChangeText={t => updateField('firstName', t)}
            placeholder="Enter first name"
            autoCapitalize="words"
          />

          <InputField
            label="Last Name"
            value={formData.lastName}
            onChangeText={t => updateField('lastName', t)}
            placeholder="Enter last name"
            autoCapitalize="words"
          />

          <TextAreaField
            label="Bio"
            value={formData.bio}
            onChangeText={t => updateField('bio', t)}
            placeholder="Tell us about yourself..."
          />

          <DateField
            label="Date of Birth"
            value={formData.dateOfBirth}
            onPress={() => {}}
            placeholder="DD / MM / YYYY"
          />

          {/* Gender Selector with proper active state */}
          <View style={s.fieldContainer}>
            <Text style={s.label}>Gender</Text>
            <View style={s.genderContainer}>
              {GENDER_OPTIONS.map(option => {
                const active =
                  formData.gender?.toLowerCase() === option.toLowerCase();
                return (
                  <TouchableOpacity
                    key={option}
                    style={[s.genderPill, active && s.genderPillActive]}
                    onPress={() => updateField('gender', option)}
                  >
                    <Text style={[s.genderText, active && s.genderTextActive]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Province First, then City */}
          <DropdownField
            label="Province"
            value={formData.province}
            onPress={() => setShowProvincePicker(true)}
            placeholder="Select Province"
          />

          <DropdownField
            label="City"
            value={formData.city}
            onPress={() => {
              if (!formData.province) {
                Alert.alert(
                  'Select Province First',
                  'Please select a province first.',
                );
                return;
              }
              setShowCityPicker(true);
            }}
            placeholder={
              formData.province ? 'Select City' : 'Select Province First'
            }
          />

          <LockedField label="Email Address" value={formData.email} />
          <LockedField label="Phone Number" value={formData.mobileNumber} />
        </ScrollView>

        <View style={s.footer}>
          <TouchableOpacity
            style={[s.saveBtn, isUpdating && s.saveBtnLoading]}
            onPress={handleSave}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator color={C.white} />
            ) : (
              <Text style={s.saveBtnText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Modals */}
      <SuccessModal visible={showSuccess} onClose={handleSuccessClose} />

      <ImagePickerModal
        visible={showImagePicker}
        onCamera={() => handleImagePicker('camera')}
        onGallery={() => handleImagePicker('gallery')}
        onClose={() => setShowImagePicker(false)}
      />

      <PickerModal
        visible={showProvincePicker}
        title="Select Province"
        options={provinces.map(p => p.name)}
        selectedValue={formData.province}
        onSelect={handleProvinceSelect}
        onClose={() => setShowProvincePicker(false)}
      />

      <PickerModal
        visible={showCityPicker}
        title="Select City"
        options={cities.map(c => c.name)}
        selectedValue={formData.city}
        onSelect={city => {
          updateField('city', city);
          setShowCityPicker(false);
        }}
        onClose={() => setShowCityPicker(false)}
      />
    </SafeAreaView>
  );
};

// Sub-components
const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  autoCapitalize = 'none',
  editable = true,
}) => (
  <View style={s.fieldContainer}>
    <Text style={s.label}>{label}</Text>
    <View style={[s.inputWrapper, !editable && s.disabledWrapper]}>
      <TextInput
        style={s.textInputInner}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.textLight}
        autoCapitalize={autoCapitalize}
        editable={editable}
      />
    </View>
  </View>
);

const TextAreaField = ({ label, value, onChangeText, placeholder }) => (
  <View style={s.fieldContainer}>
    <Text style={s.label}>{label}</Text>
    <View style={[s.inputWrapper, s.textAreaWrapper]}>
      <TextInput
        style={s.textAreaInner}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.textLight}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
    </View>
  </View>
);

const DateField = ({ label, value, onPress, placeholder }) => (
  <View style={s.fieldContainer}>
    <Text style={s.label}>{label}</Text>
    <TouchableOpacity style={s.inputWrapper} onPress={onPress}>
      <Text
        style={[s.displayText, !value && s.placeholderText]}
        numberOfLines={1}
      >
        {value || placeholder}
      </Text>
      <Icons
        name="calendar"
        size={scale(18)}
        color={C.textGray}
        style={s.inputIcon}
      />
    </TouchableOpacity>
  </View>
);

const DropdownField = ({ label, value, onPress, placeholder }) => (
  <View style={s.fieldContainer}>
    <Text style={s.label}>{label}</Text>
    <TouchableOpacity style={s.inputWrapper} onPress={onPress}>
      <Text
        style={[s.displayText, !value && s.placeholderText]}
        numberOfLines={1}
      >
        {value || placeholder}
      </Text>
      <Icons
        name="chevron-down"
        size={scale(18)}
        color={C.textGray}
        style={s.inputIcon}
      />
    </TouchableOpacity>
  </View>
);

const LockedField = ({ label, value }) => (
  <View style={s.fieldContainer}>
    <Text style={s.label}>{label}</Text>
    <View style={[s.inputWrapper, s.disabledWrapper]}>
      <Text style={s.lockedDisplayText} numberOfLines={1}>
        {value}
      </Text>
      <Icons
        name="lock"
        size={scale(16)}
        color={C.textLight}
        style={s.inputIcon}
      />
    </View>
  </View>
);

const ImagePickerModal = ({ visible, onCamera, onGallery, onClose }) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={s.modalOverlay}>
      <View style={s.imagePickerSheet}>
        <Text style={s.imagePickerTitle}>Change Profile Photo</Text>
        <TouchableOpacity style={s.imagePickerOption} onPress={onCamera}>
          <Icons name="camera" size={scale(20)} color={C.primary} />
          <Text style={s.imagePickerOptionText}>Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.imagePickerOption} onPress={onGallery}>
          <Icons name="image" size={scale(20)} color={C.primary} />
          <Text style={s.imagePickerOptionText}>Choose from Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.imagePickerCancel} onPress={onClose}>
          <Text style={s.imagePickerCancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const PickerModal = ({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
}) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={s.modalOverlay}>
      <View style={s.modalContent}>
        <View style={s.modalHeader}>
          <Text style={s.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Icons name="x" size={scale(22)} color={C.textDark} />
          </TouchableOpacity>
        </View>
        <ScrollView>
          {options.map(option => {
            const isSelected = selectedValue === option;
            return (
              <TouchableOpacity
                key={option}
                style={[s.modalItem, isSelected && s.modalItemSelected]}
                onPress={() => onSelect(option)}
              >
                <Text
                  style={[
                    s.modalItemText,
                    isSelected && s.modalItemTextSelected,
                  ]}
                >
                  {option}
                </Text>
                {isSelected && (
                  <Icons name="check" size={scale(18)} color={C.primary} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  </Modal>
);

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  kav: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: scale(20),
    paddingTop: scale(20),
    paddingBottom: scale(8),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(12),
    paddingVertical: scale(13),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
  },
  headerBtn: { minWidth: scale(48), alignItems: 'center' },
  headerTitle: { fontSize: scale(17), fontWeight: '700', color: C.teal },
  avatarSection: { alignItems: 'center', marginBottom: scale(28) },
  avatarContainer: { position: 'relative', marginBottom: scale(10) },
  avatar: { width: scale(88), height: scale(88), borderRadius: scale(44) },
  avatarFallback: {
    backgroundColor: C.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: { fontSize: scale(28), fontWeight: '700', color: C.white },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: C.white,
  },
  changePhotoText: { fontSize: scale(13), fontWeight: '600', color: C.primary },
  fieldContainer: { marginBottom: scale(16) },
  label: {
    fontSize: scale(13),
    fontWeight: '500',
    color: C.textGray,
    marginBottom: scale(7),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bg,
    borderRadius: scale(10),
    height: scale(48),
    paddingHorizontal: scale(14),
    borderWidth: 1,
    borderColor: C.border,
  },
  disabledWrapper: { backgroundColor: C.disabledBg },
  inputIcon: { marginLeft: scale(8) },
  textInputInner: { flex: 1, fontSize: scale(15), color: C.textDark },
  displayText: { flex: 1, fontSize: scale(15), color: C.textDark },
  placeholderText: { color: C.textLight },
  lockedDisplayText: { flex: 1, fontSize: scale(15), color: C.textGray },
  textAreaWrapper: {
    height: scale(104),
    alignItems: 'flex-start',
    paddingTop: scale(12),
  },
  textAreaInner: {
    flex: 1,
    width: '100%',
    fontSize: scale(15),
    color: C.textDark,
    lineHeight: scale(22),
  },
  genderContainer: { flexDirection: 'row', gap: scale(10) },
  genderPill: {
    flex: 1,
    height: scale(42),
    borderRadius: scale(21),
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderPillActive: { backgroundColor: C.teal, borderColor: C.teal },
  genderText: { fontSize: scale(14), fontWeight: '500', color: C.textGray },
  genderTextActive: { color: C.white, fontWeight: '600' },
  footer: {
    backgroundColor: C.bg,
    paddingHorizontal: scale(20),
    paddingTop: scale(12),
    paddingBottom: scale(16),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.border,
  },
  saveBtn: {
    backgroundColor: C.teal,
    height: scale(52),
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnLoading: { opacity: 0.72 },
  saveBtnText: { color: C.white, fontSize: scale(16), fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: C.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: C.white,
    borderTopLeftRadius: scale(20),
    borderTopRightRadius: scale(20),
    maxHeight: SH * 0.72,
    paddingBottom: scale(20),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: scale(20),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
  },
  modalTitle: { fontSize: scale(17), fontWeight: '700', color: C.textDark },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: scale(15),
    paddingHorizontal: scale(20),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F3F4F6',
  },
  modalItemSelected: { backgroundColor: 'rgba(10,61,98,0.05)' },
  modalItemText: { fontSize: scale(15), color: C.textDark },
  modalItemTextSelected: { color: C.primary, fontWeight: '600' },
  imagePickerSheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: scale(20),
    borderTopRightRadius: scale(20),
    paddingBottom: scale(28),
  },
  imagePickerTitle: {
    fontSize: scale(15),
    fontWeight: '700',
    color: C.textDark,
    textAlign: 'center',
    paddingVertical: scale(18),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
  },
  imagePickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingVertical: scale(16),
    gap: scale(14),
  },
  imagePickerOptionText: { flex: 1, fontSize: scale(15), color: C.textDark },
  imagePickerCancel: {
    marginHorizontal: scale(20),
    marginTop: scale(12),
    height: scale(48),
    borderRadius: scale(10),
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePickerCancelText: {
    fontSize: scale(15),
    fontWeight: '600',
    color: C.textGray,
  },

  // Success Modal Styles - Original
  successOverlay: {
    flex: 1,
    backgroundColor: C.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(32),
  },
  successCard: {
    width: '100%',
    backgroundColor: C.white,
    borderRadius: scale(24),
    overflow: 'hidden',
    alignItems: 'center',
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 28,
  },
  successStrip: {
    width: '100%',
    height: scale(90),
    backgroundColor: C.stripBg,
    overflow: 'hidden',
  },
  stripBlob: { position: 'absolute', borderRadius: 999 },
  stripBlob1: {
    width: scale(70),
    height: scale(70),
    top: -scale(20),
    left: -scale(10),
    backgroundColor: 'rgba(10,61,98,0.15)',
  },
  stripBlob2: {
    width: scale(45),
    height: scale(45),
    top: scale(10),
    left: scale(50),
    backgroundColor: 'rgba(26,110,168,0.12)',
  },
  stripBlob3: {
    width: scale(55),
    height: scale(55),
    top: -scale(15),
    right: -scale(5),
    backgroundColor: 'rgba(10,61,98,0.13)',
  },
  stripBlob4: {
    width: scale(30),
    height: scale(30),
    bottom: scale(5),
    right: scale(55),
    backgroundColor: 'rgba(26,110,168,0.10)',
  },
  stripBlob5: {
    width: scale(20),
    height: scale(20),
    top: scale(30),
    right: scale(20),
    backgroundColor: 'rgba(10,61,98,0.08)',
  },
  successClose: {
    position: 'absolute',
    top: scale(12),
    right: scale(12),
    zIndex: 10,
  },
  successCloseInner: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  iconArea: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -scale(38),
    marginBottom: scale(22),
    width: scale(90),
    height: scale(90),
  },
  ringOuter: {
    position: 'absolute',
    width: scale(90),
    height: scale(90),
    borderRadius: scale(45),
    backgroundColor: 'rgba(10,61,98,0.09)',
  },
  ringMiddle: {
    position: 'absolute',
    width: scale(74),
    height: scale(74),
    borderRadius: scale(37),
    backgroundColor: 'rgba(10,61,98,0.15)',
  },
  successCircle: {
    width: scale(60),
    height: scale(60),
    borderRadius: scale(30),
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  successBody: {
    alignItems: 'center',
    paddingHorizontal: scale(24),
    paddingBottom: scale(28),
    width: '100%',
  },
  successTitle: {
    fontSize: scale(19),
    fontWeight: '700',
    color: C.textDark,
    textAlign: 'center',
    lineHeight: scale(28),
    marginBottom: scale(8),
  },
  successSub: {
    fontSize: scale(14),
    color: C.textGray,
    textAlign: 'center',
    lineHeight: scale(20),
    marginBottom: scale(28),
  },
  successBtn: {
    width: '100%',
    backgroundColor: C.primary,
    height: vscale(48),
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  successBtnText: {
    color: C.white,
    fontSize: scale(16),
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default EditProfile;
