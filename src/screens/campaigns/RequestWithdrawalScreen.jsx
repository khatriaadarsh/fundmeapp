// src/screens/campaigns/RequestWithdrawalScreen.jsx

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/Feather';
import DocumentPicker from 'react-native-document-picker';

// THEME & DATA IMPORTS
import { P, sp } from '../../theme/theme';
import { PAYMENT_METHODS } from '../../constants/mockData';
import { useAppContext } from '../../context/AppContext';
import {
  useCampaignWithdrawalSummary,
  useSubmitWithdrawalRequest,
} from '../../hooks/useWithdrawal';

const { width: SW, height: SH } = Dimensions.get('window');

const scale = size => (SW / 375) * size;
const vscale = size => (SH / 812) * size;

const BUTTON_HEIGHT = vscale(54);

const formatPKR = n => Number(n || 0).toLocaleString('en-PK');

// Only EasyPaisa is live for now — everything else is shown but disabled.
const ACTIVE_METHOD_ID = 'easypaisa';

// Only one document can be attached.
const MAX_FILES = 1;

// ═══════════════════════════════════════════════════════════
// VALIDATION HELPERS
// ═══════════════════════════════════════════════════════════

const validateAmount = (value, available) => {
  if (!value || value.trim() === '') {
    return 'Withdrawal amount is required';
  }

  const numericAmount = Number(value);

  if (isNaN(numericAmount) || numericAmount <= 0) {
    return 'Enter a valid amount';
  }

  if (numericAmount > available) {
    return `Maximum amount is PKR ${formatPKR(available)}`;
  }

  return '';
};

const validateAccountNumber = value => {
  if (!value || value.trim() === '') {
    return 'Account number is required';
  }

  const cleaned = value.replace(/\s/g, '');

  if (!/^0\d{10}$/.test(cleaned)) {
    return 'Enter valid 11-digit number';
  }

  return '';
};

const validateTitle = value => {
  if (!value || value.trim() === '') {
    return 'Account title is required';
  }

  if (value.trim().length < 3) {
    return 'Minimum 3 characters required';
  }

  return '';
};

const validateDocument = doc => {
  if (!doc) {
    return 'Please attach a withdrawal proof document';
  }
  return '';
};

const formatFileSize = bytes => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Small colored badge for the file-type, matching the reference design's
// red "PDF" tile — extended here to cover images too.
const getDocBadge = type => {
  const t = (type || '').toLowerCase();
  if (t.includes('pdf')) return { label: 'PDF', bg: '#EF4444' };
  if (t.includes('image')) return { label: 'IMG', bg: P.teal };
  return { label: 'DOC', bg: P.gray };
};

// ═══════════════════════════════════════════════════════════
// SUBMIT BUTTON
// Stays full width/shape at all times — only the inner content
// crossfades between "Submit Request" → spinner → success text.
// ═══════════════════════════════════════════════════════════

