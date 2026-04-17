import React, { useState, useCallback, memo } from 'react';
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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icons from 'react-native-vector-icons/Feather';

// ─── Scale ───────────────────────────────────────────────
const { width: SW } = Dimensions.get('window');
const sp = n => (SW / 375) * n;

const SB_H = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0;

// ─── Tokens ──────────────────────────────────────────────
const C = {
  bg:         '#F8FAFC',
  white:      '#FFFFFF',
  teal:       '#00B4CC',
  tealLight:  'rgba(0,180,204,0.10)',
  tealBorder: 'rgba(0,180,204,0.35)',
  green:      '#059669',
  greenLight: '#10B981',
  dark:       '#0F172A',
  mid:        '#334155',
  gray:       '#64748B',
  light:      '#94A3B8',
  border:     '#E2E8F0',
};

// ─── Static data ─────────────────────────────────────────
const AMOUNTS = [500, 1000, 2500, 5000, 10000, 25000];

const CAMPAIGN = {
  title:     "Help Fatima's Heart Surgery",
  image:     'https://picsum.photos/80/60?random=10',
  remaining: 175000,
};

const METHODS = [
  { id: 'easypaisa', label: 'EasyPaisa',         icon: 'smartphone'  },
  { id: 'card',      label: 'Credit / Debit Card', icon: 'credit-card' },
  { id: 'bank',      label: 'Bank Transfer',      icon: 'repeat'      },
];

const fmt = n => n.toLocaleString('en-PK');

// ─── Sub-components ───────────────────────────────────────

// Campaign summary card at top
const CampaignCard = memo(() => (
  <View style={s.campaignCard}>
    <Image source={{ uri: CAMPAIGN.image }} style={s.campaignImg} resizeMode="cover" />
    <View style={s.campaignInfo}>
      <Text style={s.campaignTitle} numberOfLines={1}>{CAMPAIGN.title}</Text>
      <Text style={s.campaignRemaining}>
        Remaining: PKR {fmt(CAMPAIGN.remaining)}
      </Text>
    </View>
  </View>
));

// Amount preset pill
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

// Payment method row
const MethodRow = memo(({ item, selected, onSelect }) => (
  <TouchableOpacity
    style={[s.methodRow, selected && s.methodRowActive]}
    onPress={() => onSelect(item.id)}
    activeOpacity={0.75}
  >
    <View style={[s.methodIcon, selected && s.methodIconActive]}>
      <Icons name={item.icon} size={sp(16)} color={selected ? C.teal : C.gray} />
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
const DonateScreen = ({ navigation }) => {
  const [selected,   setSelected  ] = useState(5000);
  const [custom,     setCustom    ] = useState('5,000');
  const [anonymous,  setAnonymous ] = useState(true);
  const [message,    setMessage   ] = useState('');
  const [method,     setMethod    ] = useState('easypaisa');

  // Sync custom field when preset tapped
  const handleAmountPress = useCallback(amount => {
    setSelected(amount);
    setCustom(fmt(amount));
  }, []);

  // Parse custom input → update selected
  const handleCustomChange = useCallback(text => {
    const clean = text.replace(/[^0-9]/g, '');
    setCustom(clean ? fmt(Number(clean)) : '');
    setSelected(clean ? Number(clean) : 0);
  }, []);

  const handlePay = useCallback(() => {
    // Wire up payment API here
    navigation?.navigate?.('PaymentSuccess');
  }, [navigation]);

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} translucent={false} />

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

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        overScrollMode="never"
      >
        {/* Campaign card */}
        <CampaignCard />

        {/* Amount presets */}
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

        {/* Custom amount input */}
        <Text style={s.orLabel}>Or enter amount</Text>
        <View style={s.customWrap}>
          <Text style={s.currencyPrefix}>PKR</Text>
          <TextInput
            style={s.customInput}
            value={custom}
            onChangeText={handleCustomChange}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={C.light}
          />
        </View>

        {/* Anonymous toggle */}
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

        {/* Message */}
        <Text style={s.sectionLabel}>Message (optional)</Text>
        <TextInput
          style={s.messageInput}
          value={message}
          onChangeText={setMessage}
          placeholder="Leave an encouraging message..."
          placeholderTextColor={C.light}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        {/* Payment method */}
        <Text style={s.sectionLabel}>Payment Method</Text>
        <View style={s.methodGroup}>
          {METHODS.map(m => (
            <MethodRow
              key={m.id}
              item={m}
              selected={method === m.id}
              onSelect={setMethod}
            />
          ))}
        </View>

        <View style={s.bottomPad} />
      </ScrollView>

      {/* Sticky pay button */}
      <View style={s.footer}>
        <TouchableOpacity onPress={handlePay} activeOpacity={0.88}>
          <LinearGradient
            colors={[C.green, C.greenLight]}
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
    </View>
  );
};

