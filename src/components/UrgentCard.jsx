// src/components/UrgentCard.jsx

import React, { memo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MCIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { P, sp } from '../theme/theme';
import ProgressBar from './ProgressBar';
import { getCategoryIcon } from '../utils/categoryIcons';

const getProgressBarColor = (pct) => {
  const n = Number(pct);

  if (n >= 75) return '#22C55E';
  if (n >= 40) return '#00B4CC';
  return '#F59E0B';
};

// ── Responsive thumbnail size ──────────────────────────────────
// Tied to a % of actual device width (not a fixed sp value) and
// clamped so it never gets too small on narrow phones or too huge
// on tablets. Same square is reused for the fixed card height below.
const { width: SW } = Dimensions.get('window');
const THUMB = Math.round(Math.min(Math.max(SW * 0.24, 76), 108));

// ── Fixed card height ───────────────────────────────────────────
// All cards are the exact same height regardless of how much title/
// description text they have — this is what keeps every card in the
// list visually uniform, matching the reference design.
const CARD_PAD = sp(10);
const CARD_H = THUMB + CARD_PAD * 2;

const UrgentCard = memo(({ item, onPress }) => {
  const [isSaved, setIsSaved] = useState(false);

  const toggleSave = () => {
    setIsSaved((prev) => !prev);
  };

  const progressColor = getProgressBarColor(item.pct);
  const categoryIcon = getCategoryIcon(item.category);

  return (
    <TouchableOpacity
      style={ucSt.wrap}
      activeOpacity={0.9}
      onPress={() => onPress?.(item)}
    >
      {/* Thumbnail — resizeMode "contain" guarantees the FULL image is
          always visible (never sliced/cropped), letterboxed on imgBg
          if its aspect ratio doesn't match the square frame. */}
      <View style={[ucSt.imgBox, { backgroundColor: item.imgBg || P.border }]}>
        {item.coverImage ? (
          <Image
            source={{ uri: item.coverImage }}
            style={ucSt.coverImage}
            resizeMode="contain"
          />
        ) : (
          <Text style={ucSt.imgEmoji}>{item.imgEmoji}</Text>
        )}

        {!!item.badge && (
          <View style={ucSt.badge}>
            <Text style={ucSt.badgeTxt} numberOfLines={1}>
              {item.badge}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={ucSt.heartBtn}
          onPress={toggleSave}
          activeOpacity={0.8}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <AntDesign
            name={isSaved ? 'heart' : 'hearto'}
            size={sp(12)}
            color={isSaved ? P.red : P.white}
          />
        </TouchableOpacity>
      </View>

      {/* Content — every slot below is a FIXED height/line-count so
          the card never grows or shrinks based on text length. */}
      <View style={ucSt.body}>
        <View style={ucSt.catRow}>
          <MCIcons name={categoryIcon} size={sp(12)} color={item.catColor} />
          <Text style={[ucSt.catTxt, { color: item.catColor }]} numberOfLines={1}>
            {item.category?.toUpperCase()}
          </Text>
        </View>

        <Text style={ucSt.title} numberOfLines={1}>
          {item.title}
        </Text>

        {/* Always rendered (even if empty) so every card reserves the
            same vertical space for this line — this is what previously
            made cards with/without a description different heights. */}
        <Text style={ucSt.desc} numberOfLines={1}>
          {item.description || ' '}
        </Text>

        <View style={ucSt.amtRow}>
          <Text style={ucSt.amtCombined} numberOfLines={1}>
            <Text style={ucSt.raised}>{item.raised}</Text>
            <Text style={ucSt.goal}> of {item.goal}</Text>
          </Text>

          <View style={ucSt.timeRow}>
            <AntDesign name="clockcircleo" size={sp(9)} color={P.light} />
            <Text style={ucSt.timeTxt}> {item.timeLeft}</Text>
          </View>
        </View>

        <ProgressBar pct={item.pct} color={progressColor} />
      </View>
    </TouchableOpacity>
  );
});

const ucSt = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: P.white,
    borderRadius: sp(14),
    padding: CARD_PAD,
    height: CARD_H,
    marginBottom: sp(12),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },

  imgBox: {
    width: THUMB,
    height: THUMB,
    borderRadius: sp(12),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    flexShrink: 0,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  imgEmoji: {
    fontSize: sp(32),
  },
  badge: {
    position: 'absolute',
    top: sp(6),
    left: sp(6),
    maxWidth: '80%',
    backgroundColor: P.red,
    borderRadius: sp(4),
    paddingHorizontal: sp(5),
    paddingVertical: sp(2),
  },
  badgeTxt: {
    color: P.white,
    fontSize: sp(7),
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  heartBtn: {
    position: 'absolute',
    top: sp(6),
    right: sp(6),
    width: sp(22),
    height: sp(22),
    borderRadius: sp(11),
    backgroundColor: 'rgba(0,0,0,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  body: {
    flex: 1,
    marginLeft: sp(12),
    justifyContent: 'center',
    overflow: 'hidden',
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp(4),
    marginBottom: sp(4),
  },
  catTxt: {
    fontSize: sp(10),
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  title: {
    fontSize: sp(14),
    fontWeight: '700',
    color: P.dark,
    lineHeight: sp(18),
    marginBottom: sp(2),
  },
  desc: {
    fontSize: sp(11.5),
    lineHeight: sp(15),
    color: P.gray,
    marginBottom: sp(6),
  },

  amtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: sp(6),
  },
  amtCombined: {
    flexShrink: 1,
    marginRight: sp(6),
  },
  raised: {
    fontSize: sp(12.5),
    fontWeight: '800',
    color: P.teal,
  },
  goal: {
    fontSize: sp(11),
    color: P.light,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
  },
  timeTxt: {
    fontSize: sp(10),
    color: P.light,
  },
});

export default UrgentCard;