// src/screens/profile/EditProfile.jsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
  Image,
  Modal,
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
} from 'react-native';
import Icons from 'react-native-vector-icons/Feather';
import {
  launchImageLibrary,
  launchCamera,
} from 'react-native-image-picker';

// ═══════════════════════════════════════════════════════════
// Responsive Scale
// ═══════════════════════════════════════════════════════════
const { width: SW, height: SH } = Dimensions.get('window');
const scale  = size => (SW / 375) * size;
const vscale = size => (SH / 812) * size;

// ═══════════════════════════════════════════════════════════
// Design Tokens
// ═══════════════════════════════════════════════════════════
const C = {
  bg:           '#FFFFFF',
  primary:      '#0A3D62',
  primaryMid:   '#1A6EA8',
  primaryLight: 'rgba(10,61,98,0.08)',
  textDark:     '#1A1A2E',
  textGray:     '#6B7280',
  textLight:    '#9CA3AF',
  border:       '#E5E7EB',
  inputBg:      '#FFFFFF',
  disabledBg:   '#F3F4F6',
  white:        '#FFFFFF',
  overlay:      'rgba(10,20,40,0.60)',
  avatarBg:     '#B0BEC5',
  stripBg:      '#D6E8F7',
};

// ═══════════════════════════════════════════════════════════
// Static Data
// ═══════════════════════════════════════════════════════════
const PROVINCES = [
  'Punjab','Sindh','KPK',
  'Balochistan','Gilgit-Baltistan','Islamabad',
];
const CITIES_BY_PROVINCE = {
  Punjab:             ['Lahore','Faisalabad','Rawalpindi','Multan','Gujranwala'],
  Sindh:              ['Karachi','Hyderabad','Sukkur','Larkana'],
  KPK:                ['Peshawar','Mardan','Abbottabad','Swat'],
  Balochistan:        ['Quetta','Gwadar','Turbat'],
  'Gilgit-Baltistan': ['Gilgit','Skardu'],
  Islamabad:          ['Islamabad'],
};
const GENDER_OPTIONS = ['Male','Female','Other'];

