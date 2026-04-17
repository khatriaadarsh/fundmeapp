// src/screens/auth/CheckUserComponents.jsx

import React, { memo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon           from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient'; // ← already in your project
import { P, sp }      from '../../theme/theme';

// ── Gradient stop colours ────────────────────────────────────
const GRAD_START = '#0A3D62'; // deep ocean blue  (top-left)
const GRAD_MID   = '#0E6E85'; // mid transition
const GRAD_END   = '#15AABF'; // bright teal      (bottom-right)

// ════════════════════════════════════════════════════════════
//  HeroSection  — FIXED: uses LinearGradient, not CSS string
// ════════════════════════════════════════════════════════════
export const HeroSection = memo(() => (
  <LinearGradient
    colors={[GRAD_START, GRAD_MID, GRAD_END]}
    start={{ x: 0.0, y: 0.0 }}   // top-left  → 135 deg diagonal
    end={{ x: 1.0, y: 1.0 }}     // bottom-right
    style={heroSt.container}
  >
    {/* Decorative circles */}
    <View style={heroSt.circle1} />
    <View style={heroSt.circle2} />

    <View style={heroSt.content}>
      <View style={heroSt.logoRow}>
        <Text style={heroSt.logo}>FundMe</Text>
        <Text style={heroSt.heart}> ♥</Text>
      </View>
      <Text style={heroSt.tagline}>
        Empowering Hope, One Donation at a Time
      </Text>
    </View>
  </LinearGradient>
));

const heroSt = StyleSheet.create({
  container: {
    position: 'absolute',
    top:   0,
    left:  0,
    right: 0,
    height: sp(260),
    borderBottomLeftRadius:  sp(32),
    borderBottomRightRadius: sp(32),
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    width:  sp(200),
    height: sp(200),
    borderRadius:    sp(100),
    backgroundColor: 'rgba(63, 167, 180, 0.18)',
    top:   sp(-40),
    right: sp(-40),
  },
  circle2: {
    position: 'absolute',
    width:  sp(140),
    height: sp(140),
    borderRadius:    sp(70),
    backgroundColor: 'rgba(0,180,204,0.12)',
    bottom: sp(-20),
    left:   sp(-20),
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: sp(40),
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sp(8),
  },
  logo: {
    fontSize: sp(30),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  heart: {
    fontSize: sp(22),
    color: '#00B4CC',
    fontWeight: '800',
  },
  tagline: {
    fontSize: sp(13),
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'center',
    lineHeight: sp(19),
    paddingHorizontal: sp(30),
  },
});

// ════════════════════════════════════════════════════════════
//  FloatingCard
// ════════════════════════════════════════════════════════════
export const FloatingCard = memo(({ children }) => (
  <View style={cardSt.card}>{children}</View>
));

const cardSt = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: sp(20),
    padding: sp(24),
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
  },
});

// ════════════════════════════════════════════════════════════
//  EmailInputField
// ════════════════════════════════════════════════════════════
export const EmailInputField = memo(({
  value,
  onChangeText,
  onFocus,
  onBlur,
  isFocused,
  isValid,
  hasError,
  isLoading,
  errorMsg,
  helperMsg,
}) => {
  const borderColor = hasError
    ? '#EF4444'
    : isFocused
      ? '#00B4CC'
      : '#E5E7EB';

  const iconColor = isFocused ? '#00B4CC' : '#B0B7C3';

  return (
    <View style={inSt.wrapper}>
      <View style={inSt.labelRow}>
        <Text style={inSt.label}>Email Address</Text>
        <Text style={inSt.star}> *</Text>
      </View>

      <View style={[inSt.box, { borderColor }]}>
        <Icon
          name="mail"
          size={sp(18)}
          color={iconColor}
          style={inSt.leftIcon}
        />
        <TextInput
          style={inSt.field}
          value={value}
          onChangeText={onChangeText}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder="you@example.com"
          placeholderTextColor="#B0B7C3"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoading}
          returnKeyType="done"
        />
        {isValid && !hasError && (
          <Icon
            name="check-circle"
            size={sp(18)}
            color="#22C55E"
            style={inSt.rightIcon}
          />
        )}
      </View>

      {hasError && errorMsg ? (
        <View style={inSt.errorRow}>
          <Icon name="alert-circle" size={sp(13)} color="#EF4444" style={inSt.errorIcon} />
          <Text style={inSt.errorTxt}>{errorMsg}</Text>
        </View>
      ) : helperMsg ? (
        <Text style={inSt.helperTxt}>{helperMsg}</Text>
      ) : null}
    </View>
  );
});

