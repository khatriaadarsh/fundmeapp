import React, { useState, useCallback, useEffect, useMemo, useRef, memo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
  Dimensions,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/Feather';
import MCIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Shared StepHeader component (already modular as requested)
import { StepHeader } from '../../components/shared/StepHeader';
// ── Import from Shared Theme ──────────────────────────────────
import { P, sp } from '../../theme/theme'; // Using shared theme file
import ResponseModal from '../../components/ResponseModal';

// ── API wiring ──────────────────────────────────────────────
import { useProvinces, useCities } from '../../hooks/useLocation';
import { useCampaignDetail } from '../../hooks/useCampaign';
import {
  useCreateCampaignStep2,
  useResubmitCampaignStep2,
} from '../../hooks/useCreateCampaign';

// ── Static options (not covered by an API) ────────────────────
const RELATIONSHIPS = ['Family', 'Friend', 'Self', 'Community', 'NGO', 'Other'];

// ════════════════════════════════════════════════════════════
//  FieldLabel — label + mandatory star + optional counter
// ════════════════════════════════════════════════════════════
const FieldLabel = memo(({ text, counter }) => (
  <View style={lbSt.row}>
    <View style={lbSt.left}>
      <Text style={lbSt.text}>{text}</Text>
      <Text style={lbSt.star}> *</Text>
    </View>
    {counter != null && <Text style={lbSt.counter}>{counter}</Text>}
  </View>
));

const lbSt = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: sp(6),
  },
  left: { flexDirection: 'row', alignItems: 'center' },
  text: { fontSize: sp(13), fontWeight: '600', color: P.dark },
  star: { fontSize: sp(13), fontWeight: '700', color: P.red },
  counter: { fontSize: sp(12), color: P.light },
});

// ════════════════════════════════════════════════════════════
//  ErrorMsg — inline error below a field
// ════════════════════════════════════════════════════════════
const ErrorMsg = memo(({ msg }) => {
  if (!msg) return null;
  return (
    <View style={erSt.row}>
      <Icons
        name="alert-circle"
        size={sp(12)}
        color={P.red}
        style={{ marginRight: sp(4) }}
      />
      <Text style={erSt.text}>{msg}</Text>
    </View>
  );
});

const erSt = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginTop: sp(5) },
  text: { fontSize: sp(11), color: P.red, flex: 1 },
});

// ════════════════════════════════════════════════════════════
//  RichToolbar — B / I / bullet list
// ════════════════════════════════════════════════════════════
const RichToolbar = memo(({ format, onFormatChange }) => (
  <View style={tbSt.row}>
    {[
      { icon: 'format-bold', label: 'bold' },
      { icon: 'format-italic', label: 'italic' },
      { icon: 'format-list-bulleted', label: 'list' },
    ].map(t => {
      const isActive = format[t.label];
      return (
        <TouchableOpacity
          key={t.label}
          style={[tbSt.btn, isActive && tbSt.btnActive]}
          onPress={() => onFormatChange(t.label)}
          activeOpacity={0.65}
        >
          <MCIcons
            name={t.icon}
            size={sp(16)}
            color={isActive ? P.darkOcean : P.gray}
          />
        </TouchableOpacity>
      );
    })}
    <View style={tbSt.divider} />
    <Text style={tbSt.hint}>Formatting</Text>
  </View>
));

const tbSt = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: P.border,
    paddingHorizontal: sp(10),
    paddingVertical: sp(7),
    backgroundColor: P.searchBg,
  },
  btn: {
    paddingHorizontal: sp(8),
    paddingVertical: sp(4),
    borderRadius: sp(4),
    marginHorizontal: sp(2),
  },
  btnActive: { backgroundColor: P.tealLight },
  divider: { flex: 1 },
  hint: { fontSize: sp(11), color: P.light, marginRight: sp(4) },
});

