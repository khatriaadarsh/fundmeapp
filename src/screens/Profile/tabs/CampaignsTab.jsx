// src/screens/Profile/tabs/CampaignsTab.jsx
// ─────────────────────────────────────────────────────────────
//  CampaignsTab — Active Campaigns + Past Campaigns
//  Uses the shared ProgressBar from ../../components/shared/ProgressBar
// ─────────────────────────────────────────────────────────────

import React, { memo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icons from 'react-native-vector-icons/Feather';

// Shared ProgressBar — adjust path to your actual shared components dir
// import ProgressBar from '../../components/shared/ProgressBar';
// import ProgressBar from '../../components/shared/ProgressBar';
import ProgressBar from '../../../components/common/ProgressBar';

const { width: SW } = Dimensions.get('window');
const sp = n => (SW / 375) * n;

const P = {
  darkOcean: '#0A3D62',
  teal:      '#00B4CC',
  tealLight: 'rgba(0,180,204,0.10)',
  dark:      '#111827',
  gray:      '#6B7280',
  light:     '#9CA3AF',
  white:     '#FFFFFF',
  border:    '#E5E7EB',
  bg:        '#F4F5F7',
  green:     '#10B981',
  greenLight:'#ECFDF5',
  red:       '#EF4444',
  redLight:  '#FEF2F2',
};

// ── Mock data ────────────────────────────────────────────────
const ACTIVE_CAMPAIGNS = [
  {
    id: '1',
    title:    'Flood relief for 40 displaced families in Sindh',
    imageUri: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400',
    raised:   'PKR 320,000',
    goal:     'PKR 500,000',
    pct:      64,
    donors:   234,
    daysLeft: 12,
    urgent:   true,
    tags:     ['Emergency', 'Active'],
  },
  {
    id: '2',
    title:    'School supplies for children in underserved communities',
    imageUri: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400',
    raised:   'PKR 500,000',
    goal:     'PKR 500,000',
    pct:      100,
    donors:   189,
    daysLeft: 0,
    urgent:   false,
    tags:     ['Education', 'Completed'],
  },
  {
    id: '3',
    title:    'Winter food packages for orphans in Balochistan',
    imageUri: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400',
    raised:   'PKR 180,000',
    goal:     'PKR 400,000',
    pct:      45,
    donors:   97,
    daysLeft: 8,
    urgent:   true,
    tags:     ['Food', 'Active'],
  },
];

const PAST_CAMPAIGNS = [
  {
    id: '4',
    title:    'Emergency kidney surgery for Hamza, age 9',
    imageUri: 'https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=400',
    raised:   'PKR 750,000',
    goal:     'PKR 750,000',
    pct:      100,
    donors:   312,
    status:   'funded',
    tags:     ['Medical'],
  },
  {
    id: '5',
    title:    'Rebuild classroom destroyed in flash floods',
    imageUri: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=400',
    raised:   'PKR 290,000',
    goal:     'PKR 350,000',
    pct:      83,
    donors:   145,
    status:   'closed',
    tags:     ['Education'],
  },
];

// ── Tag chip ─────────────────────────────────────────────────
const TAG_COLORS = {
  Emergency:  { bg: '#FEF2F2', text: '#DC2626' },
  Active:     { bg: P.tealLight, text: P.teal },
  Education:  { bg: '#EFF6FF', text: '#3B82F6' },
  Completed:  { bg: P.greenLight, text: P.green },
  Food:       { bg: '#FEF9C3', text: '#D97706' },
  Medical:    { bg: '#F5F3FF', text: '#7C3AED' },
};

const TagChip = memo(({ tag }) => {
  const colors = TAG_COLORS[tag] ?? { bg: P.bg, text: P.gray };
  return (
    <View style={[chip.pill, { backgroundColor: colors.bg }]}>
      <Text style={[chip.txt, { color: colors.text }]}>{tag}</Text>
    </View>
  );
});
const chip = StyleSheet.create({
  pill: { borderRadius: sp(6), paddingHorizontal: sp(8), paddingVertical: sp(3), marginRight: sp(6) },
  txt:  { fontSize: sp(10), fontWeight: '700' },
});

// ── Campaign Card ────────────────────────────────────────────
const CampaignCard = memo(({ item, onPress, isPast }) => (
  <TouchableOpacity style={cc.card} onPress={() => onPress?.(item)} activeOpacity={0.88}>
    {/* Hero Image */}
    <View style={cc.imgWrap}>
      <Image source={{ uri: item.imageUri }} style={cc.img} resizeMode="cover" />
      {item.urgent && (
        <View style={cc.urgentBadge}>
          <Text style={cc.urgentTxt}>URGENT</Text>
        </View>
      )}
      {isPast && item.status === 'funded' && (
        <View style={cc.fundedRibbon}>
          <Icons name="check-circle" size={sp(12)} color={P.green} />
          <Text style={cc.fundedTxt}>Successfully Funded</Text>
        </View>
      )}
      {isPast && item.status === 'closed' && (
        <View style={cc.closedRibbon}>
          <Text style={cc.closedTxt}>Closed</Text>
        </View>
      )}
    </View>

    {/* Body */}
    <View style={cc.body}>
      {/* Tags */}
      <View style={cc.tagsRow}>
        {item.tags.map(t => <TagChip key={t} tag={t} />)}
      </View>

      {/* Title */}
      <Text style={cc.title} numberOfLines={2}>{item.title}</Text>

      {/* Progress bar */}
      <ProgressBar pct={item.pct} />

      {/* Stats row */}
      <View style={cc.statsRow}>
        <Text style={cc.raised}>{item.raised}</Text>
        <Text style={cc.goalPct}>{item.pct}% of goal</Text>
      </View>

      {/* Footer */}
      <View style={cc.footer}>
        <View style={cc.footItem}>
          <Icons name="users" size={sp(12)} color={P.light} />
          <Text style={cc.footTxt}>{item.donors} donors</Text>
        </View>
        {!isPast && item.daysLeft > 0 && (
          <View style={cc.footItem}>
            <Icons name="clock" size={sp(12)} color={P.light} />
            <Text style={cc.footTxt}>{item.daysLeft} days left</Text>
          </View>
        )}
        {!isPast && item.daysLeft === 0 && (
          <View style={cc.footItem}>
            <Icons name="check" size={sp(12)} color={P.green} />
            <Text style={[cc.footTxt, { color: P.green }]}>Goal reached</Text>
          </View>
        )}
      </View>
    </View>
  </TouchableOpacity>
));

const cc = StyleSheet.create({
  card: {
    backgroundColor: P.white,
    borderRadius: sp(14),
    marginHorizontal: sp(20),
    marginBottom: sp(12),
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  imgWrap: {
    width: '100%',
    height: sp(140),
    position: 'relative',
    backgroundColor: P.border,
  },
  img: { width: '100%', height: '100%' },
  urgentBadge: {
    position: 'absolute', top: sp(10), left: sp(10),
    backgroundColor: P.redLight,
    borderRadius: sp(5),
    paddingHorizontal: sp(8), paddingVertical: sp(3),
  },
  urgentTxt:  { fontSize: sp(10), fontWeight: '800', color: P.red, letterSpacing: 0.5 },
  fundedRibbon: {
    position: 'absolute', bottom: sp(10), left: sp(10),
    flexDirection: 'row', alignItems: 'center', gap: sp(4),
    backgroundColor: P.greenLight,
    borderRadius: sp(6), paddingHorizontal: sp(8), paddingVertical: sp(4),
  },
  fundedTxt: { fontSize: sp(10), fontWeight: '700', color: P.green },
  closedRibbon: {
    position: 'absolute', bottom: sp(10), left: sp(10),
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: sp(6), paddingHorizontal: sp(8), paddingVertical: sp(4),
  },
  closedTxt: { fontSize: sp(10), fontWeight: '700', color: P.white },
  body:  { padding: sp(14) },
  tagsRow: { flexDirection: 'row', marginBottom: sp(8) },
  title: {
    fontSize: sp(15), fontWeight: '700', color: P.dark,
    lineHeight: sp(21), marginBottom: sp(10),
  },
  statsRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: sp(6),
  },
  raised:  { fontSize: sp(12), fontWeight: '700', color: P.darkOcean },
  goalPct: { fontSize: sp(12), color: P.gray },
  footer:  { flexDirection: 'row', gap: sp(16), marginTop: sp(10) },
  footItem:{ flexDirection: 'row', alignItems: 'center', gap: sp(4) },
  footTxt: { fontSize: sp(11), color: P.light },
});

// ── Section header ───────────────────────────────────────────
const SectionHeader = memo(({ title }) => (
  <View style={sh.wrap}>
    <Text style={sh.title}>{title}</Text>
  </View>
));
const sh = StyleSheet.create({
  wrap:  { paddingHorizontal: sp(20), marginTop: sp(20), marginBottom: sp(12) },
  title: { fontSize: sp(14), fontWeight: '700', color: P.dark },
});

// ════════════════════════════════════════════════════════════
//  CampaignsTab — main export
// ════════════════════════════════════════════════════════════
const CampaignsTab = memo(({ onCampaignPress }) => (
  <View style={{ paddingBottom: sp(24) }}>
    <SectionHeader title={`Active Campaigns (${ACTIVE_CAMPAIGNS.length})`} />
    {ACTIVE_CAMPAIGNS.map(item => (
      <CampaignCard key={item.id} item={item} onPress={onCampaignPress} isPast={false} />
    ))}

    <SectionHeader title={`Past Campaigns (${PAST_CAMPAIGNS.length})`} />
    {PAST_CAMPAIGNS.map(item => (
      <CampaignCard key={item.id} item={item} onPress={onCampaignPress} isPast />
    ))}
  </View>
));

export default CampaignsTab;