export default DonateScreen;

// ─── Styles ───────────────────────────────────────────────
const s = StyleSheet.create({

  root: {
    flex:            1,
    backgroundColor: C.bg,
  },

  // Header
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: sp(18),
    paddingTop:        SB_H + sp(12),
    paddingBottom:     sp(12),
    backgroundColor:   C.bg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
  },
  headerTitle: {
    fontSize:           sp(17),
    fontWeight:         '700',
    color:              C.dark,
    includeFontPadding: false,
  },
  headerSpacer: { width: sp(22) },

  // Scroll
  scroll:        { flex: 1 },
  scrollContent: {
    paddingHorizontal: sp(18),
    paddingTop:        sp(16),
  },

  // Campaign card
  campaignCard: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: C.white,
    borderRadius:    sp(12),
    padding:         sp(12),
    marginBottom:    sp(20),
    borderWidth:     1,
    borderColor:     C.border,
    gap:             sp(12),
  },
  campaignImg: {
    width:        sp(54),
    height:       sp(44),
    borderRadius: sp(8),
    backgroundColor: C.border,
  },
  campaignInfo:      { flex: 1 },
  campaignTitle: {
    fontSize:           sp(13),
    fontWeight:         '700',
    color:              C.dark,
    marginBottom:       sp(4),
    includeFontPadding: false,
  },
  campaignRemaining: {
    fontSize:           sp(12),
    fontWeight:         '600',
    color:              C.green,
    includeFontPadding: false,
  },

  // Section label
  sectionLabel: {
    fontSize:           sp(14),
    fontWeight:         '700',
    color:              C.dark,
    marginBottom:       sp(10),
    includeFontPadding: false,
  },

  // Amount grid
  pillGrid: {
    flexDirection:  'row',
    flexWrap:       'wrap',
    gap:            sp(8),
    marginBottom:   sp(14),
  },
  pill: {
    width:             (SW - sp(36) - sp(16)) / 3,
    paddingVertical:   sp(11),
    borderRadius:      sp(8),
    borderWidth:       1.5,
    borderColor:       C.border,
    backgroundColor:   C.white,
    alignItems:        'center',
  },
  pillActive: {
    backgroundColor: C.teal,
    borderColor:     C.teal,
  },
  pillTxt: {
    fontSize:           sp(13),
    fontWeight:         '600',
    color:              C.mid,
    includeFontPadding: false,
  },
  pillTxtActive: {
    color: C.white,
  },

  // Custom input
  orLabel: {
    fontSize:           sp(12),
    color:              C.gray,
    marginBottom:       sp(8),
    includeFontPadding: false,
  },
  customWrap: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   C.white,
    borderRadius:      sp(10),
    borderWidth:       1.5,
    borderColor:       C.teal,
    paddingHorizontal: sp(14),
    height:            sp(52),
    marginBottom:      sp(16),
    gap:               sp(8),
  },
  currencyPrefix: {
    fontSize:           sp(15),
    fontWeight:         '600',
    color:              C.gray,
    includeFontPadding: false,
  },
  customInput: {
    flex:               1,
    fontSize:           sp(20),
    fontWeight:         '700',
    color:              C.dark,
    padding:            0,
    includeFontPadding: false,
  },

  // Anonymous toggle
  toggleRow: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   C.white,
    borderRadius:      sp(10),
    borderWidth:       1,
    borderColor:       C.border,
    paddingHorizontal: sp(14),
    paddingVertical:   sp(12),
    marginBottom:      sp(16),
    gap:               sp(10),
  },
  toggleLabel: {
    flex:               1,
    fontSize:           sp(14),
    fontWeight:         '500',
    color:              C.dark,
    includeFontPadding: false,
  },
  switch: {
    transform: Platform.OS === 'ios'
      ? [{ scaleX: 0.85 }, { scaleY: 0.85 }]
      : [],
  },

  // Message
  messageInput: {
    backgroundColor:   C.white,
    borderRadius:      sp(10),
    borderWidth:       1,
    borderColor:       C.border,
    paddingHorizontal: sp(14),
    paddingTop:        sp(12),
    paddingBottom:     sp(12),
    fontSize:          sp(14),
    color:             C.dark,
    minHeight:         sp(90),
    marginBottom:      sp(20),
    includeFontPadding: false,
  },

  // Payment methods
  methodGroup: {
    gap:          sp(8),
    marginBottom: sp(16),
  },
  methodRow: {
    flexDirection:     'row',
    alignItems:        'center',
    backgroundColor:   C.white,
    borderRadius:      sp(10),
    borderWidth:       1.5,
    borderColor:       C.border,
    paddingHorizontal: sp(14),
    paddingVertical:   sp(13),
    gap:               sp(12),
  },
  methodRowActive: {
    borderColor:     C.teal,
    backgroundColor: C.tealLight,
  },
  methodIcon: {
    width:           sp(34),
    height:          sp(34),
    borderRadius:    sp(8),
    backgroundColor: C.bg,
    alignItems:      'center',
    justifyContent:  'center',
  },
  methodIconActive: {
    backgroundColor: 'rgba(0,180,204,0.12)',
  },
  methodLabel: {
    flex:               1,
    fontSize:           sp(14),
    fontWeight:         '500',
    color:              C.mid,
    includeFontPadding: false,
  },
  methodLabelActive: {
    color:      C.teal,
    fontWeight: '600',
  },
  radio: {
    width:        sp(20),
    height:       sp(20),
    borderRadius: sp(10),
    borderWidth:  1.5,
    borderColor:  C.border,
    alignItems:   'center',
    justifyContent: 'center',
  },
  radioActive: {
    borderColor: C.teal,
  },
  radioDot: {
    width:           sp(10),
    height:          sp(10),
    borderRadius:    sp(5),
    backgroundColor: C.teal,
  },

  bottomPad: { height: sp(8) },

  // Footer
  footer: {
    paddingHorizontal: sp(18),
    paddingTop:        sp(12),
    paddingBottom:     Platform.OS === 'ios' ? sp(28) : sp(16),
    backgroundColor:   C.bg,
    borderTopWidth:    StyleSheet.hairlineWidth,
    borderTopColor:    C.border,
  },
  payBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    height:          sp(54),
    borderRadius:    sp(14),
    gap:             sp(10),
    elevation:       4,
    shadowColor:     C.green,
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.28,
    shadowRadius:    8,
    marginBottom:    sp(10),
  },
  payBtnTxt: {
    fontSize:           sp(17),
    fontWeight:         '800',
    color:              C.white,
    includeFontPadding: false,
  },
  secureRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            sp(5),
  },
  secureTxt: {
    fontSize:           sp(11),
    color:              C.light,
    includeFontPadding: false,
  },
});