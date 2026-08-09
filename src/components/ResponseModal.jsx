// src/components/ResponseModal.jsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import Icons from 'react-native-vector-icons/Feather';
const { width: SW } = Dimensions.get('window');
const scale = n => (SW / 375) * n;
// Matches the CampaignDetail and MyDonations primary branding palette perfectly
const C = {
  white: '#FFFFFF',
  dark: '#0D4F6B', // Changed from Slate dark to your primary app Theme Teal
  mid: '#334155',
  gray: '#64748B',
  border: '#E2E8F0',
  red: '#EF4444',
  redDeep: '#DC2626',
  green: '#059669',
  greenLight: '#10B981',
  overlay: 'rgba(15,23,42,0.55)',
};
const ResponseModal = ({
  visible,
  variant = 'error', // 'error' | 'success'
  title,
  message,
  code,
  buttonText = 'OK',
  onClose,
}) => {
  const isError = variant !== 'success';
  const iconBg = isError ? C.red : C.green;
  const iconName = isError ? 'x' : 'check';
  const heading = title || (isError ? 'Error' : 'Success');
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={rm.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={rm.sheet}>
          <View style={rm.handle} />
          <View style={[rm.iconCircle, { backgroundColor: iconBg }]}>
            <Icons name={iconName} size={scale(30)} color={C.white} />
          </View>
          <Text style={rm.title}>{heading}</Text>
          {!!message && <Text style={rm.message}>{message}</Text>}
          {!!code && <Text style={rm.code}>Code: {code}</Text>}
          {/* Button color changed to your brand primary teal C.dark (#0D4F6B) */}
          <TouchableOpacity 
            style={[rm.btn, { backgroundColor: C.dark }]} 
            onPress={onClose} 
            activeOpacity={0.85}
          >
            <Text style={rm.btnTxt}>{buttonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
const rm = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: C.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: scale(24),
    borderTopRightRadius: scale(24),
    paddingHorizontal: scale(24),
    paddingTop: scale(12),
    paddingBottom: Platform.OS === 'ios' ? scale(36) : scale(24),
    alignItems: 'center',
  },
  handle: {
    width: scale(36),
    height: scale(4),
    borderRadius: scale(2),
    backgroundColor: C.border,
    marginBottom: scale(20),
  },
  iconCircle: {
    width: scale(64),
    height: scale(64),
    borderRadius: scale(32),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: scale(16),
  },
  title: {
    fontSize: scale(18),
    fontWeight: '800',
    color: '#111827',
    marginBottom: scale(8),
  },
  message: {
    fontSize: scale(14),
    color: C.mid,
    textAlign: 'center',
    lineHeight: scale(20),
    marginBottom: scale(6),
  },
  code: {
    fontSize: scale(11),
    color: C.gray,
    marginBottom: scale(20),
  },
  btn: {
    width: '100%',
    borderRadius: scale(14),
    paddingVertical: scale(15),
    alignItems: 'center',
    marginTop: scale(6),
  },
  btnTxt: {
    fontSize: scale(15),
    fontWeight: '700',
    color: C.white,
  },
});
export default ResponseModal;
