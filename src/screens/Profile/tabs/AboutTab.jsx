// src/screens/Profile/tabs/AboutTab.jsx
// ─────────────────────────────────────────────────────────────
//  AboutTab — Bio · Trust Score · Contact · Achievements
// ─────────────────────────────────────────────────────────────

import React, { memo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Icons   from 'react-native-vector-icons/Feather';
import MCIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { useCreatorAbout } from '../../../hooks/useCreator';

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
  orange:    '#F59E0B',
  red:       '#EF4444',
};

// ── Reusable section card ────────────────────────────────────
const SectionCard = memo(({ children, style }) => (
  <View style={[sc.card, style]}>{children}</View>
));
const SectionLabel = memo(({ text }) => (
  <Text style={sc.label}>{text}</Text>
));
const sc = StyleSheet.create({
  card: {
    backgroundColor: P.white,
    borderRadius: sp(16),
    padding: sp(16),
    marginHorizontal: sp(20),
    marginTop: sp(12),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  label: {
    fontSize: sp(11),
    fontWeight: '700',
    color: P.gray,
    letterSpacing: 0.5,
    marginBottom: sp(10),
  },
});

// ── About card ───────────────────────────────────────────────
const AboutCard = memo(({ bio }) => (
  <SectionCard style={{ marginTop: sp(16) }}>
    <SectionLabel text="ABOUT" />
    <Text style={ab.bio}>{bio}</Text>
  </SectionCard>
));
const ab = StyleSheet.create({
  bio: {
    fontSize: sp(13),
    color: P.dark,
    lineHeight: sp(20),
  },
});

// ── Trust Score card — label now reflects the real API value ──
const TrustScoreCard = memo(({ score, label, description }) => (
  <SectionCard>
    <View style={ts.headerRow}>
      <Text style={sc.label}>TRUST SCORE</Text>
      <Icons name="info" size={sp(13)} color={P.light} />
    </View>

    <View style={ts.scoreRow}>
      <Text style={ts.score}>{score}/100</Text>
      <View style={ts.excellentBadge}>
        <Text style={ts.excellentTxt}>{label}</Text>
      </View>
    </View>

    <View style={ts.barBg}>
      <View style={[ts.barFill, { width: `${score}%` }]} />
    </View>

    <Text style={ts.desc}>
      {description || 'No trust summary available yet.'}
    </Text>
  </SectionCard>
));
const ts = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: sp(10),
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: sp(10),
  },
  score: {
    fontSize: sp(28),
    fontWeight: '800',
    color: P.green,
    letterSpacing: -0.5,
  },
  excellentBadge: {
    backgroundColor: P.greenLight,
    borderRadius: sp(12),
    paddingHorizontal: sp(10),
    paddingVertical: sp(4),
  },
  excellentTxt: {
    fontSize: sp(11),
    fontWeight: '700',
    color: P.green,
  },
  barBg: {
    height: sp(6),
    backgroundColor: P.border,
    borderRadius: sp(3),
    overflow: 'hidden',
    marginBottom: sp(8),
  },
  barFill: {
    height: sp(6),
    backgroundColor: P.green,
    borderRadius: sp(3),
  },
  desc: {
    fontSize: sp(11),
    color: P.gray,
    lineHeight: sp(16),
  },
});

// ── Contact card — driven by real data, checkmarks removed
//    (this endpoint doesn't return verified flags per-field) ───
const ContactCard = memo(({ email, phone, website, language }) => {
  const rows = [
    { icon: 'globe', iconLib: 'feather', label: 'Website', value: website },
    { icon: 'mail', iconLib: 'feather', label: 'Email', value: email },
    { icon: 'phone', iconLib: 'feather', label: 'Phone', value: phone },
    { icon: 'message-text-outline', iconLib: 'mc', label: 'Languages', value: language },
  ];

  return (
    <SectionCard>
      <SectionLabel text="CONTACT" />
      {rows.map((row, i) => (
        <View key={row.label} style={[ct.row, i < rows.length - 1 && ct.rowBorder]}>
          <View style={ct.iconWrap}>
            {row.iconLib === 'feather' ? (
              <Icons name={row.icon} size={sp(16)} color={P.darkOcean} />
            ) : (
              <MCIcons name={row.icon} size={sp(16)} color={P.darkOcean} />
            )}
          </View>
          <Text style={ct.rowLabel}>{row.label}</Text>
          <View style={ct.valueWrap}>
            <Text style={ct.rowValue} numberOfLines={1}>{row.value}</Text>
          </View>
        </View>
      ))}
    </SectionCard>
  );
});
const ct = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: sp(10),
    gap: sp(10),
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: P.border,
  },
  iconWrap: {
    width: sp(32),
    height: sp(32),
    borderRadius: sp(8),
    backgroundColor: P.tealLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: sp(12),
    color: P.gray,
    width: sp(72),
  },
  valueWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowValue: {
    fontSize: sp(13),
    fontWeight: '600',
    color: P.dark,
    flex: 1,
  },
});

// ── Achievements card — only renders when the API returns at
//    least one item (currently always empty per the API sample) ─
const AchievementsCard = memo(({ achievements }) => {
  if (!achievements || achievements.length === 0) return null;

  return (
    <SectionCard>
      <SectionLabel text="ACHIEVEMENTS" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={ach.row}
      >
        {achievements.map((a, i) => (
          <View key={a.label ?? i} style={[ach.badge, { backgroundColor: a.bg || P.tealLight }]}>
            <Text style={ach.emoji}>{a.emoji || '🏅'}</Text>
            <Text style={[ach.badgeLabel, { color: a.textColor || P.teal }]}>
              {a.label || String(a)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SectionCard>
  );
});
const ach = StyleSheet.create({
  row: { gap: sp(10), paddingVertical: sp(4) },
  badge: {
    width: sp(80),
    height: sp(90),
    borderRadius: sp(14),
    alignItems: 'center',
    justifyContent: 'center',
    gap: sp(8),
    padding: sp(8),
  },
  emoji:      { fontSize: sp(28) },
  badgeLabel: { fontSize: sp(10), fontWeight: '600', textAlign: 'center', lineHeight: sp(14) },
});

// ════════════════════════════════════════════════════════════
//  AboutTab — main export
// ════════════════════════════════════════════════════════════
const AboutTab = memo(({ creatorId }) => {
  const { data, isLoading, isError, error } = useCreatorAbout(creatorId);

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
          {error?.message || 'Could not load profile details.'}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ paddingBottom: sp(24) }}>
      <AboutCard bio={data.bio} />
      <TrustScoreCard
        score={data.trustScore}
        label={data.trustScoreLabel}
        description={data.trustDescription}
      />
      <ContactCard
        email={data.email}
        phone={data.phone}
        website={data.website}
        language={data.language}
      />
      <AchievementsCard achievements={data.achievements} />
    </View>
  );
});

const loader = StyleSheet.create({
  wrap: { paddingVertical: sp(60), alignItems: 'center', justifyContent: 'center' },
  errTxt: { fontSize: sp(13), color: P.gray, textAlign: 'center', paddingHorizontal: sp(30) },
});

export default AboutTab;