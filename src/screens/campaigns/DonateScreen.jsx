import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
  memo,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  StatusBar,
  Dimensions,
  Platform,
  Image,
  Alert,
  Animated,
  Keyboard,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icons from 'react-native-vector-icons/Feather';

// ── Modals ───────────────────────────────────────────────────
import DonationConfirmModal from '../../components/donation/DonationConfirmModal';
import PinEntryModal from '../../components/payment/PinEntryModal';
import DonationReceiptModal from '../../components/donation/DonationReceiptModal';

// ── API / context wiring ────────────────────────────────────
import { useCampaignDetail } from '../../hooks/useCampaign';
import {
  useInitiateDonation,
  useConfirmDonation,
} from '../../hooks/useDonation';
import { useAppContext } from '../../context/AppContext';

// ─── Scale ───────────────────────────────────────────────
const { width: SW } = Dimensions.get('window');
const sp = n => (SW / 375) * n;

const SB_H = Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 0;

// ─── Tokens ──────────────────────────────────────────────
const C = {
  bg: '#F8FAFC',
  white: '#FFFFFF',
  teal: '#00B4CC',
  tealLight: 'rgba(0,180,204,0.10)',
  tealBorder: 'rgba(0,180,204,0.35)',
  green: '#059669',
  greenLight: '#10B981',
  dark: '#0F172A',
  mid: '#334155',
  gray: '#64748B',
  light: '#94A3B8',
  border: '#E2E8F0',
  red: '#EF4444',
};

// ─── Static data ─────────────────────────────────────────
const AMOUNTS = [500, 1000, 2500, 5000, 10000, 25000];

const METHODS = [
  { id: 'easypaisa', label: 'EasyPaisa', icon: 'smartphone' },
  { id: 'card', label: 'Credit / Debit Card', icon: 'credit-card' },
  { id: 'bank', label: 'Bank Transfer', icon: 'repeat' },
];

// ⚠️ Only EASYPAISA was confirmed by the sample API payload.
// CARD / BANK_TRANSFER are assumptions — confirm the exact enum
// strings your backend expects and adjust here if different.
const PAYMENT_METHOD_API = {
  easypaisa: 'EASYPAISA',
  card: 'CARD',
  bank: 'BANK_TRANSFER',
};

// Methods that need an "Account Number" to identify the sender
const METHODS_NEEDING_ACCOUNT = ['easypaisa', 'bank'];
const ACCOUNT_NUMBER_LENGTH = 11;

const fmt = n => n.toLocaleString('en-PK');

// ─── Sub-components ───────────────────────────────────────

const CampaignCard = memo(({ title, image, remaining, loading }) => (
  <View style={s.campaignCard}>
    <Image source={{ uri: image }} style={s.campaignImg} resizeMode="cover" />
    <View style={s.campaignInfo}>
      <Text style={s.campaignTitle} numberOfLines={1}>
        {loading ? 'Loading campaign...' : title}
      </Text>
      <Text style={s.campaignRemaining}>
        Remaining: PKR {fmt(remaining || 0)}
      </Text>
    </View>
  </View>
));

const AmountPill = memo(({ amount, selected, onPress }) => (
  <TouchableOpacity
    style={[s.pill, selected && s.pillActive]}
    onPress={() => onPress(amount)}
    activeOpacity={0.75}
  >
    <Text style={[s.pillTxt, selected && s.pillTxtActive]}>
      PKR {fmt(amount)}
    </Text>
  </TouchableOpacity>
));

const MethodRow = memo(({ item, selected, onSelect }) => (
  <TouchableOpacity
    style={[s.methodRow, selected && s.methodRowActive]}
    onPress={() => onSelect(item.id)}
    activeOpacity={0.75}
  >
    <View style={[s.methodIcon, selected && s.methodIconActive]}>
      <Icons
        name={item.icon}
        size={sp(16)}
        color={selected ? C.teal : C.gray}
      />
    </View>
    <Text style={[s.methodLabel, selected && s.methodLabelActive]}>
      {item.label}
    </Text>
    <View style={[s.radio, selected && s.radioActive]}>
      {selected && <View style={s.radioDot} />}
    </View>
  </TouchableOpacity>
));

