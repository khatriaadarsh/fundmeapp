// src/components/HeroBanner.jsx
import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { P, sp } from '../theme/theme';

const HeroBanner = memo(() => (
  <LinearGradient
    colors={[P.bannerFrom, P.bannerTo]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
    style={bnSt.wrap}
  >
    <View style={bnSt.circle1} />
    <View style={bnSt.circle2} />
    <View style={bnSt.graphic}>
      <Text style={bnSt.graphicIcon}>🤲</Text>
    </View>
    <Text style={bnSt.title}>{"Fund Someone's\nFuture Today"}</Text>
    <Text style={bnSt.sub}>100% goes to those in need</Text>
    <TouchableOpacity style={bnSt.exploreBtn} activeOpacity={0.8}>
      <Text style={bnSt.exploreTxt}>Explore →</Text>
    </TouchableOpacity>
  </LinearGradient>
));

const bnSt = StyleSheet.create({
  wrap: {
    marginHorizontal: sp(16),
    borderRadius: sp(16),
    padding: sp(22),
    paddingRight: sp(100),
    overflow: 'hidden',
    minHeight: sp(138),
    position: 'relative',
    justifyContent: 'center',
  },
  circle1: {
    position: 'absolute',
    width: sp(160),
    height: sp(160),
    borderRadius: sp(80),
    borderWidth: sp(22),
    borderColor: 'rgba(255,255,255,0.07)',
    right: sp(-30),
    top: sp(-30),
  },
  circle2: {
    position: 'absolute',
    width: sp(100),
    height: sp(100),
    borderRadius: sp(50),
    borderWidth: sp(16),
    borderColor: 'rgba(255,255,255,0.05)',
    right: sp(20),
    bottom: sp(-30),
  },
  graphic: {
    position: 'absolute',
    right: sp(18),
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  graphicIcon: { fontSize: sp(52) },
  title: {
    fontSize: sp(20),
    fontWeight: '800',
    color: P.white,
    lineHeight: sp(27),
    marginBottom: sp(5),
  },
  sub: {
    fontSize: sp(12),
    color: 'rgba(255,255,255,0.72)',
    marginBottom: sp(16),
  },
  exploreBtn: {
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.55)',
    borderRadius: sp(20),
    paddingHorizontal: sp(16),
    paddingVertical: sp(6),
  },
  exploreTxt: {
    color: P.white,
    fontSize: sp(13),
    fontWeight: '600',
  },
});

export default HeroBanner;