// src/components/ComingSoon.jsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icons from 'react-native-vector-icons/Feather';

const { width: SW } = Dimensions.get('window');
const sp = n => (SW / 375) * n;

const P = {
  bg: '#F4F5F7',
  dark: '#111827',
  gray: '#6B7280',
  light: '#9CA3AF',
  teal: '#00B4CC',
  darkOcean: '#0A3D62',
};

const ComingSoon = ({ title = 'Coming Soon', icon = 'clock', subtitle }) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Icons name={icon} size={sp(40)} color={P.darkOcean} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>
        {subtitle || 'This feature is under development.\nStay tuned for updates!'}
      </Text>
      <View style={styles.dots}>
        <View style={[styles.dot, { backgroundColor: P.darkOcean }]} />
        <View style={[styles.dot, { backgroundColor: P.teal }]} />
        <View style={[styles.dot, { backgroundColor: P.light }]} />
      </View>
    </View>
  );
};

export default ComingSoon;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: P.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: sp(40),
  },
  iconCircle: {
    width: sp(90),
    height: sp(90),
    borderRadius: sp(45),
    backgroundColor: 'rgba(10, 61, 98, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: sp(24),
  },
  title: {
    fontSize: sp(22),
    fontWeight: '800',
    color: P.dark,
    marginBottom: sp(10),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: sp(14),
    color: P.gray,
    textAlign: 'center',
    lineHeight: sp(21),
    marginBottom: sp(24),
  },
  dots: {
    flexDirection: 'row',
    gap: sp(8),
  },
  dot: {
    width: sp(8),
    height: sp(8),
    borderRadius: sp(4),
  },
});