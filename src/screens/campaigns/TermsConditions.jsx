// src/screens/auth/TermsConditions.jsx
// ─────────────────────────────────────────────────────────────
//  Terms & Conditions Screen
//  FundMe App  ·  React Native CLI  ·  100% responsive
//
//  ✅ Scrollable content cards
//  ✅ Checkbox toggles agreement
//  ✅ Accept & Continue button — disabled until checkbox ticked
//  ✅ Purple→pink gradient button (active) / muted (inactive)
//  ✅ Bold inline text inside card body
// ─────────────────────────────────────────────────────────────

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

// ── Colour tokens ──────────────────────────────────────────
const C = {
  bg: '#F4F5F7',
  white: '#FFFFFF',
  dark: '#1A1A2E',
  textGray: '#6B7280',
  textBlueGray: '#7B8FA6',
  border: '#E5E7EB',
  checkBorder: '#D1D5DB',
  checkActive: '#00B4CC',
  purpleStart: '#0B5E6B',
  purpleEnd: '#F472B6',
  mutedStart: '#b9d8dd',
  mutedEnd: '#FBCFE8',
  primary: '#00B4CC',
  primaryDark: '#0B5E6B',
};

// ── Terms sections data ────────────────────────────────────
//  Each content item: { type: 'plain' | 'bold', text: string }
//  This lets us render inline bold text cleanly
const SECTIONS = [
  {
    id: '1',
    heading: 'Acceptance of Terms',
    content: [
      {
        type: 'plain',
        text: 'By accessing and using FundMe, you agree to comply with and be bound by these terms. If you do not agree with any part of these terms, please do not use our platform.',
      },
    ],
  },
  {
    id: '2',
    heading: 'User Responsibilities',
    content: [
      {
        type: 'plain',
        text: 'You are responsible for maintaining the confidentiality of your account and ensuring that all information provided is ',
      },
      { type: 'bold', text: 'accurate and truthful' },
      {
        type: 'plain',
        text: '. You must notify us immediately of any unauthorized use.',
      },
    ],
  },
  {
    id: '3',
    heading: 'Donations & Payments',
    content: [
      {
        type: 'plain',
        text: 'All donations made through the platform are considered final. We use secure third-party payment gateways to process your transactions safely and securely.',
      },
    ],
  },
  {
    id: '4',
    heading: 'Privacy Policy',
    content: [
      {
        type: 'plain',
        text: 'We collect and use your personal information as described in our Privacy Policy. By using FundMe, you consent to our data practices, including the collection, use, and sharing of your information as outlined therein.',
      },
    ],
  },
  {
    id: '5',
    heading: 'Campaign Guidelines',
    content: [
      {
        type: 'plain',
        text: 'All campaigns must be for legitimate and lawful purposes. FundMe reserves the right to remove any campaign that violates our community standards, contains false information, or engages in fraudulent activity.',
      },
    ],
  },
  {
    id: '6',
    heading: 'Limitation of Liability',
    content: [
      {
        type: 'plain',
        text: 'FundMe shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability is limited to the amount paid in the twelve months prior to the claim.',
      },
    ],
  },
];

// ── Paragraph with optional inline bold spans ──────────────
const Paragraph = ({ content }) => {
  if (content.length === 1 && content[0].type === 'plain') {
    return <Text style={card.body}>{content[0].text}</Text>;
  }
  return (
    <Text style={card.body}>
      {content.map((chunk, i) =>
        chunk.type === 'bold' ? (
          <Text key={i} style={card.bold}>
            {chunk.text}
          </Text>
        ) : (
          <Text key={i}>{chunk.text}</Text>
        ),
      )}
    </Text>
  );
};

// ── Section card ───────────────────────────────────────────
const SectionCard = ({ heading, content }) => (
  <View style={card.wrap}>
    <Text style={card.heading}>{heading}</Text>
    <Paragraph content={content} />
  </View>
);

const card = StyleSheet.create({
  wrap: {
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  heading: {
    fontSize: 15,
    fontWeight: '700',
    color: C.dark,
    marginBottom: 10,
  },
  body: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
  bold: {
    fontSize: 14,
    fontWeight: '700',
    color: C.dark,
  },
});

// ── Main Screen ────────────────────────────────────────────
const TermsConditions = ({ navigation }) => {
  const [agreed, setAgreed] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleAccept = () => {
    if (!agreed) return;
    navigation.goBack(); // ← replace with your target route e.g. 'HomeScreen'
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={s.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon name="arrow-left" size={22} color={C.dark} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Terms & Conditions</Text>
        {/* Invisible right spacer keeps title visually centred */}
        <View style={s.headerRight} />
      </View>

      {/* ── Animated content wrapper ── */}
      <Animated.View
        style={[
          s.flex,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* ── Scrollable body ── */}
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Big page heading */}
          <Text style={s.pageTitle}>FundMe Terms of Use</Text>
          <Text style={s.lastUpdated}>Last updated: March 2026</Text>

          {/* All section cards */}
          {SECTIONS.map(sec => (
            <SectionCard
              key={sec.id}
              heading={sec.heading}
              content={sec.content}
            />
          ))}

          <View style={{ height: 8 }} />
        </ScrollView>

        {/* ── Fixed bottom area: checkbox + button ── */}
        <View style={s.bottomWrap}>
          {/* Checkbox row */}
          <TouchableOpacity
            style={s.checkRow}
            onPress={() => setAgreed(p => !p)}
            activeOpacity={0.8}
          >
            <View style={[s.checkbox, agreed && s.checkboxActive]}>
              {agreed && <Icon name="check" size={13} color={C.white} />}
            </View>
            <Text style={s.checkLabel}>
              {'I agree to the Terms & Conditions'}
            </Text>
          </TouchableOpacity>

          {/* Accept & Continue — gradient changes when toggled */}
          <TouchableOpacity
            onPress={handleAccept}
            activeOpacity={agreed ? 0.85 : 1}
            disabled={!agreed}
            style={s.btnTouchable}
          >
            <LinearGradient
              colors={
                agreed
                  ? [C.primary, C.primary, C.primaryDark]
                  : [C.mutedStart, C.primary]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={s.btnGradient}
            >
              <Text style={[s.btnTxt, !agreed && s.btnTxtMuted]}>
                Accept & Continue
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default TermsConditions;

// ── Screen styles ──────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  flex: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.white,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: { width: 36, alignItems: 'flex-start' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: C.dark,
  },
  headerRight: { width: 36 }, // mirrors backBtn to keep title centred

  // Scrollable area
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 8,
  },

  // Page title area
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: C.dark,
    marginBottom: 6,
  },
  lastUpdated: {
    fontSize: 13,
    color: C.textBlueGray,
    marginBottom: 22,
  },

  // Bottom fixed area
  bottomWrap: {
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
  },

  // Checkbox
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: C.checkBorder,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxActive: {
    backgroundColor: C.primary,
    borderColor: C.primary,
  },
  checkLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: C.dark,
  },

  // Button
  btnTouchable: { width: '100%' },
  btnGradient: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnTxt: {
    color: C.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  btnTxtMuted: { opacity: 0.75 },
});
