// src/screens/campaign/CreateCampaign.jsx
// ─────────────────────────────────────────────────────────────
//  Basic Information — Step 1 of 4
//  FundMe App  ·  React Native CLI  ·  100% responsive
//
//  ✅ Real calendar date picker via @react-native-community/datetimepicker
//
//  Install:
//    npm install @react-native-community/datetimepicker
//    cd ios && pod install
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
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { C, StepHeader, Dropdown, FieldLabel } from './Shared';

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

// ── Format date as "DD MMM YYYY" ──────────────────────────
const formatDate = date => {
  if (!date) return '';
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const d = date.getDate().toString().padStart(2, '0');
  const m = months[date.getMonth()];
  const y = date.getFullYear();
  return `${d} ${m} ${y}`;
};

// ── Main Screen ────────────────────────────────────────────
const CreateCampaign = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Medical');
  const [goal, setGoal] = useState('');
  const [selectedDate, setSelectedDate] = useState(null); // Date object | null
  const [tempDate, setTempDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false); // Android: native picker
  const [showIOSModal, setShowIOSModal] = useState(false); // iOS: modal wrapper
  const [urgent, setUrgent] = useState(true);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // ── Open picker ──────────────────────────────────────────
  const openDatePicker = () => {
    setTempDate(selectedDate || new Date());
    if (Platform.OS === 'ios') {
      setShowIOSModal(true);
    } else {
      setShowPicker(true);
    }
  };

  // ── Android: onChange fires on every spin AND on confirm ─
  const onAndroidChange = (event, date) => {
    setShowPicker(false); // always close spinner
    if (event.type === 'set' && date) {
      setSelectedDate(date);
    }
    // event.type === 'dismissed' → user pressed back, do nothing
  };

  // ── iOS: runs on every scroll, only commit on Done ───────
  const onIOSChange = (event, date) => {
    if (date) setTempDate(date);
  };

  const onIOSConfirm = () => {
    setSelectedDate(tempDate);
    setShowIOSModal(false);
  };

  const onIOSCancel = () => {
    setShowIOSModal(false);
  };

  // ── Today as minimum selectable date ─────────────────────
  const today = new Date();

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      <StepHeader
        step={1}
        total={4}
        title="Create Campaign"
        onLeft={() => navigation.goBack()}
        isFirst
      />

      <Animated.View style={[s.flex, { opacity: fadeAnim }]}>
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={s.pageTitle}>Basic Information</Text>

          {/* Campaign Title */}
          <View style={s.fieldBlock}>
            <FieldLabel text="Campaign Title" right={`${title.length}/100`} />
            <TextInput
              style={s.input}
              placeholder="e.g. Help build a school"
              placeholderTextColor={C.placeholderColor}
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
          <View style={s.fieldBlock}>
            <FieldLabel text="Funding Goal" />
            <View style={s.prefixWrap}>
              <View style={s.prefixBox}>
                <Text style={s.prefixTxt}>PKR</Text>
              </View>
              <TextInput
                style={s.prefixInput}
                placeholder="0"
                placeholderTextColor={C.placeholderColor}
                value={goal}
                onChangeText={setGoal}
                keyboardType="number-pad"
              />
            </View>
          </View>

          {/* ── End Date — real calendar picker ── */}
          <View style={s.fieldBlock}>
            <FieldLabel text="End Date" />
            <TouchableOpacity
              style={s.dateWrap}
              onPress={openDatePicker}
              activeOpacity={0.8}
            >
              <Text style={[s.dateTxt, !selectedDate && s.datePlaceholder]}>
                {selectedDate ? formatDate(selectedDate) : 'Select date'}
              </Text>
              <Icon
                name="calendar-blank-outline"
                size={20}
                color={selectedDate ? C.dark : C.textLight}
                style={s.calIcon}
              />
            </TouchableOpacity>
          </View>

          {/* ── Android native date picker (shown inline) ── */}
          {Platform.OS === 'android' && showPicker && (
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="calendar" // full calendar grid
              minimumDate={today}
              onChange={onAndroidChange}
            />
          )}

          {/* Mark as Urgent */}
          <TouchableOpacity
            style={s.urgentRow}
            onPress={() => setUrgent(p => !p)}
            activeOpacity={0.8}
          >
            <View style={[s.checkbox, urgent && s.checkboxOn]}>
              {urgent && <Icon name="check" size={12} color={C.white} />}
            </View>
            <Text style={s.urgentLabel}>Mark as Urgent 🔥</Text>
          </TouchableOpacity>

          {urgent && (
            <View style={s.infoBanner}>
              <Icon
                name="information-outline"
                size={16}
                color={C.teal}
                style={{ marginRight: 8, marginTop: 1 }}
              />
              <Text style={s.infoTxt}>
                Urgent campaigns get priority visibility on the home feed to
                help you raise funds faster.
              </Text>
            </View>
          )}

          <View style={{ height: 16 }} />
        </ScrollView>

        {/* Next button */}
        <View style={s.btnWrap}>
          <TouchableOpacity
            style={s.nextBtn}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate('CampaignDetails', {
                title,
                category,
                goal,
                endDate: selectedDate ? formatDate(selectedDate) : '',
                urgent,
              })
            }
          >
            <Text style={s.nextBtnTxt}>Next</Text>
            <Icon name="arrow-right" size={17} color={C.white} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* ── iOS date picker modal ── */}
      <Modal
        visible={showIOSModal}
        transparent
        animationType="slide"
        onRequestClose={onIOSCancel}
      >
        {/* Dim overlay tapping closes modal */}
        <TouchableOpacity
          style={ios.overlay}
          activeOpacity={1}
          onPress={onIOSCancel}
        />

        <View style={ios.sheet}>
          {/* Toolbar */}
          <View style={ios.toolbar}>
            <TouchableOpacity onPress={onIOSCancel} style={ios.toolBtn}>
              <Text style={ios.cancelTxt}>Cancel</Text>
            </TouchableOpacity>
            <Text style={ios.toolTitle}>Select End Date</Text>
            <TouchableOpacity onPress={onIOSConfirm} style={ios.toolBtn}>
              <Text style={ios.doneTxt}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* iOS spinner / inline calendar */}
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="inline" // full calendar grid on iOS 14+
            minimumDate={today}
            onChange={onIOSChange}
            style={ios.picker}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CreateCampaign;

