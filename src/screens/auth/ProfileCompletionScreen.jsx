// src/screens/auth/ProfileComplete.jsx
// ─────────────────────────────────────────────────────────────
//  Profile Complete — Step 4 of 4  |  FundMe App (React Native CLI)
//
//  Layout model (identical to CNICUpload):
//  ┌─ SafeAreaView ──────────────────────────────────────────┐
//  │  [Header]   ←  ·  Step 4 of 4               (fixed)   │
//  │  [Progress bar — GREEN 100%]                 (fixed)   │
//  │  ┌─ ScrollView ──────────────────────────────────────┐ │
//  │  │  headline · subtitle · photo · bio · dob ·       │ │
//  │  │  gender · city · province                        │ │
//  │  └───────────────────────────────────────────────────┘ │
//  │  [Complete Signup ✓ button]                  (fixed)   │
//  └─────────────────────────────────────────────────────────┘
//
//  Key decisions:
//  • Fixed header + progress bar — outside ScrollView, never scroll away
//  • NO KeyboardAvoidingView — causes layout recalc/shiver on Android
//  • Footer position:absolute — keyboard/nav-bar can never overlap it
//  • ScrollView paddingBottom = FOOTER_H + buffer — last item clears footer
//  • All sizes via sp() — scales to every screen width automatically
//  • STATUSBAR_H — Android SafeAreaView top inset applied manually
// ─────────────────────────────────────────────────────────────

import React, { useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Dimensions,
  Modal,
  FlatList,
  Image,
  SafeAreaView,
} from 'react-native';
import Icons from 'react-native-vector-icons/Feather';

// ── Image picker ────────────────────────────────────────────
let launchImageLibrary = null;
try {
  launchImageLibrary = require('react-native-image-picker').launchImageLibrary;
} catch (_) {}

// ── Responsive scale (base 375 pt) ──────────────────────────
const { width: SW } = Dimensions.get('window');
const sp = n => (SW / 375) * n;

// Footer height — drives both view height and scroll bottom padding
const FOOTER_H = Platform.OS === 'android' ? sp(82) : sp(70);

// Android: SafeAreaView gives no top inset — add it manually
const STATUSBAR_H =
  Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 0;

// ── Palette ─────────────────────────────────────────────────
const P = {
  bg: '#F9FAFB',
  white: '#FFFFFF',
  teal: '#00B4CC',
  tealLight: 'rgba(0,180,204,0.10)',
  green: '#22C55E',
  dark: '#111827',
  gray: '#6B7280',
  light: '#9CA3AF',
  border: '#E5E7EB',
  overlay: 'rgba(0,0,0,0.40)',
};

// ── Static data ──────────────────────────────────────────────
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

// ════════════════════════════════════════════════════════════
//  PhotoCircle — profile image picker
//
//  Badge is placed OUTSIDE the TouchableOpacity (which has
//  overflow:hidden) so it never gets clipped by the circle.
//  The circleWrap View provides the relative positioning
//  context for the absolutely-placed badge.
// ════════════════════════════════════════════════════════════
const PhotoCircle = memo(({ uri, onPress }) => (
  <View style={phSt.section}>
    {/*
      circleWrap: relative-positioned container that is slightly
      larger than the circle so the badge can overflow the circle
      edge without being clipped.
    */}
    <View style={phSt.circleWrap}>
      {/* The circle itself — overflow:hidden clips the photo only */}
      <TouchableOpacity
        style={phSt.circle}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {/* selected image fills the circle */}
        {uri && <Image source={{ uri }} style={phSt.img} resizeMode="cover" />}
        {/* camera icon — only when no photo selected */}
        {!uri && (
          <View style={phSt.camBody}>
            <View style={phSt.camLens} />
          </View>
        )}
      </TouchableOpacity>

      {/*
        Badge lives OUTSIDE the circle TouchableOpacity —
        so overflow:hidden on the circle cannot clip it.
        Positioned relative to circleWrap.
      */}
      <TouchableOpacity
        style={phSt.badge}
        onPress={onPress}
        activeOpacity={0.8}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <Text style={phSt.badgeTxt}>+</Text>
      </TouchableOpacity>
    </View>

    <Text style={phSt.label}>Add Photo</Text>
  </View>
));

