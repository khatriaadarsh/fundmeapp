import React, { memo, useCallback } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import BottomTabBar from './BottomTabBar';
import { useRoute } from '@react-navigation/native';

// map route name → tab id that BottomTabBar expects
const ROUTE_TO_TAB = {
  HomeScreen:    'home',
  ExploreScreen: 'explore',
  SavedScreen:   'saved',
  ProfileScreen: 'me',
};

const ScreenWithTabBar = memo(
  ({
    navigation,
    children,          // UI of the concrete screen (Home, Explore …)
    style = {},        // optional extra style for the SafeAreaView
  }) => {
    const route = useRoute();
    const active = ROUTE_TO_TAB[route.name] ?? 'home';

    // single handler used by the bar – just navigate, no need for local state
    const handlePress = useCallback(
      (id: string) => {
        const dest = ROUTE_TO_TAB[id];
        if (dest && dest !== active) {
          navigation.navigate(dest);
        }
      },
      [navigation, active],
    );

    return (
      <SafeAreaView style={[styles.safe, style]}>
        {/* ── screen content ───────────────────────────────────── */}
        <View style={styles.content}>{children}</View>

        {/* ── shared fixed bottom bar ───────────────────────────── */}
        <BottomTabBar
          active={active}
          navigation={navigation}
          onPress={handlePress}
        />
      </SafeAreaView>
    );
  },
);

export default ScreenWithTabBar;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF', // keep the same background you used before
  },
  content: {
    flex: 1, // expands to fill the space above the tab bar
  },
});