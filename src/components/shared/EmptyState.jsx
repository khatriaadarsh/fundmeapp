// src/components/shared/EmptyState.jsx
import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icons from 'react-native-vector-icons/Feather';
import { P, sp } from '../../theme/theme';

const EmptyState = memo(({ query }) => (
  <View style={styles.wrap}>
    <Icons name="search" size={sp(48)} color={P.border} />
    <Text style={styles.title}>No results found</Text>
    <Text style={styles.sub}>
      {query
        ? `We couldn't find anything for "${query}"`
        : 'Start typing to search campaigns'}
    </Text>
  </View>
));

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: sp(60),
  },
  title: {
    fontSize: sp(16),
    fontWeight: '700',
    color: P.dark,
    marginTop: sp(16),
    marginBottom: sp(6),
  },
  sub: {
    fontSize: sp(13),
    color: P.light,
    textAlign: 'center',
    paddingHorizontal: sp(40),
  },
});

export default EmptyState;