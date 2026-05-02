// src/screens/campaign/CreateCampaign.jsx
// ─────────────────────────────────────────────────────────────
//  Basic Information — Step 1 of 4
//  FundMe App  ·  React Native CLI  ·  100% responsive
// ─────────────────────────────────────────────────────────────

import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
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
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { P, sp } from '../../theme/theme';

// ✅ Default import — must match how StepHeader is exported
import { StepHeader } from '../../components/shared/StepHeader';

// ✅ Named imports from Shared — C, FieldLabel, ErrorMsg, Dropdown
import { C, FieldLabel, ErrorMsg, Dropdown } from './Shared';

// ─────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────
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

const TITLE_MAX = 100;
const TITLE_MIN = 5;
const GOAL_MIN = 1000;
const GOAL_MAX = 99999999;

// ─────────────────────────────────────────────────────────────
//  Helper — format Date → "DD Mon YYYY"
// ─────────────────────────────────────────────────────────────
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
  return `${date.getDate().toString().padStart(2, '0')} ${
    months[date.getMonth()]
  } ${date.getFullYear()}`;
};

// ─────────────────────────────────────────────────────────────
//  ProgressLine styles — defined BEFORE the component
// ─────────────────────────────────────────────────────────────
const plSt = StyleSheet.create({
  bg: { height: 3, backgroundColor: C.border },
  fill: { height: 3, backgroundColor: C.teal },
});

const ProgressLine = memo(({ pct }) => (
  <View style={plSt.bg}>
    <View style={[plSt.fill, { width: `${pct}%` }]} />
  </View>
));

// ─────────────────────────────────────────────────────────────
//  Screen styles — defined BEFORE CreateCampaign renders them
// ─────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  flex: { flex: 1 },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: sp(18),
    paddingTop: sp(22),
    paddingBottom: sp(8),
  },

  pageTitle: {
    fontSize: sp(20),
    fontWeight: '800',
    color: C.dark,
    marginBottom: sp(4),
  },
  pageSub: { fontSize: sp(12), color: C.textLight, marginBottom: sp(20) },
  star: { color: C.red, fontWeight: '700' },
  warnText: { fontSize: sp(11), color: C.red, marginTop: sp(4) },

  fieldBlock: { marginBottom: sp(14) },
  inputFocused: { borderColor: C.teal, borderWidth: 1.5 },
  inputError: { borderColor: C.red, borderWidth: 1.5 },

  input: {
    height: sp(50),
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: sp(10),
    backgroundColor: C.inputBg,
    paddingHorizontal: sp(14),
    fontSize: sp(14),
    color: C.dark,
  },

  prefixWrap: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: sp(10),
    backgroundColor: C.inputBg,
    overflow: 'hidden',
    height: sp(50),
  },
  prefixBox: {
    paddingHorizontal: sp(14),
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: C.border,
    backgroundColor: '#F8FAFC',
  },
  prefixTxt: { fontSize: sp(13), fontWeight: '700', color: C.dark },
  prefixInput: {
    flex: 1,
    paddingHorizontal: sp(12),
    fontSize: sp(14),
    color: C.dark,
  },

  dateWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: sp(50),
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: sp(10),
    backgroundColor: C.inputBg,
    paddingHorizontal: sp(14),
  },
  dateTxt: { flex: 1, fontSize: sp(14), color: C.dark },
  datePlaceholder: { color: C.placeholderColor },

  urgentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sp(12),
  },
  checkbox: {
    width: sp(20),
    height: sp(20),
    borderRadius: sp(5),
    borderWidth: 2,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: sp(10),
  },
  checkboxOn: { backgroundColor: C.navy, borderColor: C.navy },
  urgentLabel: { fontSize: sp(14), fontWeight: '600', color: C.dark },

  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: C.infoBg,
    borderWidth: 1,
    borderColor: C.infoBorder,
    borderRadius: sp(10),
    padding: sp(12),
  },
  infoTxt: { flex: 1, fontSize: sp(13), color: C.infoText, lineHeight: sp(19) },

  footer: {
    paddingHorizontal: sp(18),
    paddingTop: sp(12),
    paddingBottom: Platform.OS === 'android' ? sp(18) : sp(10),
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  nextBtn: {
    backgroundColor: C.navy,
    borderRadius: sp(10),
    height: sp(50),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: sp(8),
  },
  nextBtnTxt: { color: C.white, fontSize: sp(16), fontWeight: '700' },
});

