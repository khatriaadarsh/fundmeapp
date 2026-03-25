// src/screens/campaign/ReviewSubmit.jsx
// ─────────────────────────────────────────────────────────────
//  Review & Submit — Step 4 of 4
//  FundMe App  |  React Native CLI  |  Fully Responsive
// ─────────────────────────────────────────────────────────────

import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, rs, vs, ms, NavHeader } from './Shared';

// ── Review-notice banner ───────────────────────────────────
const ReviewNotice = () => (
  <View style={rn.wrap}>
    <Icon
      name="check-circle-outline"
      size={ms(18)}
      color={C.greenDark}
      style={rn.icon}
    />
    <Text style={rn.txt}>Review your campaign before submitting</Text>
  </View>
);
const rn = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.greenLight,
    borderRadius: rs(10),
    padding: rs(12),
    marginBottom: vs(14),
  },
  icon: { marginRight: rs(8) },
  txt: { flex: 1, fontSize: ms(13), color: C.greenDark, fontWeight: '600' },
});

// ── Section card ───────────────────────────────────────────
const Card = ({ title, onEdit, children }) => (
  <View style={card.wrap}>
    <View style={card.header}>
      <Text style={card.title}>{title}</Text>
      <TouchableOpacity onPress={onEdit} activeOpacity={0.7}>
        <Text style={card.edit}>Edit</Text>
      </TouchableOpacity>
    </View>
    {children}
  </View>
);
const card = StyleSheet.create({
  wrap: {
    backgroundColor: C.white,
    borderRadius: rs(12),
    padding: rs(16),
    marginBottom: vs(12),
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(12),
  },
  title: {
    fontSize: ms(11),
    fontWeight: '800',
    color: C.light,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  edit: { fontSize: ms(13), color: C.teal, fontWeight: '600' },
});

// ── Info row (label + value) ───────────────────────────────
const InfoRow = ({ label, value }) => (
  <View style={ir.wrap}>
    <Text style={ir.label}>{label}</Text>
    <Text style={ir.value}>{value}</Text>
  </View>
);
const ir = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(8),
  },
  label: { fontSize: ms(13), color: C.gray },
  value: { fontSize: ms(13), fontWeight: '600', color: C.dark },
});

// ── Badge ──────────────────────────────────────────────────
const Badge = ({ label, bg, textColor, iconName }) => (
  <View style={[bdg.wrap, { backgroundColor: bg }]}>
    {iconName && (
      <Icon
        name={iconName}
        size={ms(11)}
        color={textColor}
        style={{ marginRight: rs(3) }}
      />
    )}
    <Text style={[bdg.txt, { color: textColor }]}>{label}</Text>
  </View>
);
const bdg = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: rs(20),
    paddingHorizontal: rs(9),
    paddingVertical: vs(3),
    marginRight: rs(6),
    alignSelf: 'flex-start',
  },
  txt: { fontSize: ms(11), fontWeight: '700' },
});

// ── Media thumbnail ────────────────────────────────────────
const MediaThumb = ({ bgColor, iconName, label }) => (
  <View style={mt.wrap}>
    <View style={[mt.box, { backgroundColor: bgColor || '#9CA3AF' }]}>
      <Icon name={iconName || 'image'} size={ms(18)} color={C.white} />
    </View>
    {label && <Text style={mt.label}>{label}</Text>}
  </View>
);
const mt = StyleSheet.create({
  wrap: { alignItems: 'center', marginRight: rs(8), marginBottom: vs(4) },
  box: {
    width: rs(52),
    height: rs(52),
    borderRadius: rs(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: ms(10), color: C.light, marginTop: vs(3) },
});

// ── Document row ───────────────────────────────────────────
const DocRow = ({ name }) => (
  <View style={dr.wrap}>
    <Icon name="file-pdf-box" size={ms(18)} color={C.pdfRed} style={dr.icon} />
    <Text style={dr.name}>{name}</Text>
  </View>
);
const dr = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', paddingVertical: vs(7) },
  icon: { marginRight: rs(8) },
  name: { fontSize: ms(13), color: C.dark, fontWeight: '500' },
});

