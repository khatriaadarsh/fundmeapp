// src/screens/settings/SettingsScreen.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Switch,
  Alert,
  Platform,
  Modal,
  Animated,
  Easing,
  FlatList,
} from 'react-native';
import Icons from 'react-native-vector-icons/Feather';

// ═══════════════════════════════════════════════════════════
// Responsive Scale
// ═══════════════════════════════════════════════════════════
const { width: SW, height: SH } = Dimensions.get('window');
const scale = size => (SW / 375) * size;
const vscale = size => (SH / 812) * size;

// ═══════════════════════════════════════════════════════════
// Design Tokens — Figma exact
// ═══════════════════════════════════════════════════════════
const C = {
  // Figma background is teal/gradient — page bg is light
  pageBg: '#F0F8FA',
  white: '#FFFFFF',
  primary: '#0A3D62',
  teal: '#15AABF',
  textDark: '#0A3D62', // Figma uses dark blue for row labels
  textMid: '#374151',
  textGray: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E8F4F7', // Figma: very light teal border
  danger: '#EF4444',
  switchOn: '#15AABF',
  sectionLbl: '#15AABF', // Figma: teal section labels
  overlay: 'rgba(0,0,0,0.45)',
  sheetBg: '#FFFFFF',
  selectedBg: '#EEF9FC',
  selectedBorder: '#15AABF',
  checkColor: '#15AABF',
};

const APP_VERSION = '1.0.0';

// ═══════════════════════════════════════════════════════════
// Picker options
// ═══════════════════════════════════════════════════════════
const LANGUAGES = ['English', 'Urdu', 'Arabic', 'French'];
const CURRENCIES = ['PKR', 'USD', 'EUR', 'GBP', 'SAR', 'AED'];
const THEMES = ['Light', 'Dark', 'System'];

// ═══════════════════════════════════════════════════════════
// ✅ ANIMATED BOTTOM SHEET MODAL
// Attractive slide-up + fade — used for Language/Currency/Theme
// ═══════════════════════════════════════════════════════════
const BottomSheetModal = ({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}) => {
  const slideAnim = useRef(new Animated.Value(SH)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide up + fade in backdrop together
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 280,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide down + fade out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SH,
          duration: 260,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, backdropAnim]);

  const handleSelect = useCallback(
    option => {
      onSelect(option);
      onClose();
    },
    [onSelect, onClose],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Animated.View style={[bs.backdrop, { opacity: backdropAnim }]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[bs.sheet, { transform: [{ translateY: slideAnim }] }]}
      >
        {/* Handle bar */}
        <View style={bs.handle} />

        {/* Title row */}
        <View style={bs.titleRow}>
          <Text style={bs.title}>{title}</Text>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icons name="x" size={scale(20)} color={C.textGray} />
          </TouchableOpacity>
        </View>

        {/* Options */}
        <FlatList
          data={options}
          keyExtractor={item => item}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={bs.separator} />}
          renderItem={({ item }) => {
            const isSelected = selected === item;
            return (
              <TouchableOpacity
                style={[bs.option, isSelected && bs.optionSelected]}
                onPress={() => handleSelect(item)}
                activeOpacity={0.72}
              >
                <Text
                  style={[bs.optionText, isSelected && bs.optionTextSelected]}
                >
                  {item}
                </Text>
                {isSelected && (
                  <Animated.View>
                    <Icons
                      name="check-circle"
                      size={scale(20)}
                      color={C.checkColor}
                    />
                  </Animated.View>
                )}
              </TouchableOpacity>
            );
          }}
        />

        {/* Bottom safe area pad */}
        <View
          style={{ height: Platform.OS === 'ios' ? vscale(20) : vscale(12) }}
        />
      </Animated.View>
    </Modal>
  );
};

const bs = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: C.overlay,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.sheetBg,
    borderTopLeftRadius: scale(22),
    borderTopRightRadius: scale(22),
    maxHeight: SH * 0.6,
    paddingTop: vscale(10),
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  handle: {
    width: scale(38),
    height: scale(4),
    backgroundColor: '#D1D5DB',
    borderRadius: scale(2),
    alignSelf: 'center',
    marginBottom: vscale(14),
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
    marginBottom: vscale(8),
  },
  title: {
    fontSize: scale(16),
    fontWeight: '700',
    color: C.textDark,
    includeFontPadding: false,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: C.border,
    marginHorizontal: scale(20),
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
    paddingVertical: vscale(15),
  },
  optionSelected: {
    backgroundColor: C.selectedBg,
  },
  optionText: {
    fontSize: scale(15),
    fontWeight: '500',
    color: C.textMid,
    includeFontPadding: false,
  },
  optionTextSelected: {
    color: C.teal,
    fontWeight: '700',
  },
});

