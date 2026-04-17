// src/components/shared/StepHeader.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icons from 'react-native-vector-icons/Feather';
import { P, sp } from '../../theme/theme';

const StepHeader = ({ step, total, title, onLeft }) => (
  <View style={styles.container}>
    {/* Left Button */}
    <TouchableOpacity onPress={onLeft} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <Icons name="arrow-left" size={sp(22)} color={P.dark} />
    </TouchableOpacity>

    {/* Title */}
    <Text style={styles.title}>{title}</Text>

    {/* Progress Badge */}
    <View style={styles.progressBadge}>
      <Text style={styles.progressText}>{step} of {total}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sp(18),
    paddingVertical: sp(12),
    backgroundColor: P.white,
    borderBottomWidth: 1,
    borderBottomColor: P.border, // Uses Theme Border
  },
  title: {
    fontSize: sp(17),
    fontWeight: '700',
    color: P.dark,
  },
  progressBadge: {
    borderWidth: 1,
    borderColor: P.border, // Uses Theme Border
    borderRadius: sp(20),
    paddingHorizontal: sp(10),
    paddingVertical: sp(4),
  },
  progressText: {
    fontSize: sp(12),
    fontWeight: '600',
    color: P.gray,
  },
});

export default StepHeader;