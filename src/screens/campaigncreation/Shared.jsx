// src/screens/campaign/Shared.jsx
// ─────────────────────────────────────────────────────────────
//  Shared components & design tokens — Campaign Creation flow
// ─────────────────────────────────────────────────────────────

import React, { useState, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import MCIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FeatherIcons from 'react-native-vector-icons/Feather';

// ─────────────────────────────────────────────────────────────
//  Design tokens  (export so every screen can use C.*)
// ─────────────────────────────────────────────────────────────
export const C = {
  bg: '#F4F5F7',
  white: '#FFFFFF',
  dark: '#1A1A2E',
  navy: '#1B2B4B',
  teal: '#00B4CC',
  tealLight: '#E0F7FA',
  green: '#22C55E',
  greenDark: '#16A34A',
  greenLight: '#DCFCE7',
  red: '#EF4444',
  textGray: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E2E8F0',
  inputBg: '#FFFFFF',
  searchBg: '#F8FAFC',
  progressBg: '#E5E7EB',
  infoBg: '#EBF8FF',
  infoBorder: '#BAE6FD',
  infoText: '#0369A1',
  placeholderColor: '#B0B7C3',
};

// ─────────────────────────────────────────────────────────────
//  IMPORTANT: StyleSheet objects MUST be declared BEFORE the
//  components that reference them.  `const` is NOT hoisted —
//  referencing fl/er/dp/br before their declaration returns
//  undefined and causes "Element type is invalid" crashes.
// ─────────────────────────────────────────────────────────────

// ── FieldLabel styles (defined first) ────────────────────────
const fl = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  left: { flexDirection: 'row', alignItems: 'center' },
  label: { fontSize: 13, fontWeight: '600', color: C.dark },
  star: { fontSize: 13, fontWeight: '700', color: C.red },
  right: { fontSize: 12, color: C.textLight },
  rightWarn: { color: C.red, fontWeight: '600' },
});

// ════════════════════════════════════════════════════════════
//  FieldLabel
//  Props:
//    text      — label string                         required
//    right     — right-side counter/hint string       optional
//    rightWarn — turns right counter red              optional
//    showStar  — shows red mandatory star (default true) optional
// ════════════════════════════════════════════════════════════
export const FieldLabel = memo(
  ({ text, right, rightWarn = false, showStar = true }) => (
    <View style={fl.row}>
      <View style={fl.left}>
        <Text style={fl.label}>{text}</Text>
        {showStar && <Text style={fl.star}> *</Text>}
      </View>
      {right != null && (
        <Text style={[fl.right, rightWarn && fl.rightWarn]}>{right}</Text>
      )}
    </View>
  ),
);

// ── ErrorMsg styles (defined before ErrorMsg) ─────────────────
const er = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  text: { fontSize: 11, color: C.red, flex: 1 },
});

// ════════════════════════════════════════════════════════════
//  ErrorMsg — inline validation error row
// ════════════════════════════════════════════════════════════
export const ErrorMsg = memo(({ msg }) => {
  if (!msg) return null;
  return (
    <View style={er.row}>
      <FeatherIcons
        name="alert-circle"
        size={12}
        color={C.red}
        style={{ marginRight: 4 }}
      />
      <Text style={er.text}>{msg}</Text>
    </View>
  );
});

// ── Dropdown styles (defined before Dropdown) ─────────────────
const dp = StyleSheet.create({
  wrap: { marginBottom: 0 },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 10,
    backgroundColor: C.white,
    paddingHorizontal: 14,
  },
  triggerError: { borderColor: C.red },
  triggerDisabled: { backgroundColor: C.bg },
  leftIcon: { marginRight: 8 },
  val: { flex: 1, fontSize: 14, color: C.dark },
  placeholder: { color: C.placeholderColor },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: C.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === 'android' ? 20 : 34,
    maxHeight: '60%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.dark,
    textAlign: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    marginHorizontal: 20,
    marginBottom: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 22,
  },
  optionActive: { backgroundColor: C.tealLight },
  optTxt: { fontSize: 15, color: C.dark },
  optTxtActive: { color: C.teal, fontWeight: '700' },
});

