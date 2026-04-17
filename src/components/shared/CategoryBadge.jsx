// src/components/shared/CategoryBadge.jsx
import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
// import { P, sp } from '../../theme/theme';
import { P, sp } from '../../theme/theme'; 

const CategoryBadge = memo(({ category }) => {
  const color = P.categoryColors[category] ?? P.categoryColors.default;
  const label = category
    ? category.charAt(0).toUpperCase() + category.slice(1)
    : 'General';

  return (
    <View style={[styles.pill, { backgroundColor: color.bg }]}>
      <Text style={[styles.text, { color: color.text }]}>{label}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: sp(10),
    paddingVertical: sp(4),
    borderRadius: sp(20),
    marginBottom: sp(8),
  },
  text: { fontSize: sp(11), fontWeight: '700' },
});

export default CategoryBadge;