// src/screens/saved/SavedScreen.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  StyleSheet,
  FlatList,
  StatusBar,
  Animated,
  View,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { P, sp } from '../../theme/theme';
import { useAppContext } from '../../context/AppContext';
import {
  useSavedCampaigns,
  useUnsaveCampaignByCampaignId,
} from '../../hooks/useSavedCampaigns';
import { getUserId } from '../../utils/storage';

import SavedScreenHeader from '../../components/saved/SavedScreenHeader';
import SavedCampaignCard from '../../components/saved/SavedCampaignCard';
import EmptyState from '../../components/shared/EmptyState';
import ResponseModal from '../../components/ResponseModal';

const SavedScreen = ({ navigation }) => {
  const { currentUser } = useAppContext();

  const resolveId = (user) => {
    if (!user) return null;
    const raw = user.userId ?? user.id ?? null;
    return raw ? Number(raw) : null;
  };

  const [userId, setUserId] = useState(() => resolveId(currentUser));
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal] = useState({
    visible: false,
    title: '',
    message: '',
  });

  const showModal = useCallback((title, message) => {
    setModal({ visible: true, title, message });
  }, []);

  const hideModal = useCallback(() => {
    setModal((prev) => ({ ...prev, visible: false }));
  }, []);

  const mountAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(sp(16))).current;

  useFocusEffect(
    useCallback(() => {
      const idFromContext = resolveId(currentUser);
      if (idFromContext) {
        setUserId(idFromContext);
        return;
      }
      getUserId().then((id) => {
        if (id) setUserId(Number(id));
      });
    }, [currentUser])
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(mountAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [mountAnim, slideAnim]);

  const {
    data: saved = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useSavedCampaigns(userId);

  const { mutate: unsaveCampaign } = useUnsaveCampaignByCampaignId(userId);


  const EMPTY_RESULT_CODES = ['023', '024', '404'];

   /**
   * "Nothing saved" is not a failure.
   *
   * The backend reports it with an inconsistent responseCode but a
   * consistent message ("Favourite not found"), so matching on the code
   * alone kept letting it through. The list is already showing an empty
   * state, and the modal is only worth opening for something the user
   * can actually act on — so this errs toward silence.
   */
  /**
   * "Nothing saved" is not a failure.
   *
   * The client flattens business errors to a top-level { code, message },
   * so this reads both that shape and the nested axios/raw one before
   * deciding anything is worth reporting.
   */
  useEffect(() => {
    if (!isError) return;

    const nested = error?.response?.data || error?.raw || {};

    const code = String(
      error?.code ?? error?.responseCode ?? nested?.responseCode ?? '',
    );

    const message = String(
      error?.message ?? error?.responseMessage ?? nested?.responseMessage ?? '',
    );

    const isEmpty =
      ['023', '024', '404'].includes(code) ||
      /not\s*found|no\s*(saved|favourite|favorite|record|data)/i.test(message);

    if (isEmpty) return;

    // Whatever went wrong, an empty list is already a coherent thing to
    // show — a dialog on top of it adds noise, not information.
    if (Array.isArray(saved) && saved.length === 0) return;

    showModal(
      'Error',
      message || 'Unable to load saved campaigns. Please try again.',
    );
  }, [isError, error, saved, showModal]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (e) {
      showModal(
        'Error',
        e?.message || 'Unable to refresh saved campaigns. Please try again.',
      );
    } finally {
      setRefreshing(false);
    }
  }, [refetch, showModal]);

    const handleUnsave = useCallback(
    (payload) => {
      // The card's callback signature has drifted before (favouriteId vs
      // the whole item), and a bare `payload?.campaignId` read fails
      // silently against a raw id — producing a "Failed" modal with no
      // backend message, since nothing was ever requested.
      let campaignId = null;

      if (payload && typeof payload === 'object') {
        campaignId =
          payload.campaignId ??
          payload.raw?.campaignId ??
          payload.id ??
          null;
      } else if (payload !== null && payload !== undefined) {
        campaignId = payload;
      }

      const numericCampaignId = Number(campaignId);
      const validCampaignId =
        Number.isFinite(numericCampaignId) && numericCampaignId > 0
          ? numericCampaignId
          : null;

      if (!userId || !validCampaignId) {
        showModal(
          'Failed',
          !userId
            ? 'Your session has expired. Please log in again.'
            : 'Missing campaign reference. Please refresh and try again.',
        );
        return;
      }

      unsaveCampaign(
        { userId, campaignId: validCampaignId },
        {
          // Success is intentionally silent — the row disappearing and
          // the list refreshing is the confirmation.
          onError: (err) => {
            const body = err?.response?.data || err?.raw;
            showModal(
              'Failed',
              body?.responseMessage ||
                err?.message ||
                'Could not unsave campaign. Please try again.',
            );
          },
        },
      );
    },
    [unsaveCampaign, userId, showModal],
  );

  const handleCardPress = useCallback(
    (item) => {
      navigation?.navigate?.('CampaignDetail', { id: item.campaignId });
    },
    [navigation],
  );

  const renderContent = () => {
    if (isLoading && !refreshing) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#0a3d62" />
        </View>
      );
    }

    return (
      <FlatList
        data={saved}
        keyExtractor={(item) => String(item.favouriteId ?? item.id)}
        renderItem={({ item }) => (
          <SavedCampaignCard
            item={item}
            onPress={handleCardPress}
            onUnsave={handleUnsave}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="heart"
            title="No saved campaigns"
            subtitle="Tap the heart icon on any campaign to add it here."
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#0a3d62']}
            tintColor="#0a3d62"
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        bounces={true}
        overScrollMode="always"
      />
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={P.white} />
      <SavedScreenHeader count={saved.length} />

      <Animated.View
        style={[
          styles.animatedWrapper,
          { opacity: mountAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {renderContent()}
      </Animated.View>

      <ResponseModal
        visible={modal.visible}
        variant="error"
        title={modal.title}
        message={modal.message}
        onClose={hideModal}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: P.bg },
  animatedWrapper: { flex: 1 },
  listContent: { flexGrow: 1, paddingTop: sp(8), paddingBottom: sp(16) },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: sp(80),
  },
});

export default SavedScreen;