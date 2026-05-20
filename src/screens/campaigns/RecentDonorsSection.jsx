// src/components/campaign/RecentDonorsSection.jsx
// ─────────────────────────────────────────────────────────────
//  RecentDonorsSection — renders the "Recent Donors" list
//  from the campaign detail screen.
//  Tapping any donor row opens DonorInfoModal with that
//  donor's full information.
//
//  Props:
//    donors: DonorShape[]   — array of donor objects
//    title:  string         — section title (default "Recent Donors")
// ─────────────────────────────────────────────────────────────

import React, { useState, useCallback, memo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import MCIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import COLORS from '../../theme/colors';
import { sp } from '../../theme/theme';
import DonorInfoModal from './DonorInfoModal';

// ─────────────────────────────────────────────────────────────
//  Responsive helper
// ─────────────────────────────────────────────────────────────
const { width: SW } = Dimensions.get('window');
const scale = n => (SW / 390) * n;

// ─────────────────────────────────────────────────────────────
//  Local tokens
// ─────────────────────────────────────────────────────────────
const T = {
  teal: COLORS?.teal ?? '#00B4CC',
  tealDark: COLORS?.tealDark ?? '#0097AA',
  tealLight: COLORS?.tealLight ?? 'rgba(0,180,204,0.10)',
  green: COLORS?.green ?? '#16A34A',
  white: COLORS?.white ?? '#FFFFFF',
  dark: COLORS?.dark ?? '#111827',
  gray: COLORS?.gray ?? '#6B7280',
  lightGray: COLORS?.lightGray ?? '#9CA3AF',
  border: COLORS?.border ?? '#E5E7EB',
};

const AVATAR_SIZE = scale(46);

// ─────────────────────────────────────────────────────────────
//  AvatarCircle — small version for list rows
// ─────────────────────────────────────────────────────────────
const AvatarCircle = memo(({ uri, name }) => {
  const initials = (name || '?')
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');

  return uri ? (
    <Image source={{ uri }} style={row.avatar} resizeMode="cover" />
  ) : (
    <View style={row.avatarFallback}>
      <Text style={row.avatarInitials}>{initials}</Text>
    </View>
  );
});

// ─────────────────────────────────────────────────────────────
//  DonorRow — single tappable row
// ─────────────────────────────────────────────────────────────
const DonorRow = memo(({ donor, onPress, isLast }) => {
  const displayName = donor.isAnonymous
    ? 'Anonymous'
    : donor.name ?? 'Anonymous';

  return (
    <TouchableOpacity
      style={[row.outer, isLast && row.outerLast]}
      onPress={() => onPress(donor)}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <AvatarCircle uri={donor.avatarUri} name={displayName} />

      {/* Name + message + time */}
      <View style={row.mid}>
        <Text style={row.name} numberOfLines={1}>
          {displayName}
        </Text>
        {!!donor.message && (
          <Text style={row.message} numberOfLines={1}>
            "{donor.message}"
          </Text>
        )}
        <Text style={row.timeAgo}>{donor.timeAgo ?? ''}</Text>
      </View>

      {/* Amount + chevron */}
      <View style={row.right}>
        <Text style={row.amount}>
          PKR {(donor.amount ?? 0).toLocaleString('en-PK')}
        </Text>
        <MCIcons
          name="chevron-right"
          size={scale(16)}
          color={T.lightGray}
          style={{ marginTop: sp(2) }}
        />
      </View>
    </TouchableOpacity>
  );
});

const row = StyleSheet.create({
  outer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: sp(14),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: T.border,
    gap: sp(12),
  },
  outerLast: {
    borderBottomWidth: 0,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    flexShrink: 0,
    backgroundColor: T.tealLight,
  },
  avatarFallback: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: T.tealLight,
    borderWidth: 1.5,
    borderColor: T.teal + '44',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarInitials: {
    fontSize: AVATAR_SIZE * 0.36,
    fontWeight: '800',
    color: T.tealDark,
  },
  mid: { flex: 1 },
  name: {
    fontSize: sp(15),
    fontWeight: '700',
    color: T.dark,
    marginBottom: sp(2),
  },
  message: {
    fontSize: sp(13),
    fontStyle: 'italic',
    color: T.gray,
    marginBottom: sp(2),
  },
  timeAgo: {
    fontSize: sp(12),
    color: T.lightGray,
  },
  right: {
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  amount: {
    fontSize: sp(14),
    fontWeight: '700',
    color: T.green,
  },
});

// ─────────────────────────────────────────────────────────────
//  RecentDonorsSection — exported component
// ─────────────────────────────────────────────────────────────

// ── Mock donors for development — replace with real props ────
const MOCK_DONORS = [
  {
    id: '1',
    name: 'Zara M.',
    isAnonymous: false,
    avatarUri: null,
    location: 'Karachi, Pakistan',
    age: 28, // ← ADD
    gender: 'Female', // ← ADD
    occupation: 'Software Engineer', // ← ADD
    phone: '+92 300 1234567', // ← ADD (optional, show only if available)
    totalDonated: 45000, // ← ADD (lifetime total across all campaigns)
    amount: 5000,
    donationDate: 'Jan 15, 2025',
    donationTime: '2:30 PM',
    paymentMethod: 'EasyPaisa',
    message: "Praying for everyone's safety!",
    timeAgo: '2h ago',
    totalCampaigns: 8,
    memberSince: 'Mar 2023',
  },
  {
    id: '2',
    name: 'Usman K.',
    isAnonymous: false,
    avatarUri: null,
    location: 'Lahore, Pakistan',
    age: 35,
    gender: 'Male',
    occupation: 'Business Owner',
    phone: null, // ← null = not shown
    totalDonated: 120000,
    amount: 10000,
    donationDate: 'Jan 15, 2025',
    donationTime: '11:00 AM',
    paymentMethod: 'JazzCash',
    message: null,
    timeAgo: '5h ago',
    totalCampaigns: 3,
    memberSince: 'Jul 2024',
  },
  {
    id: '3',
    name: 'Anonymous',
    isAnonymous: true,
    avatarUri: null,
    location: null,
    age: null, // ← hidden for anonymous
    gender: null,
    occupation: null,
    phone: null,
    totalDonated: null,
    amount: 2500,
    donationDate: 'Jan 14, 2025',
    donationTime: '9:45 PM',
    paymentMethod: 'Visa ••42',
    message: 'May Allah ease your hardships.',
    timeAgo: '1d ago',
    totalCampaigns: 0,
    memberSince: '',
  },
];

const RecentDonorsSection = ({
  donors = MOCK_DONORS,
  title = 'Recent Donors',
}) => {
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleDonorPress = useCallback(donor => {
    setSelectedDonor(donor);
    setModalVisible(true);
  }, []);

  const handleClose = useCallback(() => {
    setModalVisible(false);
    // Delay clearing donor so modal can animate out fully
    setTimeout(() => setSelectedDonor(null), 300);
  }, []);

  return (
    <View style={sec.wrap}>
      {/* Section heading */}
      <Text style={sec.heading}>{title}</Text>

      {/* Donor rows */}
      <View style={sec.card}>
        {donors.map((donor, index) => (
          <DonorRow
            key={donor.id ?? index}
            donor={donor}
            onPress={handleDonorPress}
            isLast={index === donors.length - 1}
          />
        ))}
      </View>

      {/* Donor info popup */}
      <DonorInfoModal
        visible={modalVisible}
        donor={selectedDonor}
        onClose={handleClose}
      />
    </View>
  );
};

export default RecentDonorsSection;

const sec = StyleSheet.create({
  wrap: {
    marginTop: sp(24),
  },
  heading: {
    fontSize: sp(18),
    fontWeight: '800',
    color: T.dark,
    marginBottom: sp(14),
    letterSpacing: -0.2,
  },
  card: {
    backgroundColor: T.white,
    borderRadius: scale(14),
    paddingHorizontal: sp(14),
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
});
