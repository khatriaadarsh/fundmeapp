// src/components/shared/FilterTabs.jsx
import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { P, sp } from '../../theme/theme';

const FilterTabs = memo(({ tabs, active, onChange }) => (
  <View style={styles.container}>
    {tabs.map(tab => {
      const isActive = active === tab;
      return (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, isActive && styles.activeTab]}
          onPress={() => onChange(tab)}
          activeOpacity={0.75}
        >
          <Text style={[styles.label, isActive && styles.activeLabel]}>
            {tab}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
));

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: sp(16),
    marginBottom: sp(14),
    backgroundColor: '#F1F5F9', // Light gray track
    borderRadius: sp(28),
    padding: sp(3),
  },
  tab: {
    flex: 1,
    paddingVertical: sp(8),
    borderRadius: sp(25),
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: P.darkOcean, // Matches primary banner
    elevation: 2,
    // shadowColor: '#000',
    shadowColor: 'P.darkOcean',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
  },
  label: {
    fontSize: sp(13),
    fontWeight: '600',
    color: P.gray,
  },
  activeLabel: {
    color: P.white,
  },
});

export default FilterTabs;