// ── Screen ─────────────────────────────────────────────────
const ReviewSubmit = ({ navigation, route }) => {
  const p = route?.params || {};

  // Fallback data matching the screenshot
  const title = p.title || "Help Fatima's Heart Surgery";
  const category = p.category || 'Medical';
  const urgent = p.urgent ?? true;
  const goal = p.goal || '500,000';
  const endDate = p.endDate || 'Feb 28, 2025';
  const shortDesc =
    p.shortDesc ||
    'Fatima is a 5-year-old suffering from a congenital heart defect. She needs urgent surgery to survive.';
  const fullDesc =
    p.fullDesc ||
    "We are raising funds for Fatima's open-heart surgery. The procedure is scheduled for next month at National Hospital. Her family cannot...";
  const imgs = p.imgs || [
    { id: '1', bgColor: '#7B9BBF', iconName: 'image' },
    { id: '2', bgColor: '#6B9E7A', iconName: 'camera' },
  ];
  const docs = p.docs || [
    { id: '1', name: 'Medical_Report_Final.pdf' },
    { id: '2', name: 'Hospital_Bill_Estimate.pdf' },
  ];

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const goToStep = step => {
    const screens = ['CreateCampaign', 'CampaignDetails', 'PhotosDocuments'];
    if (screens[step - 1]) navigation.navigate(screens[step - 1]);
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      {/* Header — green progress bar for final step */}
      <NavHeader
        title="Review & Submit"
        step={4}
        total={4}
        onLeft={() => navigation.goBack()}
        progressColor={C.green}
      />

      <Animated.View style={[s.flex, { opacity: fadeAnim }]}>
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Review notice */}
          <ReviewNotice />

          {/* ── BASIC INFO ── */}
          <Card title="BASIC INFO" onEdit={() => goToStep(1)}>
            <Text style={s.campaignTitle}>{title}</Text>

            {/* Badges row */}
            <View style={s.badgeRow}>
              {urgent && (
                <Badge
                  label="Urgent"
                  bg={C.urgentBg}
                  textColor={C.urgentText}
                  iconName="fire"
                />
              )}
              {category && (
                <Badge
                  label={category}
                  bg={C.medicalBg}
                  textColor={C.medicalText}
                  iconName="medical-bag"
                />
              )}
            </View>

            <View style={s.divider} />
            <InfoRow label="Goal Amount" value={`PKR ${goal}`} />
            <InfoRow label="End Date" value={endDate} />
          </Card>

          {/* ── DESCRIPTION ── */}
          <Card title="DESCRIPTION" onEdit={() => goToStep(2)}>
            <Text style={s.descMeta}>Short Description</Text>
            <Text style={s.descBody}>{shortDesc}</Text>

            <View style={[s.divider, { marginTop: vs(12) }]} />

            <Text style={[s.descMeta, { marginTop: vs(10) }]}>Full Story</Text>
            <Text style={s.descBody} numberOfLines={4}>
              {fullDesc}
            </Text>
          </Card>

          {/* ── MEDIA ── */}
          <Card title="MEDIA" onEdit={() => goToStep(3)}>
            <View style={s.mediaRow}>
              {/* Cover placeholder */}
              <MediaThumb
                bgColor="#BDBDBD"
                iconName="image-outline"
                label="Cover"
              />
              {/* Additional images */}
              {imgs.map(img => (
                <MediaThumb
                  key={img.id}
                  bgColor={img.bgColor}
                  iconName={img.iconName}
                />
              ))}
            </View>
          </Card>

          {/* ── DOCUMENTS ── */}
          <Card title="DOCUMENTS" onEdit={() => goToStep(3)}>
            {docs.map((doc, i) => (
              <View key={doc.id}>
                <DocRow name={doc.name} />
                {i < docs.length - 1 && <View style={s.divider} />}
              </View>
            ))}
          </Card>

          <View style={{ height: vs(8) }} />
        </ScrollView>

        {/* ── Bottom buttons ── */}
        <View style={s.btnBar}>
          {/* Save Draft — outlined */}
          <TouchableOpacity
            style={s.draftBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={s.draftTxt}>Save Draft</Text>
          </TouchableOpacity>

          {/* Submit for Review — green */}
          <TouchableOpacity
            style={s.submitBtn}
            onPress={() => {}}
            activeOpacity={0.85}
          >
            <Text style={s.submitTxt}>Submit for Review</Text>
            <Icon name="check" size={ms(15)} color={C.white} />
          </TouchableOpacity>
        </View>

        <Text style={s.reviewedIn}>Reviewed within 24-48 hours</Text>
      </Animated.View>
    </SafeAreaView>
  );
};

export default ReviewSubmit;

// ── Styles ─────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.screenBg },
  flex: { flex: 1 },
  scroll: { flex: 1, backgroundColor: C.screenBg },
  content: {
    paddingHorizontal: rs(16),
    paddingTop: vs(14),
    paddingBottom: vs(8),
  },

  // Campaign title in BASIC INFO
  campaignTitle: {
    fontSize: ms(17),
    fontWeight: '800',
    color: C.dark,
    marginBottom: vs(8),
    lineHeight: ms(24),
  },

  // Badges
  badgeRow: { flexDirection: 'row', marginBottom: vs(10), flexWrap: 'wrap' },

  // Divider line
  divider: { height: 1, backgroundColor: C.borderLight, marginVertical: vs(6) },

  // Description labels
  descMeta: {
    fontSize: ms(12),
    color: C.light,
    fontWeight: '600',
    marginBottom: vs(4),
  },
  descBody: { fontSize: ms(13), color: C.dark, lineHeight: ms(19) },

  // Media row
  mediaRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: vs(4) },

  // Button bar
  btnBar: {
    flexDirection: 'row',
    gap: rs(10),
    paddingHorizontal: rs(16),
    paddingTop: vs(12),
    paddingBottom: vs(6),
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  draftBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: rs(10),
    paddingVertical: vs(13),
    alignItems: 'center',
    backgroundColor: C.white,
  },
  draftTxt: { fontSize: ms(14), fontWeight: '600', color: C.dark },
  submitBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(6),
    backgroundColor: C.green,
    borderRadius: rs(10),
    paddingVertical: vs(13),
  },
  submitTxt: { fontSize: ms(14), fontWeight: '700', color: C.white },

  reviewedIn: {
    textAlign: 'center',
    fontSize: ms(11),
    color: C.light,
    paddingVertical: vs(8),
    backgroundColor: C.white,
  },
});
