import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, SPACING } from '../../theme';

const ProgressBar = memo(({ progress = 0, variant = 'primary' }) => {
  const progressPercentage = Math.min(Math.max(progress, 0), 100);
  
  const fillColor = {
    primary: COLORS.primary,
    success: COLORS.success,
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.fill,
          {
            width: `${progressPercentage}%`,
            backgroundColor: fillColor[variant] || fillColor.primary,
          },
        ]}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    marginHorizontal: SPACING.screenPadding,
    marginBottom: SPACING.xl,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
});

export default ProgressBar;