// src/screens/donation/DonationReceiptScreen.jsx
import React, { useState, useCallback, useRef, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
  Image,
  ActivityIndicator,
  RefreshControl,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/Feather';

import ResponseModal from '../../components/ResponseModal';
import { useDonationDetail } from '../../hooks/useDonation';
import { useAppContext } from '../../context/AppContext';
import { ViewShot, shareReceiptImage } from '../../utils/shareReceipt';
import {
  parseNotificationPayload,
  listPayloadKeys,
} from '../../routes/navigationRef';
import LogoImg from '../../assets/logo.png';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SW } = Dimensions.get('window');
const sp = n => (SW / 375) * n;

const C = {
  pageBg: '#F4F6F9',
  white: '#FFFFFF',
  dark: '#0D4F6B',
  textDark: '#111827',
  textMid: '#334155',
  textGray: '#64748B',
  textLight: '#94A3B8',
  border: '#E5E7EB',
  green: '#059669',
  greenBg: '#ECFDF5',
  red: '#EF4444',
};

const fmtPKR = value => {
  const n = Number(value || 0);
  return `Rs. ${n.toLocaleString('en-PK')}`;
};

const fmtDateTime = iso => {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);

    const date = d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const time = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${date}, ${time}`;
  } catch {
    return String(iso);
  }
};

let ClipboardModule = null;
try {
  // eslint-disable-next-line global-require
  ClipboardModule = require('@react-native-clipboard/clipboard').default;
} catch {
  ClipboardModule = null;
}

const InfoRow = memo(({ label, value, valueStyle }) => {
  if (value === null || value === undefined || value === '') return null;
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={[s.rowValue, valueStyle]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
});

const DonationReceiptScreen = ({ navigation, route }) => {
  const { currentUser } = useAppContext();

  // The original notification row travels with the route so this screen
  // can recover ids the router failed to extract, instead of dead-ending
  // on an error state the user can do nothing about.
  const rawNotification = route?.params?.rawNotification || null;

  const fallbackPayload = rawNotification
    ? parseNotificationPayload(rawNotification)
    : null;

  const donationId =
    (route?.params?.donationId
      ? String(route.params.donationId)
      : fallbackPayload?.donationId
        ? String(fallbackPayload.donationId)
        : null) || null;

  const userId =
    (route?.params?.userId
      ? String(route.params.userId)
      : fallbackPayload?.donationUserId
        ? String(fallbackPayload.donationUserId)
        : currentUser?.id != null
          ? String(currentUser.id)
          : null) || null;

  const roleParam = route?.params?.role;

  // An anonymous donation arrives with donor === null in the creator
  // projection too, so payload shape alone can't distinguish the two
  // sides — the notification that opened this screen is authoritative.
  const notificationHint = `${route?.params?.notificationType || ''} ${
    route?.params?.notificationTitle || ''
  }`.toUpperCase();

  const isReceivedNotification = /RECEIV/.test(notificationHint);

  const roleHint =
    roleParam === 'creator' || roleParam === 'donor'
      ? roleParam
      : isReceivedNotification
        ? 'creator'
        : undefined;

  const { data, isLoading, isError, error, refetch } = useDonationDetail({
    donationId,
    userId,
    roleHint,
  });

  const detail = data?.detail || null;

  const shotRef = useRef(null);

  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  const [responseModal, setResponseModal] = useState({
    visible: false,
    variant: 'error',
    title: '',
    message: '',
    code: '',
  });

  const closeResponseModal = useCallback(() => {
    setResponseModal(prev => ({ ...prev, visible: false }));
  }, []);

  const showError = useCallback((message, code = '') => {
    setResponseModal({
      visible: true,
      variant: 'error',
      title: 'Error',
      message: message || 'Something went wrong',
      code: code ? String(code) : '',
    });
  }, []);

  const handleBack = useCallback(() => {
    if (navigation?.canGoBack?.()) navigation.goBack();
    else navigation?.navigate?.('MainTabs');
  }, [navigation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (err) {
      const body = err?.response?.data;
      showError(
        body?.responseMessage || 'Unable to refresh receipt',
        body?.responseCode,
      );
    } finally {
      setRefreshing(false);
    }
  }, [refetch, showError]);

  const handleToggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(v => !v);
  }, []);

  const handleCopy = useCallback(() => {
    if (!ClipboardModule || !detail?.transactionId) return;
    try {
      ClipboardModule.setString(String(detail.transactionId));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      showError('Could not copy transaction ID.');
    }
  }, [detail, showError]);

  const isCreatorView = !!detail && (isReceivedNotification || detail.isCreator);

  const handleShare = useCallback(async () => {
    if (!detail || sharing) return;

    setSharing(true);
    try {
      await shareReceiptImage({
        shotRef,
        title: 'Donation Receipt',
        filename: `fundme-receipt-${detail.transactionId || Date.now()}`,
      });
    } catch (err) {
      // Reported verbatim with its stage tag so a linking problem is
      // never mistaken for a capture or share-sheet problem.
      showError(err?.message || 'Could not share the receipt image.', err?.step);
    } finally {
      setSharing(false);
    }
  }, [detail, sharing, showError]);

  // ── Guard: missing reference ────────────────────────────────
  if (!donationId || !userId) {
    const availableKeys = rawNotification
      ? Array.from(listPayloadKeys(rawNotification)).join(', ')
      : 'no payload received';

    return (
      <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor={C.pageBg} />
        <View style={s.stateWrap}>
          <Icons name="alert-triangle" size={sp(38)} color={C.red} />
          <Text style={s.stateTitle}>Receipt unavailable</Text>
          <Text style={s.stateSub}>
            {!donationId
              ? 'Missing donation reference.'
              : 'Missing user reference.'}
          </Text>
          {/* Names the keys the backend actually sent, so a field-name
              mismatch is identifiable without attaching a debugger. */}
          <Text style={s.stateKeys} numberOfLines={6}>
            {`Payload keys: ${availableKeys}`}
          </Text>
          <TouchableOpacity style={s.stateBtn} onPress={handleBack}>
            <Text style={s.stateBtnTxt}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Guard: loading ──────────────────────────────────────────
  if (isLoading && !refreshing) {
    return (
      <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor={C.pageBg} />
        <View style={s.stateWrap}>
          <ActivityIndicator size="large" color={C.dark} />
          <Text style={s.stateSub}>Loading receipt…</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Guard: error / not found ────────────────────────────────
  if (isError || !detail) {
    const body = error?.response?.data;
    return (
      <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
        <StatusBar barStyle="dark-content" backgroundColor={C.pageBg} />
        <View style={s.stateWrap}>
          <Icons name="alert-triangle" size={sp(38)} color={C.red} />
          <Text style={s.stateTitle}>Receipt unavailable</Text>
          <Text style={s.stateSub}>
            {body?.responseMessage ||
              data?.message ||
              error?.message ||
              'Donation details not found.'}
          </Text>
          <View style={s.stateBtnRow}>
            <TouchableOpacity style={s.stateBtnGhost} onPress={handleBack}>
              <Text style={s.stateBtnGhostTxt}>Go Back</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.stateBtn} onPress={refetch}>
              <Text style={s.stateBtnTxt}>Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const heroAmount = isCreatorView
    ? detail.amount
    : detail.totalChargedAmount ?? detail.amount;

  const headline = isCreatorView ? 'Donation Received' : 'Donation Successful';
  const subline = isCreatorView
    ? `From ${detail.donorName}`
    : detail.campaignTitle;

  // collapsable={false} is required on Android: without it the view can
  // be flattened away at native level and the snapshot comes back blank.
  const receiptBody = (
    <View style={s.captureArea} collapsable={false}>
      <View style={s.heroWrap}>
        <View style={s.logoCircle}>
          <Image source={LogoImg} style={s.logo} resizeMode="contain" />
        </View>

        <Text style={s.heroName}>{headline}</Text>
        {!!subline && (
          <Text style={s.heroSub} numberOfLines={2}>
            {subline}
          </Text>
        )}

        <Text style={s.heroAmount}>{fmtPKR(heroAmount)}</Text>
        <Text style={s.heroDate}>{fmtDateTime(detail.donationDate)}</Text>

        {!!detail.paymentStatus && (
          <View style={s.statusPill}>
            <Icons name="check-circle" size={sp(12)} color={C.green} />
            <Text style={s.statusTxt}>{detail.paymentStatus}</Text>
          </View>
        )}
      </View>

      <View style={s.card}>
        <InfoRow
          label={isCreatorView ? 'Amount Received' : 'Donation Amount'}
          value={fmtPKR(detail.amount)}
        />
        {detail.platformTip != null && (
          <InfoRow label="Platform Tip" value={fmtPKR(detail.platformTip)} />
        )}
        {detail.totalChargedAmount != null && (
          <>
            <View style={s.cardDivider} />
            <InfoRow
              label="Total Amount"
              value={fmtPKR(detail.totalChargedAmount)}
            />
          </>
        )}
      </View>

      {!!detail.transactionId && (
        <View style={s.card}>
          <View style={s.row}>
            <Text style={s.rowLabel}>Transaction ID</Text>
            <View style={s.copyRow}>
              <Text style={s.rowValue} numberOfLines={1}>
                {detail.transactionId}
              </Text>
              {!!ClipboardModule && (
                <TouchableOpacity
                  onPress={handleCopy}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  activeOpacity={0.7}
                >
                  <Icons
                    name={copied ? 'check' : 'copy'}
                    size={sp(16)}
                    color={C.green}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      )}

      <View style={s.card}>
        <TouchableOpacity
          style={s.accordionHead}
          onPress={handleToggle}
          activeOpacity={0.75}
        >
          <Text style={s.accordionTitle}>ADDITIONAL INFORMATION</Text>
          <Icons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={sp(18)}
            color={C.textGray}
          />
        </TouchableOpacity>

        {expanded && (
          <View style={s.accordionBody}>
            <InfoRow label="Campaign" value={detail.campaignTitle} />
            <InfoRow label="Donor" value={detail.donorName} />
            <InfoRow label="Payment Method" value={detail.paymentMethod} />
            <InfoRow
              label="Date & Time"
              value={fmtDateTime(detail.donationDate)}
            />
            {!!detail.donorMessage && (
              <View style={s.messageBlock}>
                <Text style={s.rowLabel}>Message</Text>
                <Text style={s.messageTxt}>"{detail.donorMessage}"</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <Text style={s.footerNote}>
        {isCreatorView
          ? 'This donation has been credited to your campaign.'
          : '100% of your donation reaches the campaign.'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={C.pageBg} />

      <View style={s.header}>
        <TouchableOpacity
          onPress={handleBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icons name="arrow-left" size={sp(22)} color={C.textDark} />
        </TouchableOpacity>
        <TouchableOpacity
          style={s.shareBtn}
          onPress={handleShare}
          activeOpacity={0.8}
          disabled={sharing}
        >
          {sharing ? (
            <ActivityIndicator size="small" color={C.textDark} />
          ) : (
            <Icons name="share-2" size={sp(17)} color={C.textDark} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[C.dark]}
            tintColor={C.dark}
          />
        }
      >
        {ViewShot ? (
          <ViewShot
            ref={shotRef}
            options={{ format: 'png', quality: 1, result: 'base64' }}
            style={s.shotWrap}
            collapsable={false}
          >
            {receiptBody}
          </ViewShot>
        ) : (
          receiptBody
        )}
      </ScrollView>

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

export default DonationReceiptScreen;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.pageBg },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sp(18),
    paddingVertical: sp(12),
    backgroundColor: C.pageBg,
  },
  shareBtn: {
    width: sp(38),
    height: sp(38),
    borderRadius: sp(19),
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: sp(16),
    paddingBottom: sp(32),
  },
  shotWrap: {
    backgroundColor: C.pageBg,
  },
  captureArea: {
    backgroundColor: C.pageBg,
    paddingBottom: sp(8),
  },

  heroWrap: {
    alignItems: 'center',
    paddingTop: sp(4),
    paddingBottom: sp(20),
  },
  logoCircle: {
    width: sp(72),
    height: sp(72),
    borderRadius: sp(36),
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: sp(12),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  logo: { width: sp(42), height: sp(42) },

  heroName: {
    fontSize: sp(17),
    fontWeight: '700',
    color: C.textDark,
    textAlign: 'center',
    includeFontPadding: false,
  },
  heroSub: {
    fontSize: sp(13),
    color: C.textGray,
    marginTop: sp(4),
    textAlign: 'center',
    paddingHorizontal: sp(24),
    includeFontPadding: false,
  },
  heroAmount: {
    fontSize: sp(34),
    fontWeight: '700',
    color: C.textDark,
    marginTop: sp(16),
    letterSpacing: -0.5,
    includeFontPadding: false,
  },
  heroDate: {
    fontSize: sp(13),
    color: C.textGray,
    marginTop: sp(5),
    includeFontPadding: false,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp(5),
    backgroundColor: C.greenBg,
    borderRadius: sp(20),
    paddingHorizontal: sp(12),
    paddingVertical: sp(6),
    marginTop: sp(12),
  },
  statusTxt: {
    fontSize: sp(11.5),
    fontWeight: '600',
    color: C.green,
    letterSpacing: 0.3,
    includeFontPadding: false,
  },

  card: {
    backgroundColor: C.white,
    borderRadius: sp(14),
    paddingHorizontal: sp(16),
    paddingVertical: sp(4),
    marginBottom: sp(12),
  },
  cardDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: C.border,
    marginVertical: sp(2),
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: sp(14),
    gap: sp(12),
  },
  rowLabel: {
    fontSize: sp(14),
    fontWeight: '400',
    color: C.textGray,
    flexShrink: 0,
    includeFontPadding: false,
  },
  rowValue: {
    flex: 1,
    fontSize: sp(14),
    fontWeight: '400',
    color: C.textDark,
    textAlign: 'right',
    includeFontPadding: false,
  },
  copyRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: sp(10),
  },

  accordionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: sp(16),
  },
  accordionTitle: {
    fontSize: sp(13),
    fontWeight: '400',
    color: C.textGray,
    letterSpacing: 0.4,
    includeFontPadding: false,
  },
  accordionBody: {
    paddingBottom: sp(6),
  },
  messageBlock: {
    paddingVertical: sp(14),
    gap: sp(6),
  },
  messageTxt: {
    fontSize: sp(13.5),
    color: C.textMid,
    fontStyle: 'italic',
    lineHeight: sp(20),
    includeFontPadding: false,
  },

  footerNote: {
    fontSize: sp(12),
    color: C.textLight,
    textAlign: 'center',
    marginTop: sp(6),
    includeFontPadding: false,
  },

  stateWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: sp(32),
  },
  stateTitle: {
    fontSize: sp(16),
    fontWeight: '700',
    color: C.textDark,
    marginTop: sp(12),
  },
  stateSub: {
    fontSize: sp(13),
    color: C.textGray,
    textAlign: 'center',
    marginTop: sp(6),
  },
  stateKeys: {
    fontSize: sp(10),
    color: C.textLight,
    textAlign: 'center',
    marginTop: sp(10),
    paddingHorizontal: sp(8),
  },
  stateBtnRow: {
    flexDirection: 'row',
    gap: sp(10),
  },
  stateBtn: {
    paddingHorizontal: sp(22),
    paddingVertical: sp(11),
    borderRadius: sp(50),
    backgroundColor: C.dark,
    marginTop: sp(16),
  },
  stateBtnTxt: {
    fontSize: sp(13),
    fontWeight: '700',
    color: C.white,
  },
  stateBtnGhost: {
    paddingHorizontal: sp(22),
    paddingVertical: sp(11),
    borderRadius: sp(50),
    borderWidth: 1.5,
    borderColor: C.border,
    marginTop: sp(16),
  },
  stateBtnGhostTxt: {
    fontSize: sp(13),
    fontWeight: '700',
    color: C.textDark,
  },
});