// src/screens/campaign/CampaignDetails.jsx
// ─────────────────────────────────────────────────────────────
//  Campaign Details — Step 2 of 4
//  FundMe App  |  React Native CLI  |  Fully Responsive
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
import {
  C,
  rs,
  vs,
  ms,
  NavHeader,
  FieldLabel,
  Dropdown,
  DualButtons,
} from './Shared';

// ── Constants ──────────────────────────────────────────────
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

// ── Bold/Italic/List toolbar ───────────────────────────────
const RichToolbar = () => (
  <View style={tb.wrap}>
    {[
      { name: 'format-bold', label: 'B' },
      { name: 'format-italic', label: 'I' },
      { name: 'format-list-bulleted', label: '≡' },
    ].map((t, i) => (
      <TouchableOpacity key={i} style={tb.btn} activeOpacity={0.7}>
        <Icon name={t.name} size={ms(17)} color={C.mid} />
      </TouchableOpacity>
    ))}
  </View>
);
const tb = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingHorizontal: rs(8),
    paddingVertical: vs(5),
  },
  btn: {
    paddingHorizontal: rs(10),
    paddingVertical: vs(5),
    borderRadius: rs(4),
  },
});

// ── Screen ─────────────────────────────────────────────────
const CampaignDetails = ({ navigation, route }) => {
  const params = route?.params || {};

  const [shortDesc, setShortDesc] = useState('');
  const [fullDesc, setFullDesc] = useState('');
  const [beneficiary, setBeneficiary] = useState('');
  const [relationship, setRelationship] = useState('Family');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');

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

      <NavHeader
        title="Create Campaign"
        step={2}
        total={4}
        onLeft={() => navigation.goBack()}
      />

      <Animated.View style={[s.flex, { opacity: fadeAnim }]}>
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={s.sectionHeading}>Campaign Details</Text>

          {/* Short Description */}
          <View style={s.fieldWrap}>
            <FieldLabel
              label="Short Description"
              counter={`${shortDesc.length}/500`}
            />
            <TextInput
              style={[s.textarea, shortFocus && s.focused]}
              placeholder={'Briefly explain who you are helping and\nwhy....'}
              placeholderTextColor={C.placeholder}
              value={shortDesc}
              onChangeText={t => t.length <= 500 && setShortDesc(t)}
              multiline
              textAlignVertical="top"
              onFocus={() => setShortFocus(true)}
              onBlur={() => setShortFocus(false)}
            />
          </View>

          {/* Full Description with toolbar */}
          <View style={s.fieldWrap}>
            <FieldLabel label="Full Description" />
            <View style={[s.richBox, fullFocus && s.focused]}>
              <RichToolbar />
              <TextInput
                style={s.richInput}
                placeholder={
                  'Tell the full story. Be transparent about costs\nand needs.'
                }
                placeholderTextColor={C.placeholder}
                value={fullDesc}
                onChangeText={setFullDesc}
                multiline
                textAlignVertical="top"
                onFocus={() => setFullFocus(true)}
                onBlur={() => setFullFocus(false)}
              />
            </View>
          </View>

          {/* Beneficiary Name */}
          <View style={s.fieldWrap}>
            <FieldLabel label="Beneficiary Name" />
            <View style={[s.iconInputWrap, benFocus && s.focused]}>
              <Icon
                name="account-outline"
                size={ms(18)}
                color={C.light}
                style={s.leadIcon}
              />
              <TextInput
                style={s.iconInputField}
                placeholder="Full Name"
                placeholderTextColor={C.placeholder}
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

          <View style={{ height: vs(8) }} />
        </ScrollView>

        <DualButtons onBack={() => navigation.goBack()} onNext={handleNext} />
      </Animated.View>
    </SafeAreaView>
  );
};

export default CampaignDetails;

// ── Styles ─────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.screenBg,
  },
  flex: { flex: 1 },
  scroll: { flex: 1, backgroundColor: C.screenBg },
  content: {
    paddingHorizontal: rs(18),
    paddingTop: vs(20),
    paddingBottom: vs(12),
  },

  sectionHeading: {
    fontSize: ms(20),
    fontWeight: '800',
    color: C.dark,
    marginBottom: vs(20),
  },
  fieldWrap: { marginBottom: vs(16) },
  focused: { borderColor: C.teal },

  // Short description textarea
  textarea: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: rs(8),
    backgroundColor: C.inputBg,
    padding: rs(12),
    fontSize: ms(14),
    color: C.dark,
    minHeight: vs(80),
  },

  // Full description with toolbar
  richBox: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: rs(8),
    backgroundColor: C.inputBg,
    overflow: 'hidden',
  },
  richInput: {
    padding: rs(12),
    fontSize: ms(14),
    color: C.dark,
    minHeight: vs(100),
  },

  // Input with leading icon
  iconInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: rs(8),
    backgroundColor: C.inputBg,
    height: vs(48),
    minHeight: 44,
    paddingHorizontal: rs(12),
  },
  leadIcon: { marginRight: rs(8) },
  iconInputField: {
    flex: 1,
    fontSize: ms(14),
    color: C.dark,
    paddingVertical: 0,
  },
});
