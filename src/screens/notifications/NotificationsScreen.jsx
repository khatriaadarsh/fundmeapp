// src/screens/notifications/NotificationsScreen.jsx
import React, { useState, useCallback, useMemo, useRef, memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  SectionList,
  ScrollView,
  Dimensions,
  Animated,
  PanResponder,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/Feather';

import { useAppContext } from '../../context/AppContext';
import {
  useNotificationList,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
} from '../../hooks/useNotifications';
import {
  groupNotificationsIntoSections,
  mapNotificationType,
  getStatusVisual,
  NOTIFICATION_CATEGORIES,
} from '../../utils/notificationTransform';
import ResponseModal from '../../components/ResponseModal';
import {
  parseNotificationPayload,
  resolveNotificationRoute,
} from '../../routes/navigationRef';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SW } = Dimensions.get('window');
const sp = size => (SW / 375) * size;
const vsp = size => (Dimensions.get('window').height / 812) * size;

const C = {
  pageBg: '#F4F6F9',
  white: '#FFFFFF',
  textDark: '#111827',
  textGray: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  campaign: '#16A34A',
  campaignBg: '#F0FDF4',
  donation: '#15AABF',
  donationBg: '#EEF9FC',
  withdrawal: '#0891B2',
  withdrawalBg: '#ECFEFF',
  security: '#6B7280',
  securityBg: '#F9FAFB',
  promotional: '#F59E0B',
  promotionalBg: '#FFFBEB',
  system: '#6366F1',
  systemBg: '#EEF2FF',
  markAll: '#15AABF',
  danger: '#EF4444',
};

const TYPE_CONFIG = {
  campaign: {
    icon: 'check-circle',
    color: C.campaign,
    bg: C.campaignBg,
    barColor: C.campaign,
  },
  donation: {
    icon: 'gift',
    color: C.donation,
    bg: C.donationBg,
    barColor: C.donation,
  },
  withdrawal: {
    icon: 'arrow-up-circle',
    color: C.withdrawal,
    bg: C.withdrawalBg,
    barColor: C.withdrawal,
  },
  security: {
    icon: 'shield',
    color: C.security,
    bg: C.securityBg,
    barColor: C.border,
  },
  promotional: {
    icon: 'tag',
    color: C.promotional,
    bg: C.promotionalBg,
    barColor: C.promotional,
  },
  system: {
    icon: 'settings',
    color: C.system,
    bg: C.systemBg,
    barColor: C.system,
  },
};

const Header = memo(({ onBack, onMarkAll }) => (
  <View style={styles.header}>
    <TouchableOpacity
      onPress={onBack}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Icons name="arrow-left" size={sp(22)} color={C.textDark} />
    </TouchableOpacity>
    <Text style={styles.header_title}>Notifications</Text>
    <TouchableOpacity onPress={onMarkAll} activeOpacity={0.75}>
      <Text style={styles.header_markAll}>Mark All</Text>
    </TouchableOpacity>
  </View>
));

const FilterRow = memo(({ active, onChange }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    removeClippedSubviews={false}
    contentContainerStyle={styles.filter_row}
    style={styles.filter_scrollView}
  >
    {NOTIFICATION_CATEGORIES.map(cat => {
      const isActive = active === cat.id;
      const cfg = TYPE_CONFIG[cat.id];

      return (
        <TouchableOpacity
          key={cat.id}
          style={[
            styles.filter_chip,
            {
              backgroundColor: isActive ? C.markAll : C.white,
              borderColor: C.markAll,
            },
            isActive && styles.filter_chipActive,
          ]}
          onPress={() => onChange(cat.id)}
          activeOpacity={0.8}
        >
          {!!cfg && (
            <Icons
              name={cfg.icon}
              size={sp(12.5)}
              color={isActive ? C.white : C.markAll}
              style={styles.filter_icon}
            />
          )}
          <Text
            style={[
              styles.filter_label,
              { color: isActive ? C.white : C.markAll },
            ]}
            numberOfLines={1}
          >
            {cat.label}
          </Text>
        </TouchableOpacity>
      );
    })}
  </ScrollView>
));

