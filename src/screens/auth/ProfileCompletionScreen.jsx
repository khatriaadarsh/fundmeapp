// src/screens/auth/ProfileComplete.jsx
// ─────────────────────────────────────────────────────────────
//  Profile Complete — Step 4 of 4
//  FundMe App (React Native CLI)
//
//  Back arrow | Step 4 of 4 | GREEN full progress bar
//  "Complete Your Profile" headline + subtitle
//  Camera circle (Add Photo)
//  Bio textarea
//  Date of Birth input (DD / MM / YYYY)
//  Gender: Male | Female | Other toggles (Male = teal filled)
//  City dropdown
//  Province dropdown
//  Green "Complete Signup ✓" button
// ─────────────────────────────────────────────────────────────

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';

// ── Colour tokens ──────────────────────────────────────────
const C = {
  bg: '#F9FAFB',
  white: '#FFFFFF',
  teal: '#00B4CC',
  tealLight: 'rgba(0,180,204,0.10)',
  green: '#22C55E',
  greenDark: '#16A34A',
  greenLight: 'rgba(34,197,94,0.12)',
  textDark: '#111827',
  textGray: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  inputBg: '#FFFFFF',
  progressBg: '#E5E7EB',
  genderActive: '#00B4CC',
  genderBorder: '#E5E7EB',
};

const CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Peshawar',
  'Quetta',
  'Multan',
];
const PROVINCES = [
  'Punjab',
  'Sindh',
  'KPK',
  'Balochistan',
  'Gilgit-Baltistan',
  'AJK',
];
const GENDERS = ['Male', 'Female', 'Other'];

