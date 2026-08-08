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
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Icons from 'react-native-vector-icons/Feather';

import { useCreatorRatings } from '../../../hooks/useCreator';

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

const formatRelative = iso => {
  if (!iso) return '';
  try {
    const date = new Date(iso);
    const diffMs = Date.now() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay === 1) return '1 day ago';
    if (diffDay < 7) return `${diffDay} days ago`;
    if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`;
    return `${Math.floor(diffDay / 30)}mo ago`;
  } catch {
    return '';
  }
};

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
//  RatingOverviewCard
// ════════════════════════════════════════════════════════════
const RatingOverviewCard = memo(({ rating, total, distribution }) => (
  <View style={ro.card}>
    <View style={ro.left}>
      <Text style={ro.bigRating}>{Number(rating).toFixed(1)}</Text>
      <Stars count={5} size={16} filled={Math.round(rating)} />
      <Text style={ro.basedOn}>Based on {total}{'\n'}reviews</Text>
    </View>

    <View style={ro.vDivider} />

    <View style={ro.right}>
      {distribution.map(row => (
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
//  Single review row
// ════════════════════════════════════════════════════════════
const ReviewRow = memo(({ review, isLast }) => (
  <View style={rr.wrap}>
    <View style={rr.topRow}>
      <View style={rr.avatar}>
        <Text style={rr.avatarTxt}>{review.name.charAt(0)}</Text>
      </View>

      <View style={rr.meta}>
        <View style={rr.nameDateRow}>
          <Text style={rr.name}>{review.name}</Text>
          <Text style={rr.date}>{formatRelative(review.createdDate)}</Text>
        </View>
        <Stars count={5} size={11} filled={review.rating} />
      </View>
    </View>

    <Text style={rr.text}>{review.text}</Text>

    <View style={rr.footer}>
      <View style={rr.helpfulBtn}>
        <Text style={rr.helpfulTxt}>🤙 Helpful ({review.helpful})</Text>
      </View>
    </View>

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
  separator: {
    height: 1,
    backgroundColor: P.border,
    marginTop: sp(4),
  },
});

// ════════════════════════════════════════════════════════════
//  ReviewsListCard
// ════════════════════════════════════════════════════════════
const ReviewsListCard = memo(({ reviews }) => (
  <View style={rl.card}>
    {reviews.map((review, index) => (
      <ReviewRow
        key={review.id}
        review={review}
        isLast={index === reviews.length - 1}
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
const ReviewsTab = memo(({ creatorId }) => {
  const { data, isLoading, isError, error } = useCreatorRatings(creatorId);

  if (isLoading) {
    return (
      <View style={loader.wrap}>
        <ActivityIndicator size="large" color={P.teal} />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={loader.wrap}>
        <Text style={loader.errTxt}>
          {error?.message || 'Could not load reviews.'}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ paddingBottom: sp(24) }}>
      <RatingOverviewCard
        rating={data.averageRating}
        total={data.totalReviews}
        distribution={data.distribution}
      />
      <ReviewsListCard reviews={data.reviews} />
    </View>
  );
});

const loader = StyleSheet.create({
  wrap: { paddingVertical: sp(60), alignItems: 'center', justifyContent: 'center' },
  errTxt: { fontSize: sp(13), color: P.gray, textAlign: 'center', paddingHorizontal: sp(30) },
});

export default ReviewsTab;