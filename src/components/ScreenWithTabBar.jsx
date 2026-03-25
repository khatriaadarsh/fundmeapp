import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import Icons from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomTabBar from './BottomTabBar';

const { width: SW } = Dimensions.get('window');
const sp = n => (SW / 375) * n;

const STATUSBAR_H =
  Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 0;

const P = {
  white: '#FFFFFF',
  dark: '#111827',
  gray: '#6B7280',
  teal: '#00B4CC',
  bg: '#F4F5F7',
  border: '#E5E7EB',
};

/**
 * ScreenWithBottomBar
 *
 * Wraps any screen content with:
 *  - SafeAreaView
 *  - StatusBar
 *  - Fixed BottomTabBar at bottom
 *
 * Props:
 *  - activeTab: 'home' | 'explore' | 'saved' | 'me'
 *  - navigation: navigation object
 *  - children: screen content
 *  - statusBarStyle: 'dark-content' | 'light-content'
 *  - statusBarBg: background color for status bar
 */
const ScreenWithBottomBar = ({
  activeTab,
  navigation,
  children,
  statusBarStyle = 'dark-content',
  statusBarBg = P.white,
}) => {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={statusBarStyle} backgroundColor={statusBarBg} />

      {/* Screen content takes all available space */}
      <View style={styles.content}>{children}</View>

      {/* Fixed bottom tab bar — always visible */}
      <BottomTabBar active={activeTab} navigation={navigation} />
    </SafeAreaView>
  );
};

export default ScreenWithBottomBar;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: P.white,
  },
  content: {
    flex: 1,
  },
});
