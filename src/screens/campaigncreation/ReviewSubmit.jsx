// src/screens/campaign/ReviewSubmit.jsx
// ─────────────────────────────────────────────────────────────
//  Review & Submit — Step 4 of 4
//  FundMe App  ·  React Native CLI  ·  100% responsive
//
//  NOTE: This screen makes NO API call of its own. Steps 1-3 each
//  persist their data to the backend individually via their own
//  Next buttons. By the time the user reaches this screen, the
//  campaign is already fully saved server-side. This screen exists
//  purely so the user can review everything in one place and jump
//  back to any step to correct it (via the "Edit" links) before
//  finishing. "Submit for Review" is a local confirmation only.
// ─────────────────────────────────────────────────────────────

import React, { useRef, useEffect, memo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { StepHeader } from '../../components/shared/StepHeader';
import { P } from '../../theme/theme';
import { C } from './Shared';

// ── Section card ───────────────────────────────────────────
const SectionCard = ({ label, onEdit, children }) => (
  <View style={sc.card}>
    <View style={sc.hdr}>
      <Text style={sc.label}>{label}</Text>
      <TouchableOpacity
        onPress={onEdit}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <Text style={sc.edit}>Edit</Text>
      </TouchableOpacity>
    </View>
    {children}
  </View>
);
const sc = StyleSheet.create({
  card: {
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  hdr: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  edit: { fontSize: 13, color: C.teal, fontWeight: '600' },
});

// ── Thin divider ───────────────────────────────────────────
const Divider = () => (
  <View style={{ height: 1, backgroundColor: C.border, marginVertical: 10 }} />
);

// ── Key–value row ──────────────────────────────────────────
const KVRow = ({ k, v }) => (
  <View style={kv.row}>
    <Text style={kv.key}>{k}</Text>
    <Text style={kv.val}>{v}</Text>
  </View>
);
const kv = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  key: { fontSize: 13, color: C.textGray },
  val: { fontSize: 13, fontWeight: '600', color: C.dark },
});

// ── Badge ──────────────────────────────────────────────────
const Badge = ({ text, bg, textColor, iconName }) => (
  <View style={[bdg.wrap, { backgroundColor: bg }]}>
    {iconName && (
      <Icon
        name={iconName}
        size={11}
        color={textColor}
        style={{ marginRight: 3 }}
      />
    )}
    <Text style={[bdg.txt, { color: textColor }]}>{text}</Text>
  </View>
);
const bdg = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 3,
    marginRight: 6,
  },
  txt: { fontSize: 11, fontWeight: '700' },
});

// ── Thumbnail — renders the real picked image when a uri is
//    available, falling back to an icon placeholder otherwise ──
const Thumb = ({ uri, bg, icon, label }) => (
  <View style={th.wrap}>
    {uri ? (
      <Image source={{ uri }} style={th.img} resizeMode="cover" />
    ) : (
      <View style={[th.box, { backgroundColor: bg || '#CBD5E1' }]}>
        <Icon name={icon || 'image-outline'} size={18} color="#fff" />
      </View>
    )}
    {label ? <Text style={th.lbl}>{label}</Text> : null}
  </View>
);
const th = StyleSheet.create({
  wrap: { alignItems: 'center', marginRight: 8 },
  box: {
    width: 52,
    height: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  img: { width: 52, height: 52, borderRadius: 8 },
  lbl: { fontSize: 10, color: C.textLight, marginTop: 2 },
});

// ── Document row ───────────────────────────────────────────
const DocRow = ({ name }) => (
  <View style={dr.row}>
    <Icon
      name="file-pdf-box"
      size={18}
      color="#DC2626"
      style={{ marginRight: 8 }}
    />
    <Text style={dr.name}>{name}</Text>
  </View>
);
const dr = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
  name: { fontSize: 13, color: C.dark, fontWeight: '500' },
});

const ProgressLine = memo(({ pct }) => (
  <View style={plSt.bg}>
    <View style={[plSt.fill, { width: `${pct}%` }]} />
  </View>
));
const plSt = StyleSheet.create({
  bg: { height: 3, backgroundColor: P.border },
  fill: { height: 3, backgroundColor: P.teal },
});

