// src/screens/campaigns/MyCampaignsScreen.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Platform,
  Keyboard,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/Feather';

import { P, sp } from '../../theme/theme';
import { CAMPAIGN_TABS } from '../../constants/mockData';
import EmptyState from '../../components/shared/EmptyState';
import FilterTabs from '../../components/shared/FilterTabs';
import CampaignCard from './CampaignCard';
import ResponseModal from '../../components/ResponseModal';
import { FullScreenLoader } from '../../components/common/Loader';
import { useAppContext } from '../../context/AppContext';
import {
  useMyCampaigns,
  useDeleteCampaign,
  useFetchCampaignReview,
  useCreateCampaignUpdate,
  resolveCampaignResumeStep,
  getCampaignFlowScreen,
  mapCampaignReviewToFlowParams,
} from '../../hooks/useCampaign';

const UPDATE_MAX = 500;
const UPDATE_MIN = 10;

const { height: SH } = Dimensions.get('window');

/**
 * DeleteConfirmOverlay
 *
 * Rendered as an absolute overlay inside the screen rather than in a
 * <Modal>. Three Modals were already stacked on this screen (this sheet,
 * ResponseModal, FullScreenLoader) and on Android only one native dialog
 * window reliably wins — the loser mounts but never appears, which is
 * indistinguishable from the button not firing at all.
 */
const DeleteConfirmOverlay = ({
  visible,
  title,
  loading,
  onCancel,
  onConfirm,
}) => {
  if (!visible) return null;

  return (
    <View style={dcSt.root} pointerEvents="box-none">
      <TouchableOpacity
        style={dcSt.backdrop}
        activeOpacity={1}
        onPress={loading ? undefined : onCancel}
      />

      <View style={dcSt.sheet}>
        <View style={dcSt.handle} />

        <View style={dcSt.iconCircle}>
          <Icons name="trash-2" size={sp(26)} color={P.white} />
        </View>

        <Text style={dcSt.title}>Delete Campaign?</Text>
        <Text style={dcSt.message} numberOfLines={3}>
          {title
            ? `"${title}" will be permanently removed. This action cannot be undone.`
            : 'This campaign will be permanently removed. This action cannot be undone.'}
        </Text>

        <View style={dcSt.btnRow}>
          <TouchableOpacity
            style={dcSt.cancelBtn}
            onPress={onCancel}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={dcSt.cancelTxt}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={dcSt.deleteBtn}
            onPress={onConfirm}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={P.white} />
            ) : (
              <Text style={dcSt.deleteTxt}>Delete</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const dcSt = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 999,
    elevation: 999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.55)',
  },
  sheet: {
    backgroundColor: P.white,
    borderTopLeftRadius: sp(24),
    borderTopRightRadius: sp(24),
    paddingHorizontal: sp(24),
    paddingTop: sp(12),
    paddingBottom: sp(28),
    alignItems: 'center',
  },
  handle: {
    width: sp(36),
    height: sp(4),
    borderRadius: sp(2),
    backgroundColor: P.border,
    marginBottom: sp(20),
  },
  // Brand teal, matching ResponseModal's primary button rather than the
  // destructive red — the warning is carried by the copy and the Delete
  // button, so a red icon on top of that reads as an error state.
  iconCircle: {
    width: sp(64),
    height: sp(64),
    borderRadius: sp(32),
    backgroundColor: P.darkOcean,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: sp(16),
  },
  title: {
    fontSize: sp(18),
    fontWeight: '800',
    color: P.dark,
    marginBottom: sp(8),
  },
  message: {
    fontSize: sp(14),
    color: P.gray,
    textAlign: 'center',
    lineHeight: sp(20),
    marginBottom: sp(22),
  },
  btnRow: {
    flexDirection: 'row',
    width: '100%',
    gap: sp(10),
  },
  cancelBtn: {
    flex: 1,
    borderRadius: sp(14),
    paddingVertical: sp(15),
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: P.border,
    backgroundColor: P.white,
  },
  cancelTxt: { fontSize: sp(15), fontWeight: '700', color: P.dark },
  // The single destructive accent on the sheet: the action itself.
  deleteBtn: {
    flex: 1,
    borderRadius: sp(14),
    paddingVertical: sp(15),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: P.red,
  },
  deleteTxt: { fontSize: sp(15), fontWeight: '700', color: P.white },
});

