// src/screens/notifications/NotificationsScreen.jsx
import React, { useState, useCallback, useMemo, useRef, memo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar, SectionList, Dimensions,
  Animated, PanResponder, LayoutAnimation, Platform, UIManager, ActivityIndicator, Alert,
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
import { groupNotificationsIntoSections } from '../../utils/notificationTransform';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Constants, Scaling & Theme (Self-contained) ---
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
  // Notification type colors
  donation: '#15AABF',
  donationBg: '#EEF9FC',
  approved: '#16A34A',
  approvedBg: '#F0FDF4',
  cnic: '#6B7280',
  cnicBg: '#F9FAFB',
  markAll: '#15AABF',
  // Delete / trash accent — reuses the same danger red already used
  // elsewhere in the app (e.g. ProfileScreen logout), not a new color.
  danger: '#EF4444',
};

// --- THIS IS THE FIX ---
// The configuration now correctly maps each type to its specific bar color.
const TYPE_CONFIG = {
  donation: {
    icon: 'gift', // Using a more appropriate icon
    color: C.donation,
    bg: C.donationBg,
    barColor: C.donation, // Teal bar
  },
  approved: {
    icon: 'check-circle',
    color: C.approved,
    bg: C.approvedBg,
    barColor: C.approved, // Green bar
  },
  cnic: {
    icon: 'shield',
    color: C.cnic,
    bg: C.cnicBg,
    barColor: C.border, // Neutral gray bar
  },
};
// --- END OF FIX ---

// --- Local Components ---

