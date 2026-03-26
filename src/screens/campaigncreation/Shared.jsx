// src/screens/campaign/shared.jsx
// ─────────────────────────────────────────────────────────────
//  Shared components & tokens for Campaign Creation screens
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('window');

// ── Design tokens ──────────────────────────────────────────
export const C = {
  bg: '#F4F5F7',
  white: '#FFFFFF',
  dark: '#1A1A2E',
  navy: '#1B2B4B',
  teal: '#00B4CC',
  green: '#22C55E',
  greenDark: '#16A34A',
  greenLight: '#DCFCE7',
  red: '#EF4444',
  textGray: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E2E8F0',
  inputBg: '#FFFFFF',
  progressBg: '#E5E7EB',
  infoBg: '#EBF8FF',
  infoBorder: '#BAE6FD',
  infoText: '#0369A1',
  placeholderColor: '#B0B7C3',
};

// ── Responsive helpers ─────────────────────────────────────
export const W = width;

// ── Step Header ────────────────────────────────────────────
// Screen 1: shows × (close)   — pass isFirst={true}
// Screen 2-4: shows ← (back)  — default
export const StepHeader = ({ step, total, title, onLeft, isFirst }) => (
  <View style={sh.outer}>
    <View style={sh.row}>
      <TouchableOpacity
        onPress={onLeft}
        style={sh.iconBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Icon
          name={isFirst ? 'close' : 'arrow-left'}
          size={22}
          color={C.dark}
        />
      </TouchableOpacity>
      <Text style={sh.title}>{title}</Text>
      <Text style={sh.step}>
        {step} of {total}
      </Text>
    </View>
    {/* Segmented progress bar — fills proportionally */}
    <View style={sh.segsRow}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[
            sh.seg,
            i < step ? (step === total ? sh.segGreen : sh.segTeal) : sh.segGray,
          ]}
        />
      ))}
    </View>
  </View>
);

const sh = StyleSheet.create({
  outer: {
    backgroundColor: C.white,
    paddingTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 12,
  },
  iconBtn: { width: 32, alignItems: 'flex-start' },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: C.dark,
  },
  step: {
    width: 40,
    textAlign: 'right',
    fontSize: 13,
    color: C.textGray,
    fontWeight: '500',
  },
  segsRow: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    gap: 4,
    paddingBottom: 0,
  },
  seg: { flex: 1, height: 2.5, borderRadius: 2 },
  segTeal: { backgroundColor: C.teal },
  segGreen: { backgroundColor: C.green },
  segGray: { backgroundColor: C.progressBg },
});

// ── Bottom button row ──────────────────────────────────────
export const BtnRow = ({ onBack, onNext, nextLabel = 'Next', hideBack }) => (
  <View style={br.wrap}>
    {!hideBack && (
      <TouchableOpacity style={br.back} onPress={onBack} activeOpacity={0.8}>
        <Icon name="arrow-left" size={15} color={C.dark} />
        <Text style={br.backTxt}>Back</Text>
      </TouchableOpacity>
    )}
    <TouchableOpacity
      style={[br.next, hideBack && { flex: 1 }]}
      onPress={onNext}
      activeOpacity={0.85}
    >
      <Text style={br.nextTxt}>{nextLabel}</Text>
      <Icon name="arrow-right" size={15} color={C.white} />
    </TouchableOpacity>
  </View>
);

const br = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  back: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 10,
    paddingVertical: 13,
    backgroundColor: C.white,
  },
  backTxt: { fontSize: 14, fontWeight: '600', color: C.dark },
  next: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: C.navy,
    borderRadius: 10,
    paddingVertical: 13,
  },
  nextTxt: { fontSize: 14, fontWeight: '700', color: C.white },
});

// ── Field label ────────────────────────────────────────────
export const FieldLabel = ({ text, right }) => (
  <View style={fl.row}>
    <Text style={fl.label}>{text}</Text>
    {right && <Text style={fl.right}>{right}</Text>}
  </View>
);
const fl = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: { fontSize: 13, fontWeight: '600', color: C.dark },
  right: { fontSize: 12, color: C.textLight },
});

// ── Dropdown ───────────────────────────────────────────────
export const Dropdown = ({
  label,
  value,
  options,
  onSelect,
  placeholder,
  leftIcon,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ marginBottom: 14 }}>
      {label && <FieldLabel text={label} />}
      <TouchableOpacity
        style={dp.trigger}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        {leftIcon && (
          <Icon
            name={leftIcon}
            size={16}
            color={C.textLight}
            style={dp.leftIcon}
          />
        )}
        <Text style={[dp.val, !value && dp.placeholder]} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Icon name="chevron-down" size={18} color={C.textLight} />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={dp.overlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={dp.sheet}>
            <View style={dp.handle} />
            <Text style={dp.sheetTitle}>{label || placeholder}</Text>
            <FlatList
              data={options}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[dp.opt, value === item && dp.optActive]}
                  onPress={() => {
                    onSelect(item);
                    setOpen(false);
                  }}
                >
                  <Text style={[dp.optTxt, value === item && dp.optTxtActive]}>
                    {item}
                  </Text>
                  {value === item && (
                    <Icon name="check" size={16} color={C.teal} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const dp = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    backgroundColor: C.inputBg,
    paddingHorizontal: 12,
    height: 48,
  },
  leftIcon: { marginRight: 8 },
  val: { flex: 1, fontSize: 14, color: C.dark },
  placeholder: { color: C.placeholderColor },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 36,
    maxHeight: '60%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: C.dark,
    textAlign: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: C.border,
    marginHorizontal: 20,
    marginBottom: 6,
  },
  opt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  optActive: { backgroundColor: 'rgba(0,180,204,0.06)' },
  optTxt: { fontSize: 14, color: C.dark },
  optTxtActive: { color: C.teal, fontWeight: '700' },
});
