import React, {
  useState, useRef, useEffect, useCallback, memo,
} from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, StatusBar, Animated, Platform, Dimensions,
  Modal, Image, SafeAreaView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

let launchImageLibrary = null;
try { launchImageLibrary = require('react-native-image-picker').launchImageLibrary; } catch (_) {}

const { width: SW } = Dimensions.get('window');
const sp = n => (SW / 375) * n;

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

// ─── UploadSlot ──────────────────────────────────────────────
const UploadSlot = memo(({ label, uri, onPick }) => {
  const pick = useCallback(() => {
    if (launchImageLibrary) {
      launchImageLibrary(
        { mediaType: 'photo', quality: 0.85, selectionLimit: 1 },
        res => {
          if (!res.didCancel && !res.errorCode && res.assets?.length)
            onPick(res.assets[0].uri);
        },
      );
    } else {
      onPick('__mock__');
    }
  }, [onPick]);

  return (
    <View style={slSt.wrap}>
      <Text style={slSt.label}>{label}</Text>
      {!uri ? (
        <TouchableOpacity style={slSt.empty} onPress={pick} activeOpacity={0.75}>
          <Text style={slSt.cloud}>☁️</Text>
          <Text style={slSt.tapTxt}>Tap to Upload</Text>
          <Text style={slSt.hint}>JPG or PNG, max 5 MB</Text>
        </TouchableOpacity>
      ) : (
        <View style={slSt.filled}>
          {uri === '__mock__' ? (
            <View style={slSt.mock}><Text style={slSt.mockTxt}>CNIC Preview</Text></View>
          ) : (
            <Image source={{ uri }} style={slSt.img} resizeMode="cover" />
          )}
          <View style={slSt.tick}><Text style={slSt.tickTxt}>✓</Text></View>
          <TouchableOpacity style={slSt.changeTap} onPress={pick} activeOpacity={0.75}>
            <Text style={slSt.changeTxt}>Change</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
});

// ─── SecurityBanner ──────────────────────────────────────────
const SecurityBanner = memo(({ onDismiss }) => (
  <View style={bnSt.row}>
    <Text style={bnSt.lock}>🔒</Text>
    <Text style={bnSt.txt}>Your data is encrypted with bank-level security</Text>
    <TouchableOpacity onPress={onDismiss} style={bnSt.xBtn}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} activeOpacity={0.7}>
      <Text style={bnSt.xTxt}>✕</Text>
    </TouchableOpacity>
  </View>
));

// ─── SuccessPopup ────────────────────────────────────────────
const SuccessPopup = memo(({ visible, onClose }) => {
  const opAnim = useRef(new Animated.Value(0)).current;
  const scAnim = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    if (!visible) return;
    opAnim.setValue(0); scAnim.setValue(0.88);
    Animated.parallel([
      Animated.timing(opAnim, { toValue: 1, duration: 230, useNativeDriver: true }),
      Animated.timing(scAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  }, [visible, opAnim, scAnim]);

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <TouchableOpacity style={ppSt.overlay} activeOpacity={1} onPress={onClose}>
        <Animated.View style={[ppSt.card, { opacity: opAnim, transform: [{ scale: scAnim }] }]}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <TouchableOpacity style={ppSt.xBtn} onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} activeOpacity={0.7}>
              <Text style={ppSt.xTxt}>✕</Text>
            </TouchableOpacity>
            <View style={ppSt.circle}><Text style={ppSt.circleIcon}>🪪</Text></View>
            <Text style={ppSt.title}>CNIC Uploaded Successfully!</Text>
            <Text style={ppSt.body}>
              Both sides of your CNIC have been uploaded. Our team will verify
              your identity within 24 hours.
            </Text>
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
            <TouchableOpacity onPress={onClose} activeOpacity={0.85}>
              <LinearGradient colors={[P.teal, P.tealDark]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={ppSt.btn}>
                <Text style={ppSt.btnTxt}>Got it!</Text>
              </LinearGradient>
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
});

// ─── Main Screen ─────────────────────────────────────────────
const CNICUpload = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const [cnic,     setCnic    ] = useState('');
  const [frontUri, setFrontUri] = useState(null);
  const [backUri,  setBackUri ] = useState(null);
  const [focused,  setFocused ] = useState(false);
  const [banner,   setBanner  ] = useState(true);
  const [popup,    setPopup   ] = useState(false);

  const popupFired = useRef(false);
  const timerRef   = useRef(null);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  useEffect(() => {
    if (frontUri && backUri && !popupFired.current) {
      popupFired.current = true;
      timerRef.current = setTimeout(() => { setPopup(true); timerRef.current = null; }, 300);
    }
  }, [frontUri, backUri]);

  const formatCnic = useCallback(raw => {
    const d = raw.replace(/\D/g, '').slice(0, 13);
    if (d.length <= 5)  return d;
    if (d.length <= 12) return `${d.slice(0, 5)}-${d.slice(5)}`;
    return `${d.slice(0, 5)}-${d.slice(5, 12)}-${d.slice(12)}`;
  }, []);

  const canContinue = cnic.length === 15 && !!frontUri && !!backUri;

  // Dynamic footer height — respects home bar on notched devices
  const footerPb = insets.bottom > 0 ? insets.bottom : sp(20);
  const footerH  = sp(16) + sp(52) + footerPb; // paddingTop + button + paddingBottom

  return (
    <SafeAreaView style={scSt.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={P.bg} translucent={false} />

      {/* HEADER — paddingTop uses insets.top dynamically */}
      <View style={[scSt.header, { paddingTop: insets.top + sp(6) }]}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()}
          style={scSt.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={scSt.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={scSt.stepLabel}>Step 3 of 4</Text>
      </View>

      {/* PROGRESS BAR */}
      <View style={scSt.progressBg}>
        <View style={scSt.progressFill} />
      </View>

      {/* SCROLL */}
      <ScrollView
        style={scSt.scroll}
        contentContainerStyle={[scSt.scrollContent, { paddingBottom: footerH + sp(16) }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        overScrollMode="never"
      >
        <Text style={scSt.headline}>Verify Your Identity</Text>
        <Text style={scSt.subtitle}>Upload your CNIC for verification</Text>

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

        <UploadSlot label="CNIC Front Side" uri={frontUri} onPick={setFrontUri} />
        <UploadSlot label="CNIC Back Side"  uri={backUri}  onPick={setBackUri}  />
        {banner && <SecurityBanner onDismiss={() => setBanner(false)} />}
      </ScrollView>

      {/* FOOTER */}
      <View style={[scSt.footer, { paddingBottom: footerPb }]}>
        <TouchableOpacity
          onPress={() => navigation?.navigate?.('ProfileCompletionScreen')}
          activeOpacity={canContinue ? 0.85 : 1}
          disabled={!canContinue}
        >
          <LinearGradient
            colors={canContinue ? [P.teal, P.tealDark] : [P.tealMuted, P.tealMuted]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={scSt.continueBtn}
          >
            <Text style={scSt.continueTxt}>Continue →</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <SuccessPopup visible={popup} onClose={() => setPopup(false)} />
    </SafeAreaView>
  );
};

export default CNICUpload;

// ─── Styles ──────────────────────────────────────────────────
const scSt = StyleSheet.create({
  safe: { flex: 1, backgroundColor: P.bg },

  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: sp(22),
    // paddingTop set inline via insets.top + sp(6) — removed STATUSBAR_H
    paddingBottom:     sp(10),
    backgroundColor:   P.bg,
  },
  backBtn:   { width: sp(32), padding: sp(4) },
  backArrow: { fontSize: sp(22), color: P.dark, fontWeight: '700', lineHeight: sp(26) },
  stepLabel: { fontSize: sp(13), color: P.gray, fontWeight: '600', textAlign: 'center' },

  progressBg:   { height: 4, marginHorizontal: sp(22), backgroundColor: P.border, borderRadius: 2, marginBottom: sp(22) },
  progressFill: { height: 4, width: '75%', backgroundColor: P.teal, borderRadius: 2 },

  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: sp(22) },

  headline:   { fontSize: sp(22), fontWeight: '800', color: P.dark, marginBottom: sp(4) },
  subtitle:   { fontSize: sp(13), color: P.gray, marginBottom: sp(20) },
  fieldLabel: { fontSize: sp(13), fontWeight: '600', color: '#374151', marginBottom: sp(8), marginTop: sp(4) },

  inputRow:     { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: P.border, borderRadius: sp(8), backgroundColor: P.white, paddingHorizontal: sp(12), height: sp(55) },
  inputFocused: { borderColor: P.green },
  inputIcon:    { fontSize: sp(15), marginRight: sp(8) },
  input:        { flex: 1, fontSize: sp(14), color: P.dark, paddingVertical: 0 },

  footer: {
    position:          'absolute',
    left:              0, right: 0, bottom: 0,
    paddingHorizontal: sp(22),
    paddingTop:        sp(12),
    // paddingBottom set inline via insets.bottom
    backgroundColor:   P.bg,
    borderTopWidth:    StyleSheet.hairlineWidth,
    borderTopColor:    P.border,
  },
  continueBtn: {
    width: '100%', paddingVertical: sp(16), borderRadius: sp(10),
    alignItems: 'center', elevation: 3,
    shadowColor: P.teal, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25, shadowRadius: 6,
  },
  continueTxt: { color: P.white, fontSize: sp(16), fontWeight: '700', letterSpacing: 0.3 },
});

const slSt = StyleSheet.create({
  wrap:      { marginTop: sp(18) },
  label:     { fontSize: sp(13), fontWeight: '600', color: '#374151', marginBottom: sp(8) },
  empty:     { height: sp(112), backgroundColor: P.uploadBg, borderRadius: sp(10), borderWidth: 1.5, borderColor: P.uploadBdr, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  cloud:     { fontSize: sp(26), marginBottom: sp(6) },
  tapTxt:    { fontSize: sp(14), fontWeight: '700', color: P.gray },
  hint:      { fontSize: sp(11), color: P.light, marginTop: sp(2) },
  filled:    { height: sp(140), borderRadius: sp(10), borderWidth: 2, borderColor: P.green, backgroundColor: P.previewBg, overflow: 'hidden' },
  img:       { width: '100%', height: '100%' },
  mock:      { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: P.previewBg },
  mockTxt:   { fontSize: sp(13), color: P.light, fontStyle: 'italic' },
  tick:      { position: 'absolute', top: sp(8), right: sp(8), width: sp(26), height: sp(26), borderRadius: sp(13), backgroundColor: P.green, alignItems: 'center', justifyContent: 'center', elevation: 4, zIndex: 10 },
  tickTxt:   { color: P.white, fontSize: sp(13), fontWeight: '800' },
  changeTap: { position: 'absolute', bottom: sp(8), alignSelf: 'center' },
  changeTxt: { fontSize: sp(13), color: '#000000', fontWeight: '700', textDecorationLine: 'underline' },
});

const bnSt = StyleSheet.create({
  row:  { flexDirection: 'row', alignItems: 'center', backgroundColor: P.secBg, borderRadius: sp(10), paddingHorizontal: sp(16), paddingVertical: sp(14), marginTop: sp(20), gap: sp(10) },
  lock: { fontSize: sp(18) },
  txt:  { flex: 1, fontSize: sp(13), color: P.white, fontWeight: '500', lineHeight: sp(19) },
  xBtn: { width: sp(26), height: sp(26), borderRadius: sp(13), backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  xTxt: { fontSize: sp(12), color: P.white, fontWeight: '700' },
});

const ppSt = StyleSheet.create({
  overlay: {
     flex: 1,
     backgroundColor: P.overlay,
     alignItems: 'center', 
     justifyContent: 'center',
     paddingHorizontal: sp(24) 
    },
  card:{
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
      shadowRadius: 20 
    },
  xBtn: { 
    position: 'absolute',
     top: sp(0), 
     right: sp(0), 
     width: sp(30), height: sp(30), borderRadius: sp(15), backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', zIndex: 20 },
  xTxt:       { fontSize: sp(13), color: P.gray, fontWeight: '700' },
  circle:     { width: sp(64), height: sp(64), borderRadius: sp(32), backgroundColor: '#E0F7FA', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: sp(12), marginBottom: sp(16) },
  circleIcon: { fontSize: sp(30) },
  title:      { fontSize: sp(18), fontWeight: '800', color: P.dark, textAlign: 'center', marginBottom: sp(8) },
  body:       { fontSize: sp(13), color: P.gray, textAlign: 'center', lineHeight: sp(20), marginBottom: sp(16) },
  tips:       { backgroundColor: '#F0FDFF', borderRadius: sp(10), borderLeftWidth: 3, borderLeftColor: P.teal, padding: sp(14), marginBottom: sp(20) },
  tipsTitle:  { fontSize: sp(12), fontWeight: '700', color: P.tealDark, marginBottom: sp(6) },
  tipRow:     { flexDirection: 'row', alignItems: 'flex-start', marginTop: sp(4) },
  dot:        { fontSize: sp(12), color: P.teal, marginRight: sp(6), lineHeight: sp(18) },
  tipTxt:     { flex: 1, fontSize: sp(12), color: P.gray, lineHeight: sp(18) },
  btn:        { paddingVertical: sp(14), borderRadius: sp(10), alignItems: 'center', elevation: 2, shadowColor: P.teal, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  btnTxt:     { color: P.white, fontSize: sp(15), fontWeight: '700' },
});