// ── Dropdown component ────────────────────────────────────
const Dropdown = ({ label, value, options, onSelect, placeholder }) => {
  const [open, setOpen] = useState(false);
  return (
    <View style={dd.wrap}>
      <Text style={dd.label}>{label}</Text>
      <TouchableOpacity
        style={dd.trigger}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={value ? dd.value : dd.placeholder}>
          {value || placeholder}
        </Text>
        <Text style={dd.arrow}>▾</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity
          style={dd.overlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={dd.sheet}>
            <Text style={dd.sheetTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[dd.option, value === item && dd.optionActive]}
                  onPress={() => {
                    onSelect(item);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[
                      dd.optionText,
                      value === item && dd.optionTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                  {value === item && <Text style={dd.optionCheck}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

// ── Main screen ────────────────────────────────────────────
const ProfileComplete = ({ navigation }) => {
  const [bio, setBio] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [dobFocused, setDobFocused] = useState(false);
  const [bioFocused, setBioFocused] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

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
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Format DOB as DD / MM / YYYY
  const formatDOB = text => {
    const digits = text.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
    return `${digits.slice(0, 2)} / ${digits.slice(2, 4)} / ${digits.slice(4)}`;
  };

  const handleComplete = () => {
    // Add your signup completion logic here
    // navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Header ── */}
          <View style={s.headerRow}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={s.backBtn}
            >
              <Text style={s.backArrow}>←</Text>
            </TouchableOpacity>
            <Text style={s.stepLabel}>Step 4 of 4</Text>
          </View>

          {/* ── Progress bar (GREEN — 100%) ── */}
          <View style={s.progressBg}>
            <View style={[s.progressFill, { width: '100%' }]} />
          </View>

          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {/* ── Headline ── */}
            <Text style={s.headline}>Complete Your Profile</Text>
            <Text style={s.subtitle}>Just a few more details!</Text>

            {/* ── Camera / Add Photo ── */}
            <View style={s.photoSection}>
              <TouchableOpacity style={s.photoCircle} activeOpacity={0.8}>
                {/* Camera icon body */}
                <View style={s.cameraBody}>
                  <View style={s.cameraLens} />
                </View>
                {/* Plus badge */}
                <View style={s.plusBadge}>
                  <Text style={s.plusText}>+</Text>
                </View>
              </TouchableOpacity>
              <Text style={s.addPhotoText}>Add Photo</Text>
            </View>

            {/* ── Bio ── */}
            <Text style={s.fieldLabel}>Bio</Text>
            <TextInput
              style={[s.bioInput, bioFocused && s.inputFocused]}
              placeholder="Tell us about yourself..."
              placeholderTextColor={C.textLight}
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              onFocus={() => setBioFocused(true)}
              onBlur={() => setBioFocused(false)}
            />

            {/* ── Date of Birth ── */}
            <Text style={s.fieldLabel}>Date of Birth</Text>
            <View style={[s.inputRow, dobFocused && s.inputFocused]}>
              <Text style={s.inputIcon}>📅</Text>
              <TextInput
                style={s.input}
                placeholder="DD / MM / YYYY"
                placeholderTextColor={C.textLight}
                value={dob}
                onChangeText={t => setDob(formatDOB(t))}
                keyboardType="number-pad"
                maxLength={14}
                onFocus={() => setDobFocused(true)}
                onBlur={() => setDobFocused(false)}
              />
            </View>

            {/* ── Gender ── */}
            <Text style={s.fieldLabel}>Gender</Text>
            <View style={s.genderRow}>
              {GENDERS.map(g => (
                <TouchableOpacity
                  key={g}
                  style={[s.genderBtn, gender === g && s.genderBtnActive]}
                  onPress={() => setGender(g)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[s.genderText, gender === g && s.genderTextActive]}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ── City dropdown ── */}
            <Dropdown
              label="City"
              placeholder="Select City"
              value={city}
              options={CITIES}
              onSelect={setCity}
            />

            {/* ── Province dropdown ── */}
            <Dropdown
              label="Province"
              placeholder="Select Province"
              value={province}
              options={PROVINCES}
              onSelect={setProvince}
            />

            {/* ── Complete Signup button (GREEN) ── */}
            <TouchableOpacity
              onPress={handleComplete}
              activeOpacity={0.85}
              style={{ marginTop: 8 }}
            >
              <View style={s.completeBtn}>
                <Text style={s.completeBtnText}>Complete Signup ✓</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ProfileComplete;

// ── Dropdown styles ────────────────────────────────────────
const dd = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 8,
    backgroundColor: C.white,
    paddingHorizontal: 14,
    height: 48,
  },
  placeholder: { fontSize: 14, color: C.textLight },
  value: { fontSize: 14, color: C.textDark },
  arrow: { fontSize: 14, color: C.textLight },

  // Modal sheet
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
    paddingBottom: 36,
    maxHeight: 320,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.textDark,
    textAlign: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: C.border,
    marginHorizontal: 20,
    marginBottom: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 24,
  },
  optionActive: { backgroundColor: 'rgba(0,180,204,0.07)' },
  optionText: { fontSize: 15, color: C.textDark },
  optionTextActive: { color: C.teal, fontWeight: '700' },
  optionCheck: { fontSize: 14, color: C.teal, fontWeight: '700' },
});

// ── Screen styles ──────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: {
    paddingHorizontal: 22,
    paddingTop: 52,
    paddingBottom: 40,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  backBtn: { padding: 4 },
  backArrow: { fontSize: 20, color: '#111827', fontWeight: '600' },
  stepLabel: { fontSize: 13, color: C.textGray, fontWeight: '500' },

  // Progress (GREEN for last step)
  progressBg: {
    height: 4,
    backgroundColor: C.progressBg,
    borderRadius: 2,
    marginBottom: 28,
  },
  progressFill: { height: 4, backgroundColor: C.green, borderRadius: 2 },

  // Headline
  headline: {
    fontSize: 22,
    fontWeight: '800',
    color: C.textDark,
    marginBottom: 4,
  },
  subtitle: { fontSize: 13, color: C.textGray, marginBottom: 24 },

  // Photo
  photoSection: { alignItems: 'center', marginBottom: 24 },
  photoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: C.teal,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.tealLight,
    position: 'relative',
  },
  cameraBody: {
    width: 28,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: C.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraLens: {
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: C.teal,
  },
  plusBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 16,
  },
  addPhotoText: {
    marginTop: 8,
    fontSize: 13,
    color: C.teal,
    fontWeight: '600',
  },

  // Fields
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },

  bioInput: {
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 8,
    backgroundColor: C.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: C.textDark,
    minHeight: 80,
    marginBottom: 14,
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 8,
    backgroundColor: C.white,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 14,
  },
  inputFocused: { borderColor: C.teal },
  inputIcon: { fontSize: 14, marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: C.textDark, paddingVertical: 0 },

  // Gender
  genderRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  genderBtn: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: C.genderBorder,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderBtnActive: {
    backgroundColor: C.teal,
    borderColor: C.teal,
  },
  genderText: { fontSize: 13, color: C.textGray, fontWeight: '600' },
  genderTextActive: { color: '#FFFFFF', fontWeight: '700' },

  // Complete button (GREEN)
  completeBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: C.green,
    elevation: 3,
    shadowColor: C.green,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  completeBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
