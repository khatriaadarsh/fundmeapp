// src/screens/auth/CNICUpload.jsx
// ─────────────────────────────────────────────────────────────
//  CNIC Upload — Step 3 of 4
//  FundMe App (React Native CLI)
//
//  Back arrow | Step 3 of 4 | progress bar (75%)
//  "Verify Your Identity" headline + subtitle
//  CNIC Number text input (XXXXX-XXXXXXX-X format)
//  CNIC Front Side — grey upload area (Tap to Upload)
//  CNIC Back Side  — teal-bordered preview with Change btn
//  Dark teal security banner (encrypted)
//  "Continue →" teal button
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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

// ── Colour tokens ──────────────────────────────────────────
const C = {
  bg: '#F9FAFB',
  white: '#FFFFFF',
  teal: '#00B4CC',
  tealDark: '#0097AA',
  tealDeep: '#0D4F5C',
  uploadBg: '#E9EDEF',
  uploadBorder: '#D1D5DB',
  previewBg: '#F0FDFF',
  previewBorder: '#00B4CC',
  securityBg: '#0D3B4A',
  textDark: '#111827',
  textGray: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  progressBg: '#E5E7EB',
  green: '#22C55E',
};

// ── Main screen ────────────────────────────────────────────
const CNICUpload = ({ navigation }) => {
  const [cnicNumber, setCnicNumber] = useState('');
  const [frontUploaded, setFrontUploaded] = useState(false);
  const [backUploaded, setBackUploaded] = useState(true); // pre-filled per screenshot
  const [frontFocused, setFrontFocused] = useState(false);

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

  // Format CNIC as XXXXX-XXXXXXX-X
  const formatCNIC = text => {
    const digits = text.replace(/\D/g, '').slice(0, 13);
    if (digits.length <= 5) return digits;
    if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
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
            <Text style={s.stepLabel}>Step 3 of 4</Text>
          </View>

          {/* ── Progress bar ── */}
          <View style={s.progressBg}>
            <View style={[s.progressFill, { width: '75%' }]} />
          </View>

          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {/* ── Headline ── */}
            <Text style={s.headline}>Verify Your Identity</Text>
            <Text style={s.subtitle}>Upload your CNIC for verification</Text>

            {/* ── CNIC Number ── */}
            <Text style={s.fieldLabel}>CNIC Number</Text>
            <View style={[s.inputRow, frontFocused && s.inputFocused]}>
              <Text style={s.inputIcon}>🪪</Text>
              <TextInput
                style={s.input}
                placeholder="XXXXX-XXXXXXX-X"
                placeholderTextColor={C.textLight}
                value={cnicNumber}
                onChangeText={t => setCnicNumber(formatCNIC(t))}
                keyboardType="number-pad"
                maxLength={15}
                onFocus={() => setFrontFocused(true)}
                onBlur={() => setFrontFocused(false)}
              />
            </View>

            {/* ── CNIC Front Side ── */}
            <Text style={s.fieldLabel}>CNIC Front Side</Text>
            {!frontUploaded ? (
              <TouchableOpacity
                style={s.uploadArea}
                onPress={() => setFrontUploaded(true)}
                activeOpacity={0.75}
              >
                <Text style={s.uploadCloudIcon}>☁️</Text>
                <Text style={s.uploadMainText}>Tap to Upload</Text>
                <Text style={s.uploadSubText}>JPG or PNG, max '5MB'</Text>
              </TouchableOpacity>
            ) : (
              <View style={s.previewArea}>
                <View style={s.previewInner}>
                  <Text style={s.previewLabel}>CNIC Preview</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setFrontUploaded(false)}
                  style={s.changeBtn}
                  activeOpacity={0.7}
                >
                  <Text style={s.changeBtnText}>Change</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── CNIC Back Side ── */}
            <Text style={[s.fieldLabel, { marginTop: 16 }]}>
              CNIC Back Side
            </Text>
            {!backUploaded ? (
              <TouchableOpacity
                style={s.uploadArea}
                onPress={() => setBackUploaded(true)}
                activeOpacity={0.75}
              >
                <Text style={s.uploadCloudIcon}>☁️</Text>
                <Text style={s.uploadMainText}>Tap to Upload</Text>
                <Text style={s.uploadSubText}>JPG or PNG, max '5MB'</Text>
              </TouchableOpacity>
            ) : (
              <View style={s.previewAreaActive}>
                {/* Green tick badge */}
                <View style={s.tickBadge}>
                  <Text style={s.tickText}>✓</Text>
                </View>
                <View style={s.previewInner}>
                  <Text style={s.previewLabel}>CNIC Preview</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setBackUploaded(false)}
                  style={s.changeBtn}
                  activeOpacity={0.7}
                >
                  <Text style={s.changeBtnText}>Change</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── Security banner ── */}
            <View style={s.securityBanner}>
              <Text style={s.securityIcon}>🔒</Text>
              <Text style={s.securityText}>
                Your data is encrypted with bank-level security
              </Text>
            </View>

            {/* ── Continue button ── */}
            <TouchableOpacity
              onPress={() => navigation.navigate('ProfileCompletionScreen')}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[C.teal, C.tealDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.continueBtn}
              >
                <Text style={s.continueBtnText}>Continue →</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default CNICUpload;

// ── Styles ─────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: {
    paddingHorizontal: 22,
    paddingTop: 52,
    paddingBottom: 36,
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

  // Progress
  progressBg: {
    height: 4,
    backgroundColor: C.progressBg,
    borderRadius: 2,
    marginBottom: 28,
  },
  progressFill: { height: 4, backgroundColor: C.teal, borderRadius: 2 },

  // Headline
  headline: {
    fontSize: 22,
    fontWeight: '800',
    color: C.textDark,
    marginBottom: 4,
  },
  subtitle: { fontSize: 13, color: C.textGray, marginBottom: 22 },

  // Input
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
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
    marginBottom: 16,
  },
  inputFocused: { borderColor: C.teal },
  inputIcon: { fontSize: 14, marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: C.textDark, paddingVertical: 0 },

  // Upload area (grey, no image)
  uploadArea: {
    height: 110,
    backgroundColor: C.uploadBg,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.uploadBorder,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  uploadCloudIcon: { fontSize: 28, marginBottom: 6 },
  uploadMainText: { fontSize: 14, fontWeight: '700', color: C.textGray },
  uploadSubText: { fontSize: 11, color: C.textLight, marginTop: 2 },

  // Preview area (teal border, image uploaded)
  previewArea: {
    height: 110,
    backgroundColor: C.previewBg,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: C.border,
    overflow: 'hidden',
    marginBottom: 4,
    position: 'relative',
  },
  previewAreaActive: {
    height: 110,
    backgroundColor: C.previewBg,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: C.teal,
    overflow: 'hidden',
    marginBottom: 4,
    position: 'relative',
  },
  previewInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewLabel: {
    fontSize: 13,
    color: C.textLight,
    fontStyle: 'italic',
  },
  tickBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 2,
  },
  tickText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  changeBtn: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
  },
  changeBtnText: {
    fontSize: 13,
    color: C.teal,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  // Security banner
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.securityBg,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 20,
    marginBottom: 20,
    gap: 10,
  },
  securityIcon: { fontSize: 18 },
  securityText: {
    flex: 1,
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
    lineHeight: 18,
  },

  // Continue button
  continueBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
    shadowColor: C.teal,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
