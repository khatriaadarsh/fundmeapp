// src/screens/Profile/components/ProfileHeader.jsx
// ─────────────────────────────────────────────────────────────
//  ProfileHeader — Hero gradient section
//  Contains: avatar, verified badge, name, username, location
// ─────────────────────────────────────────────────────────────

import React, { memo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icons from 'react-native-vector-icons/Feather';

const { width: SW } = Dimensions.get('window');
const sp = n => (SW / 375) * n;

// ── Palette ─────────────────────────────────────────────────
const P = {
  darkOcean: '#0A3D62',
  teal:      '#00B4CC',
  white:     '#FFFFFF',
};

const HERO_H     = sp(270);
const AVATAR_S   = sp(100);
const BADGE_S    = sp(26);

const ProfileHeader = memo(({ user, onMenuPress }) => {
  return (
    <LinearGradient
      colors={['#0A3D62', '#0E6E85', '#15AABF']}
      start={{ x: 0.0, y: 0.0 }}
      end={{ x: 1.0, y: 1.0 }}
      style={s.hero}
    >
      {/* Decorative circles */}
      <View style={s.circle1} />
      <View style={s.circle2} />
      <View style={s.circle3} />

      {/* Content */}
      <View style={s.content}>
        {/* Avatar + verified badge */}
        <View style={s.avatarWrap}>
          {user.avatarUri ? (
            <Image source={{ uri: user.avatarUri }} style={s.avatar} />
          ) : (
            <View style={[s.avatar, s.avatarFallback]}>
              <Text style={s.avatarInitial}>
                {(user.name || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          {/* Verified dot */}
          <View style={s.verifiedBadge}>
            <Icons name="check" size={sp(13)} color={P.white} />
          </View>
        </View>

        {/* Name */}
        <Text style={s.name}>{user.name}</Text>
        {/* Username */}
        <Text style={s.username}>@{user.username}</Text>

        {/* Location + joined */}
        <View style={s.locationRow}>
          <Icons name="map-pin" size={sp(12)} color="rgba(255,255,255,0.80)" />
          <Text style={s.locationTxt}>
            {user.location} · Joined {user.joinedDate}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
});

export default ProfileHeader;

const s = StyleSheet.create({
  hero: {
    width: '100%',
    height: HERO_H,
    borderBottomLeftRadius:  sp(30),
    borderBottomRightRadius: sp(30),
    overflow: 'hidden',
    position: 'relative',
  },

  // Decorative circles
  circle1: {
    position: 'absolute', width: sp(220), height: sp(220),
    borderRadius: sp(110),
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: sp(-60), right: sp(-60),
  },
  circle2: {
    position: 'absolute', width: sp(160), height: sp(160),
    borderRadius: sp(80),
    backgroundColor: 'rgba(0,180,204,0.10)',
    bottom: sp(-30), left: sp(-30),
  },
  circle3: {
    position: 'absolute', width: sp(100), height: sp(100),
    borderRadius: sp(50),
    backgroundColor: 'rgba(255,255,255,0.04)',
    top: sp(60), left: sp(20),
  },

  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: sp(20),
  },

  // Avatar
  avatarWrap: {
    position: 'relative',
    marginBottom: sp(12),
  },
  avatar: {
    width:  AVATAR_S,
    height: AVATAR_S,
    borderRadius: AVATAR_S / 2,
    borderWidth: sp(4),
    borderColor: P.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarFallback: {
    backgroundColor: '#0E6E85',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: sp(36),
    fontWeight: '800',
    color: P.white,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: sp(2),
    right: sp(2),
    width:  BADGE_S,
    height: BADGE_S,
    borderRadius: BADGE_S / 2,
    backgroundColor: P.teal,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: P.white,
  },

  // Text
  name: {
    fontSize: sp(22),
    fontWeight: '800',
    color: P.white,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  username: {
    fontSize: sp(13),
    fontWeight: '500',
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    marginTop: sp(4),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: sp(10),
    gap: sp(5),
  },
  locationTxt: {
    fontSize: sp(12),
    color: 'rgba(255,255,255,0.80)',
  },
});