// ─────────────────────────────────────────────────────────────
//  iOS modal styles — defined BEFORE they are referenced
// ─────────────────────────────────────────────────────────────
const ios = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: sp(20),
    borderTopRightRadius: sp(20),
    paddingBottom: sp(36),
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sp(16),
    paddingVertical: sp(14),
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  toolBtn: { minWidth: sp(60) },
  toolTitle: { fontSize: sp(15), fontWeight: '700', color: C.dark },
  cancelTxt: { fontSize: sp(15), color: C.textGray },
  doneTxt: {
    fontSize: sp(15),
    color: C.teal,
    fontWeight: '700',
    textAlign: 'right',
  },
  picker: { alignSelf: 'center' },
});

// ─────────────────────────────────────────────────────────────
//  CreateCampaign — main screen component
// ─────────────────────────────────────────────────────────────
const CreateCampaign = ({ navigation }) => {
  // ── Form state ──────────────────────────────────────────
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [goalRaw, setGoalRaw] = useState('');
  const [goalDisplay, setGoalDisplay] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [tempDate, setTempDate] = useState(new Date());
  const [urgent, setUrgent] = useState(false);

  // ── Picker visibility ────────────────────────────────────
  const [showPicker, setShowPicker] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  // ── Validation + focus state ─────────────────────────────
  const [errors, setErrors] = useState({});
  const [focus, setFocus] = useState({});

  const clearError = key => setErrors(prev => ({ ...prev, [key]: undefined }));
  const setFocused = key => setFocus(f => ({ ...f, [key]: true }));
  const setBlurred = key => setFocus(f => ({ ...f, [key]: false }));

  // ── Fade-in animation ────────────────────────────────────
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const today = new Date();

  // ── Date picker ──────────────────────────────────────────
  const openDatePicker = () => {
    setTempDate(selectedDate || new Date());
    Platform.OS === 'ios' ? setShowIOSModal(true) : setShowPicker(true);
  };

  const onAndroidChange = (event, date) => {
    setShowPicker(false);
    if (event.type === 'set' && date) {
      setSelectedDate(date);
      clearError('endDate');
    }
  };

  const onIOSChange = (_, date) => {
    if (date) setTempDate(date);
  };
  const onIOSConfirm = () => {
    setSelectedDate(tempDate);
    setShowIOSModal(false);
    clearError('endDate');
  };
  const onIOSCancel = () => setShowIOSModal(false);

  // ── Goal input ───────────────────────────────────────────
  const handleGoalChange = text => {
    const digits = text.replace(/[^0-9]/g, '');
    setGoalRaw(digits);
    setGoalDisplay(digits ? Number(digits).toLocaleString('en-PK') : '');
    if (errors.goal) clearError('goal');
  };

  // ── Validation ───────────────────────────────────────────
  const validate = useCallback(() => {
    const e = {};
    if (!title.trim()) e.title = 'Campaign title is required';
    else if (title.trim().length < TITLE_MIN)
      e.title = `Title must be at least ${TITLE_MIN} characters`;

    if (!category) e.category = 'Please select a category';

    if (!goalRaw) e.goal = 'Funding goal is required';
    else if (Number(goalRaw) < GOAL_MIN)
      e.goal = `Minimum goal is PKR ${GOAL_MIN.toLocaleString('en-PK')}`;
    else if (Number(goalRaw) > GOAL_MAX) e.goal = 'Goal amount is too large';

    if (!selectedDate) e.endDate = 'Please select an end date';

    setErrors(e);
    return Object.keys(e).length === 0;
  }, [title, category, goalRaw, selectedDate]);

  // ── Next ─────────────────────────────────────────────────
  const handleNext = useCallback(() => {
    Keyboard.dismiss();
    if (!validate()) return;
    navigation.navigate('CampaignDetails', {
      title: title.trim(),
      category,
      goal: goalRaw,
      endDate: formatDate(selectedDate),
      urgent,
    });
  }, [validate, navigation, title, category, goalRaw, selectedDate, urgent]);

  const titleWarn = title.length >= 85;

  // ── Render ───────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      <StepHeader
        step={1}
        total={4}
        title="Create Campaign"
        onLeft={() => navigation.goBack()}
      />
      <ProgressLine pct={25} />

      <Animated.View style={[s.flex, { opacity: fadeAnim }]}>
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={s.pageTitle}>Basic Information</Text>
          <Text style={s.pageSub}>
            All fields marked with <Text style={s.star}>*</Text> are required
          </Text>

          {/* ── Campaign Title ──────────────────────────────── */}
          <View style={s.fieldBlock}>
            <FieldLabel
              text="Campaign Title"
              right={`${title.length}/${TITLE_MAX}`}
              rightWarn={titleWarn}
            />
            <TextInput
              style={[
                s.input,
                focus.title && s.inputFocused,
                errors.title && s.inputError,
              ]}
              placeholder="e.g. Help build a school in Sindh"
              placeholderTextColor={C.placeholderColor}
              value={title}
              onChangeText={t => {
                if (t.length <= TITLE_MAX) setTitle(t);
                if (errors.title) clearError('title');
              }}
              onFocus={() => setFocused('title')}
              onBlur={() => setBlurred('title')}
            />
            {titleWarn && !errors.title && (
              <Text style={s.warnText}>
                {TITLE_MAX - title.length} characters remaining
              </Text>
            )}
            <ErrorMsg msg={errors.title} />
          </View>

          {/* ── Category ────────────────────────────────────── */}
          <View style={s.fieldBlock}>
            <Dropdown
              label="Category"
              value={category}
              options={CATEGORIES}
              onSelect={v => {
                setCategory(v);
                clearError('category');
              }}
              placeholder="Select a category"
              error={errors.category}
            />
          </View>

          {/* ── Funding Goal ─────────────────────────────────── */}
          <View style={s.fieldBlock}>
            <FieldLabel text="Funding Goal" />
            <View
              style={[
                s.prefixWrap,
                focus.goal && s.inputFocused,
                errors.goal && s.inputError,
              ]}
            >
              <View style={s.prefixBox}>
                <Text style={s.prefixTxt}>PKR</Text>
              </View>
              <TextInput
                style={s.prefixInput}
                placeholder="0"
                placeholderTextColor={C.placeholderColor}
                value={goalDisplay}
                onChangeText={handleGoalChange}
                keyboardType="number-pad"
                onFocus={() => setFocused('goal')}
                onBlur={() => setBlurred('goal')}
              />
            </View>
            <ErrorMsg msg={errors.goal} />
          </View>

          {/* ── End Date ─────────────────────────────────────── */}
          <View style={s.fieldBlock}>
            <FieldLabel text="End Date" />
            <TouchableOpacity
              style={[s.dateWrap, errors.endDate && s.inputError]}
              onPress={openDatePicker}
              activeOpacity={0.8}
            >
              <Text style={[s.dateTxt, !selectedDate && s.datePlaceholder]}>
                {selectedDate ? formatDate(selectedDate) : 'Select end date'}
              </Text>
              <MaterialCommunityIcons
                name="calendar-blank-outline"
                size={sp(20)}
                color={selectedDate ? C.teal : C.textLight}
              />
            </TouchableOpacity>
            <ErrorMsg msg={errors.endDate} />
          </View>

          {/* Android inline calendar picker */}
          {Platform.OS === 'android' && showPicker && (
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="calendar"
              minimumDate={today}
              onChange={onAndroidChange}
            />
          )}

          {/* ── Mark as Urgent ───────────────────────────────── */}
          <TouchableOpacity
            style={s.urgentRow}
            onPress={() => setUrgent(p => !p)}
            activeOpacity={0.8}
          >
            <View style={[s.checkbox, urgent && s.checkboxOn]}>
              {urgent && (
                <MaterialCommunityIcons
                  name="check"
                  size={sp(12)}
                  color={C.white}
                />
              )}
            </View>
            <Text style={s.urgentLabel}>Mark as Urgent 🔥</Text>
          </TouchableOpacity>

          {urgent && (
            <View style={s.infoBanner}>
              <MaterialCommunityIcons
                name="information-outline"
                size={sp(16)}
                color={C.teal}
                style={{ marginRight: sp(8), marginTop: sp(1) }}
              />
              <Text style={s.infoTxt}>
                Urgent campaigns get priority visibility on the home feed to
                help you raise funds faster.
              </Text>
            </View>
          )}

          <View style={{ height: sp(16) }} />
        </ScrollView>

        {/* ── Footer ─────────────────────────────────────────── */}
        <View style={s.footer}>
          <TouchableOpacity
            style={s.nextBtn}
            activeOpacity={0.85}
            onPress={handleNext}
          >
            <Text style={s.nextBtnTxt}>Next</Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={sp(17)}
              color={C.white}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* ── iOS date picker modal ─────────────────────────────── */}
      <Modal
        visible={showIOSModal}
        transparent
        animationType="slide"
        onRequestClose={onIOSCancel}
      >
        <TouchableOpacity
          style={ios.overlay}
          activeOpacity={1}
          onPress={onIOSCancel}
        />
        <View style={ios.sheet}>
          <View style={ios.toolbar}>
            <TouchableOpacity onPress={onIOSCancel} style={ios.toolBtn}>
              <Text style={ios.cancelTxt}>Cancel</Text>
            </TouchableOpacity>
            <Text style={ios.toolTitle}>Select End Date</Text>
            <TouchableOpacity onPress={onIOSConfirm} style={ios.toolBtn}>
              <Text style={ios.doneTxt}>Done</Text>
            </TouchableOpacity>
          </View>
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="inline"
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
