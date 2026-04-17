// src/components/shared/ProgressBar.jsx
import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { P, sp } from '../../theme/theme';

const ProgressBar = memo(({ pct, color = P.green }) => (
  <View style={styles.bg}>
    <View style={[styles.fill, { width: `${Math.min(pct, 100)}%`, backgroundColor: color }]} />
  </View>
));

const styles = StyleSheet.create({
  bg: {
    height: sp(4),
    backgroundColor: P.border,
    borderRadius: sp(2),
    overflow: 'hidden',
  },
  fill: {
    height: sp(4),
    borderRadius: sp(2),
  },
});

export default ProgressBar;