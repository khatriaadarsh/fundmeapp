// src/components/TopBar.jsx
import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icons from 'react-native-vector-icons/Feather';
import { P, sp } from '../theme/theme';

const TopBar = memo(({ user, onAvatarPress, onBellPress }) => (
  <View style={tbSt.wrap}>
    {/* ✅ FIX: The TouchableOpacity is now *inside* the left container. 
        It no longer has flex:1, so its touch area will not expand. */}
    <View style={tbSt.leftContainer}>
      <TouchableOpacity onPress={onAvatarPress} style={tbSt.profileButton} activeOpacity={0.8}>
        {user?.avatarUri ? (
          <Image source={{ uri: user.avatarUri }} style={tbSt.avatar} />
        ) : (
          <LinearGradient colors={[P.teal, P.tealDark]} style={tbSt.avatarGrad}>
            <Text style={tbSt.avatarInitial}>
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </Text>
          </LinearGradient>
        )}
        <Text style={tbSt.userName} numberOfLines={1}>
          {user?.name}
        </Text>
      </TouchableOpacity>
    </View>

    {/* This button has always been separate and should work correctly. */}
    <TouchableOpacity
      style={tbSt.bellBtn}
      onPress={onBellPress}
      activeOpacity={0.7}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Icons name="bell" size={sp(21)} color={P.gray} />
      <View style={tbSt.bellDot} />
    </TouchableOpacity>
  </View>
));

const tbSt = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: P.white,
    paddingHorizontal: sp(18),
    height: sp(60),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: P.border,
  },
  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp(10),
    // Ensures the button doesn't stretch across the screen
    alignSelf: 'flex-start',
  },
  avatar: {
    width: sp(38),
    height: sp(38),
    borderRadius: sp(19),
  },
  avatarGrad: {
    width: sp(38),
    height: sp(38),
    borderRadius: sp(19),
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: sp(15),
    fontWeight: '800',
    color: P.white,
  },
  userName: {
    fontSize: sp(15),
    fontWeight: '700',
    color: P.dark,
  },
  bellBtn: {
    position: 'relative',
    width: sp(38),
    height: sp(38),
    borderRadius: sp(19),
    backgroundColor: P.searchBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: P.border,
  },
  bellDot: {
    position: 'absolute',
    top: sp(7),
    right: sp(7),
    width: sp(7),
    height: sp(7),
    borderRadius: sp(4),
    backgroundColor: P.red,
    borderWidth: 1,
    borderColor: P.white,
  },
});

export default TopBar;