// ════════════════════════════════════════════════════════════
//  DropdownSheet — bottom-sheet picker modal (now with disabled state)
// ════════════════════════════════════════════════════════════
const DropdownSheet = memo(
  ({
    label,
    value,
    options,
    onSelect,
    placeholder,
    leftIcon,
    error,
    disabled = false,
  }) => {
    const [open, setOpen] = useState(false);
    const hasValue = Boolean(value);

    const handleOpen = () => {
      if (!disabled) {
        setOpen(true);
      }
    };

    return (
      <View style={dpSt.wrap}>
        <FieldLabel text={label} />
        <TouchableOpacity
          style={[
            dpSt.trigger,
            error && dpSt.triggerError,
            disabled && dpSt.triggerDisabled,
          ]}
          onPress={handleOpen}
          activeOpacity={disabled ? 1 : 0.8}
          disabled={disabled}
        >
          {leftIcon && (
            <MCIcons
              name={leftIcon}
              size={sp(17)}
              color={hasValue ? P.teal : P.light}
              style={dpSt.leftIcon}
            />
          )}
          <Text
            style={[dpSt.val, !hasValue && dpSt.ph, disabled && dpSt.ph]}
            numberOfLines={1}
          >
            {value || placeholder}
          </Text>
          <Icons name="chevron-down" size={sp(16)} color={P.light} />
        </TouchableOpacity>
        <ErrorMsg msg={error} />

        <Modal
          visible={open}
          transparent
          animationType="slide"
          onRequestClose={() => setOpen(false)}
        >
          <TouchableOpacity
            style={dpSt.overlay}
            activeOpacity={1}
            onPress={() => setOpen(false)}
          />
          <View style={dpSt.sheet}>
            <View style={dpSt.handle} />
            <Text style={dpSt.sheetTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={item => item}
              renderItem={({ item }) => {
                const isActive = item === value;
                return (
                  <TouchableOpacity
                    style={[dpSt.option, isActive && dpSt.optionActive]}
                    onPress={() => {
                      onSelect(item);
                      setOpen(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[dpSt.optTxt, isActive && dpSt.optTxtActive]}>
                      {item}
                    </Text>
                    {isActive && (
                      <Icons name="check" size={sp(15)} color={P.teal} />
                    )}
                  </TouchableOpacity>
                );
              }}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </Modal>
      </View>
    );
  },
);

const dpSt = StyleSheet.create({
  wrap: { marginBottom: sp(16) },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    height: sp(50),
    borderWidth: 1.5,
    borderColor: P.border,
    borderRadius: sp(10),
    backgroundColor: P.white,
    paddingHorizontal: sp(14),
  },
  triggerError: { borderColor: P.red },
  triggerDisabled: { backgroundColor: P.bg },
  leftIcon: { marginRight: sp(8) },
  val: { flex: 1, fontSize: sp(14), color: P.dark },
  ph: { color: P.light },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: P.white,
    borderTopLeftRadius: sp(20),
    borderTopRightRadius: sp(20),
    paddingBottom: Platform.OS === 'android' ? sp(20) : sp(34),
    maxHeight: '60%',
  },
  handle: {
    width: sp(36),
    height: sp(4),
    borderRadius: sp(2),
    backgroundColor: P.border,
    alignSelf: 'center',
    marginTop: sp(10),
    marginBottom: sp(4),
  },
  sheetTitle: {
    fontSize: sp(15),
    fontWeight: '700',
    color: P.dark,
    textAlign: 'center',
    paddingVertical: sp(12),
    borderBottomWidth: 1,
    borderBottomColor: P.border,
    marginHorizontal: sp(20),
    marginBottom: sp(4),
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: sp(14),
    paddingHorizontal: sp(22),
  },
  optionActive: { backgroundColor: P.tealLight },
  optTxt: { fontSize: sp(15), color: P.dark },
  optTxtActive: { color: P.teal, fontWeight: '700' },
});

// ════════════════════════════════════════════════════════════
//  ProgressLine — teal thin bar below header
// ════════════════════════════════════════════════════════════
const ProgressLine = memo(({ pct }) => (
  <View style={plSt.bg}>
    <View style={[plSt.fill, { width: `${pct}%` }]} />
  </View>
));

const plSt = StyleSheet.create({
  bg: { height: 3, backgroundColor: P.border },
  fill: { height: 3, backgroundColor: P.teal },
});

// ════════════════════════════════════════════════════════════
//  CampaignDetails — main screen
//
//  Doubles as the fix-up screen for a CAMPAIGN_REJECTED notification
//  whose rejectedStep is 2. In that mode the screen prefills itself
//  from the campaign detail API, the CTA reads "Update", and Next
//  posts to /campaigns/resubmit/step-2 instead of advancing the wizard.
// ════════════════════════════════════════════════════════════
const CampaignDetails = ({ navigation, route }) => {
  const params = useMemo(() => route?.params || {}, [route?.params]);
  const campaignId = params.campaignId ? String(params.campaignId) : null;

  const isRejection = params.isRejection === true;
  const rejectionReason = params.rejectionReason || '';

  // ── Form state — PREFILLED from params so that whenever this
  //    screen remounts (e.g. after editing Step 1 from the Review
  //    screen and pressing Next again, which drops and recreates
  //    this screen), previously-entered data isn't lost. ────────
  const [shortDesc, setShortDesc] = useState(params.shortDesc || '');
  const [fullDesc, setFullDesc] = useState(params.fullDesc || '');
  const [beneficiary, setBeneficiary] = useState(params.beneficiary || '');
  const [relationship, setRelationship] = useState(params.relationship || '');
  const [province, setProvince] = useState(params.province || '');
  const [city, setCity] = useState(params.city || '');

  // UI State
  const [errors, setErrors] = useState({});
  const [focus, setFocus] = useState({});
  const [format, setFormat] = useState({
    bold: false,
    italic: false,
    list: false,
  });

  const [responseModal, setResponseModal] = useState({
    visible: false,
    variant: 'error',
    title: '',
    message: '',
    code: '',
    closeAction: null,
  });

  const closeResponseModal = useCallback(() => {
    const action = responseModal.closeAction;
    setResponseModal(prev => ({ ...prev, visible: false, closeAction: null }));

    if (action === 'exit') {
      if (navigation.canGoBack()) navigation.goBack();
      else navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } else if (action === 'restart') {
      navigation.navigate('CreateCampaign');
    }
  }, [responseModal.closeAction, navigation]);

  const showResponse = useCallback(
    ({ variant = 'error', title, message, code = '', closeAction = null }) => {
      setResponseModal({
        visible: true,
        variant,
        title: title || (variant === 'success' ? 'Success' : 'Error'),
        message: message || 'Something went wrong. Please try again.',
        code: code ? String(code) : '',
        closeAction,
      });
    },
    [],
  );

  // campaignId is mandatory from Step 1 onward — if it's missing,
  // send the user back rather than letting Step 2 fail silently.
  useEffect(() => {
    if (!campaignId) {
      showResponse({
        variant: 'error',
        title: 'Error',
        message: 'Missing campaign reference. Please start again from Step 1.',
        closeAction: 'restart',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setFocused = key => setFocus(f => ({ ...f, [key]: true }));
  const setBlurred = key => setFocus(f => ({ ...f, [key]: false }));

  // ── Provinces / Cities — already-integrated location APIs ─────
  const { data: provincesData = [], isLoading: provincesLoading } = useProvinces();

  const provinceOptions = useMemo(
    // ⚠️ Adjust `name` below if your API returns a different field
    () => provincesData.map(p => p.name ?? p.provinceName ?? String(p)),
    [provincesData],
  );

  const selectedProvinceObj = useMemo(
    () => provincesData.find(p => (p.name ?? p.provinceName) === province),
    [provincesData, province],
  );
  // ⚠️ Adjust `id` below if your API returns a different field
  const provinceId = selectedProvinceObj?.id ?? selectedProvinceObj?.provinceId ?? null;

  const { data: citiesData = [], isLoading: citiesLoading } = useCities(provinceId);

  const cityOptions = useMemo(
    () => citiesData.map(c => c.name ?? c.cityName ?? String(c)),
    [citiesData],
  );

  // ── Rejection prefill ─────────────────────────────────────────
  // The notification only carries an id, so without this the creator
  // would have to retype the entire step. Runs once and never
  // overwrites a field the creator has already touched — otherwise a
  // slow detail response would wipe their edits mid-typing.
  const { data: campaignDetail } = useCampaignDetail(
    isRejection ? campaignId : null,
  );

  const prefilled = useRef(false);

  useEffect(() => {
    if (!isRejection || prefilled.current || !campaignDetail) return;

    const raw = campaignDetail.raw || {};
    prefilled.current = true;

    setShortDesc(prev => prev || raw.shortDescription || '');
    setFullDesc(prev => prev || raw.description || campaignDetail.story || '');
    setBeneficiary(prev => prev || raw.beneficiaryName || '');
    setRelationship(prev => prev || raw.relationships || '');
    setProvince(prev => prev || raw.province || campaignDetail.province || '');
    setCity(prev => prev || raw.city || campaignDetail.city || '');
  }, [isRejection, campaignDetail]);

  // ✅ Reset city whenever the user CHANGES province — but skip the
  // very first run on mount, otherwise a prefilled city (from params,
  // when editing) gets wiped out immediately before the user ever
  // sees it.
  const isFirstProvinceRender = useRef(true);
  const lastProvinceRef = useRef(province);

  useEffect(() => {
    if (isFirstProvinceRender.current) {
      isFirstProvinceRender.current = false;
      lastProvinceRef.current = province;
      return;
    }

    // The rejection prefill sets province asynchronously, well after
    // mount. Comparing against the previous value keeps that write from
    // being mistaken for a user selection and clearing the city with it.
    if (lastProvinceRef.current === province) return;

    lastProvinceRef.current = province;
    setCity('');
    setErrors(prev => ({ ...prev, city: undefined }));
  }, [province]);

  const submitStep2 = useCreateCampaignStep2();
  const resubmitStep2 = useResubmitCampaignStep2();
  const isSubmitting = submitStep2.isPending || resubmitStep2.isPending;

  const validate = useCallback(() => {
    const e = {};
    if (!shortDesc.trim()) e.shortDesc = 'Short description is required';
    else if (shortDesc.trim().length < 20)
      e.shortDesc = 'Short description must be at least 20 characters';
    if (!fullDesc.trim()) e.fullDesc = 'Full description is required';
    else if (fullDesc.trim().length < 50)
      e.fullDesc = 'Full description must be at least 50 characters';
    if (!beneficiary.trim()) e.beneficiary = 'Beneficiary name is required';
    if (!relationship) e.relationship = 'Please select a relationship';
    if (!province) e.province = 'Please select a province';
    if (!city) e.city = 'Please select a city';
    setErrors(e);
    return Object.keys(e).length === 0;
  }, [shortDesc, fullDesc, beneficiary, relationship, city, province]);

  const handleNext = useCallback(async () => {
    if (!validate()) return;
    if (isSubmitting) return;

    if (!campaignId) {
      showResponse({
        message: 'Missing campaign reference. Please start again from Step 1.',
        closeAction: 'restart',
      });
      return;
    }

    // ── Rejection fix-up: update this step only, then leave. ──
    // The remaining steps are already complete server-side, so walking
    // the creator through the rest of the wizard would be pointless.
    if (isRejection) {
      try {
        const body = await resubmitStep2.mutateAsync({
          campaignId,
          shortDescription: shortDesc.trim(),
          description: fullDesc.trim(),
          beneficiaryName: beneficiary.trim(),
          relationships: relationship,
          province,
          city,
        });

        if (body?.responseCode !== '000') {
          showResponse({
            title: 'Update Failed',
            message: body?.responseMessage || 'Could not update your campaign.',
            code: body?.responseCode || '',
          });
          return;
        }

        showResponse({
          variant: 'success',
          title: 'Campaign Updated',
          message:
            'Your campaign has been updated successfully and is now under review. You will be notified once it is approved.',
          closeAction: 'exit',
        });
      } catch (error) {
        const data = error?.response?.data;
        showResponse({
          title: 'Update Failed',
          message:
            data?.responseMessage ||
            error?.message ||
            'Could not update your campaign. Please try again.',
          code: data?.responseCode || '',
        });
      }
      return;
    }

    // ── Normal creation flow (unchanged) ──
    try {
      const response = await submitStep2.mutateAsync({
        campaignId,
        shortDescription: shortDesc.trim(),
        description: fullDesc.trim(),
        beneficiaryName: beneficiary.trim(),
        relationships: relationship,
        city,
        province,
      });

      if (response?.responseCode && response.responseCode !== '000') {
        showResponse({
          message:
            response?.responseMessage ||
            'Could not save details. Please try again.',
          code: response?.responseCode || '',
        });
        return;
      }

      navigation.navigate('PhotosDocuments', {
        ...params,
        campaignId,
        shortDesc,
        fullDesc,
        beneficiary,
        relationship,
        city,
        province,
      });
    } catch (error) {
      const data = error?.response?.data;
      showResponse({
        message:
          data?.responseMessage ||
          'Could not save campaign details. Please check your connection and try again.',
        code: data?.responseCode || '',
      });
    }
  }, [
    validate,
    isSubmitting,
    isRejection,
    navigation,
    params,
    campaignId,
    shortDesc,
    fullDesc,
    beneficiary,
    relationship,
    city,
    province,
    submitStep2,
    resubmitStep2,
    showResponse,
  ]);

  const handleFormatChange = useCallback(type => {
    // This only toggles the UI state. A real rich text editor component
    // would be needed to apply actual formatting to the text.
    setFormat(prev => ({ ...prev, [type]: !prev[type] }));
  }, []);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={P.white} />

      <StepHeader
        step={2}
        total={4}
        title={isRejection ? 'Update Campaign' : 'Create Campaign'}
        onLeft={() => navigation.goBack()}
      />
      <ProgressLine pct={50} />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={s.pageTitle}>Campaign Details</Text>
        <Text style={s.pageSub}>
          All fields marked with <Text style={s.star}>*</Text> are required
        </Text>

        {isRejection && !!rejectionReason && (
          <View style={s.rejectionBox}>
            <Text style={s.rejectionLabel}>REJECTION REASON</Text>
            <Text style={s.rejectionText}>{rejectionReason}</Text>
          </View>
        )}

        <View style={s.fieldBlock}>
          <FieldLabel
            text="Short Description"
            counter={`${shortDesc.length}/500`}
          />
          <TextInput
            style={[
              s.textarea,
              focus.shortDesc && s.inputFocused,
              errors.shortDesc && s.inputError,
            ]}
            placeholder="Briefly explain who you are helping and why..."
            placeholderTextColor={P.light}
            value={shortDesc}
            onChangeText={t => {
              if (t.length <= 500) setShortDesc(t);
            }}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            onFocus={() => setFocused('shortDesc')}
            onBlur={() => {
              setBlurred('shortDesc');
            }}
          />
          <ErrorMsg msg={errors.shortDesc} />
        </View>

        <View style={s.fieldBlock}>
          <FieldLabel text="Full Description" />
          <View
            style={[
              s.richWrap,
              focus.fullDesc && s.inputFocused,
              errors.fullDesc && s.inputError,
            ]}
          >
            <RichToolbar format={format} onFormatChange={handleFormatChange} />
            <TextInput
              style={s.richInput}
              placeholder="Tell the full story. Be transparent about costs and needs..."
              placeholderTextColor={P.light}
              value={fullDesc}
              onChangeText={setFullDesc}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              onFocus={() => setFocused('fullDesc')}
              onBlur={() => {
                setBlurred('fullDesc');
              }}
            />
          </View>
          <ErrorMsg msg={errors.fullDesc} />
        </View>

        <View style={s.fieldBlock}>
          <FieldLabel text="Beneficiary Name" />
          <View
            style={[
              s.iconInput,
              focus.beneficiary && s.inputFocused,
              errors.beneficiary && s.inputError,
            ]}
          >
            <MCIcons
              name="account-outline"
              size={sp(18)}
              color={focus.beneficiary ? P.teal : P.light}
              style={s.inputIcon}
            />
            <TextInput
              style={s.inlineInput}
              placeholder="Full name of beneficiary"
              placeholderTextColor={P.light}
              value={beneficiary}
              onChangeText={setBeneficiary}
              onFocus={() => setFocused('beneficiary')}
              onBlur={() => {
                setBlurred('beneficiary');
              }}
            />
          </View>
          <ErrorMsg msg={errors.beneficiary} />
        </View>

        <DropdownSheet
          label="Relationship"
          value={relationship}
          options={RELATIONSHIPS}
          onSelect={v => {
            setRelationship(v);
            setErrors(prev => ({ ...prev, relationship: undefined }));
          }}
          placeholder="Select relationship"
          error={errors.relationship}
        />

        {/* ── Province (from location API) ────────────────────── */}
        <DropdownSheet
          label="Province"
          value={province}
          options={provinceOptions}
          onSelect={v => {
            setProvince(v);
            setErrors(prev => ({ ...prev, province: undefined }));
          }}
          placeholder={provincesLoading ? 'Loading provinces...' : 'Select province'}
          error={errors.province}
          disabled={provincesLoading}
        />

        {/* ── City (dependent on Province, from location API) ─── */}
        <DropdownSheet
          label="City"
          value={city}
          options={cityOptions}
          onSelect={v => {
            setCity(v);
            setErrors(prev => ({ ...prev, city: undefined }));
          }}
          placeholder={
            !province
              ? 'Select a province first'
              : citiesLoading
              ? 'Loading cities...'
              : 'Select city'
          }
          leftIcon="map-marker-outline"
          error={errors.city}
          disabled={!province || citiesLoading}
        />

        <View style={{ height: sp(8) }} />
      </ScrollView>

      <View style={s.footer}>
        <TouchableOpacity
          style={[s.nextBtn, isSubmitting && s.nextBtnDisabled]}
          onPress={handleNext}
          activeOpacity={0.85}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={P.white} />
          ) : (
            <>
              <Text style={s.nextTxt}>{isRejection ? 'Update' : 'Next'}</Text>
              <Icons
                name={isRejection ? 'check' : 'arrow-right'}
                size={sp(16)}
                color={P.white}
              />
            </>
          )}
        </TouchableOpacity>
      </View>

      <ResponseModal
        visible={responseModal.visible}
        variant={responseModal.variant}
        title={responseModal.title}
        message={responseModal.message}
        code={responseModal.code}
        onClose={closeResponseModal}
      />
    </SafeAreaView>
  );
};

export default CampaignDetails;

// ════════════════════════════════════════════════════════════
//  Styles
// ════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: P.bg },
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: sp(18),
    paddingTop: sp(20),
    paddingBottom: sp(8),
  },
  pageTitle: {
    fontSize: sp(20),
    fontWeight: '800',
    color: P.dark,
    marginBottom: sp(4),
  },
  pageSub: { fontSize: sp(12), color: P.light, marginBottom: sp(20) },
  star: { color: P.red, fontWeight: '700' },

  rejectionBox: {
    borderWidth: 1,
    borderColor: P.red,
    borderRadius: sp(10),
    backgroundColor: '#FEF2F2',
    padding: sp(12),
    marginBottom: sp(18),
  },
  rejectionLabel: {
    fontSize: sp(11),
    fontWeight: '700',
    color: P.red,
    marginBottom: sp(4),
  },
  rejectionText: { fontSize: sp(13), color: P.dark, lineHeight: sp(19) },

  fieldBlock: { marginBottom: sp(16) },
  inputFocused: { borderColor: P.teal, borderWidth: 1.5 },
  inputError: { borderColor: P.red, borderWidth: 1.5 },
  textarea: {
    borderWidth: 1.5,
    borderColor: P.border,
    borderRadius: sp(10),
    backgroundColor: P.white,
    padding: sp(12),
    fontSize: sp(14),
    color: P.dark,
    minHeight: sp(90),
    lineHeight: sp(20),
  },
  richWrap: {
    borderWidth: 1.5,
    borderColor: P.border,
    borderRadius: sp(10),
    backgroundColor: P.white,
    overflow: 'hidden',
  },
  richInput: {
    padding: sp(12),
    fontSize: sp(14),
    color: P.dark,
    minHeight: sp(110),
    lineHeight: sp(20),
  },
  iconInput: {
    flexDirection: 'row',
    alignItems: 'center',
    height: sp(50),
    borderWidth: 1.5,
    borderColor: P.border,
    borderRadius: sp(10),
    backgroundColor: P.white,
    paddingHorizontal: sp(12),
  },
  inputIcon: { marginRight: sp(8) },
  inlineInput: { flex: 1, fontSize: sp(14), color: P.dark, paddingVertical: 0 },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: sp(18),
    paddingTop: sp(15),
    paddingBottom: Platform.OS === 'android' ? sp(22) : sp(10),
    backgroundColor: P.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: P.border,
    gap: sp(12),
  },
  nextBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: sp(50),
    borderRadius: sp(10),
    backgroundColor: P.teal,
    gap: sp(6),
  },
  nextBtnDisabled: { opacity: 0.6 },
  nextTxt: { fontSize: sp(15), fontWeight: '700', color: P.white },
});