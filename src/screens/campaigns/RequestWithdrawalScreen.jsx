// src/screens/campaigns/RequestWithdrawalScreen.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/Feather';
import { Animated as RNAnimated, Easing } from 'react-native';

// THEME & DATA IMPORTS
import { P, sp } from '../../theme/theme';
import { WITHDRAWAL_DATA, PAYMENT_METHODS } from '../../constants/mockData';

const { width: SW, height: SH } = Dimensions.get('window');
const scale = size => (SW / 375) * size;
const vscale = size => (SH / 812) * size;
const BUTTON_HEIGHT = vscale(54);
const FULL_WIDTH = SW - scale(32);
const formatPKR = n => n.toLocaleString('en-PK');

// ═══════════════════════════════════════════════════════════
// VALIDATION HELPERS
// ═══════════════════════════════════════════════════════════
const validateAccountNumber = (val) => {
  if (!val || val.trim().length === 0) return ''; 
  const regex = /^0\d{10}$/; 
  if (val.length === 11 && !regex.test(val)) return 'Must start with 0 (11 digits total)';
  if (val.length < 11) return `${11 - val.length} more digit(s)`;
  return '';
};

const validateTitle = (val) => {
  if (!val || val.trim().length === 0) return ''; 
  if (val.length > 0 && val.length < 3) return 'Min 3 characters';
  return '';
};

