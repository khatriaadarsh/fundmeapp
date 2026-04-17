// src/screens/Profile/tabs/ReviewsTab.jsx
// ─────────────────────────────────────────────────────────────
//  ReviewsTab — Rating overview card + all reviews in ONE card
//  with thin separator lines between each review (matches Figma)
// ─────────────────────────────────────────────────────────────

import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icons from 'react-native-vector-icons/Feather';

const { width: SW } = Dimensions.get('window');
const sp = n => (SW / 375) * n;

const P = {
  darkOcean: '#0A3D62',
  teal:      '#00B4CC',
  dark:      '#111827',
  gray:      '#6B7280',
  light:     '#9CA3AF',
  white:     '#FFFFFF',
  border:    '#E5E7EB',
  bg:        '#F4F5F7',
  gold:      '#FBBF24',
  green:     '#10B981',
  red:       '#EF4444',
};

// ── Mock data ────────────────────────────────────────────────
const RATING_DISTRIBUTION = [
  { stars: 5, pct: 78 },
  { stars: 4, pct: 18 },
  { stars: 3, pct: 3  },
  { stars: 2, pct: 1  },
  { stars: 1, pct: 0  },
];

const REVIEWS = [
  {
    id: '1',
    name:    'Ahmed K.',
    avatar:  null,
    rating:  5,
    date:    '2 days ago',
    text:    'Sarah is incredibly transparent and shared updates throughout the campaign. It made donating feel safe and meaningful.',
    helpful: 12,
  },
  {
    id: '2',
    name:    'Fatima R.',
    avatar:  null,
    rating:  5,
    date:    '1 week ago',
    text:    'Very professional and responsive. She provided photo evidence of every milestone. Will donate again for sure.',
    helpful: 8,
  },
  {
    id: '3',
    name:    'Omar H.',
    avatar:  null,
    rating:  4,
    date:    '2 weeks ago',
    text:    'Great campaign overall. Updates were a bit delayed at times but the cause is genuine and funds were well-spent.',
    helpful: 5,
  },
  {
    id: '4',
    name:    'Zainab M.',
    avatar:  null,
    rating:  5,
    date:    '1 month ago',
    text:    "One of the most trustworthy creators I've supported. The transparency reports were exceptional.",
    helpful: 19,
  },
];

// ════════════════════════════════════════════════════════════
//  Stars
// ════════════════════════════════════════════════════════════
const Stars = memo(({ count = 5, size = 13, filled = 5 }) => (
  <View style={{ flexDirection: 'row', gap: sp(2) }}>
    {Array.from({ length: count }).map((_, i) => (
      <Icons
        key={i}
        name="star"
        size={sp(size)}
        color={i < filled ? P.gold : P.border}
      />
    ))}
  </View>
));

// ════════════════════════════════════════════════════════════
//  RatingOverviewCard — big rating + bar chart
// ════════════════════════════════════════════════════════════
const RatingOverviewCard = memo(({ rating = 4.8, total = 234 }) => (
  <View style={ro.card}>
    {/* Left: big number + stars + caption */}
    <View style={ro.left}>
      <Text style={ro.bigRating}>{rating}</Text>
      <Stars count={5} size={16} filled={Math.round(rating)} />
      <Text style={ro.basedOn}>Based on {total}{'\n'}reviews</Text>
    </View>

    {/* Thin vertical divider */}
    <View style={ro.vDivider} />

    {/* Right: distribution bars */}
    <View style={ro.right}>
      {RATING_DISTRIBUTION.map(row => (
        <View key={row.stars} style={ro.barRow}>
          <Text style={ro.starLabel}>{row.stars}★</Text>
          <View style={ro.barBg}>
            <View style={[ro.barFill, { width: `${row.pct}%` }]} />
          </View>
          <Text style={ro.pctLabel}>{row.pct}%</Text>
        </View>
      ))}
    </View>
  </View>
));