const NotifCard = memo(({ item, onPress, disabled }) => {
  const categoryCfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.security;
  const statusOverride = getStatusVisual(item.raw?.notificationType);
  const cfg = statusOverride ?? categoryCfg;
  const barColor = statusOverride ? statusOverride.color : categoryCfg.barColor;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        item.unread && styles.card_unread,
        disabled && styles.card_disabled,
      ]}
      onPress={() => onPress(item)}
      activeOpacity={disabled ? 1 : 0.75}
    >
      {item.unread && (
        <View style={[styles.card_unreadBar, { backgroundColor: barColor }]} />
      )}
      <View style={styles.card_content}>
        <View style={[styles.card_iconWrap, { backgroundColor: cfg.bg }]}>
          <Icons name={cfg.icon} size={sp(16)} color={cfg.color} />
        </View>
        <View style={styles.card_text}>
          <Text style={styles.card_title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.card_body} numberOfLines={3}>
            {item.body}
          </Text>
          <Text style={styles.card_time}>{item.time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const DELETE_THRESHOLD = -sp(64);

const SwipeableNotifCard = memo(({ item, onPress, onDelete, disabled }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(1)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;

  const triggerDelete = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -sp(240),
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 0.35,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDelete(item);
    });
  }, [item, onDelete, translateX, cardScale, cardOpacity]);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 8 &&
        Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dx < 0) {
          translateX.setValue(Math.max(gesture.dx, -sp(88)));
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx <= DELETE_THRESHOLD) {
          triggerDelete();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
            tension: 60,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
        }).start();
      },
    }),
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={{
        transform: [{ translateX }, { scale: cardScale }],
        opacity: cardOpacity,
      }}
    >
      <NotifCard item={item} onPress={onPress} disabled={disabled} />
    </Animated.View>
  );
});

const EmptyState = memo(() => (
  <View style={styles.empty_wrap}>
    <View style={styles.empty_iconWrap}>
      <Icons name="bell-off" size={sp(32)} color={C.textLight} />
    </View>
    <Text style={styles.empty_title}>No Notifications</Text>
    <Text style={styles.empty_sub}>
      You're all caught up! Check back later.
    </Text>
  </View>
));

const LoadingState = memo(() => (
  <View style={styles.empty_wrap}>
    <ActivityIndicator size="small" color={C.markAll} />
  </View>
));

