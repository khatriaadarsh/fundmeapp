// src/screens/profile/ProfileScreen.jsx
import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icons from 'react-native-vector-icons/Feather';
import { useAppContext } from '../context/AppContext';
import { useProfileDetails } from '../hooks/useProfile';
import { useNotificationList } from '../hooks/useNotifications';

const { width: SW } = Dimensions.get('window');
const sp = n => (SW / 375) * n;

const P = {
  bg: '#F4F6F8',
  white: '#FFFFFF',
  teal: '#00B4CC',
  tealDark: '#0097AA',
  headerFrom: '#0B5E6B',
  headerTo: '#0D8FA0',
  dark: '#111827',
  gray: '#6B7280',
  light: '#9CA3AF',
  border: '#E5E7EB',
  red: '#EF4444',
  redLight: '#FEF2F2',
  green: '#22C55E',
  greenLight: 'rgba(34,197,94,0.10)',
  orange: '#F59E0B',
  orangeLight: 'rgba(245,158,11,0.10)',
};

// NOTE: 'notif' intentionally has no static `badge` value anymore — it's
// computed at render time from live notification data (see menuItems
// below), since a hardcoded number here would drift from reality the
// moment the user reads/deletes a notification.
const ALL_MENU_ITEMS = [
  {
    id: 'edit',
    label: 'Edit Profile',
    icon: 'user',
    color: P.teal,
    bg: 'rgba(0,180,204,0.10)',
    roles: ['donor', 'creator'],
  },
  {
    id: 'donate',
    label: 'My Donations',
    icon: 'heart',
    color: P.green,
    bg: P.greenLight,
    roles: ['donor', 'creator'],
  },
  {
    id: 'camp',
    label: 'My Campaigns',
    icon: 'target',
    color: P.teal,
    bg: 'rgba(0,180,204,0.10)',
    roles: ['creator'],
  },
  {
    id: 'with',
    label: 'Withdrawals',
    icon: 'refresh-cw',
    color: P.orange,
    bg: P.orangeLight,
    roles: ['creator'],
  },
  {
    id: 'notif',
    label: 'Notifications',
    icon: 'bell',
    color: P.teal,
    bg: 'rgba(0,180,204,0.10)',
    roles: ['donor', 'creator'],
  },
  {
    id: 'faq',
    label: 'FAQ',
    icon: 'help-circle',
    color: P.gray,
    bg: 'rgba(107,114,128,0.10)',
    roles: ['donor', 'creator'],
  },
  {
    id: 'terms',
    label: 'Terms & Conditions',
    icon: 'file-text',
    color: P.gray,
    bg: 'rgba(107,114,128,0.10)',
    roles: ['donor', 'creator'],
  },
];

const MenuItem = ({ item, onPress, isLast }) => (
  <TouchableOpacity
    style={[styles.row, isLast && styles.rowLast]}
    onPress={() => onPress(item.id)}
    activeOpacity={0.7}
  >
    <View style={[styles.iconCircle, { backgroundColor: item.bg }]}>
      <Icons name={item.icon} size={sp(16)} color={item.color} />
    </View>
    <Text style={styles.label}>{item.label}</Text>
    <View style={styles.right}>
      {item.badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeTxt}>{item.badge}</Text>
        </View>
      ) : null}
      <Icons name="chevron-right" size={sp(16)} color={P.light} />
    </View>
  </TouchableOpacity>
);

