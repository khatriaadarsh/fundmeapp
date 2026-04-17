// src/components/saved/SavedScreenHeader.jsx
import React, { memo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icons from 'react-native-vector-icons/Feather';
import { P, sp } from '../../theme/theme';

const SavedScreenHeader = memo(({ count }) => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>Saved</Text>
    <View style={styles.countBadge}>
      <Icons name="heart" size={sp(12)} color={P.red} />
      <Text style={styles.countText}>{count} saved</Text>
    </View>
  </View>
));

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: P.white,
    paddingHorizontal: sp(16),
    paddingTop: sp(10),
    paddingBottom: sp(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: P.border,
  },
  headerTitle: {
    fontSize: sp(22),
    fontWeight: '800',
    color: P.dark,
    letterSpacing: -0.4,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp(5),
    backgroundColor: '#FEF2F2',
    paddingHorizontal: sp(12),
    paddingVertical: sp(5),
    borderRadius: sp(20),
  },
  countText: {
    fontSize: sp(12),
    fontWeight: '700',
    color: P.red,
  },
});

export default SavedScreenHeader;