import React, { useCallback, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Dimensions,
  Image,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icons from 'react-native-vector-icons/Feather';
// import BottomTabBar from '../../components/BottomTabBar';
import BottomTabBar from '../components/BottomTabBar';
// import BottomTabBar from './Maintabnavigator';

// ── Responsive scale ────────────────────────────────────────
const { width: SW } = Dimensions.get('window');
const sp = n => (SW / 375) * n;

const STATUSBAR_H =
  Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0;

// ── Palette ─────────────────────────────────────────────────
const P = {
  bg:          '#F4F6F8',
  white:       '#FFFFFF',
  teal:        '#00B4CC',
  tealDark:    '#0097AA',
  headerFrom:  '#0B5E6B',
  headerTo:    '#0D8FA0',
  dark:        '#111827',
  gray:        '#6B7280',
  light:       '#9CA3AF',
  border:      '#E5E7EB',
  red:         '#EF4444',
  redLight:    '#FEF2F2',
  green:       '#22C55E',
  greenLight:  'rgba(34,197,94,0.10)',
  orange:      '#F59E0B',
  orangeLight: 'rgba(245,158,11,0.10)',
};

// Mock user — replace with real auth context / Redux
const USER = {
  name:      'Ahmed Khan',
  email:     'ahmed@gmail.com',
  avatarUri: null,
  donated:   'PKR 75,000',
  donations: 15,
  verified:  true,
};

// Menu items matching Figma
const MENU_ITEMS = [
  { id: 'edit',   label: 'Edit Profile',      icon: 'user',        color: P.teal,   bg: 'rgba(0,180,204,0.10)' },
  { id: 'donate', label: 'My Donations',       icon: 'heart',       color: P.green,  bg: P.greenLight           },
  { id: 'camp',   label: 'My Campaigns',       icon: 'target',      color: P.teal,   bg: 'rgba(0,180,204,0.10)' },
  { id: 'with',   label: 'Withdrawals',        icon: 'refresh-cw',  color: P.orange, bg: P.orangeLight          },
  { id: 'notif',  label: 'Notifications',      icon: 'bell',        color: P.teal,   bg: 'rgba(0,180,204,0.10)', badge: 3 },
  { id: 'faq',    label: 'FAQ',                icon: 'help-circle', color: P.gray,   bg: 'rgba(107,114,128,0.10)' },
  { id: 'terms',  label: 'Terms & Conditions', icon: 'file-text',   color: P.gray,   bg: 'rgba(107,114,128,0.10)' },
];

// ════════════════════════════════════════════════════════════
//  MenuItem
// ════════════════════════════════════════════════════════════
const MenuItem = memo(({ item, onPress, isLast }) => (
  <TouchableOpacity
    style={[miSt.row, isLast && miSt.rowLast]}
    onPress={() => onPress(item.id)}
    activeOpacity={0.7}
  >
    <View style={[miSt.iconCircle, { backgroundColor: item.bg }]}>
      <Icons name={item.icon} size={sp(16)} color={item.color} />
    </View>
    <Text style={miSt.label}>{item.label}</Text>
    <View style={miSt.right}>
      {item.badge ? (
        <View style={miSt.badge}>
          <Text style={miSt.badgeTxt}>{item.badge}</Text>
        </View>
      ) : null}
      <Icons name="chevron-right" size={sp(16)} color={P.light} />
    </View>
  </TouchableOpacity>
));

const miSt = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: P.white,
    paddingVertical: sp(14),
    paddingHorizontal: sp(16),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: P.border,
  },
  rowLast: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: sp(12),
    borderBottomRightRadius: sp(12),
  },
  iconCircle: {
    width: sp(38),
    height: sp(38),
    borderRadius: sp(11),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: sp(14),
  },
  label: {
    flex: 1,
    fontSize: sp(14),
    fontWeight: '500',
    color: P.dark,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp(6),
  },
  badge: {
    backgroundColor: P.teal,
    borderRadius: sp(10),
    minWidth: sp(20),
    height: sp(20),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: sp(5),
  },
  badgeTxt: {
    color: P.white,
    fontSize: sp(10),
    fontWeight: '800',
  },
});