const Header = memo(({ onBack, onMarkAll }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={onBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
      <Icons name="arrow-left" size={sp(22)} color={C.textDark} />
    </TouchableOpacity>
    <Text style={styles.header_title}>Notifications</Text>
    <TouchableOpacity onPress={onMarkAll} activeOpacity={0.75}>
      <Text style={styles.header_markAll}>Mark All</Text>
    </TouchableOpacity>
  </View>
));

const NotifCard = memo(({ item, onPress }) => {
  const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.cnic;
  return (
    <TouchableOpacity style={[styles.card, item.unread && styles.card_unread]} onPress={() => onPress(item)} activeOpacity={0.75}>
      {item.unread && <View style={[styles.card_unreadBar, { backgroundColor: cfg.barColor }]} />}
      <View style={styles.card_content}>
        <View style={[styles.card_iconWrap, { backgroundColor: cfg.bg }]}>
          <Icons name={cfg.icon} size={sp(16)} color={cfg.color} />
        </View>
        <View style={styles.card_text}>
          <Text style={styles.card_title} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.card_body} numberOfLines={3}>{item.body}</Text>
          <Text style={styles.card_time}>{item.time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

// ─────────────────────────────────────────────────────────────
// SwipeableNotifCard — wraps NotifCard with a swipe-left-to-reveal-trash
// gesture. Swiping past the threshold (or the trash icon growing to full
// size) triggers a "thrown into the trash" animation: the card slides
// further left while shrinking and fading, landing on the trash icon,
// then calls onDelete once the animation completes.
// ─────────────────────────────────────────────────────────────
const TRASH_WIDTH = sp(64);
const DELETE_THRESHOLD = -TRASH_WIDTH;

const SwipeableNotifCard = memo(({ item, onPress, onDelete }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(1)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dx < 0) {
          translateX.setValue(Math.max(gesture.dx, -TRASH_WIDTH - sp(24)));
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

  const triggerDelete = useCallback(() => {
    // Card flies the rest of the way into the trash icon: slides fully
    // left, shrinks down, and fades out — then the parent removes it
    // from the list (with LayoutAnimation collapsing the gap smoothly).
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

  const trashOpacity = translateX.interpolate({
    inputRange: [-TRASH_WIDTH, -sp(16), 0],
    outputRange: [1, 0.6, 0],
    extrapolate: 'clamp',
  });
  const trashScale = translateX.interpolate({
    inputRange: [-TRASH_WIDTH - sp(24), -TRASH_WIDTH, 0],
    outputRange: [1.15, 1, 0.6],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.swipe_wrap}>
      {/* Trash bin — revealed behind the card as the user swipes left */}
      <Animated.View
        style={[
          styles.swipe_trash,
          { opacity: trashOpacity, transform: [{ scale: trashScale }] },
        ]}
      >
        <Icons name="trash-2" size={sp(20)} color={C.white} />
      </Animated.View>

      <Animated.View
        {...panResponder.panHandlers}
        style={{
          transform: [{ translateX }, { scale: cardScale }],
          opacity: cardOpacity,
        }}
      >
        <NotifCard item={item} onPress={onPress} />
      </Animated.View>
    </View>
  );
});

const EmptyState = memo(() => (
  <View style={styles.empty_wrap}>
    <View style={styles.empty_iconWrap}><Icons name="bell-off" size={sp(32)} color={C.textLight} /></View>
    <Text style={styles.empty_title}>No Notifications</Text>
    <Text style={styles.empty_sub}>You're all caught up! Check back later.</Text>
  </View>
));

const LoadingState = memo(() => (
  <View style={styles.empty_wrap}>
    <ActivityIndicator size="small" color={C.markAll} />
  </View>
));

// --- Main Screen ---
const NotificationsScreen = ({ navigation }) => {
  const { currentUser } = useAppContext();
  const userId = currentUser?.id;

  const { data: rawNotifications = [], isLoading } = useNotificationList(userId);
  const markReadMutation = useMarkNotificationRead(userId);
  const markAllMutation = useMarkAllNotificationsRead(userId);
  const deleteMutation = useDeleteNotification(userId);

  // Optimistic local removal so the swipe/trash animation never waits on
  // the network — if the delete call fails, the id is un-hidden again.
  const [removedIds, setRemovedIds] = useState(() => new Set());

  const visibleNotifications = useMemo(
    () => rawNotifications.filter(n => !removedIds.has(n.notificationId)),
    [rawNotifications, removedIds],
  );

  const sections = useMemo(
    () => groupNotificationsIntoSections(visibleNotifications),
    [visibleNotifications],
  );

  const handleMarkAll = useCallback(() => {
    markAllMutation.mutate();
  }, [markAllMutation]);

  const handleNotifPress = useCallback((item) => {
    if (item.unread) {
      markReadMutation.mutate(Number(item.id));
    }
  }, [markReadMutation]);

  const handleDelete = useCallback((item) => {
    const notificationId = Number(item.id);

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setRemovedIds(prev => new Set(prev).add(notificationId));

    deleteMutation.mutate(notificationId, {
      onError: () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setRemovedIds(prev => {
          const next = new Set(prev);
          next.delete(notificationId);
          return next;
        });
        Alert.alert('Error', 'Failed to delete notification. Please try again.');
      },
    });
  }, [deleteMutation]);

  const hasAnyData = sections.length > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.pageBg} />
      <Header onBack={() => navigation.goBack()} onMarkAll={handleMarkAll} />
      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.list_content, !hasAnyData && styles.list_contentEmpty]}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => <Text style={styles.section_title}>{section.title}</Text>}
        renderItem={({ item }) => (
          <SwipeableNotifCard item={item} onPress={handleNotifPress} onDelete={handleDelete} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={isLoading ? <LoadingState /> : <EmptyState />}
      />
    </SafeAreaView>
  );
};

export default NotificationsScreen;

// --- Consolidated Stylesheet ---
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.pageBg },
  separator: { height: vsp(8) },
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: sp(16), paddingVertical: vsp(12), backgroundColor: C.pageBg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.border },
  header_title: { fontSize: sp(17), fontWeight: '700', color: C.textDark, letterSpacing: -0.2 },
  header_markAll: { fontSize: sp(13), fontWeight: '600', color: C.markAll },

  list_content: { paddingHorizontal: sp(16), paddingTop: vsp(16), paddingBottom: vsp(32) },
  list_contentEmpty: { flexGrow: 1 },
  section_title: { fontSize: sp(11), fontWeight: '700', color: C.textLight, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: vsp(8), marginTop: vsp(4) },

  card: { backgroundColor: C.white, borderRadius: sp(12), overflow: 'hidden', flexDirection: 'row', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  card_unread: { backgroundColor: '#FAFCFF' },
  card_unreadBar: { width: sp(4) },
  card_content: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', padding: sp(14), gap: sp(12) },
  card_iconWrap: { width: sp(36), height: sp(36), borderRadius: sp(18), alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: vsp(1) },
  card_text: { flex: 1 },
  card_title: { fontSize: sp(13), fontWeight: '700', color: C.textDark, marginBottom: vsp(3), lineHeight: sp(18) },
  card_body: { fontSize: sp(12), color: C.textGray, lineHeight: sp(17), marginBottom: vsp(6) },
  card_time: { fontSize: sp(11), fontWeight: '500', color: C.textLight },

  // ── Swipe-to-delete ──────────────────────────────────────────
  swipe_wrap: { position: 'relative' },
  swipe_trash: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: TRASH_WIDTH,
    borderRadius: sp(12),
    backgroundColor: C.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  empty_wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: vsp(80), paddingHorizontal: sp(40) },
  empty_iconWrap: { width: sp(72), height: sp(72), borderRadius: sp(36), backgroundColor: '#EEF2F7', alignItems: 'center', justifyContent: 'center', marginBottom: vsp(16) },
  empty_title: { fontSize: sp(16), fontWeight: '700', color: C.textDark, marginBottom: vsp(6), textAlign: 'center' },
  empty_sub: { fontSize: sp(13), color: C.textGray, textAlign: 'center', lineHeight: sp(19) },
});