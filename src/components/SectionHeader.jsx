// src/components/SectionHeader.jsx
import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { P, sp } from '../theme/theme';

const SectionHeader = memo(({ title, linkText, onPress }) => (
  <View style={shSt.wrap}>
    <Text style={shSt.title}>{title}</Text>
    {linkText && (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <Text style={shSt.link}>{linkText}</Text>
      </TouchableOpacity>
    )}
  </View>
));

const shSt = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: sp(16),
    marginTop: sp(22),
    marginBottom: sp(12),
  },
  title: { fontSize: sp(15), fontWeight: '800', color: P.dark },
  link: { fontSize: sp(13), color: P.teal, fontWeight: '600' },
});

export default SectionHeader;