// ─── Main Screen ──────────────────────────────────────────
const DonateScreen = ({ navigation, route }) => {
  const campaignId = route?.params?.campaignId
    ? String(route.params.campaignId)
    : null;

  const { data: campaign, isLoading: campaignLoading } =
    useCampaignDetail(campaignId);

  const { currentUser } = useAppContext();
  const donorId = currentUser?.id;
  const donorName = useMemo(() => {
    const first = currentUser?.firstName || '';
    const last = currentUser?.lastName || '';
    return `${first} ${last}`.trim() || 'Donor';
  }, [currentUser]);

  const initiateDonationMutation = useInitiateDonation();
  const confirmDonationMutation = useConfirmDonation();

  const [selected, setSelected] = useState(5000);
  const [custom, setCustom] = useState('5,000');
  const [anonymous, setAnonymous] = useState(true);
  const [message, setMessage] = useState('');
  const [method, setMethod] = useState('easypaisa');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountError, setAccountError] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [pinVisible, setPinVisible] = useState(false);
  const [receiptVisible, setReceiptVisible] = useState(false);

  const [paymentReference, setPaymentReference] = useState(null);
  const [receiptData, setReceiptData] = useState(null);

  // ── Keyboard-aware scrolling ─────────────────────────────────
  // No native resize behavior is assumed here (KeyboardAvoidingView's
  // Android 'height' behavior can double-shrink the screen if
  // windowSoftInputMode is already adjustResize, and can under-react
  // if it isn't). Instead the real keyboard height is tracked directly
  // and used to (a) shrink the space available to the ScrollView +
  // footer so the footer stays above the keyboard, and (b) scroll
  // whichever field is focused into view — this is deterministic
  // regardless of platform/manifest configuration.
  const scrollRef = useRef(null);
  const fieldOffsets = useRef({});
  const kbPad = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showEvt =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = e => {
      const height = e?.endCoordinates?.height ?? 0;
      const duration = e?.duration ?? 250;
      Animated.timing(kbPad, {
        toValue: height,
        duration,
        useNativeDriver: false, // animating layout padding, not a transform
      }).start();
    };

    const onHide = e => {
      const duration = e?.duration ?? 200;
      Animated.timing(kbPad, {
        toValue: 0,
        duration,
        useNativeDriver: false,
      }).start();
    };

    const showSub = Keyboard.addListener(showEvt, onShow);
    const hideSub = Keyboard.addListener(hideEvt, onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [kbPad]);

  // Each keyboard-relevant field's container reports its own y-offset
  // within the ScrollView via onLayout; on focus, that field is
  // scrolled just below the top of the (now keyboard-shrunk) visible
  // area so it's always fully visible while typing.
  const registerFieldY = useCallback(
    key => e => {
      fieldOffsets.current[key] = e.nativeEvent.layout.y;
    },
    [],
  );

  const scrollToField = useCallback(key => {
    const y = fieldOffsets.current[key];
    if (y == null) return;
    // Small delay lets the keyboard's show animation begin first, so
    // the scroll target is calculated against the final shrunk scroll
    // area rather than the pre-keyboard one.
    setTimeout(
      () => {
        scrollRef.current?.scrollTo({
          y: Math.max(y - sp(20), 0),
          animated: true,
        });
      },
      Platform.OS === 'ios' ? 260 : 120,
    );
  }, []);

  // Sync custom field when preset tapped
  const handleAmountPress = useCallback(amount => {
    setSelected(amount);
    setCustom(fmt(amount));
  }, []);

  const handleCustomChange = useCallback(text => {
    const clean = text.replace(/[^0-9]/g, '');
    setCustom(clean ? fmt(Number(clean)) : '');
    setSelected(clean ? Number(clean) : 0);
  }, []);

  const handleAccountNumberChange = useCallback(
    text => {
      const digits = text
        .replace(/[^0-9]/g, '')
        .slice(0, ACCOUNT_NUMBER_LENGTH);
      setAccountNumber(digits);
      if (accountError) setAccountError('');
    },
    [accountError],
  );

  const handleMethodSelect = useCallback(id => {
    setMethod(id);
    setAccountError('');
  }, []);

  const showAccountField = METHODS_NEEDING_ACCOUNT.includes(method);

  const selectedMethodLabel = useMemo(
    () => METHODS.find(m => m.id === method)?.label,
    [method],
  );

  const displayName = anonymous ? 'Anonymous' : donorName;
  const trimmedMessage = message.trim();

  // ── Step 1: Pay button → validate → open confirm modal ──────
  const handlePay = useCallback(() => {
    if (!selected || selected <= 0) return;

    if (showAccountField) {
      if (!accountNumber.trim()) {
        setAccountError('Please enter your account number to continue');
        return;
      }
      if (accountNumber.length !== ACCOUNT_NUMBER_LENGTH) {
        setAccountError(
          `Account number must be ${ACCOUNT_NUMBER_LENGTH} digits`,
        );
        return;
      }
    }

    if (!campaignId) {
      Alert.alert('Error', 'Missing campaign reference.');
      return;
    }
    if (!donorId) {
      Alert.alert(
        'Error',
        'Could not identify your account. Please log in again.',
      );
      return;
    }

    setAccountError('');
    setConfirmVisible(true);
  }, [selected, showAccountField, accountNumber, campaignId, donorId]);

  // ── Step 2: "Confirm Payment" in the summary modal → initiate ──
  const handleInitiate = useCallback(async () => {
    try {
      const payload = {
        campaignId: Number(campaignId),
        donorId: Number(donorId),
        amount: selected,
        paymentMethod: PAYMENT_METHOD_API[method] || method.toUpperCase(),
        anonymous,
      };

      if (showAccountField && accountNumber) {
        payload.walletNumber = accountNumber;
      }
      if (trimmedMessage) {
        payload.donorMessage = trimmedMessage;
      }

      const response = await initiateDonationMutation.mutateAsync(payload);

      if (response?.responseCode && response.responseCode !== '000') {
        Alert.alert(
          'Error',
          response?.responseMessage ||
            'Could not initiate donation. Please try again.',
        );
        return;
      }

      const reference = response?.data?.paymentReference;
      if (!reference) {
        Alert.alert('Error', 'Could not start the payment. Please try again.');
        return;
      }

      setPaymentReference(reference);
      setConfirmVisible(false);
      setPinVisible(true);
    } catch (error) {
      console.error(
        '🔴 [DonateScreen] Initiate donation error:',
        error?.message,
      );
      const backendMsg = error?.response?.data?.responseMessage;
      Alert.alert(
        'Error',
        backendMsg ||
          'Could not initiate donation. Please check your connection.',
      );
    }
  }, [
    campaignId,
    donorId,
    selected,
    method,
    anonymous,
    showAccountField,
    accountNumber,
    trimmedMessage,
    initiateDonationMutation,
  ]);

  // ── Step 3: PIN entered → confirm donation ──────────────────
  const handlePinSubmit = useCallback(
    async pin => {
      const response = await confirmDonationMutation.mutateAsync({
        paymentReference,
        pin,
      });

      if (response?.responseCode && response.responseCode !== '000') {
        // Throwing here lets PinEntryModal shake + clear the input
        throw new Error(response?.responseMessage || 'Incorrect PIN');
      }

      setReceiptData(response?.data || null);
      setPinVisible(false);
      setReceiptVisible(true);
    },
    [paymentReference, confirmDonationMutation],
  );

  // ── Step 4: Receipt "Done" → reset + navigate away ──────────
  const handleReceiptDone = useCallback(() => {
    setReceiptVisible(false);
    setReceiptData(null);
    setPaymentReference(null);
    navigation?.navigate?.('MainTabs');
  }, [navigation]);

  return (
    <View style={s.root}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={C.bg}
        translucent={false}
      />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation?.goBack?.()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icons name="arrow-left" size={sp(22)} color={C.dark} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Donate</Text>
        <View style={s.headerSpacer} />
      </View>

      {/* Shrinks by the real keyboard height so the footer (Pay button)
          always stays above the keyboard instead of being covered by
          it, and the ScrollView above it has a correspondingly smaller
          — but still fully scrollable — visible area. */}
      <Animated.View style={[s.body, { paddingBottom: kbPad }]}>
        <ScrollView
          ref={scrollRef}
          style={s.scroll}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          overScrollMode="never"
        >
          <CampaignCard
            title={campaign?.title}
            image={campaign?.image}
            remaining={campaign ? campaign.goal - campaign.raised : 0}
            loading={campaignLoading}
          />

          <Text style={s.sectionLabel}>Select Amount</Text>
          <View style={s.pillGrid}>
            {AMOUNTS.map(a => (
              <AmountPill
                key={a}
                amount={a}
                selected={selected === a}
                onPress={handleAmountPress}
              />
            ))}
          </View>

          <Text style={s.orLabel}>Or enter amount</Text>
          <View style={s.customWrap} onLayout={registerFieldY('custom')}>
            <Text style={s.currencyPrefix}>PKR</Text>
            <TextInput
              style={s.customInput}
              value={custom}
              onChangeText={handleCustomChange}
              onFocus={() => scrollToField('custom')}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={C.light}
            />
          </View>

          <View style={s.toggleRow}>
            <Icons name="grid" size={sp(16)} color={C.gray} />
            <Text style={s.toggleLabel}>Donate Anonymously</Text>
            <Switch
              value={anonymous}
              onValueChange={setAnonymous}
              trackColor={{ false: C.border, true: C.teal }}
              thumbColor={C.white}
              ios_backgroundColor={C.border}
              style={s.switch}
            />
          </View>

          <Text style={s.sectionLabel}>Message (optional)</Text>
          <TextInput
            style={s.messageInput}
            value={message}
            onChangeText={setMessage}
            onLayout={registerFieldY('message')}
            onFocus={() => scrollToField('message')}
            placeholder="Leave an encouraging message..."
            placeholderTextColor={C.light}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <Text style={s.sectionLabel}>Payment Method</Text>
          <View style={s.methodGroup}>
            {METHODS.map(m => (
              <MethodRow
                key={m.id}
                item={m}
                selected={method === m.id}
                onSelect={handleMethodSelect}
              />
            ))}
          </View>

          {showAccountField && (
            <>
              <Text style={s.sectionLabel}>Account Number</Text>
              <View
                style={[s.accountWrap, accountError && s.accountWrapError]}
                onLayout={registerFieldY('account')}
              >
                <Icons
                  name="phone"
                  size={sp(15)}
                  color={accountError ? C.red : C.gray}
                />
                <TextInput
                  style={s.accountInput}
                  value={accountNumber}
                  onChangeText={handleAccountNumberChange}
                  onFocus={() => scrollToField('account')}
                  keyboardType="number-pad"
                  placeholder="e.g. 03451234567"
                  placeholderTextColor={C.light}
                  maxLength={ACCOUNT_NUMBER_LENGTH}
                />
                <Text style={s.accountCounter}>
                  {accountNumber.length}/{ACCOUNT_NUMBER_LENGTH}
                </Text>
              </View>
              {!!accountError && (
                <View style={s.errorRow}>
                  <Icons name="alert-circle" size={sp(12)} color={C.red} />
                  <Text style={s.errorText}>{accountError}</Text>
                </View>
              )}
            </>
          )}

          <View style={s.bottomPad} />
        </ScrollView>

        <View style={s.footer}>
          <TouchableOpacity onPress={handlePay} activeOpacity={0.88}>
            <LinearGradient
              colors={[C.teal, C.tealborder]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.payBtn}
            >
              <Text style={s.payBtnTxt}>
                Pay PKR {selected > 0 ? fmt(selected) : '0'}
              </Text>
              <Icons name="arrow-right" size={sp(18)} color={C.white} />
            </LinearGradient>
          </TouchableOpacity>

          <View style={s.secureRow}>
            <Icons name="lock" size={sp(12)} color={C.light} />
            <Text style={s.secureTxt}>
              Secure · Zero Commission · 100% reaches campaign
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* Step 1 — review + triggers initiate donation */}
      <DonationConfirmModal
        visible={confirmVisible}
        onClose={() => setConfirmVisible(false)}
        onConfirm={handleInitiate}
        loading={initiateDonationMutation.isPending}
        campaignTitle={campaign?.title}
        campaignCreator={campaign?.creator?.name}
        creatorLoading={campaignLoading}
        amount={selected}
        accountNumber={showAccountField ? accountNumber : null}
        name={displayName}
        paymentMethod={selectedMethodLabel}
        message={trimmedMessage}
      />

      {/* Step 2 — PIN, triggers confirm donation */}
      <PinEntryModal
        visible={pinVisible}
        onClose={() => setPinVisible(false)}
        onSubmit={handlePinSubmit}
      />

      {/* Step 3 — animated success receipt */}
      <DonationReceiptModal
        visible={receiptVisible}
        onDone={handleReceiptDone}
        data={receiptData}
        message={trimmedMessage}
      />
    </View>
  );
};