// ════════════════════════════════════════════════════════════
//  GenderToggle
// ════════════════════════════════════════════════════════════
const GenderToggle = memo(({ value, onChange }) => (
  <View style={gnSt.row}>
    {GENDERS.map(g => (
      <TouchableOpacity
        key={g}
        style={[gnSt.btn, value === g && gnSt.btnActive]}
        onPress={() => onChange(g)}
        activeOpacity={0.8}
      >
        <Text style={[gnSt.txt, value === g && gnSt.txtActive]}>{g}</Text>
      </TouchableOpacity>
    ))}
  </View>
));

// ════════════════════════════════════════════════════════════
//  Dropdown — bottom sheet picker
// ════════════════════════════════════════════════════════════
const Dropdown = memo(({ label, value, options, onSelect, placeholder }) => {
  const [open, setOpen] = useState(false);
  return (
    <View style={dpSt.wrap}>
      <Text style={dpSt.label}>{label}</Text>
      <TouchableOpacity
        style={dpSt.trigger}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={value ? dpSt.value : dpSt.placeholder}>
          {value || placeholder}
        </Text>
        <Text style={dpSt.arrow}>▾</Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={dpSt.overlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={dpSt.sheet}>
            {/* drag handle */}
            <View style={dpSt.handle} />
            <Text style={dpSt.sheetTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={item => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[dpSt.option, value === item && dpSt.optionActive]}
                  onPress={() => {
                    onSelect(item);
                    setOpen(false);
                  }}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      dpSt.optionTxt,
                      value === item && dpSt.optionTxtActive,
                    ]}
                  >
                    {item}
                  </Text>
                  {value === item && <Text style={dpSt.check}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
});

// ════════════════════════════════════════════════════════════
//  Main Screen
// ════════════════════════════════════════════════════════════
const ProfileComplete = ({ navigation }) => {
  const [photoUri, setPhotoUri] = useState(null);
  const [bio, setBio] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [bioFocused, setBioFocused] = useState(false);
  const [dobFocused, setDobFocused] = useState(false);

  // pick profile photo from gallery
  const pickPhoto = useCallback(() => {
    if (launchImageLibrary) {
      launchImageLibrary(
        { mediaType: 'photo', quality: 0.85, selectionLimit: 1 },
        res => {
          if (!res.didCancel && !res.errorCode && res.assets?.length) {
            setPhotoUri(res.assets[0].uri);
          }
        },
      );
    }
  }, []);

  // DOB formatter → DD / MM / YYYY
  const formatDOB = useCallback(raw => {
    const d = raw.replace(/\D/g, '').slice(0, 8);
    if (d.length <= 2) return d;
    if (d.length <= 4) return `${d.slice(0, 2)} / ${d.slice(2)}`;
    return `${d.slice(0, 2)} / ${d.slice(2, 4)} / ${d.slice(4)}`;
  }, []);

  const handleComplete = useCallback(() => {
    navigation?.reset?.({ index: 0, routes: [{ name: 'Login' }] });
  }, [navigation]);

  return (
    <SafeAreaView style={scSt.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={P.bg} />

      {/* ══ FIXED HEADER ══════════════════════════════════════ */}
      <View style={scSt.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack?.()}
          style={scSt.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={scSt.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={scSt.stepLabel}>Step 4 of 4</Text>
      </View>

      {/* ══ FIXED PROGRESS BAR (GREEN = 100%) ════════════════ */}
      <View style={scSt.progressBg}>
        <View style={scSt.progressFill} />
      </View>

      {/* ══ SCROLLABLE CONTENT ══════════════════════════════ */}
      <ScrollView
        style={scSt.scroll}
        contentContainerStyle={[
          scSt.scrollContent,
          { paddingBottom: FOOTER_H + sp(20) },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        overScrollMode="never"
      >
        <Text style={scSt.headline}>Complete Your Profile</Text>
        <Text style={scSt.subtitle}>Just a few more details!</Text>

        {/* profile photo */}
        <PhotoCircle uri={photoUri} onPress={pickPhoto} />

        {/* bio */}
        <Text style={scSt.fieldLabel}>Bio</Text>
        <TextInput
          style={[scSt.bioInput, bioFocused && scSt.inputFocused]}
          placeholder="Tell us about yourself..."
          placeholderTextColor={P.light}
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          onFocus={() => setBioFocused(true)}
          onBlur={() => setBioFocused(false)}
        />

        {/* date of birth */}
        <Text style={scSt.fieldLabel}>Date of Birth</Text>
        <View style={[scSt.inputRow, dobFocused && scSt.inputFocused]}>
          <Text style={scSt.inputIcon}>📅</Text>
          <TextInput
            style={scSt.input}
            placeholder="DD / MM / YYYY"
            placeholderTextColor={P.light}
            value={dob}
            onChangeText={t => setDob(formatDOB(t))}
            keyboardType="number-pad"
            maxLength={14}
            onFocus={() => setDobFocused(true)}
            onBlur={() => setDobFocused(false)}
          />
        </View>

        {/* gender */}
        <Text style={scSt.fieldLabel}>Gender</Text>
        <GenderToggle value={gender} onChange={setGender} />

        {/* province */}
        <Dropdown
          label="Province"
          placeholder="Select Province"
          value={province}
          options={PROVINCES}
          onSelect={setProvince}
        />

        {/* city */}
        <Dropdown
          label="City"
          placeholder="Select City"
          value={city}
          options={CITIES}
          onSelect={setCity}
        />

        {/* province */}
        {/* <Dropdown
          label="Province"
          placeholder="Select Province"
          value={province}
          options={PROVINCES}
          onSelect={setProvince}
        /> */}
      </ScrollView>

      {/* ══ FIXED FOOTER — absolute, keyboard can never push it ═ */}
      <View style={scSt.footer}>
        <TouchableOpacity
          style={scSt.completeBtn}
          onPress={handleComplete}
          activeOpacity={0.85}
        >
          <Text style={scSt.completeTxt}>
            Complete Signup <Icons name="check" style={scSt.checkIcon} />
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProfileComplete;

// ════════════════════════════════════════════════════════════
//  StyleSheets
// ════════════════════════════════════════════════════════════

// ── Screen ──────────────────────────────────────────────────
const scSt = StyleSheet.create({
  safe: { flex: 1, backgroundColor: P.bg },

  // fixed header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sp(22),
    paddingTop: sp(14) + STATUSBAR_H,
    paddingBottom: sp(10),
    backgroundColor: P.bg,
  },
  backBtn: { padding: sp(4) },
  backArrow: { fontSize: sp(20), color: P.dark, fontWeight: '700' },
  stepLabel: { fontSize: sp(13), color: P.gray, fontWeight: '600' },

  // fixed progress bar
  progressBg: {
    height: 4,
    marginHorizontal: sp(22),
    backgroundColor: P.border,
    borderRadius: 2,
    marginBottom: sp(22),
  },
  progressFill: {
    height: 4,
    width: '100%', // 100% = step 4 complete
    backgroundColor: P.green,
    borderRadius: 2,
  },

  // scrollview
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: sp(22),
    // paddingBottom injected inline = FOOTER_H + sp(20)
  },

  // headline
  headline: {
    fontSize: sp(22),
    fontWeight: '800',
    color: P.dark,
    marginBottom: sp(4),
  },
  subtitle: {
    fontSize: sp(13),
    color: P.gray,
    marginBottom: sp(24),
  },

  // field label — shared
  fieldLabel: {
    fontSize: sp(13),
    fontWeight: '600',
    color: '#374151',
    marginBottom: sp(8),
    marginTop: sp(2),
    marginLeft: sp(5),
  },

  // bio textarea
  bioInput: {
    borderWidth: 1.5,
    borderColor: P.border,
    borderRadius: sp(8),
    backgroundColor: P.white,
    paddingHorizontal: sp(14),
    paddingTop: sp(12),
    paddingBottom: sp(12),
    fontSize: sp(14),
    color: P.dark,
    minHeight: sp(90),
    marginBottom: sp(16),
  },

  // single-line input row (DOB)
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: P.border,
    borderRadius: sp(8),
    backgroundColor: P.white,
    paddingHorizontal: sp(12),
    height: sp(52),
    marginBottom: sp(16),
  },
  inputFocused: { borderColor: P.teal },
  inputIcon: { fontSize: sp(15), marginRight: sp(8) },
  input: {
    flex: 1,
    fontSize: sp(14),
    color: P.dark,
    paddingVertical: 0,
  },

  // fixed footer
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: sp(22),
    paddingTop: sp(12),
    paddingBottom: Platform.OS === 'android' ? sp(22) : sp(12),
    backgroundColor: P.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: P.border,
  },
  completeBtn: {
    width: '100%',
    paddingVertical: sp(16),
    borderRadius: sp(10),
    alignItems: 'center',
    backgroundColor: P.green,
    elevation: 3,
    shadowColor: P.green,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  completeTxt: {
    color: P.white,
    fontSize: sp(16),
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  checkIcon: { fontSize: sp(16), marginLeft: sp(6) },
});

// ── PhotoCircle ──────────────────────────────────────────────
const phSt = StyleSheet.create({
  section: {
    alignItems: 'center',
    marginBottom: sp(24),
  },
  /*
    circleWrap: the positioning parent for both the circle and the badge.
    It is sp(6) larger on each side than the circle so the badge
    can sit at the bottom-right corner without being clipped.
    overflow is NOT hidden here — only the inner circle clips the photo.
  */
  circleWrap: {
    width: sp(96), // circle sp(90) + 6 bleed for badge
    height: sp(96),
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: sp(90),
    height: sp(90),
    borderRadius: sp(45), // exact half = perfect circle
    borderWidth: 2,
    borderColor: P.teal,
    borderStyle: 'dashed',
    backgroundColor: P.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', // clips ONLY the photo — badge is outside this
  },
  img: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  camBody: {
    width: sp(30),
    height: sp(23),
    borderRadius: sp(4),
    borderWidth: 2,
    borderColor: P.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  camLens: {
    width: sp(12),
    height: sp(12),
    borderRadius: sp(6),
    borderWidth: 2,
    borderColor: P.teal,
  },
  /*
    Badge is positioned relative to circleWrap (NOT the circle).
    bottom:0, right:0 of the wrap = bottom-right of the circle edge.
    Since circleWrap is 6pt larger, the badge peeks out beyond
    the circle boundary and is never clipped.
  */
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: sp(26),
    height: sp(26),
    borderRadius: sp(13),
    backgroundColor: P.teal,
    borderWidth: 2,
    borderColor: P.bg, // white ring separates badge from circle edge
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    zIndex: 20,
  },
  badgeTxt: {
    color: P.white,
    fontSize: sp(15),
    fontWeight: '800',
    lineHeight: sp(18),
    textAlign: 'center',
  },
  label: {
    marginTop: sp(8),
    fontSize: sp(13),
    color: P.teal,
    fontWeight: '600',
  },
});

// ── GenderToggle ─────────────────────────────────────────────
const gnSt = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: sp(10),
    marginBottom: sp(16),
  },
  btn: {
    flex: 1,
    height: sp(46),
    borderRadius: sp(8),
    borderWidth: 1.5,
    borderColor: P.border,
    backgroundColor: P.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnActive: {
    backgroundColor: P.teal,
    borderColor: P.teal,
  },
  txt: { fontSize: sp(13), color: P.gray, fontWeight: '600' },
  txtActive: { fontSize: sp(13), color: P.white, fontWeight: '700' },
});

// ── Dropdown ─────────────────────────────────────────────────
const dpSt = StyleSheet.create({
  wrap: { marginBottom: sp(16) },
  label: {
    fontSize: sp(13),
    fontWeight: '600',
    color: '#374151',
    marginBottom: sp(8),
    marginLeft: sp(5),
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: P.border,
    borderRadius: sp(8),
    backgroundColor: P.white,
    paddingHorizontal: sp(14),
    height: sp(52),
  },
  placeholder: { fontSize: sp(14), color: P.light },
  value: { fontSize: sp(14), color: P.dark },
  arrow: { fontSize: sp(14), color: P.light },

  // bottom sheet
  overlay: {
    flex: 1,
    backgroundColor: P.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: P.white,
    borderTopLeftRadius: sp(20),
    borderTopRightRadius: sp(20),
    paddingBottom: Platform.OS === 'android' ? sp(28) : sp(36),
    maxHeight: sp(340),
  },
  handle: {
    width: sp(40),
    height: 4,
    borderRadius: 2,
    backgroundColor: P.border,
    alignSelf: 'center',
    marginTop: sp(12),
    marginBottom: sp(4),
  },
  sheetTitle: {
    fontSize: sp(15),
    fontWeight: '700',
    color: P.dark,
    textAlign: 'center',
    paddingVertical: sp(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: P.border,
    marginHorizontal: sp(20),
    marginBottom: sp(4),
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: sp(14),
    paddingHorizontal: sp(24),
  },
  optionActive: { backgroundColor: 'rgba(0,180,204,0.07)' },
  optionTxt: { fontSize: sp(15), color: P.dark },
  optionTxtActive: { fontSize: sp(15), color: P.teal, fontWeight: '700' },
  check: { fontSize: sp(14), color: P.teal, fontWeight: '700' },
});