// ── iOS modal styles ───────────────────────────────────────
const ios = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 36,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  toolBtn: { minWidth: 60 },
  toolTitle: { fontSize: 15, fontWeight: '700', color: C.dark },
  cancelTxt: { fontSize: 15, color: C.textGray },
  doneTxt: {
    fontSize: 15,
    color: C.teal,
    fontWeight: '700',
    textAlign: 'right',
  },
  picker: { alignSelf: 'center' },
});

// ── Screen styles ──────────────────────────────────────────
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

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    backgroundColor: C.inputBg,
    paddingHorizontal: 12,
    fontSize: 14,
    color: C.dark,
  },

  prefixWrap: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    backgroundColor: C.inputBg,
    overflow: 'hidden',
    height: 48,
  },
  prefixBox: {
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: C.border,
    backgroundColor: '#F8FAFC',
  },
  prefixTxt: { fontSize: 13, fontWeight: '700', color: C.dark },
  prefixInput: { flex: 1, paddingHorizontal: 12, fontSize: 14, color: C.dark },

  // ✅ Date field is now a TouchableOpacity, not a TextInput
  dateWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    backgroundColor: C.inputBg,
  },
  dateTxt: { flex: 1, paddingHorizontal: 12, fontSize: 14, color: C.dark },
  datePlaceholder: { color: C.placeholderColor },
  calIcon: { paddingRight: 12 },

  urgentRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxOn: { backgroundColor: C.navy, borderColor: C.navy },
  urgentLabel: { fontSize: 14, fontWeight: '600', color: C.dark },

  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: C.infoBg,
    borderWidth: 1,
    borderColor: C.infoBorder,
    borderRadius: 8,
    padding: 12,
  },
  infoTxt: { flex: 1, fontSize: 13, color: C.infoText, lineHeight: 19 },

  btnWrap: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  nextBtn: {
    backgroundColor: C.navy,
    borderRadius: 10,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextBtnTxt: { color: C.white, fontSize: 15, fontWeight: '700' },
});
