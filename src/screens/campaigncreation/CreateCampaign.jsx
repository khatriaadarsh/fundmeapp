// src/screens/campaign/CreateCampaign.jsx
// ─────────────────────────────────────────────────────────────
//  Create Campaign — Step 1 of 4 — Basic Information
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
import { C, rs, vs, ms, NavHeader, FieldLabel, Dropdown } from './Shared';

// ── Constants ──────────────────────────────────────────────
const CATEGORIES = [
  'Medical',
  'Education',
  'Emergency',
  'Food',
  'Shelter',
  'Water',
  'Environment',
  'Other',
];

// ── Screen ─────────────────────────────────────────────────
const CreateCampaign = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Medical');
  const [goal, setGoal] = useState('');
  const [endDate, setEndDate] = useState('');
  const [urgent, setUrgent] = useState(true); // ticked in screenshot

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      {/* ── Header ── */}
      <NavHeader
        title="Create Campaign"
        step={1}
        total={4}
        onLeft={() => navigation.goBack()}
        leftIcon="close"
      />

      <Animated.View style={[s.flex, { opacity: fadeAnim }]}>
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Section heading */}
          <Text style={s.sectionHeading}>Basic Information</Text>

          {/* Campaign Title */}
          <View style={s.fieldWrap}>
            <FieldLabel
              label="Campaign Title"
              counter={`${title.length}/100`}
            />
            <TextInput
              style={s.input}
              placeholder="e.g. Help build a school"
              placeholderTextColor={C.placeholder}
              value={title}
              onChangeText={t => t.length <= 100 && setTitle(t)}
            />
          </View>

          {/* Category */}
          <Dropdown
            label="Category"
            value={category}
            options={CATEGORIES}
            onSelect={setCategory}
            placeholder="Select category"
          />

          {/* Funding Goal */}
          <View style={s.fieldWrap}>
            <FieldLabel label="Funding Goal" />
            <View style={s.prefixWrap}>
              <View style={s.prefixBox}>
                <Text style={s.prefixTxt}>PKR</Text>
              </View>
              <View style={s.prefixDivider} />
              <TextInput
                style={s.prefixInput}
                placeholder="0"
                placeholderTextColor={C.placeholder}
                value={goal}
                onChangeText={setGoal}
                keyboardType="number-pad"
              />
            </View>
          </View>

          {/* End Date */}
          <View style={s.fieldWrap}>
            <FieldLabel label="End Date" />
            <View style={s.iconInput}>
              <TextInput
                style={s.iconInputField}
                placeholder="Select date"
                placeholderTextColor={C.placeholder}
                value={endDate}
                onChangeText={setEndDate}
              />
              <Icon
                name="calendar-blank-outline"
                size={ms(20)}
                color={C.light}
                style={s.trailingIcon}
              />
            </View>
          </View>

          {/* Mark as Urgent */}
          <TouchableOpacity
            style={s.checkRow}
            onPress={() => setUrgent(p => !p)}
            activeOpacity={0.8}
          >
            <View style={[s.checkbox, urgent && s.checkboxOn]}>
              {urgent && <Icon name="check" size={ms(12)} color={C.white} />}
            </View>
            <Text style={s.checkLabel}>Mark as Urgent 🔥</Text>
          </TouchableOpacity>

          {/* Info banner — visible when urgent ticked */}
          {urgent && (
            <View style={s.infoBanner}>
              <Icon
                name="information-outline"
                size={ms(16)}
                color={C.teal}
                style={s.infoIcon}
              />
              <Text style={s.infoTxt}>
                Urgent campaigns get priority visibility on the home feed to
                help you raise funds faster.
              </Text>
            </View>
          )}

          <View style={{ height: vs(16) }} />
        </ScrollView>

        {/* ── Next button ── */}
        <View style={s.btnWrap}>
          <TouchableOpacity
            style={s.nextBtn}
            onPress={() =>
              navigation.navigate('CampaignDetails', {
                title,
                category,
                goal,
                endDate,
                urgent,
              })
            }
            activeOpacity={0.85}
          >
            <Text style={s.nextBtnTxt}>Next</Text>
            <Icon name="arrow-right" size={ms(17)} color={C.white} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

export default CreateCampaign;

// ── Styles ─────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.screenBg },
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
    marginBottom: vs(25),
  },

  fieldWrap: { marginBottom: vs(16) },

  // Plain text input
  input: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: rs(8),
    backgroundColor: C.inputBg,
    paddingHorizontal: rs(12),
    height: vs(50),
    minHeight: 44,
    fontSize: ms(14),
    color: C.dark,
  },

  // PKR prefix input
  prefixWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: rs(8),
    backgroundColor: C.inputBg,
    height: vs(50),
    minHeight: 44,
    overflow: 'hidden',
  },
  prefixBox: {
    paddingHorizontal: rs(14),
    justifyContent: 'center',
    alignSelf: 'stretch',
    backgroundColor: '#F9FAFB',
  },
  prefixTxt: { fontSize: ms(13), fontWeight: '700', color: C.dark },
  prefixDivider: { width: 1, alignSelf: 'stretch', backgroundColor: C.border },
  prefixInput: {
    flex: 1,
    paddingHorizontal: rs(12),
    fontSize: ms(14),
    color: C.dark,
  },

  // Input with trailing icon
  iconInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: rs(8),
    backgroundColor: C.inputBg,
    height: vs(50),
    minHeight: 44,
  },
  iconInputField: {
    flex: 1,
    paddingHorizontal: rs(12),
    fontSize: ms(14),
    color: C.dark,
  },
  trailingIcon: { paddingRight: rs(12) },

  // Checkbox row
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(12),
  },
  checkbox: {
    width: rs(20),
    height: rs(20),
    borderRadius: rs(4),
    borderWidth: 2,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: rs(10),
  },
  checkboxOn: { backgroundColor: C.navy, borderColor: C.navy },
  checkLabel: { fontSize: ms(14), fontWeight: '600', color: C.dark },

  // Info banner
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: C.infoBg,
    borderWidth: 1,
    borderColor: C.infoBorder,
    borderRadius: rs(8),
    padding: rs(12),
  },
  infoIcon: { marginRight: rs(8), marginTop: 1 },
  infoTxt: { flex: 1, fontSize: ms(13), color: C.infoText, lineHeight: ms(19) },

  // Next button (full width, dark navy)
  btnWrap: {
    paddingHorizontal: rs(18),
    paddingVertical: vs(18),
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  nextBtn: {
    backgroundColor: C.navy,
    borderRadius: rs(10),
    paddingVertical: vs(15),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(8),
  },
  nextBtnTxt: { color: C.white, fontSize: ms(16), fontWeight: '700' },
});
