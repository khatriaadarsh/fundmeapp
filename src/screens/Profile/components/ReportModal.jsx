// src/screens/Profile/components/ReportModal.jsx
// ─────────────────────────────────────────────────────────────
//  ReportModal — Bottom sheet: Report / Block / Share / Copy link
// ─────────────────────────────────────────────────────────────

import React, { memo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import Icons from 'react-native-vector-icons/Feather';

const { width: SW, height: SH } = Dimensions.get('window');
const sp = n => (SW / 375) * n;

const P = {
  dark:   '#111827',
  gray:   '#6B7280',
  red:    '#EF4444',
  white:  '#FFFFFF',
  border: '#E5E7EB',
  bg:     '#F4F5F7',
};

const ACTIONS = [
  { icon: 'flag',        label: 'Report this user',  color: P.red,  key: 'report' },
  { icon: 'slash',       label: 'Block user',         color: P.red,  key: 'block'  },
  { icon: 'share-2',     label: 'Share profile',      color: P.dark, key: 'share'  },
  { icon: 'link',        label: 'Copy profile link',  color: P.dark, key: 'copy'   },
];

const ReportModal = memo(({ visible, onClose, onAction }) => {
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible,slideAnim]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={s.overlay} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[s.sheet, { transform: [{ translateY: slideAnim }] }]}
      >
        {/* Handle */}
        <View style={s.handle} />

        {/* Title */}
        <Text style={s.title}>Options</Text>

        {/* Actions */}
        {ACTIONS.map(action => (
          <TouchableOpacity
            key={action.key}
            style={s.row}
            onPress={() => { onAction?.(action.key); onClose(); }}
            activeOpacity={0.7}
          >
            <View style={[s.iconWrap, action.color === P.red && s.iconWrapRed]}>
              <Icons name={action.icon} size={sp(18)} color={action.color} />
            </View>
            <Text style={[s.rowLabel, action.color === P.red && s.rowLabelRed]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}

        {/* Cancel */}
        <TouchableOpacity style={s.cancelBtn} onPress={onClose} activeOpacity={0.8}>
          <Text style={s.cancelTxt}>Cancel</Text>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
});

export default ReportModal;

const s = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: P.white,
    borderTopLeftRadius:  sp(24),
    borderTopRightRadius: sp(24),
    paddingHorizontal: sp(20),
    paddingBottom: sp(34),
    paddingTop: sp(12),
  },
  handle: {
    width: sp(40),
    height: sp(4),
    borderRadius: sp(2),
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: sp(16),
  },
  title: {
    fontSize: sp(15),
    fontWeight: '700',
    color: P.dark,
    marginBottom: sp(16),
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: sp(14),
    borderBottomWidth: 1,
    borderBottomColor: P.border,
    gap: sp(14),
  },
  iconWrap: {
    width: sp(38),
    height: sp(38),
    borderRadius: sp(19),
    backgroundColor: P.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapRed: { backgroundColor: '#FEF2F2' },
  rowLabel:    { fontSize: sp(14), fontWeight: '600', color: P.dark },
  rowLabelRed: { color: P.red },
  cancelBtn: {
    marginTop: sp(14),
    height: sp(50),
    borderRadius: sp(12),
    backgroundColor: P.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: P.border,
  },
  cancelTxt: { fontSize: sp(15), fontWeight: '700', color: P.gray },
});