/**
 * PostUpdateOverlay
 *
 * A centered dialog rather than a bottom sheet: this one owns a
 * multiline TextInput, and anything anchored to the bottom edge sits
 * directly under the keyboard the moment it opens.
 *
 * The real keyboard height is measured and used to shrink the available
 * area, so the dialog stays centred in whatever space is left. This is
 * preferred over KeyboardAvoidingView, whose Android 'height' behavior
 * double-shrinks when windowSoftInputMode is already adjustResize and
 * under-reacts when it isn't.
 */
const PostUpdateOverlay = ({
  visible,
  campaignTitle,
  value,
  onChangeText,
  error,
  loading,
  onCancel,
  onSubmit,
}) => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvt =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvt, e => {
      setKeyboardHeight(e?.endCoordinates?.height ?? 0);
    });
    const hideSub = Keyboard.addListener(hideEvt, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    if (!visible) setKeyboardHeight(0);
  }, [visible]);

  if (!visible) return null;

  const remaining = UPDATE_MAX - value.length;
  const nearLimit = remaining <= 50;

  // Caps the card so it can never grow taller than the space the
  // keyboard leaves behind; the body scrolls instead.
  const availableHeight = SH - keyboardHeight;
  const maxCardHeight = Math.max(availableHeight - sp(48), sp(280));

  return (
    <View
      style={[puSt.root, { paddingBottom: keyboardHeight }]}
      pointerEvents="box-none"
    >
      <TouchableOpacity
        style={puSt.backdrop}
        activeOpacity={1}
        onPress={loading ? undefined : onCancel}
      />

      <View style={[puSt.card, { maxHeight: maxCardHeight }]}>
        <ScrollView
          bounces={false}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={puSt.cardBody}
        >
          <View style={puSt.headRow}>
            <View style={puSt.iconCircle}>
              <Icons name="edit-3" size={sp(20)} color={P.white} />
            </View>

            <View style={puSt.headText}>
              <Text style={puSt.title}>Post an Update</Text>
              {!!campaignTitle && (
                <Text style={puSt.subtitle} numberOfLines={1}>
                  {campaignTitle}
                </Text>
              )}
            </View>
          </View>

          <Text style={puSt.hint}>
            Share progress with your donors — how funds were used, who was
            helped, or what happens next.
          </Text>

          <View style={[puSt.inputWrap, !!error && puSt.inputWrapError]}>
            <TextInput
              style={puSt.input}
              value={value}
              onChangeText={onChangeText}
              placeholder="e.g. First batch of relief funds distributed. 15 families received tents today."
              placeholderTextColor={P.light}
              multiline
              textAlignVertical="top"
              maxLength={UPDATE_MAX}
              editable={!loading}
              autoFocus
            />
          </View>

          <View style={puSt.metaRow}>
            {error ? (
              <View style={puSt.errRow}>
                <Icons name="alert-circle" size={sp(12)} color={P.red} />
                <Text style={puSt.errTxt}>{error}</Text>
              </View>
            ) : (
              <View style={puSt.spacer} />
            )}

            <Text style={[puSt.counter, nearLimit && puSt.counterWarn]}>
              {value.length}/{UPDATE_MAX}
            </Text>
          </View>
        </ScrollView>

        {/* Outside the ScrollView so the actions stay reachable even
            when the body is scrolled or the keyboard is open. */}
        <View style={puSt.btnRow}>
          <TouchableOpacity
            style={puSt.cancelBtn}
            onPress={onCancel}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={puSt.cancelTxt}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[puSt.postBtn, loading && puSt.postBtnDisabled]}
            onPress={onSubmit}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={P.white} />
            ) : (
              <>
                <Text style={puSt.postTxt}>Post Update</Text>
                <Icons name="send" size={sp(14)} color={P.white} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const puSt = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: sp(20),
    zIndex: 1000,
    elevation: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.55)',
  },
  card: {
    width: '100%',
    backgroundColor: P.white,
    borderRadius: sp(20),
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
  },
  cardBody: {
    paddingHorizontal: sp(20),
    paddingTop: sp(20),
  },
  headRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp(12),
    marginBottom: sp(12),
  },
  iconCircle: {
    width: sp(44),
    height: sp(44),
    borderRadius: sp(22),
    backgroundColor: P.darkOcean,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headText: { flex: 1 },
  title: {
    fontSize: sp(17),
    fontWeight: '800',
    color: P.dark,
    marginBottom: sp(2),
  },
  subtitle: { fontSize: sp(12), color: P.gray },
  hint: {
    fontSize: sp(12.5),
    color: P.gray,
    lineHeight: sp(18),
    marginBottom: sp(14),
  },
  inputWrap: {
    borderWidth: 1.5,
    borderColor: P.border,
    borderRadius: sp(12),
    backgroundColor: P.white,
    paddingHorizontal: sp(14),
    paddingVertical: sp(12),
  },
  inputWrapError: { borderColor: P.red },
  input: {
    fontSize: sp(14),
    color: P.dark,
    lineHeight: sp(20),
    padding: 0,
    minHeight: sp(88),
    maxHeight: sp(140),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: sp(8),
    marginBottom: sp(16),
    gap: sp(10),
  },
  spacer: { flex: 1 },
  errRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp(5),
  },
  errTxt: { flex: 1, fontSize: sp(11.5), color: P.red },
  counter: { fontSize: sp(11.5), color: P.light, fontWeight: '600' },
  counterWarn: { color: P.red },
  btnRow: {
    flexDirection: 'row',
    gap: sp(10),
    paddingHorizontal: sp(20),
    paddingBottom: sp(20),
  },
  cancelBtn: {
    flex: 1,
    borderRadius: sp(14),
    paddingVertical: sp(14),
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: P.border,
    backgroundColor: P.white,
  },
  cancelTxt: { fontSize: sp(15), fontWeight: '700', color: P.dark },
  postBtn: {
    flex: 1.4,
    flexDirection: 'row',
    borderRadius: sp(14),
    paddingVertical: sp(14),
    alignItems: 'center',
    justifyContent: 'center',
    gap: sp(7),
    backgroundColor: P.darkOcean,
  },
  postBtnDisabled: { opacity: 0.7 },
  postTxt: { fontSize: sp(15), fontWeight: '700', color: P.white },
});

const MyCampaignsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('All');

  const { currentUser } = useAppContext();
  const userId = currentUser?.id ?? currentUser?.userId ?? null;

  // API
  const { data, refetch } = useMyCampaigns();
  const { mutate: deleteCampaign, isPending: isDeleting } = useDeleteCampaign();
  const { mutate: fetchReview, isPending: isLoadingReview } =
    useFetchCampaignReview();
  const { mutate: postUpdate, isPending: isPostingUpdate } =
    useCreateCampaignUpdate();

  const [refreshing, setRefreshing] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState({
    visible: false,
    campaignId: null,
    title: '',
  });

  const [updateSheet, setUpdateSheet] = useState({
    visible: false,
    campaignId: null,
    title: '',
    text: '',
    error: '',
  });

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

  const showResponse = useCallback(
    ({ variant = 'error', title, message, code = '' }) => {
      setResponseModal({
        visible: true,
        variant,
        title: title || (variant === 'success' ? 'Success' : 'Error'),
        message: message || 'Something went wrong. Please try again.',
        code: code ? String(code) : '',
      });
    },
    [],
  );

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const filteredData = useMemo(() => {
    const campaigns = data?.campaigns || [];

    if (activeTab === 'All') {
      return campaigns;
    }

    return campaigns.filter(c => c.status === activeTab);
  }, [activeTab, data]);

  // ── Delete ────────────────────────────────────────────────
  const closeConfirmDelete = useCallback(() => {
    if (isDeleting) return;
    setConfirmDelete({ visible: false, campaignId: null, title: '' });
  }, [isDeleting]);

  const runDelete = useCallback(
    campaignId => {
      deleteCampaign(campaignId, {
        onSuccess: body => {
          setConfirmDelete({ visible: false, campaignId: null, title: '' });

          // HTTP 200 alone isn't success — the backend returns failures
          // with a 200 and a non-"000" responseCode.
          if (body?.responseCode && body.responseCode !== '000') {
            showResponse({
              variant: 'error',
              title: 'Delete Failed',
              message:
                body?.responseMessage ||
                'Could not delete this campaign. Please try again.',
              code: body?.responseCode,
            });
            return;
          }

          showResponse({
            variant: 'success',
            title: 'Campaign Deleted',
            message:
              body?.responseMessage ||
              'Your campaign has been deleted successfully.',
          });
        },
        onError: error => {
          setConfirmDelete({ visible: false, campaignId: null, title: '' });

          const body = error?.response?.data || error?.raw;
          showResponse({
            variant: 'error',
            title: 'Delete Failed',
            message:
              body?.responseMessage ||
              error?.message ||
              'Could not delete this campaign. Please try again.',
            code: body?.responseCode || error?.code || '',
          });
        },
      });
    },
    [deleteCampaign, showResponse],
  );

  const handleConfirmDelete = useCallback(() => {
    const campaignId = confirmDelete.campaignId;

    if (!campaignId) {
      setConfirmDelete({ visible: false, campaignId: null, title: '' });
      showResponse({ message: 'Missing campaign reference.' });
      return;
    }

    runDelete(campaignId);
  }, [confirmDelete.campaignId, runDelete, showResponse]);

  // ── Post Update ───────────────────────────────────────────
  const openUpdateSheet = useCallback(
    item => {
      const campaignId = item?.campaignId ?? item?.id ?? null;

      if (!campaignId) {
        showResponse({ message: 'Missing campaign reference.' });
        return;
      }

      if (!userId) {
        showResponse({
          message: 'Your session has expired. Please log in again.',
        });
        return;
      }

      setUpdateSheet({
        visible: true,
        campaignId,
        title: item?.title || '',
        text: '',
        error: '',
      });
    },
    [userId, showResponse],
  );

  const closeUpdateSheet = useCallback(() => {
    if (isPostingUpdate) return;
    Keyboard.dismiss();
    setUpdateSheet({
      visible: false,
      campaignId: null,
      title: '',
      text: '',
      error: '',
    });
  }, [isPostingUpdate]);

  const handleUpdateTextChange = useCallback(text => {
    setUpdateSheet(prev => ({
      ...prev,
      text,
      // Clearing as the creator types keeps the error tied to the last
      // submit attempt rather than lingering over corrected input.
      error: prev.error ? '' : prev.error,
    }));
  }, []);

  const handleSubmitUpdate = useCallback(() => {
    const { campaignId, text } = updateSheet;
    const trimmed = text.trim();

    if (!trimmed) {
      setUpdateSheet(prev => ({
        ...prev,
        error: 'Please write an update before posting.',
      }));
      return;
    }

    if (trimmed.length < UPDATE_MIN) {
      setUpdateSheet(prev => ({
        ...prev,
        error: `Update must be at least ${UPDATE_MIN} characters.`,
      }));
      return;
    }

    if (!campaignId || !userId) {
      setUpdateSheet(prev => ({ ...prev, visible: false }));
      showResponse({ message: 'Missing campaign reference.' });
      return;
    }

    Keyboard.dismiss();

    postUpdate(
      { campaignId, userId, update: trimmed },
      {
        onSuccess: body => {
          if (body?.responseCode && body.responseCode !== '000') {
            setUpdateSheet(prev => ({
              ...prev,
              error:
                body?.responseMessage ||
                'Could not post your update. Please try again.',
            }));
            return;
          }

          setUpdateSheet({
            visible: false,
            campaignId: null,
            title: '',
            text: '',
            error: '',
          });

          showResponse({
            variant: 'success',
            title: 'Update Posted',
            message:
              'Your update is now live on the campaign page — donors will see it right away.',
          });
        },
        onError: error => {
          const body = error?.response?.data || error?.raw;

          // Kept inside the sheet rather than closing it: the creator's
          // text is still there and retrying shouldn't mean retyping.
          setUpdateSheet(prev => ({
            ...prev,
            error:
              body?.responseMessage ||
              error?.message ||
              'Could not post your update. Please try again.',
          }));
        },
      },
    );
  }, [updateSheet, userId, postUpdate, showResponse]);

  // ── Edit ──────────────────────────────────────────────────
  /**
   * Loads everything already saved, then jumps to the step AFTER the
   * last completed one — carrying the saved fields along so nothing has
   * to be retyped.
   */
  const handleEdit = useCallback(
    item => {
      const campaignId = item?.campaignId ?? item?.id;

      if (!campaignId) {
        showResponse({ message: 'Missing campaign reference.' });
        return;
      }

      fetchReview(campaignId, {
        onSuccess: body => {
          if (body?.responseCode && body.responseCode !== '000') {
            showResponse({
              title: 'Could Not Open Campaign',
              message:
                body?.responseMessage ||
                'Unable to load this campaign. Please try again.',
              code: body?.responseCode,
            });
            return;
          }

          const detail = body?.data;
          if (!detail) {
            showResponse({
              title: 'Could Not Open Campaign',
              message:
                body?.responseMessage ||
                'Unable to load this campaign. Please try again.',
              code: body?.responseCode || '',
            });
            return;
          }

          const params = mapCampaignReviewToFlowParams(detail);
          const step = resolveCampaignResumeStep(detail);
          const screen = getCampaignFlowScreen(step);

          navigation.navigate(screen, {
            ...params,
            campaignId: params.campaignId || String(campaignId),
            // Reset explicitly: these screens are shared with the
            // rejection deep-link, and React Navigation MERGES params
            // into an existing route instance rather than replacing
            // them — a stale isRejection would flip this into a
            // resubmit.
            isRejection: false,
            rejectedStep: null,
            rejectionReason: '',
            notificationType: '',
            rawNotification: null,
          });
        },
        onError: error => {
          const body = error?.response?.data || error?.raw;
          showResponse({
            title: 'Could Not Open Campaign',
            message:
              body?.responseMessage ||
              error?.message ||
              'Unable to load this campaign. Please try again.',
            code: body?.responseCode || error?.code || '',
          });
        },
      });
    },
    [fetchReview, navigation, showResponse],
  );

  // ── View ──────────────────────────────────────────────────
  /**
   * Same contract as Home and Explore: navigate with campaignId and let
   * CampaignDetail run the detail query itself.
   */
  const handleView = useCallback(
    item => {
      const campaignId = item?.campaignId ?? item?.id;

      if (!campaignId) {
        showResponse({ message: 'Missing campaign reference.' });
        return;
      }

      navigation.navigate('CampaignDetail', {
        campaignId,
        campaign: item?.raw,
      });
    },
    [navigation, showResponse],
  );

  const handleAction = useCallback(
    (action, item) => {
      const key = String(action || '')
        .trim()
        .toLowerCase();
      const campaignId = item?.campaignId ?? item?.id ?? null;

      if (key === 'delete') {
        setConfirmDelete({
          visible: true,
          campaignId,
          title: item?.title || '',
        });
        return;
      }

      if (key === 'post update') {
        openUpdateSheet(item);
        return;
      }

      if (key === 'view') {
        handleView(item);
        return;
      }

      if (key === 'edit' || key === 'update' || key === 'edit & resubmit') {
        handleEdit(item);
        return;
      }

      if (key === 'withdraw') {
        navigation.navigate('RequestWithdrawalScreen', {
          campaignId,
          campaignTitle: item?.title,
        });
      }
    },
    [navigation, handleEdit, handleView, openUpdateSheet],
  );

  const renderItem = useCallback(
    ({ item }) => (
      <CampaignCard item={item} onAction={act => handleAction(act, item)} />
    ),
    [handleAction],
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={P.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icons name="arrow-left" size={sp(22)} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Campaigns</Text>

        <TouchableOpacity onPress={() => navigation.navigate('CreateCampaign')}>
          <Text style={styles.newBtn}>+ New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={item => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{ height: sp(6) }} />}
        ListHeaderComponent={
          <View style={styles.tabContainer}>
            <View style={styles.topSpacer} />

            <FilterTabs
              tabs={CAMPAIGN_TABS}
              active={activeTab}
              onChange={setActiveTab}
            />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="folder"
            title={`No ${activeTab} Campaigns`}
            subtitle="We couldn't find any matching campaigns."
          />
        }
      />

      <DeleteConfirmOverlay
        visible={confirmDelete.visible}
        title={confirmDelete.title}
        loading={isDeleting}
        onCancel={closeConfirmDelete}
        onConfirm={handleConfirmDelete}
      />

      <PostUpdateOverlay
        visible={updateSheet.visible}
        campaignTitle={updateSheet.title}
        value={updateSheet.text}
        onChangeText={handleUpdateTextChange}
        error={updateSheet.error}
        loading={isPostingUpdate}
        onCancel={closeUpdateSheet}
        onSubmit={handleSubmitUpdate}
      />

      <FullScreenLoader visible={isLoadingReview} message="Loading campaign…" />

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

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: P.bg,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sp(16),
    paddingVertical: sp(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    backgroundColor: P.bg,
  },

  headerTitle: {
    fontSize: sp(17),
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.2,
  },

  newBtn: {
    fontSize: sp(14),
    fontWeight: '700',
    color: P.teal,
  },

  listContent: {
    paddingBottom: sp(32),
    flexGrow: 1,
  },

  tabContainer: {
    marginBottom: sp(14),
  },

  topSpacer: {
    height: sp(16),
  },
});

export default MyCampaignsScreen;