const ProfileScreen = ({ navigation }) => {
  const { currentUser } = useAppContext();

  const userRole = currentUser?.role || 'donor';
  const userId = currentUser?.id;

  // Fetch full profile details — this is now the source of truth for the
  // header (image, name, verified badge), not just the login response.
  const { data: profileData, isLoading } = useProfileDetails(userId);

  // Same notification data source as NotificationsScreen, used here only
  // to derive the unread count for the menu badge.
  const { data: rawNotifications = [] } = useNotificationList(userId);

  // Unread count for the "Notifications" menu badge. Adjust the field
  // check below if your API uses a different flag than `isRead`/`read`.
  const unreadNotifCount = useMemo(() => {
    if (!Array.isArray(rawNotifications)) return 0;
    return rawNotifications.filter(
      n => n?.isRead === false || n?.read === false,
    ).length;
  }, [rawNotifications]);

  // Prefer live API data, fall back to currentUser (login response) only
  // while the profile details request is still in flight / hasn't resolved.
  const firstName = profileData?.firstName ?? currentUser?.firstName ?? '';
  const lastName = profileData?.lastName ?? currentUser?.lastName ?? '';
  const email = profileData?.email ?? currentUser?.email ?? '';

  // cnicVerified comes from the profileDetails API response
  const isVerified =
    profileData?.cnicVerified === true || currentUser?.nicVerified === true;

  const profileImage =
    profileData?.profileImageUrl ?? currentUser?.profileImage ?? null;

  const menuItems = useMemo(() => {
    return ALL_MENU_ITEMS.filter(item => item.roles.includes(userRole)).map(
      item =>
        item.id === 'notif'
          ? {
              ...item,
              badge:
                unreadNotifCount > 0
                  ? unreadNotifCount > 99
                    ? '99+'
                    : unreadNotifCount
                  : null,
            }
          : item,
    );
  }, [userRole, unreadNotifCount]);

  const handleBack = useCallback(() => {
    navigation?.goBack?.();
  }, [navigation]);

  const handleMenu = useCallback(
    id => {
      switch (id) {
        case 'edit':
          navigation.navigate('EditProfile', {
            profileData: profileData || currentUser,
            userId: userId,
          });
          break;
        case 'donate':
          navigation.navigate('MyDonationScreen');
          break;
        case 'camp':
          navigation.navigate('MyCampaignsScreen');
          break;
        case 'with':
          navigation.navigate('MyWithdrawalsScreen');
          break;
        case 'notif':
          navigation.navigate('NotificationsScreen');
          break;
        case 'faq':
          navigation.navigate('FAQScreen');
          break;
        case 'terms':
          navigation.navigate('TermsConditions');
          break;
        default:
          console.log('Menu:', id);
      }
    },
    [navigation, profileData, currentUser, userId],
  );

  const handleLogout = useCallback(() => {
    navigation?.reset?.({ index: 0, routes: [{ name: 'Login' }] });
  }, [navigation]);

  const displayName = `${firstName} ${lastName}`.trim() || 'User';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#0A3D62" />

      <LinearGradient
        colors={['#0A3D62', '#15AABF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <Icons name="arrow-left" size={sp(20)} color={P.white} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => navigation.navigate('SettingsScreen')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          activeOpacity={0.7}
        >
          <Icons name="settings" size={sp(20)} color={P.white} />
        </TouchableOpacity>

        <View style={styles.avatarRing}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>
                {firstName?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.userName}>{displayName}</Text>
        <Text style={styles.userEmail}>{email}</Text>

        {isVerified ? (
          <View style={styles.verifiedBadge}>
            <Icons name="check-circle" size={sp(11)} color={P.teal} />
            <Text style={styles.verifiedTxt}>CNIC Verified</Text>
          </View>
        ) : (
          <View style={[styles.verifiedBadge, styles.notVerifiedBadge]}>
            <Icons name="x-circle" size={sp(11)} color={P.red} />
            <Text style={[styles.verifiedTxt, styles.notVerifiedTxt]}>
              CNIC Not Verified
            </Text>
          </View>
        )}

        {isLoading && (
          <ActivityIndicator
            size="small"
            color={P.white}
            style={styles.loader}
          />
        )}
      </LinearGradient>

      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <View style={styles.statTopRow}>
            <Text style={styles.statVal}>PKR 75,000</Text>
            <Icons
              name="copy"
              size={sp(13)}
              color={P.light}
              style={{ marginLeft: sp(4) }}
            />
          </View>
          <Text style={styles.statLbl}>Donated</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <View style={styles.statTopRow}>
            <Text style={styles.statVal}>15</Text>
            <Icons
              name="heart"
              size={sp(13)}
              color={P.light}
              style={{ marginLeft: sp(4) }}
            />
          </View>
          <Text style={styles.statLbl}>Donations</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
        <View style={styles.menuCard}>
          {menuItems.map((item, idx) => (
            <MenuItem
              key={item.id}
              item={item}
              onPress={handleMenu}
              isLast={idx === menuItems.length - 1}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Icons name="log-out" size={sp(16)} color={P.red} />
          <Text style={styles.logoutTxt}>Log Out</Text>
        </TouchableOpacity>

        <View style={{ height: sp(24) }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: P.bg,
  },
  header: {
    paddingTop: sp(16),
    paddingBottom: sp(26),
    paddingHorizontal: sp(22),
    alignItems: 'center',
  },
  backBtn: {
    position: 'absolute',
    top: sp(14),
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
    top: sp(14),
    right: sp(16),
    width: sp(36),
    height: sp(36),
    borderRadius: sp(18),
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: P.white,
    borderRadius: sp(20),
    paddingHorizontal: sp(12),
    paddingVertical: sp(5),
    gap: sp(5),
  },
  notVerifiedBadge: {
    backgroundColor: P.redLight,
  },
  verifiedTxt: {
    fontSize: sp(11),
    fontWeight: '700',
    color: P.teal,
  },
  notVerifiedTxt: {
    color: P.red,
  },
  loader: {
    marginTop: sp(10),
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: P.white,
    marginHorizontal: sp(16),
    marginTop: sp(10),
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
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: sp(16) },
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

export default ProfileScreen;