// ═══════════════════════════════════════════════════════════
// ANIMATED BUTTON
// ═══════════════════════════════════════════════════════════
const AnimatedSubmitButton = ({ state, onPress }) => {
  const widthAnim = useRef(new RNAnimated.Value(1)).current;
  const radiusAnim = useRef(new RNAnimated.Value(scale(12))).current;
  const bgAnim = useRef(new RNAnimated.Value(0)).current; 
  const idleOpacity = useRef(new RNAnimated.Value(1)).current;
  
  const spinAnim = useRef(new RNAnimated.Value(0)).current;
  const spinOpacity = useRef(new RNAnimated.Value(0)).current;
  const spinLoop = useRef(null);
  const spinPulse = useRef(new RNAnimated.Value(1)).current;

  const ripple1 = useRef(new RNAnimated.Value(0)).current;
  const ripple1Op = useRef(new RNAnimated.Value(0)).current;
  
  const checkScale = useRef(new RNAnimated.Value(0)).current;
  const checkOpacity = useRef(new RNAnimated.Value(0)).current;
  
  const textOpacity = useRef(new RNAnimated.Value(0)).current;
  const textTranslate = useRef(new RNAnimated.Value(14)).current;

  const stopLoops = useCallback(() => {
    spinLoop.current?.stop();
  }, []);

  useEffect(() => {
    if (state === 'loading') {
      RNAnimated.timing(idleOpacity, { toValue: 0, duration: 160, useNativeDriver: true }).start();
      
      RNAnimated.parallel([
        RNAnimated.spring(widthAnim, { toValue: 0, tension: 70, friction: 11, useNativeDriver: false }),
        RNAnimated.spring(radiusAnim, { toValue: BUTTON_HEIGHT / 2, tension: 70, friction: 11, useNativeDriver: false }),
      ]).start(() => {
        RNAnimated.timing(spinOpacity, { toValue: 1, duration: 220, useNativeDriver: true }).start();
        
        spinLoop.current = RNAnimated.loop(
          RNAnimated.timing(spinAnim, { toValue: 1, duration: 750, easing: Easing.linear, useNativeDriver: true })
        );
        spinLoop.current.start();
      });
    } else if (state === 'success') {
      stopLoops();
      spinAnim.setValue(0);

      RNAnimated.sequence([
        RNAnimated.timing(spinOpacity, { toValue: 0, duration: 120, useNativeDriver: true }),
        RNAnimated.parallel([
           RNAnimated.sequence([
             RNAnimated.timing(ripple1Op, { toValue: 0.8, duration: 80, useNativeDriver: true }),
             RNAnimated.parallel([
                RNAnimated.timing(ripple1, { toValue: 1, duration: 400, useNativeDriver: true }),
                RNAnimated.timing(ripple1Op, { toValue: 0, duration: 400, useNativeDriver: true })
             ])
           ]),
           RNAnimated.timing(bgAnim, { toValue: 1, duration: 380, useNativeDriver: false }),
           RNAnimated.parallel([
              RNAnimated.spring(checkScale, { toValue: 1, tension: 220, friction: 5, useNativeDriver: true }),
              RNAnimated.timing(checkOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
              RNAnimated.timing(textOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
              RNAnimated.spring(textTranslate, { toValue: 0, tension: 65, friction: 9, useNativeDriver: true }),
              RNAnimated.spring(widthAnim, { toValue: 1, tension: 55, friction: 7, useNativeDriver: false }),
              RNAnimated.spring(radiusAnim, { toValue: scale(12), tension: 55, friction: 7, useNativeDriver: false })
           ])
        ])
      ]).start();
    }
    return () => stopLoops();
  }, [state,bgAnim,checkOpacity,checkScale,idleOpacity,spinAnim,spinOpacity,textTranslate,widthAnim,radiusAnim,stopLoops,ripple1,ripple1Op,textOpacity]);

  const animWidth = widthAnim.interpolate({ inputRange: [0, 1], outputRange: [BUTTON_HEIGHT, FULL_WIDTH] });
  const bgColor = bgAnim.interpolate({ inputRange: [0, 1], outputRange: [P.darkOcean || '#0A3D62', P.green || '#10B981'] });
  const spinRotate = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <RNAnimated.View style={[styles.btnOuter, { width: animWidth, borderRadius: radiusAnim, backgroundColor: bgColor, transform: [{ scale: spinPulse }] }]}>
      <TouchableOpacity
        style={styles.btnTouchable}
        onPress={state === 'idle' ? onPress : undefined}
        disabled={state !== 'idle'}
        activeOpacity={0.88}
      >
        <RNAnimated.View style={[styles.rippleLayer, { width: ripple1, height: ripple1, opacity: ripple1Op, borderRadius: BUTTON_HEIGHT * 1.4 }]} />
        <RNAnimated.Text style={[styles.btnText, { opacity: idleOpacity }]}>Submit Request</RNAnimated.Text>
        <RNAnimated.View style={[styles.absoluteCenter, { opacity: spinOpacity }]}>
           <RNAnimated.View style={{ transform: [{ rotate: spinRotate }] }}>
               <Icons name="loader" size={sp(22)} color="#FFFFFF" />
           </RNAnimated.View>
        </RNAnimated.View>
        <RNAnimated.View style={[styles.absoluteCenter, styles.successRow, { opacity: textOpacity, transform: [{ translateY: textTranslate }] }]}>
           <RNAnimated.View style={{ transform: [{ scale: checkScale }], opacity: checkOpacity }}>
              <Icons name="check-circle" size={scale(22)} color={P.white} />
           </RNAnimated.View>
           <Text style={styles.successText}>Submitted Successfully!</Text>
        </RNAnimated.View>
      </TouchableOpacity>
    </RNAnimated.View>
  );
};

// Optimized Input Field
const InputField = ({ label, value, onChange, placeholder, keyboardType = 'default', error, onBlur }) => (
  <View style={styles.fieldWrap}>
    <Text style={styles.sectionLabel}>{label}</Text>
    <TextInput
      style={[styles.textInput, error && styles.inputError]}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={P.light}
      keyboardType={keyboardType}
      autoCapitalize="none"
      onBlur={onBlur}
    />
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

// ═══════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════
const RequestWithdrawalScreen = ({ navigation }) => {
  const [amount, setAmount] = useState(String(WITHDRAWAL_DATA.available));
  const [selectedMethod, setSelectedMethod] = useState('easypaisa');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountTitle, setAccountTitle] = useState('');
  const [btnState, setBtnState] = useState('idle');
  
  const [errors, setErrors] = useState({ amount: '', account: '', title: '' });
  const selectedMethodData = PAYMENT_METHODS.find(m => m.id === selectedMethod);

  const clearErrors = () => setErrors({ amount: '', account: '', title: '' });

  const checkValidation = useCallback(() => {
    let isValid = true;
    const amtError = !amount || Number(amount) <= 0 ? 'Required' : 
                     Number(amount) > WITHDRAWAL_DATA.available ? `Max ${formatPKR(WITHDRAWAL_DATA.available)}` : '';
    const accError = validateAccountNumber(accountNumber);
    const titleError = validateTitle(accountTitle);
    setErrors({ amount: amtError, account: accError, title: titleError });
    return !amtError && !accError && !titleError;
  }, [amount, accountNumber, accountTitle]);

  const handleSubmit = useCallback(() => {
    if (!checkValidation()) return;
    setBtnState('loading');
    setTimeout(() => {
      setBtnState('success');
      setTimeout(() => navigation.navigate('Profile'), 2200);
    }, 2000);
  }, [navigation, checkValidation]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={P.bg} />

      {/* ✅ SYNCED HEADER - Matches MyCampaignsScreen EXACTLY */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
           <Icons name="arrow-left" size={sp(22)} color={P.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Withdrawal</Text>
        <View style={{width: sp(32)}} />
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          <View style={styles.card}>
            <Text style={styles.campaignTitle}>{WITHDRAWAL_DATA.campaignTitle}</Text>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>PKR {typeof WITHDRAWAL_DATA.available === 'number' ? WITHDRAWAL_DATA.available.toLocaleString() : '0'}</Text>
            
            <View style={styles.statsRow}>
               <View><Text style={styles.statVal}>{WITHDRAWAL_DATA.raised.toLocaleString()}</Text><Text style={styles.statLbl}>Raised</Text></View>
                <View style={{width: sp(1), backgroundColor: '#E5E7EB'}}/>
               <View><Text style={styles.statVal}>{WITHDRAWAL_DATA.withdrawn.toLocaleString()}</Text><Text style={styles.statLbl}>Withdrawn</Text></View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Withdrawal Amount *</Text>
            <View style={styles.amountBox}>
               <Text style={styles.currencyPrefix}>PKR</Text>
               <View style={styles.divider} />
               <TextInput
                  style={[styles.amountInput, errors.amount && styles.inputError]}
                  value={amount}
                  onChangeText={(text) => { setAmount(text); if(errors.amount) clearErrors(); }}
                  onBlur={checkValidation}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={P.light}
               />
            </View>
            {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Select Account *</Text>
            {PAYMENT_METHODS.map(method => (
              <TouchableOpacity
                key={method.id}
                style={[styles.methodRow, selectedMethod === method.id && styles.methodRowActive]}
                onPress={() => setSelectedMethod(method.id)}
                activeOpacity={0.75}
              >
                <View style={[styles.radioOuter, selectedMethod === method.id && styles.radioOuterActive]}>
                   {selectedMethod === method.id && <View style={styles.radioInner}/>}
                </View>
                <Text style={[styles.methodLabel, selectedMethod === method.id && styles.methodLabelActive]}>
                    {method.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <InputField
            label="Account Number *"
            value={accountNumber}
            onChange={(text) => { setAccountNumber(text); if(errors.account) setErrors(e =>({...e, account: ''})); }}
            error={errors.account}
            onBlur={checkValidation}
            placeholder={selectedMethodData?.placeholder ?? '03XX XXXXXXX'}
            keyboardType="phone-pad"
          />

          <InputField
            label="Account Title *"
            value={accountTitle}
            onChange={(text) => { setAccountTitle(text); if(errors.title) setErrors(e =>({...e, title: ''})); }}
            error={errors.title}
            onBlur={checkValidation}
            placeholder="e.g. Ahmed Khan"
          />

          <View style={styles.noticeBanner}>
            <Icons name="clock" size={sp(16)} color="#D97706" />
            <Text style={styles.noticeText}>Requests are processed within 24–48 hours.</Text>
          </View>
          
          <View style={{height: sp(16)}} />
        </ScrollView>

        <View style={styles.footer}>
          <AnimatedSubmitButton state={btnState} onPress={handleSubmit} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ═══════════════════════════════════════════════════════════
// STYLES (SYNCED)
// ═══════════════════════════════════════════════════════════
const styles = StyleSheet.create({
  // ✅ BACKGROUND MATCH
  safe: { flex: 1, backgroundColor: P.bg },
  flex: { flex: 1 },

  // ✅ HEADER SYNC
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sp(16),
    paddingVertical: sp(12),
    borderBottomWidth: StyleSheet.hairlineWidth, 
    borderBottomColor: P.border,              
    backgroundColor: P.bg,                     
  },
  
  headerTitle: { fontSize: sp(17), fontWeight: '700', color: P.dark, letterSpacing: -0.2 },

  scrollContent: { paddingHorizontal: sp(16), paddingTop: sp(16), paddingBottom: sp(32) },

  card: {
    backgroundColor: '#FFFFFF', borderRadius: sp(12), padding: sp(16), marginBottom: sp(20),
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05,
  },
  campaignTitle: { fontSize: sp(14), fontWeight: '700', color: P.dark, marginBottom: sp(8) },
  balanceLabel: { fontSize: sp(12), color: P.gray, marginBottom: sp(3) },
  balanceAmount: { fontSize: sp(26), fontWeight: '800', color: P.green, marginBottom: sp(12) },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: sp(10), borderTopWidth: 1, borderTopColor: P.border },
  statVal: { fontSize: sp(14), fontWeight: '600', color: P.dark },
  statLbl: { fontSize: sp(11), color: P.light },

  section: { marginBottom: sp(20) },
  sectionLabel: { fontSize: sp(14), fontWeight: '700', color: P.dark, marginBottom: sp(10) },

  amountBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: P.white, borderRadius: sp(10), borderWidth: 1, borderColor: P.border, height: sp(54), paddingHorizontal: sp(16) },
  currencyPrefix: { fontSize: sp(15), fontWeight: '700', color: P.gray, marginRight: sp(12) },
  divider: { width: 1, height: '55%', backgroundColor: P.border, marginRight: sp(12) },
  amountInput: { flex: 1, fontSize: sp(16), fontWeight: '600', color: P.dark },
  
  fieldWrap: { marginBottom: sp(12) }, 
  textInput: {
    backgroundColor: P.white, borderRadius: sp(10), borderWidth: 1, borderColor: P.border,
    height: sp(54), paddingHorizontal: sp(16), fontSize: sp(15), color: P.dark,
  },
  inputError: { borderColor: '#EF4444', backgroundColor: '#FFFBFB' },
  errorText: { fontSize: sp(11), color: '#EF4444', marginTop: sp(4), marginLeft: sp(4), marginBottom: sp(10) },

  methodRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: P.white, borderRadius: sp(10), borderWidth: 1, borderColor: P.border, paddingHorizontal: sp(16), height: sp(54), marginBottom: sp(10), gap: sp(14) },
  methodRowActive: { borderColor: P.teal, backgroundColor: P.tealLight },
  radioOuter: { width: sp(22), height: sp(22), borderRadius: sp(11), borderWidth: 2, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center' },
  radioOuterActive: { borderColor: P.teal },
  radioInner: { width: sp(11), height: sp(11), borderRadius: sp(6), backgroundColor: P.teal },
  methodLabel: { fontSize: sp(15), fontWeight: '500', color: P.gray },
  methodLabelActive: { color: P.dark, fontWeight: '600' },

  noticeBanner: { flexDirection: 'row', alignItems: 'center', gap: sp(10), backgroundColor: '#FEF3C7', borderRadius: sp(10), padding: sp(14), marginBottom: sp(8) },
  noticeText: { fontSize: sp(13), color: '#D97706', fontWeight: '500' },

  footer: { paddingHorizontal: sp(16), paddingTop: sp(12), paddingBottom: Platform.OS === 'ios' ? sp(28) : sp(16), backgroundColor: P.bg, borderTopWidth: 1, borderTopColor: P.border, alignItems: 'center' },

  btnOuter: { height: BUTTON_HEIGHT, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2 },
  btnTouchable: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },
  rippleLayer: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.22)' },
  btnText: { fontSize: sp(16), fontWeight: '700', color: '#FFFFFF' },
  absoluteCenter: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  successRow: { flexDirection: 'row', alignItems: 'center', gap: sp(8) },
  successText: { color: '#FFFFFF', fontSize: sp(15), fontWeight: '700' },
});

export default RequestWithdrawalScreen;