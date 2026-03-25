// src/screens/profile/EditProfile.jsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
  Modal,
  Alert,
} from 'react-native';
import Icons from 'react-native-vector-icons/Feather';

const { width: SW, height: SH } = Dimensions.get('window');
const scale = size => (SW / 375) * size;
const vscale = size => (SH / 812) * size;

// ═══════════════════════════════════════════════════════════
// Design System - Pure White Theme
// ═══════════════════════════════════════════════════════════
const C = {
  bg: '#FFFFFF',           // Pure white background
  primary: '#0A3D62',      // Dark blue
  primaryLight: '#15AABF',
  textDark: '#1A1A2E',     // Almost black
  textGray: '#6B7280',     // Label color
  textLight: '#9CA3AF',    // Placeholder
  border: '#E5E7EB',       // Light gray border
  inputBg: '#FFFFFF',      // White inputs
  disabledBg: '#F3F4F6',   // Light gray for locked fields
  white: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.5)',
};

// ═══════════════════════════════════════════════════════════
// Reusable Components
// ═══════════════════════════════════════════════════════════

const Header = ({ onBack, onSave, saveDisabled }) => (
  <View style={s.header}>
    <TouchableOpacity onPress={onBack} style={s.headerBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <Icons name="arrow-left" size={scale(24)} color={C.textDark} />
    </TouchableOpacity>
    
    <Text style={s.headerTitle}>Edit Profile</Text>
    
    <TouchableOpacity onPress={onSave} disabled={saveDisabled} style={s.headerBtn}>
      <Text style={[s.saveText, saveDisabled && s.saveTextDisabled]}>Save</Text>
    </TouchableOpacity>
  </View>
);

const AvatarSection = ({ imageUri, onChangePhoto }) => (
  <View style={s.avatarSection}>
    <View style={s.avatarContainer}>
      <Image 
        // source={imageUri ? { uri: imageUri } : require('../../assets/default-avatar.png')} 
        style={s.avatar}
        // defaultSource={require('../../assets/default-avatar.png')}
      />
      <TouchableOpacity style={s.cameraBadge} onPress={onChangePhoto}>
        <Icons name="camera" size={scale(14)} color={C.white} />
      </TouchableOpacity>
    </View>
    <TouchableOpacity onPress={onChangePhoto}>
      <Text style={s.changePhotoText}>Change Photo</Text>
    </TouchableOpacity>
  </View>
);

const InputField = ({ label, value, onChangeText, placeholder, autoCapitalize = 'none', editable = true }) => (
  <View style={s.fieldContainer}>
    <Text style={s.label}>{label}</Text>
    <View style={[s.inputWrapper, !editable && s.disabledWrapper]}>
      <TextInput
        style={[s.input, !editable && s.disabledText]}
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
        style={[s.input, s.textArea]}
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
      <Text style={[s.input, !value && { color: C.textLight }]} numberOfLines={1}>
        {value || placeholder}
      </Text>
      <Icons name="calendar" size={scale(20)} color={C.textGray} style={s.inputIcon} />
    </TouchableOpacity>
  </View>
);

const GenderSelector = ({ selected, onSelect, options = ['Male', 'Female', 'Other'] }) => (
  <View style={s.fieldContainer}>
    <Text style={s.label}>Gender</Text>
    <View style={s.genderContainer}>
      {options.map((option) => {
        const isSelected = selected === option;
        return (
          <TouchableOpacity
            key={option}
            style={[s.genderPill, isSelected && s.genderPillActive]}
            onPress={() => onSelect(option)}
            activeOpacity={0.8}
          >
            <Text style={[s.genderText, isSelected && s.genderTextActive]}>
              {option}
            </Text>
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
      <Text style={[s.input, !value && { color: C.textLight }]} numberOfLines={1}>
        {value || placeholder}
      </Text>
      <Icons name="chevron-down" size={scale(20)} color={C.textGray} style={s.inputIcon} />
    </TouchableOpacity>
  </View>
);

const PrimaryButton = ({ title, onPress, loading }) => (
  <TouchableOpacity 
    style={s.primaryButton} 
    onPress={onPress} 
    disabled={loading}
    activeOpacity={0.85}
  >
    <Text style={s.primaryButtonText}>{loading ? 'Saving...' : title}</Text>
  </TouchableOpacity>
);

// Simple Modal Picker Component
const PickerModal = ({ visible, title, options, selectedValue, onSelect, onClose }) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onClose}
  >
    <View style={s.modalOverlay}>
      <View style={s.modalContent}>
        <View style={s.modalHeader}>
          <Text style={s.modalTitle}>{title}</Text>
          <TouchableOpacity onPress={onClose}>
            <Icons name="x" size={scale(24)} color={C.textDark} />
          </TouchableOpacity>
        </View>
        <ScrollView style={s.modalScroll}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                s.modalItem,
                selectedValue === option && s.modalItemSelected
              ]}
              onPress={() => onSelect(option)}
            >
              <Text style={[
                s.modalItemText,
                selectedValue === option && s.modalItemTextSelected
              ]}>
                {option}
              </Text>
              {selectedValue === option && (
                <Icons name="check" size={scale(20)} color={C.primary} />
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  </Modal>
);

// Date Picker Modal (Simple implementation)
const DatePickerModal = ({ visible, onSelect, onClose }) => {
  // Generate dates for picker (simplified)
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const formatDate = (date) => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d} / ${m} / ${y}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={s.modalOverlay}>
        <View style={s.modalContent}>
          <View style={s.modalHeader}>
            <Text style={s.modalTitle}>Select Date</Text>
            <TouchableOpacity onPress={onClose}>
              <Icons name="x" size={scale(24)} color={C.textDark} />
            </TouchableOpacity>
          </View>
          
          <View style={s.datePickerContainer}>
            <Text style={s.datePreview}>{formatDate(selectedDate)}</Text>
            
            {/* Simple date selector using native Alert or you can integrate react-native-date-picker */}
            <TouchableOpacity 
              style={s.dateButton}
              onPress={() => {
                // For now, using current date. Integrate react-native-date-picker here
                onSelect(formatDate(new Date()));
                onClose();
              }}
            >
              <Text style={s.dateButtonText}>Use Current Date</Text>
            </TouchableOpacity>
            
            <Text style={s.dateHelper}>Note: Install react-native-date-picker for full calendar UI</Text>
          </View>
          
          <TouchableOpacity 
            style={s.modalConfirmBtn}
            onPress={() => {
              onSelect(formatDate(selectedDate));
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
// Main Component
// ═══════════════════════════════════════════════════════════
const EditProfile = ({ navigation }) => {
  const [formData, setFormData] = useState({
    firstName: 'Ahmed',
    lastName: 'Khan',
    bio: 'Helping those in need across Punjab. Passionate about education and healthcare access.',
    dateOfBirth: '15 / 08 / 1995',
    gender: 'Male',
    province: 'Punjab',      // Province first
    city: 'Lahore',          // City second
    email: 'ahmed@gmail.com',
    phone: '+92 300 1234567',
    avatar: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  
  // Modal states
  const [showProvincePicker, setShowProvincePicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Data for pickers
  const provinces = ['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Gilgit-Baltistan', 'Islamabad'];
  const citiesByProvince = {
    'Punjab': ['Lahore', 'Faisalabad', 'Rawalpindi', 'Multan', 'Gujranwala'],
    'Sindh': ['Karachi', 'Hyderabad', 'Sukkur', 'Larkana'],
    'KPK': ['Peshawar', 'Mardan', 'Abbottabad', 'Swat'],
    'Balochistan': ['Quetta', 'Gwadar', 'Turbat'],
    'Gilgit-Baltistan': ['Gilgit', 'Skardu'],
    'Islamabad': ['Islamabad']
  };

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleProvinceSelect = (province) => {
    updateField('province', province);
    // Reset city when province changes
    updateField('city', '');
    setShowProvincePicker(false);
  };

  const handleCitySelect = (city) => {
    updateField('city', city);
    setShowCityPicker(false);
  };

  const handleImagePick = () => {
    Alert.alert(
      'Change Photo',
      'Choose an option',
      [
        { text: 'Camera', onPress: () => console.log('Camera') },
        { text: 'Gallery', onPress: () => console.log('Gallery') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
    // For actual implementation:
    // 1. Install: npm install react-native-image-picker
    // 2. Use launchImageLibrary or launchCamera from the package
  };

  const handleSave = useCallback(async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigation.goBack();
    }, 1500);
  }, [navigation]);

  // Get available cities based on selected province
  const availableCities = formData.province ? citiesByProvince[formData.province] || [] : [];

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      
      <Header 
        onBack={() => navigation.goBack()} 
        onSave={handleSave}
        saveDisabled={isLoading}
      />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? vscale(90) : 0}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <AvatarSection 
            imageUri={formData.avatar} 
            onChangePhoto={handleImagePick} 
          />

          <InputField
            label="First Name"
            value={formData.firstName}
            onChangeText={(text) => updateField('firstName', text)}
            placeholder="Enter first name"
            autoCapitalize="words"
          />

          <InputField
            label="Last Name"
            value={formData.lastName}
            onChangeText={(text) => updateField('lastName', text)}
            placeholder="Enter last name"
            autoCapitalize="words"
          />

          <TextAreaField
            label="Bio"
            value={formData.bio}
            onChangeText={(text) => updateField('bio', text)}
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
            onSelect={(gender) => updateField('gender', gender)}
          />

          {/* Province First - Then City */}
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
                Alert.alert('Select Province First', 'Please select a province before selecting city.');
                return;
              }
              setShowCityPicker(true);
            }}
            placeholder={formData.province ? "Select City" : "Select Province First"}
          />

          {/* Locked Fields */}
          <View style={s.lockedFieldContainer}>
            <Text style={s.label}>Email Address</Text>
            <View style={[s.inputWrapper, s.lockedWrapper]}>
              <Text style={[s.input, s.lockedText]} numberOfLines={1}>
                {formData.email}
              </Text>
              <Icons name="lock" size={scale(18)} color={C.textLight} style={s.inputIcon} />
            </View>
          </View>

          <View style={s.lockedFieldContainer}>
            <Text style={s.label}>Phone Number</Text>
            <View style={[s.inputWrapper, s.lockedWrapper]}>
              <Text style={[s.input, s.lockedText]} numberOfLines={1}>
                {formData.phone}
              </Text>
              <Icons name="lock" size={scale(18)} color={C.textLight} style={s.inputIcon} />
            </View>
          </View>

          <View style={s.buttonSpacer} />
        </ScrollView>

        <View style={s.footer}>
          <PrimaryButton 
            title="Save Changes" 
            onPress={handleSave} 
            loading={isLoading}
          />
        </View>
      </KeyboardAvoidingView>

      {/* Modals */}
      <PickerModal
        visible={showProvincePicker}
        title="Select Province"
        options={provinces}
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
        onSelect={(date) => updateField('dateOfBirth', date)}
        onClose={() => setShowDatePicker(false)}
      />
    </SafeAreaView>
  );
};

// ═══════════════════════════════════════════════════════════
// Styles - Exact Figma Match
// ═══════════════════════════════════════════════════════════
const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg, // Pure white
  },
  container: {
    flex: 1,
    backgroundColor: C.bg, // Pure white
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: vscale(12),
    backgroundColor: C.bg, // Pure white
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerBtn: {
    padding: scale(4),
    minWidth: scale(44),
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: scale(17),
    fontWeight: '700',
    color: C.textDark,
    letterSpacing: -0.3,
  },
  saveText: {
    fontSize: scale(15),
    fontWeight: '600',
    color: C.primary,
  },
  saveTextDisabled: {
    color: C.textLight,
  },

  // Scroll Content
  scrollContent: {
    paddingHorizontal: scale(20),
    paddingTop: vscale(16),
    paddingBottom: vscale(20),
  },

  // Avatar Section
  avatarSection: {
    alignItems: 'center',
    marginBottom: vscale(24),
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: vscale(12),
  },
  avatar: {
    width: scale(90),
    height: scale(90),
    borderRadius: scale(45),
    backgroundColor: '#F3F4F6',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: scale(0),
    right: scale(0),
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: C.white,
  },
  changePhotoText: {
    fontSize: scale(13),
    fontWeight: '600',
    color: C.primary,
  },

  // Form Fields - Pure White Background
  fieldContainer: {
    marginBottom: vscale(16),
  },
  lockedFieldContainer: {
    marginBottom: vscale(16),
  },
  label: {
    fontSize: scale(14),
    fontWeight: '500', // Medium, not bold
    color: C.textGray,
    marginBottom: vscale(8),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.inputBg, // White background
    borderRadius: scale(10),    // Slightly rounded
    height: vscale(48),
    paddingHorizontal: scale(16),
    borderWidth: 1,
    borderColor: C.border,      // Light gray border
  },
  input: {
    flex: 1,
    fontSize: scale(15),
    color: C.textDark,
    fontWeight: '400',          // Normal weight, not bold
    height: '100%',
  },
  inputIcon: {
    marginLeft: scale(8),
  },
  disabledWrapper: {
    backgroundColor: C.disabledBg,
  },
  disabledText: {
    color: C.textGray,
    fontWeight: '400',
  },
  lockedText: {
    color: C.textGray,
    fontWeight: '400',
  },
  lockedWrapper: {
    backgroundColor: C.disabledBg,
  },

  // Text Area Specific
  textAreaWrapper: {
    height: vscale(100),
    paddingTop: vscale(12),
    paddingBottom: vscale(12),
    alignItems: 'flex-start',
  },
  textArea: {
    height: '100%',
    lineHeight: scale(22),
    fontWeight: '400',          // Normal weight
  },

  // Gender Selector
  genderContainer: {
    flexDirection: 'row',
    gap: scale(10),
  },
  genderPill: {
    flex: 1,
    height: vscale(40),
    borderRadius: scale(20),
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.inputBg, // White
  },
  genderPillActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  genderText: {
    fontSize: scale(14),
    fontWeight: '500',
    color: C.textGray,
  },
  genderTextActive: {
    color: C.white,
    fontWeight: '600',
  },

  // Footer & Button
  buttonSpacer: {
    height: vscale(20),
  },
  footer: {
    backgroundColor: C.bg, // Pure white
    paddingHorizontal: scale(20),
    paddingVertical: vscale(12),
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingBottom: Platform.OS === 'ios' ? vscale(24) : vscale(16),
  },
  primaryButton: {
    backgroundColor: C.primary,
    height: vscale(50),
    borderRadius: scale(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: C.white,
    fontSize: scale(16),
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: C.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: C.white,
    borderTopLeftRadius: scale(20),
    borderTopRightRadius: scale(20),
    maxHeight: SH * 0.7,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: scale(20),
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  modalTitle: {
    fontSize: scale(18),
    fontWeight: '700',
    color: C.textDark,
  },
  modalScroll: {
    maxHeight: SH * 0.5,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: scale(16),
    paddingHorizontal: scale(20),
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalItemSelected: {
    backgroundColor: 'rgba(10,61,98,0.05)',
  },
  modalItemText: {
    fontSize: scale(16),
    color: C.textDark,
    fontWeight: '400',
  },
  modalItemTextSelected: {
    color: C.primary,
    fontWeight: '600',
  },
  modalConfirmBtn: {
    margin: scale(20),
    backgroundColor: C.primary,
    height: vscale(50),
    borderRadius: scale(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmText: {
    color: C.white,
    fontSize: scale(16),
    fontWeight: '700',
  },
  
  // Date Picker Styles
  datePickerContainer: {
    padding: scale(20),
    alignItems: 'center',
  },
  datePreview: {
    fontSize: scale(24),
    fontWeight: '700',
    color: C.textDark,
    marginBottom: vscale(20),
  },
  dateButton: {
    paddingVertical: scale(12),
    paddingHorizontal: scale(24),
    backgroundColor: C.primary,
    borderRadius: scale(8),
    marginBottom: vscale(12),
  },
  dateButtonText: {
    color: C.white,
    fontSize: scale(16),
    fontWeight: '600',
  },
  dateHelper: {
    fontSize: scale(12),
    color: C.textLight,
    textAlign: 'center',
    marginTop: vscale(10),
  },
});

export default EditProfile;