const ro = StyleSheet.create({
  card: {
    backgroundColor: P.white,
    borderRadius: sp(16),
    padding: sp(18),
    marginHorizontal: sp(20),
    marginTop: sp(16),
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp(14),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  left: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    minWidth: sp(85),
  },
  bigRating: {
    fontSize: sp(42),
    fontWeight: '800',
    color: P.darkOcean,
    lineHeight: sp(48),
    letterSpacing: -1,
    marginBottom: sp(4),
  },
  basedOn: {
    fontSize: sp(11),
    color: P.gray,
    marginTop: sp(6),
    lineHeight: sp(16),
  },
  vDivider: {
    width: 1,
    height: sp(100),
    backgroundColor: P.border,
  },
  right: {
    flex: 1,
    justifyContent: 'center',
    gap: sp(6),
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp(6),
  },
  starLabel: {
    fontSize: sp(11),
    color: P.gray,
    width: sp(22),
    textAlign: 'right',
  },
  barBg: {
    flex: 1,
    height: sp(7),
    backgroundColor: '#F3F4F6',
    borderRadius: sp(4),
    overflow: 'hidden',
  },
  barFill: {
    height: sp(7),
    backgroundColor: P.gold,
    borderRadius: sp(4),
  },
  pctLabel: {
    fontSize: sp(11),
    color: P.light,
    width: sp(30),
    textAlign: 'right',
  },
});

// ════════════════════════════════════════════════════════════
//  Single review row — used inside the shared reviews card
// ════════════════════════════════════════════════════════════
const ReviewRow = memo(({ review, isLast }) => (
  <View style={rr.wrap}>
    {/* Top: avatar + name + stars + date */}
    <View style={rr.topRow}>
      <View style={rr.avatar}>
        <Text style={rr.avatarTxt}>{review.name.charAt(0)}</Text>
      </View>

      <View style={rr.meta}>
        <View style={rr.nameDateRow}>
          <Text style={rr.name}>{review.name}</Text>
          <Text style={rr.date}>{review.date}</Text>
        </View>
        <Stars count={5} size={11} filled={review.rating} />
      </View>
    </View>

    {/* Review text */}
    <Text style={rr.text}>{review.text}</Text>

    {/* Footer: helpful + reply */}
    <View style={rr.footer}>
      <TouchableOpacity activeOpacity={0.7} style={rr.helpfulBtn}>
        <Text style={rr.helpfulTxt}>🤙 Helpful ({review.helpful})</Text>
      </TouchableOpacity>
      <TouchableOpacity activeOpacity={0.7}>
        <Text style={rr.replyTxt}>Reply</Text>
      </TouchableOpacity>
    </View>

    {/* Separator — hidden on last item */}
    {!isLast && <View style={rr.separator} />}
  </View>
));

const rr = StyleSheet.create({
  wrap: {
    paddingVertical: sp(16),
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: sp(10),
    gap: sp(10),
  },
  avatar: {
    width: sp(36),
    height: sp(36),
    borderRadius: sp(18),
    backgroundColor: P.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: {
    fontSize: sp(14),
    fontWeight: '800',
    color: P.white,
  },
  meta: {
    flex: 1,
    gap: sp(4),
  },
  nameDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: sp(13),
    fontWeight: '700',
    color: P.dark,
  },
  date: {
    fontSize: sp(11),
    color: P.light,
  },
  text: {
    fontSize: sp(13),
    color: P.dark,
    lineHeight: sp(19),
    marginBottom: sp(10),
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp(18),
  },
  helpfulBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpfulTxt: {
    fontSize: sp(12),
    color: P.gray,
  },
  replyTxt: {
    fontSize: sp(12),
    fontWeight: '600',
    color: P.teal,
  },
  // Thin separator between reviews — matches screenshot
  separator: {
    height: 1,
    backgroundColor: P.border,
    marginTop: sp(4),
  },
});

// ════════════════════════════════════════════════════════════
//  ReviewsListCard — ONE card containing ALL reviews with
//  thin separators between them (not individual elevated cards)
// ════════════════════════════════════════════════════════════
const ReviewsListCard = memo(() => (
  <View style={rl.card}>
    {REVIEWS.map((review, index) => (
      <ReviewRow
        key={review.id}
        review={review}
        isLast={index === REVIEWS.length - 1}
      />
    ))}
  </View>
));

const rl = StyleSheet.create({
  card: {
    backgroundColor: P.white,
    borderRadius: sp(16),
    paddingHorizontal: sp(16),
    marginHorizontal: sp(20),
    marginTop: sp(12),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
});

// ════════════════════════════════════════════════════════════
//  ReviewsTab — main export
// ════════════════════════════════════════════════════════════
const ReviewsTab = memo(() => (
  <View style={{ paddingBottom: sp(24) }}>
    <RatingOverviewCard rating={4.8} total={234} />
    <ReviewsListCard />
  </View>
));

export default ReviewsTab;