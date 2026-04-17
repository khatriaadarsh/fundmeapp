// src/components/shared/SectionHeader.jsx
import React, { memo } from 'react';
import { Text,View, StyleSheet } from 'react-native';
import { P, sp } from '../../theme/theme';

const SectionHeader = memo(({ title, linkText, onPress }) => (
  <View style={styles.wrap}>
    <Text style={styles.title}>{title}</Text>
    {linkText && <Text style={styles.link} onPress={onPress}>{linkText}</Text>}
  </View>
));

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: sp(12) },
  title: { fontSize: sp(18), fontWeight: '800', color: P.dark },
  link: { fontSize: sp(13), fontWeight: '600', color: P.teal },
});

export default SectionHeader;