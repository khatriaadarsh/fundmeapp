// src/screens/campaign/shared.js
// ─────────────────────────────────────────────────────────────
//  Shared design tokens, scale helpers & reusable components
//  for all 4 Campaign Creation screens
// ─────────────────────────────────────────────────────────────

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// ── Responsive helpers ─────────────────────────────────────
const { width, height } = Dimensions.get('window');
// Base design was built on 390pt wide screen
export const rs = size => (width / 390) * size; // horizontal scale
export const vs = size => (height / 844) * size; // vertical scale
export const ms = (size, factor = 0.5) => size + (rs(size) - size) * factor;

// ── Colour tokens ──────────────────────────────────────────
export const C = {
  // Backgrounds
  screenBg: '#F2F3F5',
  white: '#FFFFFF',
  inputBg: '#FFFFFF',

  // Text
  dark: '#111827',
  mid: '#374151',
  gray: '#6B7280',
  light: '#9CA3AF',
  placeholder: '#B0B7C3',

  // Brand
  teal: '#00B4CC',
  tealDark: '#0097AA',
  navy: '#1B2B4B',
  green: '#22C55E',
  greenDark: '#16A34A',
  greenLight: '#DCFCE7',
  red: '#EF4444',
  pdfRed: '#DC2626',

  // Borders
  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  // Info banner
  infoBg: '#EFF8FF',
  infoBorder: '#BAE6FD',
  infoText: '#0369A1',

  // Badges
  urgentBg: '#FEE2E2',
  urgentText: '#DC2626',
  medicalBg: '#EFF6FF',
  medicalText: '#2563EB',

  // Progress
  progressBg: '#E5E7EB',
  progressLine: '#00B4CC',
  progressGreen: '#22C55E',
};

// ── Step progress bar ──────────────────────────────────────
export const StepProgressBar = ({ step, total, color }) => (
  <View style={pb.row}>
    {Array.from({ length: total }, (_, i) => (
      <View
        key={i}
        style={[
          pb.seg,
          { backgroundColor: i < step ? color || C.teal : C.progressBg },
        ]}
      />
    ))}
  </View>
);
const pb = StyleSheet.create({
  row: { flexDirection: 'row', gap: rs(4), height: vs(3) },
  seg: { flex: 1, borderRadius: rs(2) },
});

// ── Top navigation header ──────────────────────────────────
export const NavHeader = ({
  title,
  step,
  total,
  onLeft,
  leftIcon = 'arrow-left',
  progressColor,
}) => (
  <View style={nh.wrap}>
    <View style={nh.row}>
      <TouchableOpacity onPress={onLeft} style={nh.iconBtn} activeOpacity={0.7}>
        <Icon name={leftIcon} size={ms(22)} color={C.dark} />
      </TouchableOpacity>
      <Text style={nh.title}>{title}</Text>
      <Text style={nh.step}>
        {step} of {total}
      </Text>
    </View>
    <StepProgressBar step={step} total={total} color={progressColor} />
  </View>
);
const nh = StyleSheet.create({
  wrap: {
    backgroundColor: C.white,
    paddingTop: vs(6),
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingHorizontal: rs(16),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: vs(10),
  },
  iconBtn: { padding: rs(4) },
  title: { fontSize: ms(16), fontWeight: '700', color: C.dark },
  step: {
    fontSize: ms(13),
    color: C.gray,
    fontWeight: '500',
    minWidth: rs(36),
    textAlign: 'right',
  },
});

// ── Field label ────────────────────────────────────────────
export const FieldLabel = ({ label, counter }) => (
  <View style={fl.row}>
    <Text style={fl.label}>{label}</Text>
    {counter !== undefined && <Text style={fl.counter}>{counter}</Text>}
  </View>
);
const fl = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(6),
  },
  label: { fontSize: ms(13), fontWeight: '600', color: C.dark },
  counter: { fontSize: ms(12), color: C.light },
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
    <View style={dr.wrap}>
      {label && <FieldLabel label={label} />}
      <TouchableOpacity
        style={[dr.trigger, open && dr.triggerOpen]}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        {leftIcon && (
          <Icon
            name={leftIcon}
            size={ms(16)}
            color={C.light}
            style={dr.leftIcon}
          />
        )}
        <Text style={[dr.val, !value && dr.placeholder]} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Icon name="chevron-down" size={ms(18)} color={C.light} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity
          style={dr.overlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={dr.sheet}>
            <Text style={dr.sheetTitle}>{label || placeholder}</Text>
            <FlatList
              data={options}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[dr.option, value === item && dr.optionActive]}
                  onPress={() => {
                    onSelect(item);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[dr.optionTxt, value === item && dr.optionTxtActive]}
                  >
                    {item}
                  </Text>
                  {value === item && (
                    <Icon name="check" size={ms(16)} color={C.teal} />
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
const dr = StyleSheet.create({
  wrap: { marginBottom: vs(16) },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: rs(8),
    backgroundColor: C.inputBg,
    paddingHorizontal: rs(12),
    height: vs(48),
    minHeight: 44,
  },
  triggerOpen: { borderColor: C.teal },
  leftIcon: { marginRight: rs(8) },
  val: { flex: 1, fontSize: ms(14), color: C.dark },
  placeholder: { color: C.placeholder },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: rs(20),
    borderTopRightRadius: rs(20),
    paddingTop: vs(16),
    paddingBottom: vs(40),
    maxHeight: height * 0.55,
  },
  sheetTitle: {
    fontSize: ms(15),
    fontWeight: '700',
    color: C.dark,
    textAlign: 'center',
    paddingBottom: vs(12),
    borderBottomWidth: 1,
    borderColor: C.border,
    marginHorizontal: rs(20),
    marginBottom: vs(8),
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: vs(13),
    paddingHorizontal: rs(24),
  },
  optionActive: { backgroundColor: 'rgba(0,180,204,0.06)' },
  optionTxt: { fontSize: ms(14), color: C.dark },
  optionTxtActive: { color: C.teal, fontWeight: '700' },
});

// ── Dual button row (Back + Next) ──────────────────────────
export const DualButtons = ({
  onBack,
  onNext,
  nextLabel = 'Next',
  disabled,
}) => (
  <View style={db.wrap}>
    <TouchableOpacity style={db.back} onPress={onBack} activeOpacity={0.8}>
      <Icon name="arrow-left" size={ms(15)} color={C.dark} />
      <Text style={db.backTxt}>Back</Text>
    </TouchableOpacity>
    <TouchableOpacity
      style={[db.next, disabled && db.nextDisabled]}
      onPress={onNext}
      activeOpacity={0.85}
      disabled={disabled}
    >
      <Text style={db.nextTxt}>{nextLabel}</Text>
      <Icon name="arrow-right" size={ms(15)} color={C.white} />
    </TouchableOpacity>
  </View>
);
const db = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: rs(10),
    paddingHorizontal: rs(16),
    paddingVertical: vs(12),
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  back: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(6),
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: rs(10),
    paddingVertical: vs(13),
    backgroundColor: C.white,
  },
  backTxt: { fontSize: ms(15), fontWeight: '600', color: C.dark },
  next: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(6),
    backgroundColor: C.navy,
    borderRadius: rs(10),
    paddingVertical: vs(13),
  },
  nextDisabled: { opacity: 0.5 },
  nextTxt: { fontSize: ms(15), fontWeight: '700', color: C.white },
});
