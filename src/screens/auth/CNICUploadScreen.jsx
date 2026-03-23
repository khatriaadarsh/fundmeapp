// src/screens/auth/CNICUpload.jsx
// ─────────────────────────────────────────────────────────────
//  CNIC Upload — Step 3 of 4  |  FundMe App (React Native CLI)
//
//  Layout model (top → bottom, all fixed):
//  ┌─ SafeAreaView ──────────────────────────────────────────┐
//  │  [Header row]   ← arrow  ·  Step 3 of 4               │  ← fixed, never scrolls
//  │  [Progress bar 75%]                                    │  ← fixed
//  │  ┌─ ScrollView ────────────────────────────────────┐   │
//  │  │  headline · subtitle · input · slots · banner  │   │
//  │  └─────────────────────────────────────────────────┘   │
//  │  [Continue button]                                     │  ← fixed footer, NEVER moves
//  └─────────────────────────────────────────────────────────┘
//
//  Key decisions:
//  • NO KeyboardAvoidingView — causes constant layout recalc & shiver on Android
//  • Continue footer uses position:'absolute' bottom:0 so keyboard resize
//    (adjustResize window mode) cannot push it OR overlap it
//  • ScrollView gets paddingBottom equal to footer height so last item
//    is never hidden behind the footer
//  • NO Animated wrapper around page content — avoids layout thrash on mount
// ─────────────────────────────────────────────────────────────

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  memo,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated,
  Platform,
  Dimensions,
  Modal,
  Image,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

// ── Image picker ────────────────────────────────────────────
let launchImageLibrary = null;
try {
  launchImageLibrary = require('react-native-image-picker').launchImageLibrary;
} catch (_) {}

// ── Responsive scale  (base width = 375 pt) ─────────────────
const { width: SW } = Dimensions.get('window');
const sp = n => (SW / 375) * n;

// Footer height constant — used for both the view and scroll padding
const FOOTER_H = sp(Platform.OS === 'android' ? 80 : 68);

// Android: SafeAreaView does NOT add top inset — we do it manually
const STATUSBAR_H = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0;

// ── Palette ─────────────────────────────────────────────────
const P = {
  bg:        '#F9FAFB',
  white:     '#FFFFFF',
  teal:      '#00B4CC',
  tealDark:  '#0097AA',
  tealMuted: '#A5D8E0',
  secBg:     '#0D3B4A',
  uploadBg:  '#E9EDEF',
  uploadBdr: '#D1D5DB',
  previewBg: '#F0FDFF',
  green:     '#22C55E',
  dark:      '#111827',
  gray:      '#6B7280',
  light:     '#9CA3AF',
  border:    '#E5E7EB',
  overlay:   'rgba(0,0,0,0.50)',
};

