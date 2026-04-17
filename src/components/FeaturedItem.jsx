// src/components/FeaturedItem.jsx
import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { P, sp } from '../theme/theme';
import ProgressBar from './ProgressBar';

const FeaturedItem = memo(({ item }) => (
  <TouchableOpacity style={fiSt.wrap} activeOpacity={0.8}>
    <View style={[fiSt.thumb, { backgroundColor: item.imgBg }]}>
      <Text style={fiSt.emoji}>{item.imgEmoji}</Text>
    </View>
    <View style={fiSt.info}>
      <Text style={fiSt.title} numberOfLines={1}>
        {item.title}
      </Text>
      <ProgressBar pct={item.pct} />
      <View style={fiSt.meta}>
        <Text style={fiSt.raised}>{item.raised}</Text>
        <Text style={fiSt.sep}> / </Text>
        <Text style={fiSt.goal}>{item.goal}</Text>
        <View style={fiSt.spacer} />
        <Text style={fiSt.org}>{item.org}</Text>
      </View>
    </View>
  </TouchableOpacity>
));

// ✅ FIX: Styles updated to remove the "card" look and integrate into the screen
const fiSt = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    // Removed backgroundColor, borderRadius, and shadow properties
    paddingVertical: sp(14), // Increased vertical padding
    borderBottomWidth: StyleSheet.hairlineWidth, // Added a subtle separator line
    borderBottomColor: P.border,
  },
  thumb: {
    width: sp(64),
    height: sp(64),
    borderRadius: sp(10),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: sp(12),
  },
  emoji: { fontSize: sp(28) },
  info: { flex: 1 },
  title: {
    fontSize: sp(14),
    fontWeight: '700',
    color: P.dark,
    marginBottom: sp(8),
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: sp(6),
  },
  raised: { fontSize: sp(12), fontWeight: '700', color: P.teal },
  sep: { fontSize: sp(12), color: P.light },
  goal: { fontSize: sp(12), color: P.light },
  spacer: { flex: 1 },
  org: { fontSize: sp(11), color: P.light },
});

export default FeaturedItem;