const NotificationsScreen = ({ navigation }) => {
  const { currentUser } = useAppContext();
  const userId = currentUser?.id ?? currentUser?.userId;

  const {
    data: rawNotifications = [],
    isLoading,
    refetch,
  } = useNotificationList(userId);
  const markReadMutation = useMarkNotificationRead(userId);
  const markAllMutation = useMarkAllNotificationsRead(userId);
  const deleteMutation = useDeleteNotification(userId);

  const [activeFilter, setActiveFilter] = useState('all');
  const [removedIds, setRemovedIds] = useState(() => new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
  });

  const visibleNotifications = useMemo(
    () => rawNotifications.filter(n => !removedIds.has(n.notificationId)),
    [rawNotifications, removedIds],
  );

  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'all') return visibleNotifications;
    return visibleNotifications.filter(
      n => mapNotificationType(n.notificationType) === activeFilter,
    );
  }, [visibleNotifications, activeFilter]);

  const sections = useMemo(
    () => groupNotificationsIntoSections(filteredNotifications),
    [filteredNotifications],
  );

  const handleFilterChange = useCallback(id => {
    setActiveFilter(id);
  }, []);

  const handleMarkAll = useCallback(() => {
    markAllMutation.mutate();
  }, [markAllMutation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  /**
   * The router owns every routing decision; this only fills in
   * session-level defaults the payload may omit, and forwards the raw
   * row so the receipt screen can re-extract ids the router missed.
   */
  const handleNotifPress = useCallback(
    item => {
      if (item.unread) {
        markReadMutation.mutate(Number(item.id));
      }

      const source = { ...item, raw: item.raw || item };
      const payload = parseNotificationPayload(source);
      const route = resolveNotificationRoute(source);

      if (!route?.name) return;

      const params = { ...(route.params || {}) };

      if (route.name === 'DonationReceiptScreen') {
        params.donationId = params.donationId ?? payload.donationId;
        params.userId = params.userId ?? payload.donationUserId ?? userId;
        params.rawNotification = item.raw || item;
      }

      if (route.name === 'CNICUploadScreen') {
        params.email =
          params.email || payload.email || currentUser?.email || '';
      }

      navigation.navigate(route.name, params);
    },
    [markReadMutation, navigation, userId, currentUser],
  );

  // Declared BEFORE renderItem — renderItem closes over it, and a const
  // referenced above its definition throws at module evaluation time.
  const handleDelete = useCallback(
    item => {
      const notificationId = Number(item.id);

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setRemovedIds(prev => new Set(prev).add(notificationId));

      deleteMutation.mutate(notificationId, {
        onError: error => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setRemovedIds(prev => {
            const next = new Set(prev);
            next.delete(notificationId);
            return next;
          });
          setErrorModal({
            visible: true,
            message:
              error?.response?.data?.responseMessage ||
              error?.message ||
              'Failed to delete notification. Please try again.',
          });
        },
      });
    },
    [deleteMutation],
  );

  const hasAnyData = sections.length > 0;

  const renderSectionHeader = useCallback(
    ({ section }) => <Text style={styles.section_title}>{section.title}</Text>,
    [],
  );

  // A card is dimmed/inert only when the router says there's nowhere to
  // go — donation cards stay active even once read.
  const renderItem = useCallback(
    ({ item }) => {
      const route = resolveNotificationRoute({
        ...item,
        raw: item.raw || item,
      });

      return (
        <SwipeableNotifCard
          item={item}
          onPress={handleNotifPress}
          onDelete={handleDelete}
          disabled={!route?.name}
        />
      );
    },
    [handleNotifPress, handleDelete],
  );

  const renderSeparator = useCallback(
    () => <View style={styles.separator} />,
    [],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={C.pageBg} />

      <View style={styles.topBlock}>
        <Header onBack={() => navigation.goBack()} onMarkAll={handleMarkAll} />
        <FilterRow active={activeFilter} onChange={handleFilterChange} />
      </View>

      <SectionList
        style={styles.list}
        sections={sections}
        keyExtractor={item => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.list_content,
          !hasAnyData && styles.list_contentEmpty,
        ]}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={renderSectionHeader}
        renderItem={renderItem}
        ItemSeparatorComponent={renderSeparator}
        ListEmptyComponent={
          isLoading && !refreshing ? <LoadingState /> : <EmptyState />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[C.markAll]}
            tintColor={C.markAll}
          />
        }
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        updateCellsBatchingPeriod={50}
        windowSize={9}
        removeClippedSubviews={Platform.OS === 'android'}
      />

      <ResponseModal
        visible={errorModal.visible}
        variant="error"
        title="Error"
        message={errorModal.message}
        onClose={() => setErrorModal({ visible: false, message: '' })}
      />
    </SafeAreaView>
  );
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.pageBg },
  separator: { height: vsp(8) },
  topBlock: { backgroundColor: C.pageBg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sp(16),
    paddingVertical: vsp(12),
    backgroundColor: C.pageBg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
  },
  header_title: {
    fontSize: sp(17),
    fontWeight: '700',
    color: C.textDark,
    letterSpacing: -0.2,
  },
  header_markAll: { fontSize: sp(13), fontWeight: '600', color: C.markAll },
  filter_scrollView: { flexGrow: 0 },
  filter_row: {
    paddingHorizontal: sp(16),
    paddingVertical: vsp(8),
    alignItems: 'center',
  },
  filter_chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: sp(34),
    paddingHorizontal: sp(12),
    marginRight: sp(8),
    borderRadius: sp(17),
    borderWidth: 1,
  },
  filter_chipActive: {},
  filter_icon: { marginRight: sp(5) },
  filter_label: { fontSize: sp(12.5), fontWeight: '700' },
  list: { flex: 1 },
  list_content: {
    paddingHorizontal: sp(16),
    paddingTop: vsp(10),
    paddingBottom: vsp(32),
    flexGrow: 1,
  },
  list_contentEmpty: { flexGrow: 1 },
  section_title: {
    fontSize: sp(11),
    fontWeight: '700',
    color: C.textLight,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: vsp(8),
    marginTop: vsp(4),
  },
  card: {
    backgroundColor: C.white,
    borderRadius: sp(12),
    overflow: 'hidden',
    flexDirection: 'row',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  card_unread: { backgroundColor: '#FAFCFF' },
  card_disabled: { opacity: 0.72 },
  card_unreadBar: { width: sp(4) },
  card_content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: sp(14),
    gap: sp(12),
  },
  card_iconWrap: {
    width: sp(36),
    height: sp(36),
    borderRadius: sp(18),
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: vsp(1),
  },
  card_text: { flex: 1 },
  card_title: {
    fontSize: sp(13),
    fontWeight: '700',
    color: C.textDark,
    marginBottom: vsp(3),
    lineHeight: sp(18),
  },
  card_body: {
    fontSize: sp(12),
    color: C.textGray,
    lineHeight: sp(17),
    marginBottom: vsp(6),
  },
  card_time: { fontSize: sp(11), fontWeight: '500', color: C.textLight },
  empty_wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: vsp(60),
    paddingHorizontal: sp(40),
  },
  empty_iconWrap: {
    width: sp(72),
    height: sp(72),
    borderRadius: sp(36),
    backgroundColor: '#EEF2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vsp(16),
  },
  empty_title: {
    fontSize: sp(16),
    fontWeight: '700',
    color: C.textDark,
    marginBottom: vsp(6),
    textAlign: 'center',
  },
  empty_sub: {
    fontSize: sp(13),
    color: C.textGray,
    textAlign: 'center',
    lineHeight: sp(19),
  },
});