// ── Main Screen ────────────────────────────────────────────
const ReviewSubmit = ({ navigation, route }) => {
  const p = route?.params || {};

  const campaignId = p.campaignId;
  const title = p.title || '';
  const category = p.category || '';
  const urgent = !!p.urgent;
  const goal = p.goal || '';
  const endDate = p.endDate || '';
  const shortDesc = p.shortDesc || '';
  const fullDesc = p.fullDesc || '';
  const coverUri = p.coverUri || null;
  const images = p.images || [];
  const docs = p.docs || [];

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const goStep = screen => navigation.navigate(screen, p);

  // No API call here — steps 1-3 already saved everything to the
  // backend. This is a local confirmation that closes out the
  // creation flow and takes the user back to the main app.
  const handleSubmit = useCallback(() => {
    if (!campaignId) {
      Alert.alert('Error', 'Missing campaign reference. Please start again from Step 1.');
      return;
    }

    Alert.alert(
      'Submitted',
      'Your application is submitted for review.\nYou will receive a notification.',
      [
        {
          text: 'OK',
          onPress: () =>
            navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] }),
        },
      ],
    );
  }, [campaignId, navigation]);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      {/* Header — green progress bar on step 4 */}
      <StepHeader
        step={4}
        total={4}
        title="Review & Submit"
        onLeft={() => navigation.goBack()}
      />
      <ProgressLine pct={100} />

      <Animated.View style={[s.flex, { opacity: fadeAnim }]}>
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Green review notice ── */}
          <View style={s.notice}>
            <Icon
              name="check-circle-outline"
              size={17}
              color={C.greenDark}
              style={{ marginRight: 8 }}
            />
            <Text style={s.noticeTxt}>
              Review your campaign before submitting
            </Text>
          </View>

          {/* ── BASIC INFO ── */}
          <SectionCard
            label="BASIC INFO"
            onEdit={() => goStep('CreateCampaign')}
          >
            <Text style={s.campaignTitle}>{title}</Text>

            {/* Badges row */}
            <View style={s.badgeRow}>
              {urgent && (
                <Badge
                  text="Urgent"
                  bg="#FEF2F2"
                  textColor="#DC2626"
                  iconName="fire"
                />
              )}
              {category && (
                <Badge
                  text={category}
                  bg="#EFF6FF"
                  textColor="#2563EB"
                  iconName="medical-bag"
                />
              )}
            </View>

            <Divider />
            <KVRow k="Goal Amount" v={`PKR ${goal}`} />
            <KVRow k="End Date" v={endDate} />
          </SectionCard>

          {/* ── DESCRIPTION ── */}
          <SectionCard
            label="DESCRIPTION"
            onEdit={() => goStep('CampaignDetails')}
          >
            <Text style={s.descLabel}>Short Description</Text>
            <Text style={s.descBody}>{shortDesc}</Text>
            <View style={{ height: 12 }} />
            <Text style={s.descLabel}>Full Story</Text>
            <Text style={s.descBody} numberOfLines={4}>
              {fullDesc}
            </Text>
          </SectionCard>

          {/* ── MEDIA ── */}
          <SectionCard label="MEDIA" onEdit={() => goStep('PhotosDocuments')}>
            <View style={s.mediaRow}>
              {/* Cover photo */}
              <Thumb uri={coverUri} icon="image-outline" label="Cover" />
              {/* Additional images */}
              {images.map(img => (
                <Thumb key={img.id} uri={img.uri} />
              ))}
            </View>
          </SectionCard>

          {/* ── DOCUMENTS ── */}
          <SectionCard
            label="DOCUMENTS"
            onEdit={() => goStep('PhotosDocuments')}
          >
            {docs.map((doc, i) => (
              <View key={doc.id} style={s.docCol}>
                <DocRow name={doc.name} />
                {i < docs.length - 1 && <Divider />}
              </View>
            ))}
          </SectionCard>

          <View style={{ height: 8 }} />
        </ScrollView>

        {/* ── Bottom buttons ── */}
        <View style={s.btnArea}>
          <View style={s.btnRow}>
            {/* Save Draft */}
            <TouchableOpacity
              style={s.draftBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Text style={s.draftTxt}>Save Draft</Text>
            </TouchableOpacity>

            {/* Submit for Review */}
            <TouchableOpacity
              style={s.submitBtn}
              onPress={handleSubmit}
              activeOpacity={0.85}
            >
              <Text style={s.submitTxt}>Submit for Review</Text>
              <Icon name="check" size={15} color={C.white} />
            </TouchableOpacity>
          </View>

          <Text style={s.footerNote}>Reviewed within 24-48 hours</Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default ReviewSubmit;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 4 },

  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  noticeTxt: { fontSize: 13, color: C.greenDark, fontWeight: '600', flex: 1 },

  campaignTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: C.dark,
    marginBottom: 10,
  },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 4 },

  descLabel: {
    fontSize: 12,
    color: C.textLight,
    fontWeight: '600',
    marginBottom: 4,
  },
  descBody: { fontSize: 13, color: C.dark, lineHeight: 19 },

  mediaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  btnArea: {
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 4,
  },
  btnRow: { flexDirection: 'row', columnGap: 10, marginBottom: 8 },
  docCol: { paddingVertical: 4, overflow: 'hidden' },
  draftBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: C.white,
  },
  draftTxt: { fontSize: 14, fontWeight: '600', color: C.dark },

  submitBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: C.green,
    borderRadius: 10,
    paddingVertical: 13,
  },
  submitTxt: { fontSize: 14, fontWeight: '700', color: C.white },

  footerNote: {
    textAlign: 'center',
    fontSize: 11,
    color: C.textLight,
    paddingBottom: 6,
  },
});