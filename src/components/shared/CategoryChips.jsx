// src/components/shared/CategoryChips.jsx

import React, { memo } from 'react';
import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import MCIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { P, sp } from '../../theme/theme';
import { getCategoryIcon } from '../../utils/categoryIcons';

const DEFAULT_CATEGORIES = [
  { id: 'all', name: 'All', label: 'All' },
];

const CIRCLE_SIZE = sp(52);

const CategoryChips = memo(({
  active,
  onChange,
  categories = DEFAULT_CATEGORIES,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.wrap}
    >
      {categories.map((cat) => {
        const id = cat.id || cat.name;
        const label = cat.label || cat.name;
        const isActive = active === id;
        const iconName = getCategoryIcon(cat.name || cat.label || id);

        return (
          <TouchableOpacity
            key={id}
            activeOpacity={0.85}
            onPress={() => onChange?.(id)}
            style={styles.item}
          >
            <View style={[styles.circle, isActive && styles.circleActive]}>
              <MCIcons
                name={iconName}
                size={sp(20)}
                color={isActive ? P.white : P.teal}
              />
            </View>
            <Text
              style={[styles.label, isActive && styles.labelActive]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: sp(16),
    paddingBottom: sp(14),
    gap: sp(16),
  },
  item: {
    alignItems: 'center',
    width: sp(64),
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: 'rgba(0,180,204,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: sp(6),
  },
  circleActive: {
    backgroundColor: P.teal,
  },
  label: {
    fontSize: sp(11.5),
    fontWeight: '600',
    color: P.gray,
    textAlign: 'center',
  },
  labelActive: {
    color: P.dark,
    fontWeight: '700',
  },
});

export default CategoryChips;