const inSt = StyleSheet.create({
  wrapper:  { width: '100%', marginBottom: sp(4) },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: sp(8) },
  label:    { fontSize: sp(13), fontWeight: '600', color: '#111827' },
  star:     { fontSize: sp(13), fontWeight: '700', color: '#EF4444' },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    height: sp(52),
    borderWidth: 1.5,
    borderRadius: sp(10),
    backgroundColor: '#FFFFFF',
    paddingHorizontal: sp(14),
  },
  leftIcon:  { marginRight: sp(10) },
  rightIcon: { marginLeft: sp(8)   },
  field: {
    flex: 1,
    fontSize: sp(14),
    color: '#111827',
    paddingVertical: 0,
  },
  errorRow:  { flexDirection: 'row', alignItems: 'center', marginTop: sp(7) },
  errorIcon: { marginRight: sp(5) },
  errorTxt:  { fontSize: sp(12), color: '#EF4444', flex: 1 },
  helperTxt: { fontSize: sp(12), color: '#B0B7C3', marginTop: sp(7) },
});

// ════════════════════════════════════════════════════════════
//  ContinueButton
// ════════════════════════════════════════════════════════════
export const ContinueButton = memo(({ onPress, isLoading, disabled }) => (
  <TouchableOpacity
    style={[btnSt.btn, disabled && btnSt.disabled]}
    onPress={onPress}
    activeOpacity={0.85}
    disabled={isLoading || disabled}
  >
    {isLoading ? (
      <ActivityIndicator color="#FFFFFF" size="small" />
    ) : (
      <>
        <Text style={btnSt.txt}>Continue</Text>
        <Icon name="arrow-right" size={sp(16)} color="#FFFFFF" style={btnSt.icon} />
      </>
    )}
  </TouchableOpacity>
));

const btnSt = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: sp(52),
    backgroundColor: GRAD_START,   // same dark ocean as gradient start
    borderRadius: sp(12),
    elevation: 3,
    shadowColor: GRAD_START,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    marginTop: sp(20),
  },
  disabled: { opacity: 0.55 },
  txt:  { fontSize: sp(15), fontWeight: '700', color: '#FFFFFF' },
  icon: { marginLeft: sp(6) },
});

// ════════════════════════════════════════════════════════════
//  TrustBadges
// ════════════════════════════════════════════════════════════
export const TrustBadges = memo(() => (
  <View style={badgeSt.row}>
    {[
      { emoji: '🛡️', label: 'Secure'    },
      { emoji: '✓',  label: 'Verified'  },
      { emoji: '🔒', label: 'Encrypted' },
    ].map(b => (
      <View key={b.label} style={badgeSt.badge}>
        <Text style={badgeSt.emoji}>{b.emoji}</Text>
        <Text style={badgeSt.label}>{b.label}</Text>
      </View>
    ))}
  </View>
));

const badgeSt = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: sp(20),
    marginTop: sp(28),
    marginBottom: sp(16),
  },
  badge: { flexDirection: 'row', alignItems: 'center', gap: sp(5) },
  emoji: { fontSize: sp(13) },
  label: { fontSize: sp(11), color: '#6B7280' },
});

// ════════════════════════════════════════════════════════════
//  FooterLinks
// ════════════════════════════════════════════════════════════
export const FooterLinks = memo(() => (
  <View style={footSt.wrap}>
    <Text style={footSt.caption}>By continuing, you agree to our</Text>
    <Text style={footSt.links}>Terms of Service · Privacy Policy</Text>
  </View>
));

const footSt = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingBottom: sp(24),
  },
  caption: {
    fontSize: sp(11),
    color: '#B0B7C3',
    marginBottom: sp(4),
  },
  links: {
    fontSize: sp(11),
    color: GRAD_START,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});