// ════════════════════════════════════════════════════════════
//  Dropdown — bottom-sheet option picker
//  Props:
//    label       — field label string            optional
//    value       — selected value string         required
//    options     — string[]                      required
//    onSelect    — (val: string) => void         required
//    placeholder — shown when empty              required
//    leftIcon    — MCIcons icon name             optional
//    error       — validation error string       optional
//    disabled    — disables the picker           optional
// ════════════════════════════════════════════════════════════
export const Dropdown = memo(
  ({
    label,
    value,
    options,
    onSelect,
    placeholder,
    leftIcon,
    error,
    disabled = false,
  }) => {
    const [open, setOpen] = useState(false);
    const hasValue = Boolean(value);

    return (
      <View style={dp.wrap}>
        {label != null && <FieldLabel text={label} />}

        <TouchableOpacity
          style={[
            dp.trigger,
            error && dp.triggerError,
            disabled && dp.triggerDisabled,
          ]}
          onPress={() => !disabled && setOpen(true)}
          activeOpacity={disabled ? 1 : 0.8}
          disabled={disabled}
        >
          {leftIcon && (
            <MCIcons
              name={leftIcon}
              size={17}
              color={hasValue ? C.teal : C.textLight}
              style={dp.leftIcon}
            />
          )}
          <Text
            style={[dp.val, (!hasValue || disabled) && dp.placeholder]}
            numberOfLines={1}
          >
            {value || placeholder}
          </Text>
          <FeatherIcons
            name="chevron-down"
            size={16}
            color={disabled ? C.border : C.textLight}
          />
        </TouchableOpacity>

        <ErrorMsg msg={error} />

        <Modal
          visible={open}
          transparent
          animationType="slide"
          onRequestClose={() => setOpen(false)}
        >
          <TouchableOpacity
            style={dp.overlay}
            activeOpacity={1}
            onPress={() => setOpen(false)}
          />
          <View style={dp.sheet}>
            <View style={dp.handle} />
            <Text style={dp.sheetTitle}>{label || placeholder}</Text>
            <FlatList
              data={options}
              keyExtractor={item => item}
              renderItem={({ item }) => {
                const isActive = item === value;
                return (
                  <TouchableOpacity
                    style={[dp.option, isActive && dp.optionActive]}
                    onPress={() => {
                      onSelect(item);
                      setOpen(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[dp.optTxt, isActive && dp.optTxtActive]}>
                      {item}
                    </Text>
                    {isActive && (
                      <FeatherIcons name="check" size={15} color={C.teal} />
                    )}
                  </TouchableOpacity>
                );
              }}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </Modal>
      </View>
    );
  },
);

// ── BtnRow styles (defined before BtnRow) ─────────────────────
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
  nextFull: { flex: 1 },
  nextTxt: { fontSize: 14, fontWeight: '700', color: C.white },
});

// ════════════════════════════════════════════════════════════
//  BtnRow — reusable Back + Next footer
//  Props:
//    onBack     — back press handler
//    onNext     — next press handler
//    nextLabel  — next button label   (default 'Next')
//    hideBack   — hide back button    (default false)
// ════════════════════════════════════════════════════════════
export const BtnRow = memo(
  ({ onBack, onNext, nextLabel = 'Next', hideBack = false }) => (
    <View style={br.wrap}>
      {!hideBack && (
        <TouchableOpacity style={br.back} onPress={onBack} activeOpacity={0.8}>
          <FeatherIcons name="arrow-left" size={15} color={C.dark} />
          <Text style={br.backTxt}>Back</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={[br.next, hideBack && br.nextFull]}
        onPress={onNext}
        activeOpacity={0.85}
      >
        <Text style={br.nextTxt}>{nextLabel}</Text>
        <FeatherIcons name="arrow-right" size={15} color={C.white} />
      </TouchableOpacity>
    </View>
  ),
);
