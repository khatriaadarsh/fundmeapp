// src/screens/campaigncreation/CreateCampaign.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import Icons from 'react-native-vector-icons/Feather';

const { width: SW, height: SH } = Dimensions.get('window');
const scale = size => (SW / 375) * size;
const vscale = size => (SH / 812) * size;

const C = {
  bg: '#FFFFFF',
  primary: '#0A3D62',
  primaryLight: '#15AABF',
  textDark: '#1A1A2E',
  textGray: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  inputBg: '#F9FAFB',
  infoBg: '#E0F2FE',
  infoText: '#0369A1',
  white: '#FFFFFF',
  urgent: '#0A3D62',
  progressBg: '#E5E7EB',
};

const TOTAL_STEPS = 4;
const CURRENT_STEP = 1;

const CreateCampaign = ({ navigation }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: '', // Empty by default
    fundingGoal: '',
    endDate: '',
    isUrgent: false, // Unchecked by default
  });

  const [charCount, setCharCount] = useState(0);
  const maxChars = 100;

  const handleTitleChange = (text) => {
    if (text.length <= maxChars) {
      setFormData({ ...formData, title: text });
      setCharCount(text.length);
    }
  };

  // Calculate progress percentage (25% for step 1)
  const progressPercent = (CURRENT_STEP / TOTAL_STEPS) * 100;

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      
      {/* Fixed Header */}
      <View style={s.header}>
        <TouchableOpacity 
          style={s.closeBtn} 
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icons name="x" size={scale(24)} color={C.textDark} />
        </TouchableOpacity>
        
        <Text style={s.headerTitle}>Create Campaign</Text>
        
        <View style={s.stepIndicator}>
          <Text style={s.stepText}>
            <Text style={s.stepActive}>{CURRENT_STEP}</Text>
            <Text style={s.stepTotal}> of {TOTAL_STEPS}</Text>
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={s.progressContainer}>
        <View style={s.progressBar}>
          <View style={[s.progressFill, { width: `${progressPercent}%` }]} />
        </View>
      </View>

      {/* Main Content with Keyboard Handling */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? vscale(90) : 0}
      >
        <ScrollView 
          style={s.scrollView}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={s.sectionTitle}>Basic Information</Text>

          {/* Campaign Title */}
          <View style={s.fieldContainer}>
            <View style={s.labelRow}>
              <Text style={s.label}>Campaign Title</Text>
              <Text style={s.charCounter}>{charCount}/{maxChars}</Text>
            </View>
            <View style={s.inputWrapper}>
              <TextInput
                style={s.input}
                placeholder="e.g. Help build a school"
                placeholderTextColor={C.textLight}
                value={formData.title}
                onChangeText={handleTitleChange}
                maxLength={maxChars}
              />
            </View>
          </View>

          {/* Category */}
          <View style={s.fieldContainer}>
            <Text style={s.label}>Category</Text>
            <TouchableOpacity style={s.dropdown} activeOpacity={0.7}>
              <Text style={[
                s.dropdownText, 
                !formData.category && { color: C.textLight }
              ]}>
                {formData.category || 'Select Category'}
              </Text>
              <Icons name="chevron-down" size={scale(20)} color={C.textGray} />
            </TouchableOpacity>
          </View>

          {/* Funding Goal */}
          <View style={s.fieldContainer}>
            <Text style={s.label}>Funding Goal</Text>
            <View style={s.inputWrapper}>
              <View style={s.prefixContainer}>
                <Text style={s.prefix}>PKR</Text>
                <View style={s.prefixLine} />
              </View>
              <TextInput
                style={[s.input, s.inputWithPrefix]}
                placeholder="0"
                placeholderTextColor={C.textLight}
                keyboardType="numeric"
                value={formData.fundingGoal}
                onChangeText={(text) => setFormData({ ...formData, fundingGoal: text })}
              />
            </View>
          </View>

          {/* End Date */}
          <View style={s.fieldContainer}>
            <Text style={s.label}>End Date</Text>
            <TouchableOpacity style={s.datePicker} activeOpacity={0.7}>
              <Text style={[
                s.dateText, 
                !formData.endDate && { color: C.textLight }
              ]}>
                {formData.endDate || 'Select date'}
              </Text>
              <Icons name="calendar" size={scale(20)} color={C.textGray} />
            </TouchableOpacity>
          </View>

          {/* Urgent Checkbox */}
          <TouchableOpacity 
            style={s.urgentContainer}
            onPress={() => setFormData({ ...formData, isUrgent: !formData.isUrgent })}
            activeOpacity={0.7}
          >
            <View style={[s.checkbox, formData.isUrgent && s.checkboxActive]}>
              {formData.isUrgent && (
                <Icons name="check" size={scale(14)} color={C.white} />
              )}
            </View>
            <Text style={s.urgentText}>Mark as Urgent</Text>
            <Text style={s.fireIcon}>🔥</Text>
          </TouchableOpacity>

          {/* Info Box */}
          <View style={s.infoBox}>
            <View style={s.infoIconContainer}>
              <Icons name="info" size={scale(16)} color={C.infoText} />
            </View>
            <Text style={s.infoText}>
              Urgent campaigns get priority visibility on the home feed to help you raise funds faster.
            </Text>
          </View>

          {/* Bottom padding to ensure content above button */}
          <View style={s.bottomPadding} />
        </ScrollView>

        {/* Fixed Bottom Button - Now inside KeyboardAvoidingView but not absolute */}
        <View style={s.footer}>
          <TouchableOpacity 
            style={s.nextButton}
            onPress={() => navigation.navigate('CampaignPhotos')}
            activeOpacity={0.85}
          >
            <Text style={s.nextButtonText}>Next</Text>
            <Icons name="arrow-right" size={scale(18)} color={C.white} style={s.nextIcon} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  container: {
    flex: 1,
  },
  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingTop: vscale(12),
    paddingBottom: vscale(12),
    backgroundColor: C.bg,
  },
  closeBtn: {
    padding: scale(4),
  },
  headerTitle: {
    fontSize: scale(17),
    fontWeight: '700',
    color: C.textDark,
    letterSpacing: -0.3,
  },
  stepIndicator: {
    minWidth: scale(50),
    alignItems: 'flex-end',
  },
  stepText: {
    fontSize: scale(14),
  },
  stepActive: {
    fontWeight: '700',
    color: C.textDark,
  },
  stepTotal: {
    color: C.textGray,
    fontWeight: '500',
  },
  // Progress Bar
  progressContainer: {
    paddingHorizontal: scale(20),
    paddingBottom: vscale(8),
    backgroundColor: C.bg,
  },
  progressBar: {
    height: scale(4),
    backgroundColor: C.progressBg,
    borderRadius: scale(2),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: C.primary,
    borderRadius: scale(2),
  },
  // Content Styles
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: scale(20),
    paddingTop: vscale(16),
    paddingBottom: vscale(20),
  },
  sectionTitle: {
    fontSize: scale(20),
    fontWeight: '800',
    color: C.textDark,
    marginBottom: vscale(24),
    letterSpacing: -0.5,
  },
  fieldContainer: {
    marginBottom: vscale(20),
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vscale(8),
  },
  label: {
    fontSize: scale(14),
    fontWeight: '600',
    color: C.textGray,
  },
  charCounter: {
    fontSize: scale(12),
    color: C.textLight,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: scale(12),
    backgroundColor: C.white,
    height: vscale(50),
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: scale(16),
    fontSize: scale(15),
    color: C.textDark,
    fontWeight: '500',
  },
  inputWithPrefix: {
    paddingLeft: scale(8),
  },
  prefixContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: scale(16),
    height: '100%',
  },
  prefix: {
    fontSize: scale(15),
    color: C.textGray,
    fontWeight: '600',
    marginRight: scale(8),
  },
  prefixLine: {
    width: 1,
    height: scale(20),
    backgroundColor: C.border,
    marginRight: scale(8),
  },
  // Dropdown
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: scale(12),
    backgroundColor: C.white,
    height: vscale(50),
    paddingHorizontal: scale(16),
  },
  dropdownText: {
    fontSize: scale(15),
    color: C.textDark,
    fontWeight: '500',
  },
  // Date Picker
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: scale(12),
    backgroundColor: C.white,
    height: vscale(50),
    paddingHorizontal: scale(16),
  },
  dateText: {
    fontSize: scale(15),
    color: C.textDark,
    fontWeight: '500',
  },
  // Urgent Checkbox
  urgentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vscale(8),
    marginBottom: vscale(16),
  },
  checkbox: {
    width: scale(22),
    height: scale(22),
    borderRadius: scale(6),
    borderWidth: 2,
    borderColor: C.border,
    marginRight: scale(10),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.white,
  },
  checkboxActive: {
    backgroundColor: C.urgent,
    borderColor: C.urgent,
  },
  urgentText: {
    fontSize: scale(15),
    fontWeight: '600',
    color: C.textDark,
  },
  fireIcon: {
    fontSize: scale(14),
    marginLeft: scale(4),
  },
  // Info Box
  infoBox: {
    flexDirection: 'row',
    backgroundColor: C.infoBg,
    borderRadius: scale(12),
    padding: scale(16),
    alignItems: 'flex-start',
  },
  infoIconContainer: {
    marginRight: scale(12),
    marginTop: scale(2),
  },
  infoText: {
    flex: 1,
    fontSize: scale(13),
    color: C.infoText,
    lineHeight: scale(20),
    fontWeight: '500',
  },
  // Footer - No longer absolute, properly handled by KeyboardAvoidingView
  bottomPadding: {
    height: vscale(20), // Extra scroll space
  },
  footer: {
    backgroundColor: C.bg,
    paddingHorizontal: scale(20),
    paddingVertical: vscale(12),
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingBottom: Platform.OS === 'ios' ? vscale(24) : vscale(16),
  },
  nextButton: {
    backgroundColor: C.primary,
    height: vscale(52),
    borderRadius: scale(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    color: C.white,
    fontSize: scale(16),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  nextIcon: {
    marginLeft: scale(8),
  },
});

export default CreateCampaign;