// ═══════════════════════════════════════════════════════════
// SUCCESS MODAL
// ═══════════════════════════════════════════════════════════
const SuccessModal = ({ visible, onClose }) => {
  const masterAnim = useRef(new Animated.Value(0)).current;
  const checkAnim  = useRef(new Animated.Value(0)).current;

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
    inputRange: [0, 0.4], outputRange: [0, 1], extrapolate: 'clamp',
  });
  const cardScale = masterAnim.interpolate({
    inputRange: [0, 0.4], outputRange: [0.80, 1], extrapolate: 'clamp',
  });
  const cardOpacity = masterAnim.interpolate({
    inputRange: [0, 0.25], outputRange: [0, 1], extrapolate: 'clamp',
  });
  const ringScale = masterAnim.interpolate({
    inputRange: [0.4, 0.65, 0.7], outputRange: [0, 1.15, 1], extrapolate: 'clamp',
  });
  const ringOpacity = masterAnim.interpolate({
    inputRange: [0.4, 0.55], outputRange: [0, 1], extrapolate: 'clamp',
  });
  const circleScale = masterAnim.interpolate({
    inputRange: [0.45, 0.68, 0.7], outputRange: [0, 1.10, 1], extrapolate: 'clamp',
  });
  const circleOpacity = masterAnim.interpolate({
    inputRange: [0.45, 0.58], outputRange: [0, 1], extrapolate: 'clamp',
  });
  const textOpacity = masterAnim.interpolate({
    inputRange: [0.70, 0.92], outputRange: [0, 1], extrapolate: 'clamp',
  });
  const textTranslate = masterAnim.interpolate({
    inputRange: [0.70, 1.0], outputRange: [20, 0], extrapolate: 'clamp',
  });
  const checkScale = checkAnim.interpolate({
    inputRange: [0, 0.6, 0.8, 1], outputRange: [0, 1.3, 0.85, 1],
  });
  const checkOpacity = checkAnim.interpolate({
    inputRange: [0, 0.2], outputRange: [0, 1], extrapolate: 'clamp',
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
            hitSlop={{ top:14,bottom:14,left:14,right:14 }}
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
            <Animated.View style={[
              s.ringOuter,
              { opacity: ringOpacity, transform: [{ scale: ringScale }] },
            ]} />
            <Animated.View style={[
              s.ringMiddle,
              { opacity: ringOpacity, transform: [{ scale: ringScale }] },
            ]} />
            <Animated.View style={[
              s.successCircle,
              { opacity: circleOpacity, transform: [{ scale: circleScale }] },
            ]}>
              <Animated.View style={{
                opacity: checkOpacity,
                transform: [{ scale: checkScale }],
              }}>
                <Icons name="check" size={scale(30)} color={C.white} />
              </Animated.View>
            </Animated.View>
          </View>

          <Animated.View style={[
            s.successBody,
            { opacity: textOpacity, transform: [{ translateY: textTranslate }] },
          ]}>
            <Text style={s.successTitle}>Profile Updated{'\n'}Successfully</Text>
            <Text style={s.successSub}>Your profile changes have been saved</Text>
            <TouchableOpacity style={s.successBtn} onPress={onClose} activeOpacity={0.85}>
              <Text style={s.successBtnText}>Done</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

// ═══════════════════════════════════════════════════════════
// HEADER
// ═══════════════════════════════════════════════════════════
const Header = ({ onBack, onSave, saveDisabled }) => (
  <View style={s.header}>
    <TouchableOpacity
      onPress={onBack}
      style={s.headerBtn}
      hitSlop={{ top:10,bottom:10,left:10,right:10 }}
    >
      <Icons name="arrow-left" size={scale(22)} color={C.textDark} />
    </TouchableOpacity>
    <Text style={s.headerTitle}>Edit Profile</Text>
    <TouchableOpacity onPress={onSave} disabled={saveDisabled} style={s.headerBtn}>
      <Text style={[s.saveText, saveDisabled && s.saveTextDisabled]}>Save</Text>
    </TouchableOpacity>
  </View>
);

// ═══════════════════════════════════════════════════════════
// AVATAR
// ═══════════════════════════════════════════════════════════
const AvatarSection = ({ imageUri, initials, onChangePhoto }) => (
  <View style={s.avatarSection}>
    <View style={s.avatarContainer}>
      {imageUri
        ? <Image source={{ uri: imageUri }} style={s.avatar} />
        : (
          <View style={[s.avatar, s.avatarFallback]}>
            <Text style={s.avatarInitials}>{initials}</Text>
          </View>
        )
      }
      <TouchableOpacity style={s.cameraBadge} onPress={onChangePhoto}>
        <Icons name="camera" size={scale(13)} color={C.white} />
      </TouchableOpacity>
    </View>
    <TouchableOpacity onPress={onChangePhoto} activeOpacity={0.7}>
      <Text style={s.changePhotoText}>Change Photo</Text>
    </TouchableOpacity>
  </View>
);

// ═══════════════════════════════════════════════════════════
// FORM FIELDS
// ═══════════════════════════════════════════════════════════
const InputField = ({
  label, value, onChangeText, placeholder,
  autoCapitalize = 'none', editable = true,
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
        selectTextOnFocus={editable}
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
    <TouchableOpacity style={s.inputWrapper} onPress={onPress} activeOpacity={0.7}>
      <Text style={[s.displayText, !value && s.placeholderText]} numberOfLines={1}>
        {value || placeholder}
      </Text>
      <Icons name="calendar" size={scale(18)} color={C.textGray} style={s.inputIcon} />
    </TouchableOpacity>
  </View>
);

const GenderSelector = ({ selected, onSelect }) => (
  <View style={s.fieldContainer}>
    <Text style={s.label}>Gender</Text>
    <View style={s.genderContainer}>
      {GENDER_OPTIONS.map(option => {
        const active = selected === option;
        return (
          <TouchableOpacity
            key={option}
            style={[s.genderPill, active && s.genderPillActive]}
            onPress={() => onSelect(option)}
            activeOpacity={0.8}
          >
            <Text style={[s.genderText, active && s.genderTextActive]}>{option}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

const DropdownField = ({ label, value, onPress, placeholder }) => (
  <View style={s.fieldContainer}>
    <Text style={s.label}>{label}</Text>
    <TouchableOpacity style={s.inputWrapper} onPress={onPress} activeOpacity={0.7}>
      <Text style={[s.displayText, !value && s.placeholderText]} numberOfLines={1}>
        {value || placeholder}
      </Text>
      <Icons name="chevron-down" size={scale(18)} color={C.textGray} style={s.inputIcon} />
    </TouchableOpacity>
  </View>
);

const LockedField = ({ label, value }) => (
  <View style={s.fieldContainer}>
    <Text style={s.label}>{label}</Text>
    <View style={[s.inputWrapper, s.disabledWrapper]}>
      <Text style={s.lockedDisplayText} numberOfLines={1}>{value}</Text>
      <Icons name="lock" size={scale(16)} color={C.textLight} style={s.inputIcon} />
    </View>
  </View>
);

// ═══════════════════════════════════════════════════════════
// PICKER MODAL
// ═══════════════════════════════════════════════════════════
const PickerModal = ({
  visible, title, options, selectedValue, onSelect, onClose,
}) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={s.modalOverlay}>
      <View style={s.modalContent}>
        <View style={s.modalHeader}>
          <Text style={s.modalTitle}>{title}</Text>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top:8,bottom:8,left:8,right:8 }}
          >
            <Icons name="x" size={scale(22)} color={C.textDark} />
          </TouchableOpacity>
        </View>
        <ScrollView
          style={s.modalScroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {options.map(option => {
            const isSelected = selectedValue === option;
            return (
              <TouchableOpacity
                key={option}
                style={[s.modalItem, isSelected && s.modalItemSelected]}
                onPress={() => onSelect(option)}
                activeOpacity={0.7}
              >
                <Text style={[
                  s.modalItemText,
                  isSelected && s.modalItemTextSelected,
                ]}>
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

// ═══════════════════════════════════════════════════════════
// IMAGE PICKER MODAL
// ═══════════════════════════════════════════════════════════
const ImagePickerModal = ({ visible, onCamera, onGallery, onClose }) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={s.modalOverlay}>
      <View style={s.imagePickerSheet}>
        <Text style={s.imagePickerTitle}>Change Profile Photo</Text>
        <TouchableOpacity style={s.imagePickerOption} onPress={onCamera} activeOpacity={0.7}>
          <View style={s.imagePickerIconWrap}>
            <Icons name="camera" size={scale(20)} color={C.primary} />
          </View>
          <Text style={s.imagePickerOptionText}>Take Photo</Text>
          <Icons name="chevron-right" size={scale(18)} color={C.textLight} />
        </TouchableOpacity>
        <View style={s.imagePickerDivider} />
        <TouchableOpacity style={s.imagePickerOption} onPress={onGallery} activeOpacity={0.7}>
          <View style={s.imagePickerIconWrap}>
            <Icons name="image" size={scale(20)} color={C.primary} />
          </View>
          <Text style={s.imagePickerOptionText}>Choose from Gallery</Text>
          <Icons name="chevron-right" size={scale(18)} color={C.textLight} />
        </TouchableOpacity>
        <TouchableOpacity style={s.imagePickerCancel} onPress={onClose} activeOpacity={0.8}>
          <Text style={s.imagePickerCancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

// ═══════════════════════════════════════════════════════════
// DATE PICKER MODAL
// ═══════════════════════════════════════════════════════════
const DatePickerModal = ({ visible, currentValue, onSelect, onClose }) => {
  const parseInitial = () => {
    if (currentValue) {
      const parts = currentValue.split(' / ');
      if (parts.length === 3) {
        return {
          day:   parseInt(parts[0], 10),
          month: parseInt(parts[1], 10),
          year:  parseInt(parts[2], 10),
        };
      }
    }
    const now = new Date();
    return { day: now.getDate(), month: now.getMonth()+1, year: now.getFullYear() };
  };

  const [date, setDate] = useState(parseInitial);
  const pad = n => String(n).padStart(2,'0');
  const daysInMonth = (m, y) => new Date(y, m, 0).getDate();
  const days   = Array.from({ length: daysInMonth(date.month, date.year) }, (_,i) => i+1);
  const months = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  const years  = Array.from({ length: 80 }, (_,i) => new Date().getFullYear() - i);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <View style={s.modalContent}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Date of Birth</Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top:8,bottom:8,left:8,right:8 }}
            >
              <Icons name="x" size={scale(22)} color={C.textDark} />
            </TouchableOpacity>
          </View>
          <Text style={s.datePreview}>
            {pad(date.day)} / {pad(date.month)} / {date.year}
          </Text>
          <View style={s.datePickerRow}>
            <View style={s.dateColumn}>
              <Text style={s.dateColumnLabel}>Day</Text>
              <ScrollView style={s.dateScroll} showsVerticalScrollIndicator={false}>
                {days.map(d => (
                  <TouchableOpacity
                    key={d}
                    style={[s.dateItem, date.day===d && s.dateItemSelected]}
                    onPress={() => setDate(p => ({...p, day:d}))}
                  >
                    <Text style={[s.dateItemText, date.day===d && s.dateItemTextSelected]}>
                      {pad(d)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={s.dateColumn}>
              <Text style={s.dateColumnLabel}>Month</Text>
              <ScrollView style={s.dateScroll} showsVerticalScrollIndicator={false}>
                {months.map((m, idx) => (
                  <TouchableOpacity
                    key={m}
                    style={[s.dateItem, date.month===idx+1 && s.dateItemSelected]}
                    onPress={() => setDate(p => ({...p, month:idx+1}))}
                  >
                    <Text style={[s.dateItemText, date.month===idx+1 && s.dateItemTextSelected]}>
                      {m.slice(0,3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <View style={s.dateColumn}>
              <Text style={s.dateColumnLabel}>Year</Text>
              <ScrollView style={s.dateScroll} showsVerticalScrollIndicator={false}>
                {years.map(y => (
                  <TouchableOpacity
                    key={y}
                    style={[s.dateItem, date.year===y && s.dateItemSelected]}
                    onPress={() => setDate(p => ({...p, year:y}))}
                  >
                    <Text style={[s.dateItemText, date.year===y && s.dateItemTextSelected]}>
                      {y}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
          <TouchableOpacity
            style={s.modalConfirmBtn}
            onPress={() => {
              onSelect(`${pad(date.day)} / ${pad(date.month)} / ${date.year}`);
              onClose();
            }}
          >
            <Text style={s.modalConfirmText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════
const EditProfile = ({ navigation }) => {
  const [formData, setFormData] = useState({
    firstName:   'Ahmed',
    lastName:    'Khan',
    bio:         'Helping those in need across Punjab. Passionate about education and healthcare access.',
    dateOfBirth: '15 / 08 / 1995',
    gender:      'Male',
    city:        'Lahore',
    province:    'Punjab',
    email:       'ahmed@gmail.com',
    phone:       '+92 300 1234567',
    avatar:      null,
  });

  const [isLoading,          setIsLoading]          = useState(false);
  const [showSuccess,        setShowSuccess]        = useState(false);
  const [showImagePicker,    setShowImagePicker]    = useState(false);
  const [showProvincePicker, setShowProvincePicker] = useState(false);
  const [showCityPicker,     setShowCityPicker]     = useState(false);
  const [showDatePicker,     setShowDatePicker]     = useState(false);

  const updateField = useCallback(
    (field, value) => setFormData(prev => ({ ...prev, [field]: value })),
    [],
  );

  const getInitials = () =>
    `${formData.firstName?.[0]??''}${formData.lastName?.[0]??''}`.toUpperCase();

  const availableCities = CITIES_BY_PROVINCE[formData.province] ?? [];

  const IMAGE_OPTIONS = {
    mediaType:'photo', quality:0.8, maxWidth:800, maxHeight:800,
  };

  const handleOpenCamera = async () => {
    setShowImagePicker(false);
    try {
      const result = await launchCamera(IMAGE_OPTIONS);
      if (!result.didCancel && !result.errorCode && result.assets?.[0]?.uri) {
        updateField('avatar', result.assets[0].uri);
      }
    } catch { Alert.alert('Error','Unable to open camera.'); }
  };

  const handleOpenGallery = async () => {
    setShowImagePicker(false);
    try {
      const result = await launchImageLibrary(IMAGE_OPTIONS);
      if (!result.didCancel && !result.errorCode && result.assets?.[0]?.uri) {
        updateField('avatar', result.assets[0].uri);
      }
    } catch { Alert.alert('Error','Unable to open gallery.'); }
  };

  const handleProvinceSelect = useCallback(province => {
    setFormData(prev => ({ ...prev, province, city: '' }));
    setShowProvincePicker(false);
  }, []);

  const handleCitySelect = useCallback(city => {
    updateField('city', city);
    setShowCityPicker(false);
  }, [updateField]);

  const handleSave = useCallback(() => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      Alert.alert('Required','First name and last name are required.');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);
    }, 1200);
  }, [formData.firstName, formData.lastName]);

  const handleSuccessClose = useCallback(() => {
    setShowSuccess(false);
    navigation.goBack();
  }, [navigation]);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* HEADER — fixed, never moves */}
      <Header
        onBack={() => navigation.goBack()}
        onSave={handleSave}
        saveDisabled={isLoading}
      />

      {/*
        ══════════════════════════════════════════════════
        ✅ FINAL KEYBOARD FIX — works on Android & iOS
        ══════════════════════════════════════════════════

        LAYOUT:
        SafeAreaView
          Header          ← fixed
          KeyboardAvoidingView (flex:1)
            ScrollView (flex:1)
              ...form fields...
            ──────────────────   ← footer is INSIDE KAV
            Footer              ← but OUTSIDE ScrollView

        WHY THIS WORKS:
        - KAV shrinks by the keyboard height (adjustResize)
        - ScrollView fills remaining space above footer
        - Footer is always visible at bottom of KAV
        - AndroidManifest windowSoftInputMode="adjustResize"
          makes Android resize the window, so KAV shrinks
          correctly instead of being covered
        ══════════════════════════════════════════════════
      */}
      <KeyboardAvoidingView
        style={s.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        // Android uses adjustResize from manifest — no behavior needed
      >
        {/* Scrollable form */}
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <AvatarSection
            imageUri={formData.avatar}
            initials={getInitials()}
            onChangePhoto={() => setShowImagePicker(true)}
          />
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
            onPress={() => setShowDatePicker(true)}
            placeholder="DD / MM / YYYY"
          />
          <GenderSelector
            selected={formData.gender}
            onSelect={g => updateField('gender', g)}
          />
          <DropdownField
            label="City"
            value={formData.city}
            onPress={() => {
              if (!formData.province) {
                Alert.alert('Select Province First','Please select a province first.');
                return;
              }
              setShowCityPicker(true);
            }}
            placeholder={formData.province ? 'Select City' : 'Select Province First'}
          />
          <DropdownField
            label="Province"
            value={formData.province}
            onPress={() => setShowProvincePicker(true)}
            placeholder="Select Province"
          />
          <LockedField label="Email Address" value={formData.email} />
          <LockedField label="Phone Number"  value={formData.phone} />
        </ScrollView>

        {/*
          ✅ Footer is INSIDE KeyboardAvoidingView
             but OUTSIDE ScrollView.
          On Android: adjustResize shrinks the whole window
          so the footer naturally stays above keyboard.
          On iOS: KAV padding behavior pushes everything up.
        */}
        <View style={s.footer}>
          <TouchableOpacity
            style={[s.saveBtn, isLoading && s.saveBtnLoading]}
            onPress={handleSave}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <Text style={s.saveBtnText}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* ═══ MODALS ════════════════════════════════════════ */}
      <SuccessModal visible={showSuccess} onClose={handleSuccessClose} />

      <ImagePickerModal
        visible={showImagePicker}
        onCamera={handleOpenCamera}
        onGallery={handleOpenGallery}
        onClose={() => setShowImagePicker(false)}
      />
      <PickerModal
        visible={showProvincePicker}
        title="Select Province"
        options={PROVINCES}
        selectedValue={formData.province}
        onSelect={handleProvinceSelect}
        onClose={() => setShowProvincePicker(false)}
      />
      <PickerModal
        visible={showCityPicker}
        title="Select City"
        options={availableCities}
        selectedValue={formData.city}
        onSelect={handleCitySelect}
        onClose={() => setShowCityPicker(false)}
      />
      <DatePickerModal
        visible={showDatePicker}
        currentValue={formData.dateOfBirth}
        onSelect={date => updateField('dateOfBirth', date)}
        onClose={() => setShowDatePicker(false)}
      />
    </SafeAreaView>
  );
};

// ═══════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════
const s = StyleSheet.create({

  safe:  { flex:1, backgroundColor: C.bg },

  // KAV fills all space below header
  kav: {
    flex: 1,
    backgroundColor: C.bg,
  },

  scroll:        { flex:1 },
  scrollContent: {
    paddingHorizontal: scale(20),
    paddingTop: vscale(20),
    paddingBottom: vscale(8),
  },

  // ── Header ───────────────────────────────────────────────
  header: {
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: vscale(13),
    backgroundColor: C.bg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
  },
  headerBtn: {
    minWidth: scale(48),
    alignItems:'center',
    justifyContent:'center',
    paddingVertical: scale(4),
  },
  headerTitle: {
    fontSize: scale(17),
    fontWeight:'700',
    color: C.textDark,
    letterSpacing:-0.3,
  },
  saveText:         { fontSize:scale(15), fontWeight:'600', color:C.primary, textAlign:'right' },
  saveTextDisabled: { color:C.textLight },

  // ── Avatar ───────────────────────────────────────────────
  avatarSection:   { alignItems:'center', marginBottom:vscale(28) },
  avatarContainer: { position:'relative', marginBottom:vscale(10) },
  avatar: {
    width:scale(88), height:scale(88), borderRadius:scale(44),
  },
  avatarFallback: {
    backgroundColor:C.avatarBg, alignItems:'center', justifyContent:'center',
  },
  avatarInitials: {
    fontSize:scale(28), fontWeight:'700', color:C.white, letterSpacing:1,
  },
  cameraBadge: {
    position:'absolute', bottom:0, right:0,
    width:scale(28), height:scale(28), borderRadius:scale(14),
    backgroundColor:C.primary, alignItems:'center', justifyContent:'center',
    borderWidth:2.5, borderColor:C.white,
    elevation:3,
    shadowColor:'#000', shadowOffset:{width:0,height:1},
    shadowOpacity:0.15, shadowRadius:2,
  },
  changePhotoText: { fontSize:scale(13), fontWeight:'600', color:C.primary },

  // ── Fields ───────────────────────────────────────────────
  fieldContainer: { marginBottom:vscale(16) },
  label: {
    fontSize:scale(13), fontWeight:'500',
    color:C.textGray, marginBottom:vscale(7),
  },
  inputWrapper: {
    flexDirection:'row', alignItems:'center',
    backgroundColor:C.inputBg, borderRadius:scale(10),
    height:vscale(48), paddingHorizontal:scale(14),
    borderWidth:1, borderColor:C.border,
  },
  disabledWrapper:   { backgroundColor:C.disabledBg, borderColor:C.border },
  inputIcon:         { marginLeft:scale(8), flexShrink:0 },
  textInputInner: {
    flex:1, fontSize:scale(15), color:C.textDark, fontWeight:'400',
    padding:0, margin:0, includeFontPadding:false, textAlignVertical:'center',
  },
  displayText: {
    flex:1, fontSize:scale(15), color:C.textDark,
    fontWeight:'400', includeFontPadding:false,
  },
  placeholderText:   { color:C.textLight },
  lockedDisplayText: {
    flex:1, fontSize:scale(15), color:C.textGray,
    fontWeight:'400', includeFontPadding:false,
  },
  textAreaWrapper: {
    height:vscale(104), alignItems:'flex-start',
    paddingTop:vscale(12), paddingBottom:vscale(12),
  },
  textAreaInner: {
    flex:1, width:'100%', fontSize:scale(15), color:C.textDark,
    fontWeight:'400', padding:0, margin:0, lineHeight:scale(22),
    includeFontPadding:false, textAlignVertical:'top',
  },

  // ── Gender ───────────────────────────────────────────────
  genderContainer:  { flexDirection:'row', gap:scale(10) },
  genderPill: {
    flex:1, height:vscale(42), borderRadius:scale(21),
    borderWidth:1, borderColor:C.border,
    alignItems:'center', justifyContent:'center',
    backgroundColor:C.inputBg,
  },
  genderPillActive: { backgroundColor:C.primary, borderColor:C.primary },
  genderText:       { fontSize:scale(14), fontWeight:'500', color:C.textGray },
  genderTextActive: { color:C.white, fontWeight:'600' },

  // ── Footer — INSIDE KAV, OUTSIDE ScrollView ───────────────
  footer: {
    backgroundColor: C.bg,
    paddingHorizontal: scale(20),
    paddingTop: vscale(12),
    paddingBottom: Platform.OS === 'ios' ? vscale(16) : vscale(16),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.border,
  },
  saveBtn: {
    backgroundColor: C.primary,
    height: vscale(52),
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: C.primary,
    shadowOffset: { width:0, height:5 },
    shadowOpacity: 0.30,
    shadowRadius: 10,
  },
  saveBtnLoading: { opacity:0.72 },
  saveBtnText: {
    color: C.white,
    fontSize: scale(16),
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // ── Generic Modals ───────────────────────────────────────
  modalOverlay:  { flex:1, backgroundColor:C.overlay, justifyContent:'flex-end' },
  modalContent: {
    backgroundColor:C.white,
    borderTopLeftRadius:scale(20), borderTopRightRadius:scale(20),
    maxHeight:SH * 0.72,
    paddingBottom: Platform.OS === 'ios' ? vscale(20) : vscale(8),
  },
  modalHeader: {
    flexDirection:'row', justifyContent:'space-between', alignItems:'center',
    paddingHorizontal:scale(20), paddingVertical:vscale(16),
    borderBottomWidth:StyleSheet.hairlineWidth, borderBottomColor:C.border,
  },
  modalTitle:            { fontSize:scale(17), fontWeight:'700', color:C.textDark },
  modalScroll:           { maxHeight:SH * 0.52 },
  modalItem: {
    flexDirection:'row', alignItems:'center', justifyContent:'space-between',
    paddingVertical:vscale(15), paddingHorizontal:scale(20),
    borderBottomWidth:StyleSheet.hairlineWidth, borderBottomColor:'#F3F4F6',
  },
  modalItemSelected:     { backgroundColor:'rgba(10,61,98,0.05)' },
  modalItemText:         { fontSize:scale(15), color:C.textDark, fontWeight:'400' },
  modalItemTextSelected: { color:C.primary, fontWeight:'600' },
  modalConfirmBtn: {
    margin:scale(20), backgroundColor:C.primary,
    height:vscale(50), borderRadius:scale(10),
    alignItems:'center', justifyContent:'center',
  },
  modalConfirmText: { color:C.white, fontSize:scale(16), fontWeight:'700' },

  // ── Date Picker ──────────────────────────────────────────
  datePreview: {
    fontSize:scale(22), fontWeight:'700', color:C.textDark,
    textAlign:'center', paddingVertical:vscale(14),
    borderBottomWidth:StyleSheet.hairlineWidth, borderBottomColor:C.border,
  },
  datePickerRow:   { flexDirection:'row', paddingHorizontal:scale(8), paddingTop:vscale(8) },
  dateColumn:      { flex:1, alignItems:'center' },
  dateColumnLabel: {
    fontSize:scale(11), fontWeight:'600', color:C.textLight,
    textTransform:'uppercase', letterSpacing:0.5, marginBottom:vscale(4),
  },
  dateScroll:           { height:vscale(160), width:'100%' },
  dateItem:             { paddingVertical:vscale(9), paddingHorizontal:scale(4), alignItems:'center', borderRadius:scale(8), marginHorizontal:scale(2), marginVertical:scale(1) },
  dateItemSelected:     { backgroundColor:C.primary },
  dateItemText:         { fontSize:scale(15), color:C.textDark, fontWeight:'400' },
  dateItemTextSelected: { color:C.white, fontWeight:'700' },

  // ── Image Picker ─────────────────────────────────────────
  imagePickerSheet: {
    backgroundColor:C.white,
    borderTopLeftRadius:scale(20), borderTopRightRadius:scale(20),
    paddingBottom: Platform.OS === 'ios' ? vscale(28) : vscale(16),
  },
  imagePickerTitle: {
    fontSize:scale(15), fontWeight:'700', color:C.textDark, textAlign:'center',
    paddingVertical:vscale(18),
    borderBottomWidth:StyleSheet.hairlineWidth, borderBottomColor:C.border,
  },
  imagePickerOption:     { flexDirection:'row', alignItems:'center', paddingHorizontal:scale(20), paddingVertical:vscale(16) },
  imagePickerIconWrap:   { width:scale(38), height:scale(38), borderRadius:scale(19), backgroundColor:'rgba(10,61,98,0.08)', alignItems:'center', justifyContent:'center', marginRight:scale(14) },
  imagePickerOptionText: { flex:1, fontSize:scale(15), color:C.textDark, fontWeight:'500' },
  imagePickerDivider:    { height:StyleSheet.hairlineWidth, backgroundColor:C.border, marginHorizontal:scale(20) },
  imagePickerCancel:     { marginHorizontal:scale(20), marginTop:vscale(12), height:vscale(48), borderRadius:scale(10), borderWidth:1, borderColor:C.border, alignItems:'center', justifyContent:'center' },
  imagePickerCancelText: { fontSize:scale(15), fontWeight:'600', color:C.textGray },

  // ── Success Modal ────────────────────────────────────────
  successOverlay: {
    flex:1, backgroundColor:C.overlay,
    alignItems:'center', justifyContent:'center',
    paddingHorizontal:scale(32),
  },
  successCard: {
    width:'100%', backgroundColor:C.white,
    borderRadius:scale(24), overflow:'hidden', alignItems:'center',
    elevation:24, shadowColor:'#000',
    shadowOffset:{width:0,height:12}, shadowOpacity:0.22, shadowRadius:28,
  },
  successStrip: {
    width:'100%', height:scale(90),
    backgroundColor:C.stripBg, overflow:'hidden',
  },
  stripBlob:  { position:'absolute', borderRadius:999 },
  stripBlob1: { width:scale(70),height:scale(70),top:-scale(20),left:-scale(10),backgroundColor:'rgba(10,61,98,0.15)' },
  stripBlob2: { width:scale(45),height:scale(45),top:scale(10),left:scale(50),backgroundColor:'rgba(26,110,168,0.12)' },
  stripBlob3: { width:scale(55),height:scale(55),top:-scale(15),right:-scale(5),backgroundColor:'rgba(10,61,98,0.13)' },
  stripBlob4: { width:scale(30),height:scale(30),bottom:scale(5),right:scale(55),backgroundColor:'rgba(26,110,168,0.10)' },
  stripBlob5: { width:scale(20),height:scale(20),top:scale(30),right:scale(20),backgroundColor:'rgba(10,61,98,0.08)' },
  successClose:      { position:'absolute', top:scale(12), right:scale(12), zIndex:10 },
  successCloseInner: {
    width:scale(28), height:scale(28), borderRadius:scale(14),
    backgroundColor:'rgba(255,255,255,0.95)',
    alignItems:'center', justifyContent:'center',
    elevation:2, shadowColor:'#000',
    shadowOffset:{width:0,height:1}, shadowOpacity:0.1, shadowRadius:3,
  },
  iconArea: {
    alignItems:'center', justifyContent:'center',
    marginTop:-scale(38), marginBottom:scale(22),
    width:scale(90), height:scale(90),
  },
  ringOuter: {
    position:'absolute',
    width:scale(90), height:scale(90), borderRadius:scale(45),
    backgroundColor:'rgba(10,61,98,0.09)',
  },
  ringMiddle: {
    position:'absolute',
    width:scale(74), height:scale(74), borderRadius:scale(37),
    backgroundColor:'rgba(10,61,98,0.15)',
  },
  successCircle: {
    width:scale(60), height:scale(60), borderRadius:scale(30),
    backgroundColor:C.primary, alignItems:'center', justifyContent:'center',
    elevation:8, shadowColor:C.primary,
    shadowOffset:{width:0,height:5}, shadowOpacity:0.40, shadowRadius:12,
  },
  successBody: {
    alignItems:'center', paddingHorizontal:scale(24),
    paddingBottom:scale(28), width:'100%',
  },
  successTitle: {
    fontSize:scale(19), fontWeight:'700', color:C.textDark,
    textAlign:'center', lineHeight:scale(28), marginBottom:scale(8),
  },
  successSub: {
    fontSize:scale(14), color:C.textGray,
    textAlign:'center', lineHeight:scale(20), marginBottom:scale(28),
  },
  successBtn: {
    width:'100%', backgroundColor:C.primary,
    height:vscale(48), borderRadius:scale(12),
    alignItems:'center', justifyContent:'center',
    elevation:3, shadowColor:C.primary,
    shadowOffset:{width:0,height:4}, shadowOpacity:0.30, shadowRadius:8,
  },
  successBtnText: {
    color:C.white, fontSize:scale(16),
    fontWeight:'700', letterSpacing:0.3,
  },
});

export default EditProfile;