const SubmitButton = ({ state, onPress }) => {
  const idleOpacity = React.useRef(new Animated.Value(1)).current;
  const loadingOpacity = React.useRef(new Animated.Value(0)).current;
  const successOpacity = React.useRef(new Animated.Value(0)).current;
  const bgAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const targets =
      state === 'loading'
        ? [0, 1, 0]
        : state === 'success'
        ? [0, 0, 1]
        : [1, 0, 0];

    Animated.parallel([
      Animated.timing(idleOpacity, {
        toValue: targets[0],
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(loadingOpacity, {
        toValue: targets[1],
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(successOpacity, {
        toValue: targets[2],
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(bgAnim, {
        toValue: state === 'success' ? 1 : 0,
        duration: 250,
        useNativeDriver: false,
      }),
    ]).start();
  }, [state, idleOpacity, loadingOpacity, successOpacity, bgAnim]);

  const bgColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [P.darkOcean || '#0A3D62', P.green || '#10B981'],
  });

  return (
    <Animated.View style={[styles.btnOuter, { backgroundColor: bgColor }]}>
      <TouchableOpacity
        style={styles.btnTouchable}
        onPress={state === 'idle' ? onPress : undefined}
        disabled={state !== 'idle'}
        activeOpacity={0.88}
      >
        <Animated.View
          style={[styles.absoluteCenter, { opacity: idleOpacity }]}
          pointerEvents={state === 'idle' ? 'auto' : 'none'}
        >
          <Text style={styles.btnText}>Submit Request</Text>
        </Animated.View>

        <Animated.View
          style={[styles.absoluteCenter, { opacity: loadingOpacity }]}
          pointerEvents="none"
        >
          <ActivityIndicator color="#FFFFFF" size="small" />
        </Animated.View>

        <Animated.View
          style={[styles.absoluteCenter, styles.successRow, { opacity: successOpacity }]}
          pointerEvents="none"
        >
          <Icons name="check-circle" size={scale(20)} color={P.white} />
          <Text style={styles.successText}>Submitted Successfully!</Text>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ═══════════════════════════════════════════════════════════
// INPUT FIELD COMPONENT
// ═══════════════════════════════════════════════════════════

const InputField = ({
  label,
  value,
  onChange,
  placeholder,
  keyboardType = 'default',
  error,
  onBlur,
}) => (
  <View style={styles.fieldWrap}>
    <Text style={styles.sectionLabel}>{label}</Text>

    <TextInput
      style={[styles.textInput, error ? styles.inputError : null]}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={P.light}
      keyboardType={keyboardType}
      autoCapitalize="none"
      onBlur={onBlur}
    />

    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

// ═══════════════════════════════════════════════════════════
// DOCUMENT PICKER FIELD — redesigned to match reference image
// ═══════════════════════════════════════════════════════════

const DocumentField = ({ document, onPick, onRemove, error }) => {
  const badge = document ? getDocBadge(document.type) : null;
  const filesAdded = document ? 1 : 0;

  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.sectionLabel}>Supporting Documents *</Text>

      <TouchableOpacity
        style={[styles.docDropzone, error ? styles.inputError : null]}
        onPress={onPick}
        activeOpacity={0.75}
        disabled={filesAdded >= MAX_FILES}
      >
        <View style={styles.docDropzoneIconWrap}>
          <Icons name="file-plus" size={scale(24)} color={P.gray} />
        </View>
        <Text style={styles.docDropzoneTitle}>Upload PDF, JPG or PNG</Text>
        <Text style={styles.docDropzoneCount}>
          {filesAdded}/{MAX_FILES} file{MAX_FILES > 1 ? 's' : ''} added
        </Text>
      </TouchableOpacity>

      {!!document && (
        <View style={styles.docPreview}>
          <View style={[styles.docBadge, { backgroundColor: badge.bg }]}>
            <Text style={styles.docBadgeText}>{badge.label}</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.docPreviewName} numberOfLines={1}>
              {document.name}
            </Text>
            <Text style={styles.docPreviewMeta}>
              {formatFileSize(document.size)}
            </Text>
          </View>

          <TouchableOpacity
            onPress={onRemove}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.docRemoveBtn}
          >
            <Icons name="x" size={scale(18)} color={P.gray} />
          </TouchableOpacity>
        </View>
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════

const RequestWithdrawalScreen = ({ navigation, route }) => {
  const { currentUser } = useAppContext();
  const userId = currentUser?.id;

  const campaignId = route?.params?.campaignId ?? route?.params?.campaign?.id;
  const fallbackTitle = route?.params?.campaignTitle ?? route?.params?.campaign?.title;

  const {
    data: summary,
    isLoading: isSummaryLoading,
  } = useCampaignWithdrawalSummary(campaignId);

  const { mutate: submitWithdrawal, isPending: isSubmitting } =
    useSubmitWithdrawalRequest();

  const available = summary?.availableFunds ?? 0;
  const raised = summary?.totalRaised ?? 0;
  const withdrawn = Math.max(raised - available, 0);
  const campaignTitle = summary?.campaignTitle ?? fallbackTitle ?? '';

  const [amount, setAmount] = useState('');
  const amountInitialized = React.useRef(false);

  // Prefill the amount field with the available balance ONCE the summary
  // has loaded — but only the first time, so it doesn't overwrite
  // whatever the user has already typed.
  useEffect(() => {
    if (!amountInitialized.current && summary?.availableFunds != null) {
      setAmount(String(summary.availableFunds));
      amountInitialized.current = true;
    }
  }, [summary]);

  const [selectedMethod, setSelectedMethod] = useState(ACTIVE_METHOD_ID);

  const [accountNumber, setAccountNumber] = useState('');
  const [accountTitle, setAccountTitle] = useState('');
  const [document, setDocument] = useState(null);

  const [btnState, setBtnState] = useState('idle');

  const [errors, setErrors] = useState({
    amount: '',
    account: '',
    title: '',
    document: '',
  });

  const selectedMethodData = PAYMENT_METHODS.find(m => m.id === selectedMethod);

  // ═══════════════════════════════════════════════════════
  // FIELD VALIDATIONS
  // ═══════════════════════════════════════════════════════

  const validateForm = useCallback(() => {
    const amountError = validateAmount(amount, available);
    const accountError = validateAccountNumber(accountNumber);
    const titleError = validateTitle(accountTitle);
    const documentError = validateDocument(document);

    setErrors({
      amount: amountError,
      account: accountError,
      title: titleError,
      document: documentError,
    });

    return !amountError && !accountError && !titleError && !documentError;
  }, [amount, accountNumber, accountTitle, document, available]);

  const validateSingleField = field => {
    switch (field) {
      case 'amount':
        setErrors(prev => ({
          ...prev,
          amount: validateAmount(amount, available),
        }));
        break;

      case 'account':
        setErrors(prev => ({
          ...prev,
          account: validateAccountNumber(accountNumber),
        }));
        break;

      case 'title':
        setErrors(prev => ({
          ...prev,
          title: validateTitle(accountTitle),
        }));
        break;

      default:
        break;
    }
  };

  // ═══════════════════════════════════════════════════════
  // DOCUMENT PICKER
  // ═══════════════════════════════════════════════════════

  const handlePickDocument = useCallback(async () => {
    try {
      const response = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.pdf,
          DocumentPicker.types.images, // covers jpg/png
        ],
        copyTo: 'cachesDirectory',
        allowMultiSelection: false,
      });

      // Different versions of react-native-document-picker return either
      // an array (v8+) or a single object (older versions) — handle both
      // so a successful pick never accidentally falls into the catch block.
      const result = Array.isArray(response) ? response[0] : response;

      if (!result) return;

      setDocument({
        uri: result.fileCopyUri || result.uri,
        name: result.name,
        type: result.type,
        size: result.size,
      });

      setErrors(prev => ({ ...prev, document: '' }));
    } catch (err) {
      // Robust cancel detection: some library versions/platforms don't
      // populate the error the way DocumentPicker.isCancel() expects,
      // which was causing a false "unable to select" alert + console
      // error every time the user simply backed out of the picker.
      // We treat ANY of these signals as a silent cancel — no log, no
      // alert, just return quietly.
      const isCancelled =
        DocumentPicker.isCancel(err) ||
        err?.code === 'DOCUMENT_PICKER_CANCELED' ||
        err?.code === 'E_DOCUMENT_PICKER_CANCELED' ||
        /cancel/i.test(err?.message || '');

      if (isCancelled) {
        return;
      }

      console.error('🔴 [RequestWithdrawal] Document pick error:', err);
      Alert.alert('Error', 'Unable to select document. Please try again.');
    }
  }, []);

  const handleRemoveDocument = useCallback(() => {
    setDocument(null);
  }, []);

  // ═══════════════════════════════════════════════════════
  // SUBMIT
  // ═══════════════════════════════════════════════════════

  const handleSubmit = useCallback(() => {
    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    setBtnState('loading');

    submitWithdrawal(
      {
        campaignId,
        userId,
        amount,
        accountType: selectedMethod.toUpperCase(),
        accountNumber,
        accountTitle,
        document,
      },
      {
        onSuccess: (response) => {
          if (response?.responseCode === '000') {
            setBtnState('success');
            setTimeout(() => {
              navigation.goBack();
            }, 2200);
          } else {
            setBtnState('idle');
            Alert.alert('Error', response?.responseMessage || 'Withdrawal request failed');
          }
        },
        onError: (error) => {
          setBtnState('idle');
          Alert.alert(
            'Error',
            error?.response?.data?.responseMessage ||
              error?.message ||
              'Failed to submit withdrawal request',
          );
        },
      },
    );
  }, [
    validateForm,
    submitWithdrawal,
    campaignId,
    userId,
    amount,
    selectedMethod,
    accountNumber,
    accountTitle,
    document,
    navigation,
  ]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={P.bg} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
          }}
        >
          <Icons name="arrow-left" size={sp(22)} color={P.dark} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Request Withdrawal</Text>

        <View style={{ width: sp(32) }} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* TOP CARD */}
          <View style={styles.card}>
            {isSummaryLoading ? (
              <View style={styles.cardLoading}>
                <ActivityIndicator color={P.teal} />
              </View>
            ) : (
              <>
                <Text style={styles.campaignTitle}>{campaignTitle}</Text>

                <Text style={styles.balanceLabel}>Available Balance</Text>

                <Text style={styles.balanceAmount}>
                  PKR {formatPKR(available)}
                </Text>

                <View style={styles.statsRow}>
                  <View>
                    <Text style={styles.statVal}>{formatPKR(raised)}</Text>
                    <Text style={styles.statLbl}>Raised</Text>
                  </View>

                  <View
                    style={{
                      width: sp(1),
                      backgroundColor: '#E5E7EB',
                    }}
                  />

                  <View>
                    <Text style={styles.statVal}>{formatPKR(withdrawn)}</Text>
                    <Text style={styles.statLbl}>Withdrawn</Text>
                  </View>
                </View>
              </>
            )}
          </View>

          {/* AMOUNT */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Withdrawal Amount *</Text>

            <View
              style={[
                styles.amountBox,
                errors.amount ? styles.inputError : null,
              ]}
            >
              <Text style={styles.currencyPrefix}>PKR</Text>

              <View style={styles.divider} />

              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={text => {
                  setAmount(text);

                  if (errors.amount) {
                    setErrors(prev => ({
                      ...prev,
                      amount: '',
                    }));
                  }
                }}
                onBlur={() => validateSingleField('amount')}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={P.light}
              />
            </View>

            {errors.amount ? (
              <Text style={styles.errorText}>{errors.amount}</Text>
            ) : null}
          </View>

          {/* PAYMENT METHODS */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Select Account *</Text>

            {PAYMENT_METHODS.map(method => {
              const isActive = method.id === ACTIVE_METHOD_ID;
              const isSelected = selectedMethod === method.id;

              return (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.methodRow,
                    isSelected && styles.methodRowActive,
                    !isActive && styles.methodRowDisabled,
                  ]}
                  onPress={() => isActive && setSelectedMethod(method.id)}
                  activeOpacity={isActive ? 0.75 : 1}
                  disabled={!isActive}
                >
                  <View
                    style={[
                      styles.radioOuter,
                      isSelected && styles.radioOuterActive,
                    ]}
                  >
                    {isSelected && <View style={styles.radioInner} />}
                  </View>

                  <Text
                    style={[
                      styles.methodLabel,
                      isSelected && styles.methodLabelActive,
                      !isActive && styles.methodLabelDisabled,
                    ]}
                  >
                    {method.label}
                  </Text>

                  {!isActive && (
                    <View style={styles.comingSoonChip}>
                      <Text style={styles.comingSoonText}>Coming Soon</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ACCOUNT NUMBER */}
          <InputField
            label="Account Number *"
            value={accountNumber}
            onChange={text => {
              setAccountNumber(text);

              if (errors.account) {
                setErrors(prev => ({
                  ...prev,
                  account: '',
                }));
              }
            }}
            error={errors.account}
            onBlur={() => validateSingleField('account')}
            placeholder={selectedMethodData?.placeholder ?? '03XX XXXXXXX'}
            keyboardType="phone-pad"
          />

          {/* ACCOUNT TITLE */}
          <InputField
            label="Account Title *"
            value={accountTitle}
            onChange={text => {
              setAccountTitle(text);

              if (errors.title) {
                setErrors(prev => ({
                  ...prev,
                  title: '',
                }));
              }
            }}
            error={errors.title}
            onBlur={() => validateSingleField('title')}
            placeholder="e.g. Ahmed Khan"
          />

          {/* WITHDRAWAL PROOF DOCUMENT */}
          <DocumentField
            document={document}
            onPick={handlePickDocument}
            onRemove={handleRemoveDocument}
            error={errors.document}
          />

          {/* NOTICE */}
          <View style={styles.noticeBanner}>
            <Icons name="clock" size={sp(16)} color="#D97706" />

            <Text style={styles.noticeText}>
              Requests are processed within 24–48 hours.
            </Text>
          </View>

          <View style={{ height: sp(16) }} />
        </ScrollView>

        {/* FOOTER */}
        <View style={styles.footer}>
          <SubmitButton state={btnState} onPress={handleSubmit} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ═══════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: P.bg,
  },

  flex: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sp(16),
    paddingVertical: sp(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: P.border,
    backgroundColor: P.bg,
  },

  headerTitle: {
    fontSize: sp(17),
    fontWeight: '700',
    color: P.dark,
    letterSpacing: -0.2,
  },

  scrollContent: {
    paddingHorizontal: sp(16),
    paddingTop: sp(16),
    paddingBottom: sp(32),
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: sp(12),
    padding: sp(16),
    marginBottom: sp(20),
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
  },

  cardLoading: {
    paddingVertical: sp(24),
    alignItems: 'center',
    justifyContent: 'center',
  },

  campaignTitle: {
    fontSize: sp(14),
    fontWeight: '700',
    color: P.dark,
    marginBottom: sp(8),
  },

  balanceLabel: {
    fontSize: sp(12),
    color: P.gray,
    marginBottom: sp(3),
  },

  balanceAmount: {
    fontSize: sp(26),
    fontWeight: '800',
    color: P.green,
    marginBottom: sp(12),
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: sp(10),
    borderTopWidth: 1,
    borderTopColor: P.border,
  },

  statVal: {
    fontSize: sp(14),
    fontWeight: '600',
    color: P.dark,
  },

  statLbl: {
    fontSize: sp(11),
    color: P.light,
  },

  section: {
    marginBottom: sp(20),
  },

  sectionLabel: {
    fontSize: sp(14),
    fontWeight: '700',
    color: P.dark,
    marginBottom: sp(10),
  },

  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: P.white,
    borderRadius: sp(10),
    borderWidth: 1,
    borderColor: P.border,
    height: sp(54),
    paddingHorizontal: sp(16),
  },

  currencyPrefix: {
    fontSize: sp(15),
    fontWeight: '700',
    color: P.gray,
    marginRight: sp(12),
  },

  divider: {
    width: 1,
    height: '55%',
    backgroundColor: P.border,
    marginRight: sp(12),
  },

  amountInput: {
    flex: 1,
    fontSize: sp(16),
    fontWeight: '600',
    color: P.dark,
  },

  fieldWrap: {
    marginBottom: sp(12),
  },

  textInput: {
    backgroundColor: P.white,
    borderRadius: sp(10),
    borderWidth: 1,
    borderColor: P.border,
    height: sp(54),
    paddingHorizontal: sp(16),
    fontSize: sp(15),
    color: P.dark,
  },

  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FFF7F7',
  },

  errorText: {
    fontSize: sp(11),
    color: '#EF4444',
    marginTop: sp(5),
    marginLeft: sp(4),
    fontWeight: '500',
  },

  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: P.white,
    borderRadius: sp(10),
    borderWidth: 1,
    borderColor: P.border,
    paddingHorizontal: sp(16),
    height: sp(54),
    marginBottom: sp(10),
    gap: sp(14),
  },

  methodRowActive: {
    borderColor: P.teal,
    backgroundColor: P.tealLight,
  },

  methodRowDisabled: {
    opacity: 0.55,
  },

  radioOuter: {
    width: sp(22),
    height: sp(22),
    borderRadius: sp(11),
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  radioOuterActive: {
    borderColor: P.teal,
  },

  radioInner: {
    width: sp(11),
    height: sp(11),
    borderRadius: sp(6),
    backgroundColor: P.teal,
  },

  methodLabel: {
    flex: 1,
    fontSize: sp(15),
    fontWeight: '500',
    color: P.gray,
  },

  methodLabelActive: {
    color: P.dark,
    fontWeight: '600',
  },

  methodLabelDisabled: {
    color: P.light,
  },

  comingSoonChip: {
    paddingHorizontal: sp(8),
    paddingVertical: sp(4),
    borderRadius: sp(8),
    backgroundColor: '#F3F4F6',
  },

  comingSoonText: {
    fontSize: sp(10),
    fontWeight: '700',
    color: P.gray,
  },

  // ── Document picker field (matches reference image) ────────
  docDropzone: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F6F8',
    borderRadius: sp(12),
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    paddingVertical: sp(28),
    paddingHorizontal: sp(16),
  },

  docDropzoneIconWrap: {
    marginBottom: sp(10),
  },

  docDropzoneTitle: {
    fontSize: sp(15),
    fontWeight: '700',
    color: P.gray,
  },

  docDropzoneCount: {
    fontSize: sp(12.5),
    color: P.light,
    marginTop: sp(6),
  },

  docPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: P.white,
    borderRadius: sp(12),
    borderWidth: 1,
    borderColor: P.border,
    paddingHorizontal: sp(14),
    paddingVertical: sp(12),
    marginTop: sp(12),
    gap: sp(12),
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },

  docBadge: {
    width: sp(40),
    height: sp(40),
    borderRadius: sp(8),
    alignItems: 'center',
    justifyContent: 'center',
  },

  docBadgeText: {
    color: '#FFFFFF',
    fontSize: sp(10),
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  docPreviewName: {
    fontSize: sp(14.5),
    fontWeight: '700',
    color: P.dark,
  },

  docPreviewMeta: {
    fontSize: sp(12),
    color: P.gray,
    marginTop: sp(2),
  },

  docRemoveBtn: {
    padding: sp(4),
  },

  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp(10),
    backgroundColor: '#FEF3C7',
    borderRadius: sp(10),
    padding: sp(14),
    marginBottom: sp(8),
  },

  noticeText: {
    fontSize: sp(13),
    color: '#D97706',
    fontWeight: '500',
  },

  footer: {
    paddingHorizontal: sp(16),
    paddingTop: sp(12),
    paddingBottom: Platform.OS === 'ios' ? sp(28) : sp(16),
    backgroundColor: P.bg,
    borderTopWidth: 1,
    borderTopColor: P.border,
    alignItems: 'center',
  },

  btnOuter: {
    width: '100%',
    height: BUTTON_HEIGHT,
    borderRadius: scale(12),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
  },

  btnTouchable: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  btnText: {
    fontSize: sp(16),
    fontWeight: '700',
    color: '#FFFFFF',
  },

  absoluteCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },

  successRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp(8),
  },

  successText: {
    color: '#FFFFFF',
    fontSize: sp(15),
    fontWeight: '700',
  },
});

export default RequestWithdrawalScreen;