// ═══════════════════════════════════════════════════════════
// HEADER
// ═══════════════════════════════════════════════════════════
const Header = ({ onBack }) => (
  <View style={s.header}>
    <TouchableOpacity
      onPress={onBack}
      style={s.headerBack}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Icons name="arrow-left" size={scale(22)} color={C.textDark} />
    </TouchableOpacity>
    <Text style={s.headerTitle}>Settings</Text>
    <View style={s.headerBack} />
  </View>
);

// ═══════════════════════════════════════════════════════════
// SECTION WRAPPER — Figma: teal label + white card
// ═══════════════════════════════════════════════════════════
const Section = ({ label, children }) => (
  <View style={s.section}>
    <Text style={s.sectionLabel}>{label}</Text>
    <View style={s.sectionCard}>{children}</View>
  </View>
);

// ═══════════════════════════════════════════════════════════
// NAV ROW — label + chevron
// ═══════════════════════════════════════════════════════════
const NavRow = ({
  icon,
  label,
  labelColor,
  iconColor,
  onPress,
  isLast = false,
}) => (
  <TouchableOpacity
    style={[s.row, !isLast && s.rowBorder]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    {icon ? (
      <View style={s.rowIconWrap}>
        <Icons name={icon} size={scale(18)} color={iconColor ?? C.textGray} />
      </View>
    ) : (
      <View style={s.rowNoIcon} />
    )}
    <Text style={[s.rowLabel, labelColor && { color: labelColor }]}>
      {label}
    </Text>
    <Icons name="chevron-right" size={scale(18)} color={C.textLight} />
  </TouchableOpacity>
);

// ═══════════════════════════════════════════════════════════
// TOGGLE ROW — switch
// ═══════════════════════════════════════════════════════════
const ToggleRow = ({ label, value, onChange, isLast = false }) => (
  <View style={[s.row, !isLast && s.rowBorder]}>
    <View style={s.rowNoIcon} />
    <Text style={s.rowLabel}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: '#D1D5DB', true: C.switchOn }}
      thumbColor={C.white}
      ios_backgroundColor="#D1D5DB"
      style={s.switchStyle}
    />
  </View>
);

// ═══════════════════════════════════════════════════════════
// VALUE ROW — label + value text + chevron
// ═══════════════════════════════════════════════════════════
const ValueRow = ({
  label,
  value,
  onPress,
  showChevron = true,
  isLast = false,
}) => (
  <TouchableOpacity
    style={[s.row, !isLast && s.rowBorder]}
    onPress={onPress}
    activeOpacity={onPress ? 0.7 : 1}
    disabled={!onPress}
  >
    <View style={s.rowNoIcon} />
    <Text style={s.rowLabel}>{label}</Text>
    <View style={s.rowRight}>
      {value ? <Text style={s.rowValue}>{value}</Text> : null}
      {showChevron && (
        <Icons name="chevron-right" size={scale(18)} color={C.textLight} />
      )}
    </View>
  </TouchableOpacity>
);

