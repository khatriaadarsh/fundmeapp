// src/components/UrgentCard.jsx
// ─────────────────────────────────────────────────────────────
//  UrgentCard — horizontal campaign card with dynamic progress color
// ─────────────────────────────────────────────────────────────

import React, { memo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { P, sp, URGENT_W } from '../theme/theme';
import ProgressBar from './ProgressBar';

// ─────────────────────────────────────────────────────────────
//  FIX: Corrected color logic
//
//  OLD (wrong):
//    pct >= 80 → red    ← makes fully funded campaigns look alarming
//    pct >= 40 → teal
//    else      → amber  ← low progress shown as amber (ok)
//
//  NEW (correct — matches real crowdfunding UX):
//    pct >= 75 → green  ← almost/fully funded = celebrate 🎉
//    pct >= 40 → teal   ← making good progress
//    else      → amber  ← needs attention / just started
//
//  Also: Number(pct) ensures the comparison works even if pct
//  arrives as a string from an API response.
// ─────────────────────────────────────────────────────────────
const getProgressBarColor = (pct) => {
  const n = Number(pct);        // guard against string values
  if (n >= 75) return '#22C55E'; // green  — nearly / fully funded
  if (n >= 40) return '#00B4CC'; // teal   — good progress
  return '#F59E0B';              // amber  — early / needs help
};

const UrgentCard = memo(({ item, onPress }) => {
  const [isSaved, setIsSaved] = useState(false);
  const toggleSave = () => setIsSaved(prev => !prev);

  const progressColor = getProgressBarColor(item.pct);

  return (
    <TouchableOpacity
      style={ucSt.wrap}
      activeOpacity={0.9}
      onPress={() => onPress?.(item)}
    >
      {/* ── Image area ── */}
      <View style={[ucSt.imgBox, { backgroundColor: item.imgBg }]}>
        <Text style={ucSt.imgEmoji}>{item.imgEmoji}</Text>

        {/* URGENT badge */}
        <View style={ucSt.badge}>
          <Text style={ucSt.badgeTxt}>{item.badge}</Text>
        </View>

        {/* Heart / save toggle */}
        <TouchableOpacity style={ucSt.heartBtn} onPress={toggleSave} activeOpacity={0.8}>
          <AntDesign
            name={isSaved ? 'heart' : 'hearto'}
            size={sp(16)}
            color={isSaved ? P.red : P.white}
          />
        </TouchableOpacity>
      </View>

      {/* ── Body ── */}
      <View style={ucSt.body}>
        {/* Category chip */}
        <View style={[ucSt.catChip, { backgroundColor: item.catColor + '18' }]}>
          <Text style={[ucSt.catTxt, { color: item.catColor }]}>
            {item.category}
          </Text>
        </View>

        {/* Title */}
        <Text style={ucSt.title} numberOfLines={2}>
          {item.title}
        </Text>

        {/* Raised / Goal */}
        <View style={ucSt.amtRow}>
          <Text style={ucSt.raised}>{item.raised}</Text>
          <Text style={ucSt.goal}> / {item.goal}</Text>
        </View>

        {/* Progress bar — color changes with percentage */}
        <ProgressBar pct={item.pct} color={progressColor} />

        {/* User row */}
        <View style={ucSt.userRow}>
          <View style={ucSt.avatar}>
            <Text style={ucSt.avatarTxt}>{item.user.charAt(0)}</Text>
          </View>
          <Text style={ucSt.userName} numberOfLines={1}>{item.user}</Text>
          {item.verified && (
            <View style={ucSt.verifiedBadge}>
              <AntDesign name="check" size={sp(8)} color={P.white} />
            </View>
          )}
          <AntDesign
            name="clockcircleo"
            size={sp(9)}
            color={P.light}
            style={{ marginLeft: sp(5) }}
          />
          <Text style={ucSt.timeTxt}> {item.timeLeft}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const ucSt = StyleSheet.create({
  wrap: {
    width: URGENT_W,
    backgroundColor: P.white,
    borderRadius: sp(14),
    overflow: 'hidden',
    marginRight: sp(14),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  imgBox: {
    height: sp(130),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  imgEmoji: { fontSize: sp(48) },
  badge: {
    position: 'absolute',
    top: sp(10),
    left: sp(10),
    backgroundColor: P.red,
    borderRadius: sp(5),
    paddingHorizontal: sp(7),
    paddingVertical: sp(3),
  },
  badgeTxt: {
    color: P.white,
    fontSize: sp(9),
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heartBtn: {
    position: 'absolute',
    top: sp(10),
    right: sp(10),
    width: sp(30),
    height: sp(30),
    borderRadius: sp(15),
    backgroundColor: 'rgba(0,0,0,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: sp(12) },
  catChip: {
    alignSelf: 'flex-start',
    borderRadius: sp(5),
    paddingHorizontal: sp(7),
    paddingVertical: sp(2),
    marginBottom: sp(6),
  },
  catTxt: { fontSize: sp(10), fontWeight: '700' },
  title: {
    fontSize: sp(13),
    fontWeight: '700',
    color: P.dark,
    lineHeight: sp(18),
    marginBottom: sp(7),
    minHeight: sp(36),
  },
  amtRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: sp(6),
  },
  raised: { fontSize: sp(13), fontWeight: '800', color: P.teal },
  goal:   { fontSize: sp(11), color: P.light },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: sp(10),
  },
  avatar: {
    width: sp(20),
    height: sp(20),
    borderRadius: sp(10),
    backgroundColor: P.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: sp(5),
  },
  avatarTxt: { color: P.white, fontSize: sp(9), fontWeight: '800' },
  userName:  { flex: 1, fontSize: sp(11), color: P.gray },
  verifiedBadge: {
    width: sp(14),
    height: sp(14),
    borderRadius: sp(7),
    backgroundColor: P.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeTxt: { fontSize: sp(10), color: P.light },
});

export default UrgentCard;