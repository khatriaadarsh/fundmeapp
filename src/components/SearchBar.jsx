// src/components/SearchBar.jsx
import React, { memo } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import Icons from 'react-native-vector-icons/Feather';
import { P, sp } from '../theme/theme';

const SearchBar = memo(({ value, onChange }) => (
  <View style={srSt.wrap}>
    <Icons name="search" size={sp(15)} color={P.light} style={srSt.icon} />
    <TextInput
      style={srSt.input}
      placeholder="Search campaigns..."
      placeholderTextColor={P.light}
      value={value}
      onChangeText={onChange}
      returnKeyType="search"
    />
  </View>
));

const srSt = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: P.searchBg,
    borderRadius: sp(10),
    marginHorizontal: sp(16),
    marginTop: sp(14),
    marginBottom: sp(16),
    paddingHorizontal: sp(13),
    height: sp(44),
    borderWidth: 1,
    borderColor: P.border,
  },
  icon: { marginRight: sp(8) },
  input: {
    flex: 1,
    fontSize: sp(14),
    color: P.dark,
    paddingVertical: 0,
  },
});

export default SearchBar;