// ═══════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════
const SettingsScreen = ({ navigation }) => {
  // ── Toggles ───────────────────────────────────────────────
  const [pushEnabled, setPushEnabled] = useState(true);
  const [campaignUpdates, setCampaignUpdates] = useState(true);

  // ── Preferences ───────────────────────────────────────────
  const [language, setLanguage] = useState('English');
  const [currency, setCurrency] = useState('PKR');
  const [theme, setTheme] = useState('Light');

  // ── Bottom sheet visibility ───────────────────────────────
  const [langSheet, setLangSheet] = useState(false);
  const [currencySheet, setCurrencySheet] = useState(false);
  const [themeSheet, setThemeSheet] = useState(false);

  // ── Delete account ────────────────────────────────────────
  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete Account',
      'Are you sure? This action is permanent and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => console.warn('Account deleted'),
        },
      ],
    );
  }, []);

  // ── Navigate helper ───────────────────────────────────────
  const go = useCallback(
    screen => () => navigation.navigate(screen),
    [navigation],
  );

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.pageBg} />

      <Header onBack={() => navigation.goBack()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {/* ── ACCOUNT ───────────────────────────────────── */}
        <Section label="ACCOUNT">
          <NavRow
            label="Change Password"
            onPress={go('NewPasswordScreen')}
          />
          <NavRow label="Email Preferences" onPress={go('EmailPreferences')} />
          <NavRow
            icon="trash-2"
            iconColor={C.danger}
            label="Delete Account"
            labelColor={C.danger}
            onPress={handleDeleteAccount}
            isLast
          />
        </Section>

        {/* ── NOTIFICATIONS ─────────────────────────────── */}
        <Section label="NOTIFICATIONS">
          <ToggleRow
            label="Push Notifications"
            value={pushEnabled}
            onChange={setPushEnabled}
          />
          <ToggleRow
            label="Campaign Updates"
            value={campaignUpdates}
            onChange={setCampaignUpdates}
            isLast
          />
        </Section>

        {/* ── PREFERENCES ───────────────────────────────── */}
        <Section label="PREFERENCES">
          <ValueRow
            label="Language"
            value={language}
            onPress={() => setLangSheet(true)}
          />
          <ValueRow
            label="Currency"
            value={currency}
            onPress={() => setCurrencySheet(true)}
          />
          <ValueRow
            label="Theme"
            value={theme}
            onPress={() => setThemeSheet(true)}
            isLast
          />
        </Section>

        {/* ── ABOUT ─────────────────────────────────────── */}
        <Section label="ABOUT">
          <NavRow label="Privacy Policy" onPress={go('PrivacyPolicy')} />
          <ValueRow
            label="App Version"
            value={APP_VERSION}
            showChevron={false}
            isLast
          />
        </Section>
      </ScrollView>

      {/* ── BOTTOM SHEET MODALS ───────────────────────────── */}
      <BottomSheetModal
        visible={langSheet}
        title="Select Language"
        options={LANGUAGES}
        selected={language}
        onSelect={setLanguage}
        onClose={() => setLangSheet(false)}
      />
      <BottomSheetModal
        visible={currencySheet}
        title="Select Currency"
        options={CURRENCIES}
        selected={currency}
        onSelect={setCurrency}
        onClose={() => setCurrencySheet(false)}
      />
      <BottomSheetModal
        visible={themeSheet}
        title="Select Theme"
        options={THEMES}
        selected={theme}
        onSelect={setTheme}
        onClose={() => setThemeSheet(false)}
      />
    </SafeAreaView>
  );
};

// ═══════════════════════════════════════════════════════════
// STYLES — Figma exact match
// ═══════════════════════════════════════════════════════════
const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.pageBg,
  },

  // ── Header ───────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: vscale(14),
    backgroundColor: C.pageBg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
  },
  headerBack: {
    width: scale(36),
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: scale(17),
    fontWeight: '700',
    color: C.textDark,
    letterSpacing: -0.2,
  },

  // ── Scroll ───────────────────────────────────────────────
  scrollContent: {
    paddingHorizontal: scale(14),
    paddingTop: vscale(16),
    paddingBottom: vscale(40),
  },

  // ── Section ───────────────────────────────────────────────
  section: {
    marginBottom: vscale(18),
  },
  sectionLabel: {
    fontSize: scale(11),
    fontWeight: '800',
    color: C.sectionLbl, // ✅ Figma: teal section labels
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: vscale(8),
    marginLeft: scale(6),
    includeFontPadding: false,
  },
  sectionCard: {
    backgroundColor: C.white,
    borderRadius: scale(14),
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#15AABF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },

  // ── Row base ─────────────────────────────────────────────
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingVertical: vscale(15),
    minHeight: vscale(54),
    backgroundColor: C.white,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
  },

  // Icon slots
  rowIconWrap: {
    width: scale(28),
    alignItems: 'center',
    marginRight: scale(10),
  },
  rowNoIcon: {
    // No icon — small left pad to keep alignment
    width: scale(4),
  },

  rowLabel: {
    flex: 1,
    fontSize: scale(14),
    fontWeight: '500',
    color: C.textDark, // ✅ Figma: dark blue labels
    includeFontPadding: false,
    lineHeight: scale(20),
  },

  // Right side
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(4),
  },
  rowValue: {
    fontSize: scale(13),
    fontWeight: '500',
    color: C.textGray,
    includeFontPadding: false,
  },

  // Switch scale fix on iOS
  switchStyle: {
    transform:
      Platform.OS === 'ios' ? [{ scaleX: 0.85 }, { scaleY: 0.85 }] : [],
  },
});

export default SettingsScreen;