export default DonateScreen;

// ─── Styles ───────────────────────────────────────────────
const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sp(18),
    paddingTop: SB_H + sp(12),
    paddingBottom: sp(12),
    backgroundColor: C.bg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
  },
  headerTitle: {
    fontSize: sp(17),
    fontWeight: '700',
    color: C.dark,
    includeFontPadding: false,
  },
  headerSpacer: { width: sp(22) },

  // Wraps ScrollView + footer so the animated keyboard padding above
  // shrinks both together, keeping the footer above the keyboard.
  body: {
    flex: 1,
  },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: sp(18),
    paddingTop: sp(16),
  },

  campaignCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: sp(12),
    padding: sp(12),
    marginBottom: sp(20),
    borderWidth: 1,
    borderColor: C.border,
    gap: sp(12),
  },
  campaignImg: {
    width: sp(54),
    height: sp(44),
    borderRadius: sp(8),
    backgroundColor: C.border,
  },
  campaignInfo: { flex: 1 },
  campaignTitle: {
    fontSize: sp(13),
    fontWeight: '700',
    color: C.dark,
    marginBottom: sp(4),
    includeFontPadding: false,
  },
  campaignRemaining: {
    fontSize: sp(12),
    fontWeight: '600',
    color: C.green,
    includeFontPadding: false,
  },

  sectionLabel: {
    fontSize: sp(14),
    fontWeight: '700',
    color: C.dark,
    marginBottom: sp(10),
    includeFontPadding: false,
  },

  pillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: sp(8),
    marginBottom: sp(14),
  },
  pill: {
    width: (SW - sp(36) - sp(16)) / 3,
    paddingVertical: sp(11),
    borderRadius: sp(8),
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
    alignItems: 'center',
  },
  pillActive: {
    backgroundColor: C.teal,
    borderColor: C.teal,
  },
  pillTxt: {
    fontSize: sp(13),
    fontWeight: '600',
    color: C.mid,
    includeFontPadding: false,
  },
  pillTxtActive: {
    color: C.white,
  },

  orLabel: {
    fontSize: sp(12),
    color: C.gray,
    marginBottom: sp(8),
    includeFontPadding: false,
  },
  customWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: sp(10),
    borderWidth: 1.5,
    borderColor: C.teal,
    paddingHorizontal: sp(14),
    height: sp(52),
    marginBottom: sp(16),
    gap: sp(8),
  },
  currencyPrefix: {
    fontSize: sp(15),
    fontWeight: '600',
    color: C.gray,
    includeFontPadding: false,
  },
  customInput: {
    flex: 1,
    fontSize: sp(20),
    fontWeight: '700',
    color: C.dark,
    padding: 0,
    includeFontPadding: false,
  },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: sp(10),
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: sp(14),
    paddingVertical: sp(12),
    marginBottom: sp(16),
    gap: sp(10),
  },
  toggleLabel: {
    flex: 1,
    fontSize: sp(14),
    fontWeight: '500',
    color: C.dark,
    includeFontPadding: false,
  },
  switch: {
    transform:
      Platform.OS === 'ios' ? [{ scaleX: 0.85 }, { scaleY: 0.85 }] : [],
  },

  messageInput: {
    backgroundColor: C.white,
    borderRadius: sp(10),
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: sp(14),
    paddingTop: sp(12),
    paddingBottom: sp(12),
    fontSize: sp(14),
    color: C.dark,
    minHeight: sp(90),
    marginBottom: sp(20),
    includeFontPadding: false,
  },

  methodGroup: {
    gap: sp(8),
    marginBottom: sp(16),
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: sp(10),
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: sp(14),
    paddingVertical: sp(13),
    gap: sp(12),
  },
  methodRowActive: {
    borderColor: C.teal,
    backgroundColor: C.tealLight,
  },
  methodIcon: {
    width: sp(34),
    height: sp(34),
    borderRadius: sp(8),
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodIconActive: {
    backgroundColor: 'rgba(0,180,204,0.12)',
  },
  methodLabel: {
    flex: 1,
    fontSize: sp(14),
    fontWeight: '500',
    color: C.mid,
    includeFontPadding: false,
  },
  methodLabelActive: {
    color: C.teal,
    fontWeight: '600',
  },
  radio: {
    width: sp(20),
    height: sp(20),
    borderRadius: sp(10),
    borderWidth: 1.5,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: C.teal,
  },
  radioDot: {
    width: sp(10),
    height: sp(10),
    borderRadius: sp(5),
    backgroundColor: C.teal,
  },

  accountWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: sp(10),
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: sp(14),
    height: sp(48),
    marginBottom: sp(6),
    gap: sp(8),
  },
  accountWrapError: {
    borderColor: C.red,
  },
  accountInput: {
    flex: 1,
    fontSize: sp(14),
    color: C.dark,
    padding: 0,
    includeFontPadding: false,
  },
  accountCounter: {
    fontSize: sp(11),
    color: C.light,
    includeFontPadding: false,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp(5),
    marginBottom: sp(16),
  },
  errorText: {
    fontSize: sp(11.5),
    color: C.red,
    flex: 1,
    includeFontPadding: false,
  },

  bottomPad: { height: sp(8) },

  footer: {
    paddingHorizontal: sp(18),
    paddingTop: sp(12),
    paddingBottom: Platform.OS === 'ios' ? sp(28) : sp(16),
    backgroundColor: C.bg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.border,
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: sp(54),
    borderRadius: sp(14),
    gap: sp(10),
    elevation: 4,
    shadowColor: C.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    marginBottom: sp(10),
  },
  payBtnTxt: {
    fontSize: sp(17),
    fontWeight: '800',
    color: C.white,
    includeFontPadding: false,
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: sp(5),
  },
  secureTxt: {
    fontSize: sp(11),
    color: C.light,
    includeFontPadding: false,
  },
});
