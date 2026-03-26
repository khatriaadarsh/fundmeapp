// src/screens/campaign/CampaignDetails.jsx
// ─────────────────────────────────────────────────────────────
//  Campaign Details — Step 2 of 4
//  FundMe App  ·  React Native CLI  ·  100% responsive
// ─────────────────────────────────────────────────────────────

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { C, StepHeader, BtnRow, Dropdown, FieldLabel } from './Shared';

const RELATIONSHIPS = ['Family', 'Friend', 'Self', 'Community', 'NGO', 'Other'];
const CITIES = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Peshawar',
  'Quetta',
  'Multan',
];
const PROVINCES = [
  'Punjab',
  'Sindh',
  'KPK',
  'Balochistan',
  'Gilgit-Baltistan',
  'AJK',
];

// ── Rich text toolbar (B / I / ≡) ─────────────────────────
const RichToolbar = () => (
  <View style={tb.row}>
    {[
      { icon: 'format-bold', key: 'B' },
      { icon: 'format-italic', key: 'I' },
      { icon: 'format-list-bulleted', key: 'L' },
    ].map(t => (
      <TouchableOpacity key={t.key} style={tb.btn} activeOpacity={0.7}>
        <Icon name={t.icon} size={17} color={C.dark} />
      </TouchableOpacity>
    ))}
  </View>
);
const tb = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingHorizontal: 6,
    paddingVertical: 5,
    backgroundColor: '#FAFAFA',
  },
  btn: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
});

// ── Main screen ────────────────────────────────────────────
const CampaignDetails = ({ navigation, route }) => {
  const params = route?.params || {};

  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [beneficiary, setBeneficiary] = useState('');
  const [relationship, setRelationship] = useState('Family');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');

  // Focus states for border highlight
  const [shortFocus, setShortFocus] = useState(false);
  const [fullFocus, setFullFocus] = useState(false);
  const [benFocus, setBenFocus] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleNext = () =>
    navigation.navigate('PhotosDocuments', {
      ...params,
      shortDesc,
      fullDesc,
      beneficiary,
      relationship,
      city,
      province,
    });

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      <StepHeader
        step={2}
        total={4}
        title="Create Campaign"
        onLeft={() => navigation.goBack()}
      />

      <Animated.View style={[s.flex, { opacity: fadeAnim }]}>
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={s.pageTitle}>Campaign Details</Text>

          {/* Short Description */}
          <View style={s.fieldBlock}>
            <FieldLabel
              text="Short Description"
              right={`${shortDesc.length}/500`}
            />
            <TextInput
              style={[s.textarea, shortFocus && s.focused]}
              placeholder={'Briefly explain who you are helping and\nwhy....'}
              placeholderTextColor={C.placeholderColor}
              value={shortDesc}
              onChangeText={t => t.length <= 500 && setShortDesc(t)}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              onFocus={() => setShortFocus(true)}
              onBlur={() => setShortFocus(false)}
            />
          </View>

          {/* Full Description */}
          <View style={s.fieldBlock}>
            <FieldLabel text="Full Description" />
            {/* Bordered rich area — toolbar on top, input below */}
            <View style={[s.richWrap, fullFocus && s.focused]}>
              <RichToolbar />
              <TextInput
                style={s.richInput}
                placeholder={
                  'Tell the full story. Be transparent about costs\nand needs.'
                }
                placeholderTextColor={C.placeholderColor}
                value={fullDesc}
                onChangeText={setFullDesc}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                onFocus={() => setFullFocus(true)}
                onBlur={() => setFullFocus(false)}
              />
            </View>
          </View>

          {/* Beneficiary Name */}
          <View style={s.fieldBlock}>
            <FieldLabel text="Beneficiary Name" />
            <View style={[s.iconInput, benFocus && s.focused]}>
              <Icon
                name="account-outline"
                size={18}
                color={C.textLight}
                style={s.inputIcon}
              />
              <TextInput
                style={s.inlineInput}
                placeholder="Full Name"
                placeholderTextColor={C.placeholderColor}
                value={beneficiary}
                onChangeText={setBeneficiary}
                onFocus={() => setBenFocus(true)}
                onBlur={() => setBenFocus(false)}
              />
            </View>
          </View>

          {/* Relationship */}
          <Dropdown
            label="Relationship"
            value={relationship}
            options={RELATIONSHIPS}
            onSelect={setRelationship}
            placeholder="Select relationship"
          />

          {/* City */}
          <Dropdown
            label="City"
            value={city}
            options={CITIES}
            onSelect={setCity}
            placeholder="Select City"
            leftIcon="map-marker-outline"
          />

          {/* Province */}
          <Dropdown
            label="Province"
            value={province}
            options={PROVINCES}
            onSelect={setProvince}
            placeholder="Select Province"
          />

          <View style={{ height: 8 }} />
        </ScrollView>

        {/* ── Back + Next ── */}
        <BtnRow onBack={() => navigation.goBack()} onNext={handleNext} />
      </Animated.View>
    </SafeAreaView>
  );
};

export default CampaignDetails;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 18, paddingTop: 22, paddingBottom: 8 },
  pageTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: C.dark,
    marginBottom: 22,
  },
  fieldBlock: { marginBottom: 14 },

  focused: { borderColor: C.teal },

  /* ── Short desc ── */
  textarea: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    backgroundColor: C.inputBg,
    padding: 12,
    fontSize: 14,
    color: C.dark,
    minHeight: 88,
  },

  /* ── Rich text area ── */
  richWrap: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    backgroundColor: C.inputBg,
    overflow: 'hidden',
  },
  richInput: {
    padding: 12,
    fontSize: 14,
    color: C.dark,
    minHeight: 100,
  },

  /* ── Icon input (Beneficiary) ── */
  iconInput: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    backgroundColor: C.inputBg,
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 8 },
  inlineInput: { flex: 1, fontSize: 14, color: C.dark, paddingVertical: 0 },
});
