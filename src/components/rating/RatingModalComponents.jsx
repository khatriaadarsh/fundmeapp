// src/components/rating/RatingModalComponents.jsx
// PURE REACT NATIVE — no div / className / web tags.

import React, { memo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import { sp, COLORS, GRAD_START, GRAD_MID, GRAD_END } from './ratingTheme';

/* ── Gradient icon badge ── */
export const GradientBadge = memo(({ icon, size = 76, iconSize = 30 }) => (
  <LinearGradient
    colors={[GRAD_START, GRAD_MID, GRAD_END]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={[
      badgeSt.circle,
      { width: sp(size), height: sp(size), borderRadius: sp(size / 2) },
    ]}
  >
    <Icon name={icon} size={sp(iconSize)} color={COLORS.white} />
  </LinearGradient>
));

const badgeSt = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: sp(20),
    elevation: 6,
    shadowColor: GRAD_START,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
});

/* ── Shared gradient button ── */
export const GradientButton = memo(
  ({ label, onPress, disabled, submitting }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      style={[btnSt.wrap, disabled && btnSt.disabled]}
    >
      <LinearGradient
        colors={[GRAD_START, GRAD_MID, GRAD_END]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={btnSt.btn}
      >
        {submitting ? (
          <ActivityIndicator color={COLORS.white} size="small" />
        ) : (
          <Text style={btnSt.txt}>{label}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  ),
);

const btnSt = StyleSheet.create({
  wrap: { borderRadius: sp(26), overflow: 'hidden', marginBottom: sp(10) },
  btn: { height: sp(54), alignItems: 'center', justifyContent: 'center' },
  txt: {
    fontSize: sp(15),
    fontWeight: '800',
    color: COLORS.white,
    letterSpacing: 0.6,
  },
  disabled: { opacity: 0.5 },
});

/* ── STEP 1: Prompt — matches the design image ──
   Badge (speech bubble) → title → 3 big icons → SUBMIT button.
   User selects an icon (it highlights), then presses SUBMIT.        */
export const PromptStep = memo(({ title, selected, onSelect, onSubmit }) => {
  const options = [
    { key: 'dislike', icon: 'thumbs-down' },
    { key: 'like', icon: 'thumbs-up' },
    { key: 'love', icon: 'heart' },
  ];

  return (
    <View style={promptSt.container}>
      <GradientBadge icon="message-circle" size={80} iconSize={34} />

      <Text style={promptSt.title}>{title}</Text>

      <View style={promptSt.row}>
        {options.map((opt) => {
          const active = selected === opt.key;
          return (
            <TouchableOpacity
              key={opt.key}
              activeOpacity={0.75}
              onPress={() => onSelect(opt.key)}
              style={[promptSt.item, active && promptSt.itemActive]}
            >
              <Icon
                name={opt.icon}
                size={sp(32)}
                color={active ? COLORS.white : GRAD_START}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      <GradientButton
        label="SUBMIT"
        onPress={onSubmit}
        disabled={!selected}
      />
    </View>
  );
});

const promptSt = StyleSheet.create({
  container: { paddingBottom: sp(6) },
  title: {
    fontSize: sp(26),
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: sp(34),
    marginBottom: sp(30),
    paddingHorizontal: sp(10),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: sp(26),
    marginBottom: sp(34),
  },
  item: {
    width: sp(72),
    height: sp(72),
    borderRadius: sp(36),
    backgroundColor: '#EEF6F8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  itemActive: {
    backgroundColor: GRAD_START,
    borderColor: GRAD_MID,
  },
});

/* ── (kept for backward compatibility) simple picker ── */
export const SentimentPicker = memo(({ onSelect, disabled }) => (
  <View style={promptSt.row}>
    {[
      { key: 'dislike', icon: 'thumbs-down' },
      { key: 'like', icon: 'thumbs-up' },
      { key: 'love', icon: 'heart' },
    ].map((opt) => (
      <TouchableOpacity
        key={opt.key}
        style={promptSt.item}
        activeOpacity={0.7}
        disabled={disabled}
        onPress={() => onSelect(opt.key)}
      >
        <Icon name={opt.icon} size={sp(32)} color={GRAD_START} />
      </TouchableOpacity>
    ))}
  </View>
));

/* ── Result step ── */
export const ResultPanel = memo(
  ({
    icon,
    title,
    subtitle,
    primaryLabel,
    secondaryLabel,
    onPrimary,
    onSecondary,
  }) => (
    <View>
      <GradientBadge icon={icon} />
      <Text style={resSt.title}>{title}</Text>
      <Text style={resSt.subtitle}>{subtitle}</Text>

      <GradientButton label={primaryLabel} onPress={onPrimary} />

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onSecondary}
        style={resSt.secondaryBtn}
      >
        <Text style={resSt.secondaryTxt}>{secondaryLabel}</Text>
      </TouchableOpacity>
    </View>
  ),
);

const resSt = StyleSheet.create({
  title: {
    fontSize: sp(21),
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: sp(8),
  },
  subtitle: {
    fontSize: sp(13.5),
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: sp(20),
    marginBottom: sp(22),
    paddingHorizontal: sp(6),
  },
  secondaryBtn: {
    height: sp(52),
    borderRadius: sp(26),
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryTxt: { fontSize: sp(14), fontWeight: '700', color: COLORS.textPrimary },
});

/* ── 5-star selector ── */
export const StarRating = memo(({ value, onChange, disabled }) => (
  <View style={starSt.row}>
    {[1, 2, 3, 4, 5].map((i) => (
      <TouchableOpacity
        key={i}
        disabled={disabled}
        hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
        onPress={() => onChange(i)}
      >
        <Icon
          name="star"
          size={sp(34)}
          color={i <= value ? COLORS.star : COLORS.starEmpty}
        />
      </TouchableOpacity>
    ))}
  </View>
));

const starSt = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: sp(10),
    marginBottom: sp(18),
  },
});

/* ── Feedback form ── */
export const FeedbackForm = memo(
  ({
    title,
    subtitle,
    placeholder,
    stars,
    onChangeStars,
    message,
    onChangeMessage,
    onSubmit,
    submitting,
  }) => (
    <View>
      <GradientBadge icon="edit-3" />
      <Text style={resSt.title}>{title}</Text>
      <Text style={resSt.subtitle}>{subtitle}</Text>

      <StarRating value={stars} onChange={onChangeStars} disabled={submitting} />

      <TextInput
        style={fbSt.input}
        value={message}
        onChangeText={onChangeMessage}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textMuted}
        multiline
        textAlignVertical="top"
        editable={!submitting}
        maxLength={500}
      />

      <GradientButton
        label="SUBMIT"
        onPress={onSubmit}
        disabled={submitting || stars === 0}
        submitting={submitting}
      />
    </View>
  ),
);

const fbSt = StyleSheet.create({
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: sp(14),
    minHeight: sp(84),
    maxHeight: sp(120),
    padding: sp(14),
    fontSize: sp(13.5),
    color: COLORS.textPrimary,
    marginBottom: sp(16),
  },
});

/* ── Thank you ── */
export const ThankYou = memo(({ title, subtitle }) => (
  <View style={{ paddingBottom: sp(4) }}>
    <GradientBadge icon="check" />
    <Text style={resSt.title}>{title}</Text>
    <Text style={[resSt.subtitle, { marginBottom: sp(6) }]}>{subtitle}</Text>
  </View>
));