// ════════════════════════════════════════════════════════════
//  UploadSlot
// ════════════════════════════════════════════════════════════
const UploadSlot = memo(({ label, uri, onPick }) => {
  const pick = useCallback(() => {
    if (launchImageLibrary) {
      launchImageLibrary(
        { mediaType: 'photo', quality: 0.85, selectionLimit: 1 },
        res => {
          if (!res.didCancel && !res.errorCode && res.assets?.length) {
            onPick(res.assets[0].uri);
          }
        },
      );
    } else {
      onPick('__mock__'); // dev/test fallback
    }
  }, [onPick]);

  return (
    <View style={slSt.wrap}>
      <Text style={slSt.label}>{label}</Text>

      {!uri ? (
        /* ── empty ── */
        <TouchableOpacity style={slSt.empty} onPress={pick} activeOpacity={0.75}>
          <Text style={slSt.cloud}>☁️</Text>
          <Text style={slSt.tapTxt}>Tap to Upload</Text>
          <Text style={slSt.hint}>JPG or PNG, max 5 MB</Text>
        </TouchableOpacity>
      ) : (
        /* ── filled ── */
        <View style={slSt.filled}>
          {uri === '__mock__' ? (
            <View style={slSt.mock}>
              <Text style={slSt.mockTxt}>CNIC Preview</Text>
            </View>
          ) : (
            <Image source={{ uri }} style={slSt.img} resizeMode="cover" />
          )}
          {/* green tick badge */}
          <View style={slSt.tick}>
            <Text style={slSt.tickTxt}>✓</Text>
          </View>
          {/* change link */}
          <TouchableOpacity style={slSt.changeTap} onPress={pick} activeOpacity={0.75}>
            <Text style={slSt.changeTxt}>Change</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
});

// ════════════════════════════════════════════════════════════
//  SecurityBanner  — dismissible with ✕
// ════════════════════════════════════════════════════════════
const SecurityBanner = memo(({ onDismiss }) => (
  <View style={bnSt.row}>
    <Text style={bnSt.lock}>🔒</Text>
    <Text style={bnSt.txt}>Your data is encrypted with bank-level security</Text>
    <TouchableOpacity
      onPress={onDismiss}
      style={bnSt.xBtn}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      activeOpacity={0.7}
    >
      <Text style={bnSt.xTxt}>✕</Text>
    </TouchableOpacity>
  </View>
));

// ════════════════════════════════════════════════════════════
//  SuccessPopup — shown exactly ONCE when both images uploaded
// ════════════════════════════════════════════════════════════
const SuccessPopup = memo(({ visible, onClose }) => {
  const opAnim = useRef(new Animated.Value(0)).current;
  const scAnim = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    if (!visible) return;
    opAnim.setValue(0);
    scAnim.setValue(0.88);
    Animated.parallel([
      Animated.timing(opAnim, { toValue: 1, duration: 230, useNativeDriver: true }),
      Animated.timing(scAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [visible, opAnim, scAnim]);

  // Don't mount when hidden — zero layout cost on parent screen
  if (!visible) return null;

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* dim backdrop — tap to close */}
      <TouchableOpacity style={ppSt.overlay} activeOpacity={1} onPress={onClose}>
        <Animated.View
          style={[ppSt.card, { opacity: opAnim, transform: [{ scale: scAnim }] }]}
        >
          {/* stop inner taps from closing */}
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>

            {/* ✕ */}
            <TouchableOpacity
              style={ppSt.xBtn}
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <Text style={ppSt.xTxt}>✕</Text>
            </TouchableOpacity>

            {/* icon circle */}
            <View style={ppSt.circle}>
              <Text style={ppSt.circleIcon}>🪪</Text>
            </View>

            <Text style={ppSt.title}>CNIC Uploaded Successfully!</Text>
            <Text style={ppSt.body}>
              Both sides of your CNIC have been uploaded. Our team will verify
              your identity within 24 hours.
            </Text>

            {/* tips box */}
            <View style={ppSt.tips}>
              <Text style={ppSt.tipsTitle}>For best results ensure:</Text>
              {[
                'Images are clear and not blurry',
                'All four corners are visible',
                'No glare or shadows on the card',
              ].map(t => (
                <View key={t} style={ppSt.tipRow}>
                  <Text style={ppSt.dot}>•</Text>
                  <Text style={ppSt.tipTxt}>{t}</Text>
                </View>
              ))}
            </View>

            {/* CTA */}
            <TouchableOpacity onPress={onClose} activeOpacity={0.85}>
              <LinearGradient
                colors={[P.teal, P.tealDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={ppSt.btn}
              >
                <Text style={ppSt.btnTxt}>Got it!</Text>
              </LinearGradient>
            </TouchableOpacity>

          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
});

// ════════════════════════════════════════════════════════════
//  Main Screen
// ════════════════════════════════════════════════════════════
const CNICUpload = ({ navigation }) => {
  const [cnic,     setCnic    ] = useState('');
  const [frontUri, setFrontUri] = useState(null);
  const [backUri,  setBackUri ] = useState(null);
  const [focused,  setFocused ] = useState(false);
  const [banner,   setBanner  ] = useState(true);
  const [popup,    setPopup   ] = useState(false);

  const popupFired = useRef(false);
  const timerRef   = useRef(null);

  // cleanup on unmount
  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  // fire popup exactly once
  useEffect(() => {
    if (frontUri && backUri && !popupFired.current) {
      popupFired.current = true;
      timerRef.current = setTimeout(() => {
        setPopup(true);
        timerRef.current = null;
      }, 300);
    }
  }, [frontUri, backUri]);

  // CNIC formatter → XXXXX-XXXXXXX-X
  const formatCnic = useCallback(raw => {
    const d = raw.replace(/\D/g, '').slice(0, 13);
    if (d.length <= 5)  return d;
    if (d.length <= 12) return `${d.slice(0, 5)}-${d.slice(5)}`;
    return `${d.slice(0, 5)}-${d.slice(5, 12)}-${d.slice(12)}`;
  }, []);

  const canContinue = cnic.length === 15 && !!frontUri && !!backUri;

  return (
    <SafeAreaView style={scSt.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={P.bg} />

      {/* ══════════════════════════════════════════════════════
          FIXED HEADER — lives outside ScrollView, never moves
          ══════════════════════════════════════════════════════ */}
      <View style={scSt.header}>
        {/* back arrow */}
        <TouchableOpacity
          onPress={() => navigation?.goBack?.()}
          style={scSt.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={scSt.backArrow}>←</Text>
        </TouchableOpacity>

        {/* step indicator — right side */}
        <Text style={scSt.stepLabel}>Step 3 of 4</Text>
      </View>

      {/* ══════════════════════════════════════════════════════
          FIXED PROGRESS BAR
          ══════════════════════════════════════════════════════ */}
      <View style={scSt.progressBg}>
        <View style={scSt.progressFill} />
      </View>

      {/* ══════════════════════════════════════════════════════
          SCROLLABLE CONTENT
          paddingBottom = FOOTER_H so nothing hides behind footer
          ══════════════════════════════════════════════════════ */}
      <ScrollView
        style={scSt.scroll}
        contentContainerStyle={[scSt.scrollContent, { paddingBottom: FOOTER_H + sp(16) }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        overScrollMode="never"
      >
        <Text style={scSt.headline}>Verify Your Identity</Text>
        <Text style={scSt.subtitle}>Upload your CNIC for verification</Text>

        {/* CNIC Number */}
        <Text style={scSt.fieldLabel}>CNIC Number</Text>
        <View style={[scSt.inputRow, focused && scSt.inputFocused]}>
          <Text style={scSt.inputIcon}>🪪</Text>
          <TextInput
            style={scSt.input}
            placeholder="XXXXX-XXXXXXX-X"
            placeholderTextColor={P.light}
            value={cnic}
            onChangeText={t => setCnic(formatCnic(t))}
            keyboardType="number-pad"
            maxLength={15}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </View>

        {/* Upload slots */}
        <UploadSlot label="CNIC Front Side" uri={frontUri} onPick={setFrontUri} />
        <UploadSlot label="CNIC Back Side"  uri={backUri}  onPick={setBackUri}  />

        {/* Dismissible security banner */}
        {banner && <SecurityBanner onDismiss={() => setBanner(false)} />}
      </ScrollView>

      {/* ══════════════════════════════════════════════════════
          FIXED FOOTER — absolutely positioned at bottom
          The keyboard CANNOT push this up (adjustPan) and
          the content CANNOT overlap it (paddingBottom above)
          ══════════════════════════════════════════════════════ */}
      <View style={scSt.footer}>
        <TouchableOpacity
          onPress={() => navigation?.navigate?.('ProfileCompletionScreen')}
          activeOpacity={canContinue ? 0.85 : 1}
          disabled={!canContinue}
        >
          <LinearGradient
            colors={canContinue ? [P.teal, P.tealDark] : [P.tealMuted, P.tealMuted]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={scSt.continueBtn}
          >
            <Text style={scSt.continueTxt}>Continue →</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* one-time popup */}
      <SuccessPopup visible={popup} onClose={() => setPopup(false)} />
    </SafeAreaView>
  );
};

export default CNICUpload;

// ════════════════════════════════════════════════════════════
//  STYLESHEETS
// ════════════════════════════════════════════════════════════

// ── Screen ──────────────────────────────────────────────────
const scSt = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: P.bg,
  },

  // ── Fixed header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',  // arrow | Step 3 of 4 | spacer
    paddingHorizontal: sp(22),
    paddingTop: sp(14) + STATUSBAR_H,  // ← accounts for Android status bar
    paddingBottom: sp(10),
    backgroundColor: P.bg,
  },
  backBtn: {
    width: sp(32),   // explicit width — ensures step label stays centred
    padding: sp(4),
  },
  backArrow: {
    fontSize: sp(22),
    color: P.dark,
    fontWeight: '700',
    lineHeight: sp(26),
  },
  stepLabel: {
    fontSize: sp(13),
    color: P.gray,
    fontWeight: '600',   // slightly bolder so it's clearly readable
    textAlign: 'center',
  },

  // ── Fixed progress bar
  progressBg: {
    height: 4,
    marginHorizontal: sp(22),
    backgroundColor: P.border,
    borderRadius: 2,
    marginBottom: sp(22),
  },
  progressFill: {
    height: 4,
    width: '75%',
    backgroundColor: P.teal,
    borderRadius: 2,
  },

  // ── Scroll
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: sp(22),
    // paddingBottom is set inline = FOOTER_H + 16 (see JSX)
  },

  // ── Typography
  headline: {
    fontSize: sp(22),
    fontWeight: '800',
    color: P.dark,
    marginBottom: sp(4),
  },
  subtitle: {
    fontSize: sp(13),
    color: P.gray,
    marginBottom: sp(20),
  },
  fieldLabel: {
    fontSize: sp(13),
    fontWeight: '600',
    color: '#374151',
    marginBottom: sp(8),
    marginTop: sp(4),
  },

  // ── CNIC input
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: P.border,
    borderRadius: sp(8),
    backgroundColor: P.white,
    paddingHorizontal: sp(12),
    height: sp(55),
  },
  inputFocused: { borderColor: P.green },
  inputIcon: { fontSize: sp(15), marginRight: sp(8) },
  input: {
    flex: 1,
    fontSize: sp(14),
    color: P.dark,
    paddingVertical: 0,
  },

  // ── Fixed footer (absolutely pinned to bottom)
  // position:absolute ensures keyboard resize (adjustResize) cannot
  // push this button up or cause it to overlap scroll content
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: sp(22),
    paddingTop: sp(12),
    paddingBottom: Platform.OS === 'android' ? sp(20) : sp(28),
    backgroundColor: P.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: P.border,
  },
  continueBtn: {
    width: '100%',
    paddingVertical: sp(16),
    borderRadius: sp(10),
    alignItems: 'center',
    elevation: 3,
    shadowColor: P.teal,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  continueTxt: {
    color: P.white,
    fontSize: sp(16),
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

// ── UploadSlot ───────────────────────────────────────────────
const slSt = StyleSheet.create({
  wrap:  { marginTop: sp(18) },
  label: {
    fontSize: sp(13),
    fontWeight: '600',
    color: '#374151',
    marginBottom: sp(8),
  },

  // empty state
  empty: {
    height: sp(112),
    backgroundColor: P.uploadBg,
    borderRadius: sp(10),
    borderWidth: 1.5,
    borderColor: P.uploadBdr,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cloud:  { fontSize: sp(26), marginBottom: sp(6) },
  tapTxt: { fontSize: sp(14), fontWeight: '700', color: P.gray },
  hint:   { fontSize: sp(11), color: P.light, marginTop: sp(2) },

  // filled state
  filled: {
    height: sp(140),
    borderRadius: sp(10),
    borderWidth: 2,
    borderColor: P.green,
    backgroundColor: P.previewBg,
    overflow: 'hidden',
  },
  img:     { width: '100%', height: '100%' },
  mock:    { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: P.previewBg },
  mockTxt: { fontSize: sp(13), color: P.light, fontStyle: 'italic' },

  tick: {
    position: 'absolute',
    top: sp(8), right: sp(8),
    width: sp(26), height: sp(26),
    borderRadius: sp(13),
    backgroundColor: P.green,
    alignItems: 'center', justifyContent: 'center',
    elevation: 4, zIndex: 10,
  },
  tickTxt:   { color: P.white, fontSize: sp(13), fontWeight: '800' },
  changeTap: { position: 'absolute', bottom: sp(8), alignSelf: 'center' },
  changeTxt: {
    fontSize: sp(13),
    color: '#000000',
    textDecorationStyle: 'solid',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});

// ── SecurityBanner ───────────────────────────────────────────
const bnSt = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: P.secBg,
    borderRadius: sp(10),
    paddingHorizontal: sp(16),
    paddingVertical: sp(14),
    marginTop: sp(20),
    gap: sp(10),
  },
  lock: { fontSize: sp(18) },
  txt: {
    flex: 1,
    fontSize: sp(13),
    color: P.white,
    fontWeight: '500',
    lineHeight: sp(19),
  },
  xBtn: {
    width: sp(26), height: sp(26),
    borderRadius: sp(13),
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  xTxt: { fontSize: sp(12), color: P.white, fontWeight: '700' },
});

// ── SuccessPopup ─────────────────────────────────────────────
const ppSt = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: P.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: sp(24),
  },
  card: {
    width: '100%',
    backgroundColor: P.white,
    borderRadius: sp(20),
    paddingHorizontal: sp(24),
    paddingTop: sp(28),
    paddingBottom: sp(24),
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  xBtn: {
    position: 'absolute',
    top: sp(0), right: sp(0),
    width: sp(30), height: sp(30),
    borderRadius: sp(15),
    backgroundColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 20,
  },
  xTxt: { fontSize: sp(13), color: P.gray, fontWeight: '700' },
  circle: {
    width: sp(64), height: sp(64),
    borderRadius: sp(32),
    backgroundColor: '#E0F7FA',
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center',
    marginTop: sp(12),
    marginBottom: sp(16),
  },
  circleIcon: { fontSize: sp(30) },
  title: {
    fontSize: sp(18), fontWeight: '800', color: P.dark,
    textAlign: 'center', marginBottom: sp(8),
  },
  body: {
    fontSize: sp(13), color: P.gray,
    textAlign: 'center', lineHeight: sp(20),
    marginBottom: sp(16),
  },
  tips: {
    backgroundColor: '#F0FDFF',
    borderRadius: sp(10),
    borderLeftWidth: 3,
    borderLeftColor: P.teal,
    padding: sp(14),
    marginBottom: sp(20),
  },
  tipsTitle: {
    fontSize: sp(12), fontWeight: '700', color: P.tealDark,
    marginBottom: sp(6),
  },
  tipRow:  { flexDirection: 'row', alignItems: 'flex-start', marginTop: sp(4) },
  dot:     { fontSize: sp(12), color: P.teal, marginRight: sp(6), lineHeight: sp(18) },
  tipTxt:  { flex: 1, fontSize: sp(12), color: P.gray, lineHeight: sp(18) },
  btn: {
    paddingVertical: sp(14),
    borderRadius: sp(10),
    alignItems: 'center',
    elevation: 2,
    shadowColor: P.teal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  btnTxt: { color: P.white, fontSize: sp(15), fontWeight: '700' },
});