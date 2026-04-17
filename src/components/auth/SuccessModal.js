import React, { useEffect, useRef, memo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import GradientButton from '../common/GradientButton';
import { COLORS, SPACING, TYPOGRAPHY, scale } from '../../theme';

const SuccessModal = memo(({ visible, onClose, title, message, tips = [] }) => {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    if (!visible) return;

    opacityAnim.setValue(0);
    scaleAnim.setValue(0.88);

    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 230,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, opacityAnim, scaleAnim]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.card,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>

            {/* Icon */}
            <View style={styles.iconCircle}>
              <Text style={styles.iconEmoji}>🪪</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>{title}</Text>

            {/* Message */}
            <Text style={styles.message}>{message}</Text>

            {/* Tips */}
            {tips.length > 0 && (
              <View style={styles.tipsContainer}>
                <Text style={styles.tipsTitle}>For best results ensure:</Text>
                {tips.map((tip, index) => (
                  <View key={index} style={styles.tipRow}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Button */}
            <GradientButton title="Got it!" onPress={onClose} />
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: SPACING.xl,
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.xxl + SPACING.sm,
    paddingBottom: SPACING.xxl,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: scale(30),
    height: scale(30),
    borderRadius: scale(15),
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  closeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.textSecondary,
  },
  iconCircle: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(32),
    backgroundColor: '#E0F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  iconEmoji: {
    fontSize: scale(32),
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontFamily: TYPOGRAPHY.fontFamily.extraBold,
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  message: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.fontSize.sm * 1.5,
    marginBottom: SPACING.lg,
  },
  tipsContainer: {
    backgroundColor: '#F0FDFF',
    borderRadius: SPACING.borderRadius,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  tipsTitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    color: COLORS.primaryDark,
    marginBottom: SPACING.gapSm,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: SPACING.xs,
  },
  bullet: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.primary,
    marginRight: SPACING.gapSm,
    lineHeight: TYPOGRAPHY.fontSize.xs * 1.5,
  },
  tipText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    color: COLORS.textSecondary,
    lineHeight: TYPOGRAPHY.fontSize.xs * 1.5,
  },
});

export default SuccessModal;