import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icons from 'react-native-vector-icons/Feather';

const { width: SW } = Dimensions.get('window');
const sp = n => (SW / 375) * n;

const TEAL = '#00B4CC';
// const TEAL_DARK = '#0097AA';
const INACTIVE = '#9CA3AF';
const WHITE = '#FFFFFF';
const OCEAN_BLUE = '#0A3D62';
const RED = '#e74c3c';

const TABS = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'explore', label: 'Explore', icon: 'compass' },
  { id: 'saved', label: 'Saved', icon: 'heart' },
  { id: 'me', label: 'Me', icon: 'user' },
];

const TAB_ROUTES = {
  home: 'HomeScreen',
  explore: 'ExploreScreen',
  saved: 'SavedScreen',
  me: 'ProfileScreen',
};

const ROUTE_TO_TAB = {
  HomeScreen: 'home',
  ExploreScreen: 'explore',
  SavedScreen: 'saved',
  ProfileScreen: 'me',
};

const TabItem = memo(({ t, active, onPress }) => {
  const isActive = active === t.id;
  return (
    <TouchableOpacity
      style={s.tab}
      onPress={() => onPress?.(t.id)}
      activeOpacity={0.7}
    >
      <Icons
        name={t.icon}
        size={sp(22)}
        color={isActive ? RED : INACTIVE}
      />
      <Text style={[s.label, isActive && s.labelActive]}>{t.label}</Text>
    </TouchableOpacity>
  );
});

const BottomTabBar = memo(({ active = 'home', navigation }) => {
  const handleTabPress = (id) => {
    if (id !== active) {
      navigation?.reset?.({
        index: 0,
        routes: [{ name: TAB_ROUTES[id] }],
      });
    }
  };

  const handleFabPress = () => {
    navigation?.navigate?.('CreateCampaignScreen');
  };

  return (
    <View style={s.bar}>
      {TABS.slice(0, 2).map(t => (
        <TabItem
          key={t.id}
          t={t}
          active={active}
          onPress={handleTabPress}
        />
      ))}

      <View style={s.fabSlot}>
        <TouchableOpacity onPress={handleFabPress} activeOpacity={0.85}>
          <LinearGradient colors={[OCEAN_BLUE, OCEAN_BLUE]} style={s.fab}>
            <Icons name="plus" size={sp(24)} color={WHITE} />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {TABS.slice(2).map(t => (
        <TabItem
          key={t.id}
          t={t}
          active={active}
          onPress={handleTabPress}
        />
      ))}
    </View>
  );
});

export { ROUTE_TO_TAB };
export default BottomTabBar;

const s = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    paddingTop: sp(6),
    paddingBottom: Platform.OS === 'android' ? sp(10) : sp(6),
    paddingHorizontal: sp(6),
    elevation: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: sp(2),
  },
  label: {
    fontSize: sp(10),
    color: INACTIVE,
    marginTop: sp(3),
  },
  labelActive: {
    color: RED,
    fontWeight: '700',
  },
  fabSlot: {
    flex: 1,
    alignItems: 'center',
    marginTop: sp(-24),
  },
  fab: {
    width: sp(56),
    height: sp(56),
    borderRadius: sp(28),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
});