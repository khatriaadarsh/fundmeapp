// src/screens/campaigns/MyCampaignsScreen.jsx

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  StatusBar,
  ActivityIndicator,
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
import {
  useMyCampaigns,
  useDeleteCampaign,
  useFetchCampaignReview,
  resolveCampaignResumeStep,
  getCampaignFlowScreen,
  mapCampaignReviewToFlowParams,
} from '../../hooks/useCampaign';

/**
 * DeleteConfirmOverlay
 *
 * Rendered as an absolute overlay inside the screen rather than in a
 * <Modal>. Three Modals were already stacked on this screen (this sheet,
 * ResponseModal, FullScreenLoader) and on Android only one native dialog
 * window reliably wins — the loser mounts but never appears, which is
 * indistinguishable from the button not firing at all.
 */
const DeleteConfirmOverlay = ({ visible, title, loading, onCancel, onConfirm }) => {
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

const MyCampaignsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('All');

  // API
  const { data, refetch } = useMyCampaigns();
  const { mutate: deleteCampaign, isPending: isDeleting } = useDeleteCampaign();
  const { mutate: fetchReview, isPending: isLoadingReview } =
    useFetchCampaignReview();

  const [refreshing, setRefreshing] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState({
    visible: false,
    campaignId: null,
    title: '',
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
      const key = String(action || '').trim().toLowerCase();
      const campaignId = item?.campaignId ?? item?.id ?? null;

      if (key === 'delete') {
        setConfirmDelete({
          visible: true,
          campaignId,
          title: item?.title || '',
        });
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
    [navigation, handleEdit, handleView],
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