// ════════════════════════════════════════════════════════════
//  ProfileScreen
// ════════════════════════════════════════════════════════════
const ProfileScreen = ({ navigation }) => {
  const handleBack = useCallback(() => {
    navigation?.goBack?.();
  }, [navigation]);

  const handleMenu = useCallback(id => {
    // Wire to actual screens when ready
    // e.g. navigation.navigate('EditProfile')
    console.log('Menu:', id);
  }, []);

  const handleLogout = useCallback(() => {
    navigation?.reset?.({ index: 0, routes: [{ name: 'Login' }] });
  }, [navigation]);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={P.headerFrom} />

      {/* ══ TEAL GRADIENT HEADER ════════════════════════════ */}
      <LinearGradient
        // colors={['#0A3D62', '#0F6C85', '#15AABF']}
        colors={['#0A3D62', '#15AABF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.header}
      >
        {/* ← Back button */}
        <TouchableOpacity
          style={s.backBtn}
          onPress={handleBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <Icons name="arrow-left" size={sp(20)} color={P.white} />
        </TouchableOpacity>

        {/* Settings */}
        <TouchableOpacity
          style={s.settingsBtn}
          onPress={() => handleMenu('settings')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <Icons name="settings" size={sp(20)} color={P.white} />
        </TouchableOpacity>

        {/* Avatar */}
        <View style={s.avatarRing}>
          {USER.avatarUri ? (
            <Image source={{ uri: USER.avatarUri }} style={s.avatar} />
          ) : (
            <View style={s.avatarFallback}>
              <Text style={s.avatarInitial}>
                {USER.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* Name */}
        <Text style={s.userName}>{USER.name}</Text>
        <Text style={s.userEmail}>{USER.email}</Text>

        {/* CNIC Verified badge */}
        {USER.verified && (
          <View style={s.verifiedBadge}>
            <Icons name="check-circle" size={sp(11)} color={P.teal} />
            <Text style={s.verifiedTxt}>CNIC Verified</Text>
          </View>
        )}
      </LinearGradient>

      {/* ══ STATS CARD ══════════════════════════════════════ */}
      <View style={s.statsCard}>
        {/* Donated */}
        <View style={s.statItem}>
          <View style={s.statTopRow}>
            <Text style={s.statVal}>{USER.donated}</Text>
            <Icons name="copy" size={sp(13)} color={P.light} style={{ marginLeft: sp(4) }} />
          </View>
          <Text style={s.statLbl}>Donated</Text>
        </View>

        <View style={s.statDivider} />

        {/* Donations count */}
        <View style={s.statItem}>
          <View style={s.statTopRow}>
            <Text style={s.statVal}>{USER.donations}</Text>
            <Icons name="heart" size={sp(13)} color={P.light} style={{ marginLeft: sp(4) }} />
          </View>
          <Text style={s.statLbl}>Donations</Text>
        </View>
      </View>

      {/* ══ MENU LIST ═══════════════════════════════════════ */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
        {/* Menu card */}
        <View style={s.menuCard}>
          {MENU_ITEMS.map((item, idx) => (
            <MenuItem
              key={item.id}
              item={item}
              onPress={handleMenu}
              isLast={idx === MENU_ITEMS.length - 1}
            />
          ))}
        </View>

        {/* Log Out */}
        <TouchableOpacity
          style={s.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Icons name="log-out" size={sp(16)} color={P.red} />
          <Text style={s.logoutTxt}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: sp(24) }} />
      </ScrollView>

      {/* ══ BOTTOM TAB BAR ══════════════════════════════════ */}
      <BottomTabBar active="me" onPress={id => {
        if (id !== 'me') navigation?.navigate?.('HomeScreen');
      }} />
    </SafeAreaView>
  );
};

export default ProfileScreen;

// ════════════════════════════════════════════════════════════
//  Styles
// ════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: P.bg,
  },

  // Gradient header
  header: {
    paddingTop: sp(16) + STATUSBAR_H,
    paddingBottom: sp(26),
    paddingHorizontal: sp(22),
    alignItems: 'center',
  },
  backBtn: {
    position: 'absolute',
    top: sp(14) + STATUSBAR_H,
    left: sp(16),
    width: sp(36),
    height: sp(36),
    borderRadius: sp(18),
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsBtn: {
    position: 'absolute',
    top: sp(14) + STATUSBAR_H,
    right: sp(16),
    width: sp(36),
    height: sp(36),
    borderRadius: sp(18),
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Avatar
  avatarRing: {
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: sp(46),
    marginBottom: sp(12),
  },
  avatar: {
    width: sp(84),
    height: sp(84),
    borderRadius: sp(42),
  },
  avatarFallback: {
    width: sp(84),
    height: sp(84),
    borderRadius: sp(42),
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: sp(34),
    fontWeight: '800',
    color: P.white,
  },

  userName: {
    fontSize: sp(18),
    fontWeight: '800',
    color: P.white,
    marginBottom: sp(3),
  },
  userEmail: {
    fontSize: sp(12),
    color: 'rgba(255,255,255,0.75)',
    marginBottom: sp(10),
  },

  // Verified badge
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: P.white,
    borderRadius: sp(20),
    paddingHorizontal: sp(12),
    paddingVertical: sp(5),
    gap: sp(5),
  },
  verifiedTxt: {
    fontSize: sp(11),
    fontWeight: '700',
    color: P.teal,
  },

  // Stats card — floats below header
  statsCard: {
    flexDirection: 'row',
    backgroundColor: P.white,
    marginHorizontal: sp(16),
    marginTop: sp(-1), // flush with header bottom
    borderRadius: sp(14),
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    marginBottom: sp(16),
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: sp(16),
    paddingHorizontal: sp(8),
  },
  statTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sp(3),
  },
  statVal: {
    fontSize: sp(15),
    fontWeight: '800',
    color: P.dark,
  },
  statLbl: {
    fontSize: sp(11),
    color: P.light,
  },
  statDivider: {
    width: 1,
    backgroundColor: P.border,
    marginVertical: sp(14),
  },

  // Scroll
  scroll:        { flex: 1 },
  scrollContent: { paddingHorizontal: sp(16) },

  // Menu card wraps all items
  menuCard: {
    backgroundColor: P.white,
    borderRadius: sp(14),
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    marginBottom: sp(16),
  },

  // Log out
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: P.redLight,
    borderRadius: sp(14),
    paddingVertical: sp(16),
    gap: sp(8),
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.15)',
  },
  logoutTxt: {
    fontSize: sp(15),
    fontWeight: '700',
    color: P.red,
  },
});