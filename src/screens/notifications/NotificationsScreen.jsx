// src/screens/notifications/NotificationsScreen.jsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  StatusBar,
  SectionList,
} from 'react-native';
import Icons from 'react-native-vector-icons/Feather';

// ═══════════════════════════════════════════════════════════
// Responsive Scale — reused across all screens
// ═══════════════════════════════════════════════════════════
const { width: SW, height: SH } = Dimensions.get('window');
const scale  = size => (SW / 375) * size;
const vscale = size => (SH / 812) * size;

// ═══════════════════════════════════════════════════════════
// Design Tokens — same theme
// ═══════════════════════════════════════════════════════════
const C = {
  pageBg:      '#F4F6F9',
  white:       '#FFFFFF',
  primary:     '#0A3D62',
  teal:        '#15AABF',
  textDark:    '#111827',
  textGray:    '#6B7280',
  textLight:   '#9CA3AF',
  border:      '#E5E7EB',

  // Notification type colors
  donation:    '#15AABF',  // teal — donation received
  donationBg:  '#EEF9FC',
  approved:    '#16A34A',  // green — campaign approved
  approvedBg:  '#F0FDF4',
  cnic:        '#6B7280',  // gray — cnic verified
  cnicBg:      '#F9FAFB',

  // Unread left border accent
  unreadBar:   '#15AABF',

  // Mark all
  markAll:     '#15AABF',

  // Section header
  sectionLabel:'#9CA3AF',
};

// ═══════════════════════════════════════════════════════════
// Notification type config
// ═══════════════════════════════════════════════════════════
const TYPE_CONFIG = {
  donation: {
    icon:     'link-2',
    color:    C.donation,
    bg:       C.donationBg,
    barColor: C.donation,
  },
  approved: {
    icon:     'check',
    color:    C.approved,
    bg:       C.approvedBg,
    barColor: C.approved,
  },
  cnic: {
    icon:     'shield',
    color:    C.cnic,
    bg:       C.cnicBg,
    barColor: C.border,
  },
};

// ═══════════════════════════════════════════════════════════
// Static Data — grouped by section
// ═══════════════════════════════════════════════════════════
const INITIAL_DATA = [
  {
    title: 'TODAY',
    data: [
      {
        id: '1',
        type:    'donation',
        title:   'Donation Received 🎉',
        body:    'Ahmed donated PKR 5,000 to your campaign',
        time:    '2h ago',
        unread:  true,
      },
      {
        id: '2',
        type:    'approved',
        title:   'Campaign Approved ✅',
        body:    'Your campaign "Help Fatima\'s Heart Surgery" is now live and visible to donors.',
        time:    '5h ago',
        unread:  true,
      },
    ],
  },
  {
    title: 'YESTERDAY',
    data: [
      {
        id: '3',
        type:    'cnic',
        title:   'CNIC Verified',
        body:    'Your identity verification has been successfully completed. You can now withdraw funds.',
        time:    'Yesterday',
        unread:  false,
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════
// HEADER
// ═══════════════════════════════════════════════════════════
const Header = ({ onBack, onMarkAll }) => (
  <View style={s.header}>
    <TouchableOpacity
      onPress={onBack}
      style={s.headerBack}
      hitSlop={{ top:10, bottom:10, left:10, right:10 }}
    >
      <Icons name="arrow-left" size={scale(22)} color={C.textDark} />
    </TouchableOpacity>

    <Text style={s.headerTitle}>Notifications</Text>

    <TouchableOpacity onPress={onMarkAll} activeOpacity={0.75}>
      <Text style={s.markAll}>Mark All</Text>
    </TouchableOpacity>
  </View>
);

// ═══════════════════════════════════════════════════════════
// SECTION HEADER — "TODAY" / "YESTERDAY"
// ═══════════════════════════════════════════════════════════
const SectionHeader = ({ title }) => (
  <Text style={s.sectionTitle}>{title}</Text>
);

// ═══════════════════════════════════════════════════════════
// NOTIFICATION ICON
// ═══════════════════════════════════════════════════════════
const NotifIcon = ({ type }) => {
  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.cnic;
  return (
    <View style={[s.iconWrap, { backgroundColor: cfg.bg }]}>
      <Icons name={cfg.icon} size={scale(16)} color={cfg.color} />
    </View>
  );
};

// ═══════════════════════════════════════════════════════════
// NOTIFICATION CARD
// Figma: white card, left colored bar for unread,
//        icon left, title + body + time right
// ═══════════════════════════════════════════════════════════
const NotifCard = ({ item, onPress }) => {
  const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.cnic;

  return (
    <TouchableOpacity
      style={[
        s.card,
        item.unread && s.cardUnread,
      ]}
      onPress={() => onPress(item)}
      activeOpacity={0.75}
    >
      {/* Unread left accent bar */}
      {item.unread && (
        <View style={[s.unreadBar, { backgroundColor: cfg.barColor }]} />
      )}

      {/* Content row */}
      <View style={s.cardContent}>
        <NotifIcon type={item.type} />

        <View style={s.cardText}>
          <Text style={s.notifTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={s.notifBody} numberOfLines={3}>
            {item.body}
          </Text>
          <Text style={s.notifTime}>{item.time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ═══════════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════════
const EmptyState = () => (
  <View style={s.empty}>
    <View style={s.emptyIconWrap}>
      <Icons name="bell-off" size={scale(32)} color={C.textLight} />
    </View>
    <Text style={s.emptyTitle}>No Notifications</Text>
    <Text style={s.emptySub}>
      You're all caught up! Check back later.
    </Text>
  </View>
);

// ═══════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════
const NotificationsScreen = ({ navigation }) => {
  const [sections, setSections] = useState(INITIAL_DATA);

  // Mark all as read
  const handleMarkAll = useCallback(() => {
    setSections(prev =>
      prev.map(section => ({
        ...section,
        data: section.data.map(n => ({ ...n, unread: false })),
      })),
    );
  }, []);

  // Mark single as read on tap
  const handleNotifPress = useCallback(item => {
    setSections(prev =>
      prev.map(section => ({
        ...section,
        data: section.data.map(n =>
          n.id === item.id ? { ...n, unread: false } : n,
        ),
      })),
    );
  }, []);

  const allData = sections.flatMap(s => s.data);

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.pageBg} />

      <Header
        onBack={() => navigation.goBack()}
        onMarkAll={handleMarkAll}
      />

      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          s.listContent,
          allData.length === 0 && s.listContentEmpty,
        ]}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <SectionHeader title={section.title} />
        )}
        renderItem={({ item }) => (
          <NotifCard item={item} onPress={handleNotifPress} />
        )}
        ItemSeparatorComponent={() => (
          <View style={{ height: vscale(8) }} />
        )}
        SectionSeparatorComponent={() => (
          <View style={{ height: vscale(4) }} />
        )}
        ListEmptyComponent={<EmptyState />}
      />
    </SafeAreaView>
  );
};

// ═══════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════
const s = StyleSheet.create({

  safe: {
    flex: 1,
    backgroundColor: C.pageBg,
  },

  // ── Header ───────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: vscale(14),
    backgroundColor: C.pageBg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
  },
  headerBack: {
    width: scale(36),
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: scale(17),
    fontWeight: '700',
    color: C.textDark,
    letterSpacing: -0.2,
  },
  markAll: {
    fontSize: scale(14),
    fontWeight: '600',
    color: C.markAll,
  },

  // ── List ─────────────────────────────────────────────────
  listContent: {
    paddingHorizontal: scale(16),
    paddingTop: vscale(16),
    paddingBottom: vscale(32),
  },
  listContentEmpty: {
    flexGrow: 1,
  },

  // ── Section header ────────────────────────────────────────
  sectionTitle: {
    fontSize: scale(11),
    fontWeight: '700',
    color: C.sectionLabel,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: vscale(8),
    marginTop: vscale(4),
    includeFontPadding: false,
  },

  // ── Card ─────────────────────────────────────────────────
  card: {
    backgroundColor: C.white,
    borderRadius: scale(12),
    overflow: 'hidden',
    flexDirection: 'row',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width:0, height:1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardUnread: {
    // Slightly tinted background for unread
    backgroundColor: '#FAFCFF',
  },

  // Colored left accent bar — only on unread
  unreadBar: {
    width: scale(4),
    alignSelf: 'stretch',
    borderTopLeftRadius: scale(12),
    borderBottomLeftRadius: scale(12),
  },

  // Content row (icon + text)
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: scale(12),
    paddingVertical: vscale(14),
    gap: scale(12),
  },

  // ── Icon ─────────────────────────────────────────────────
  iconWrap: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: vscale(1),
  },

  // ── Text block ───────────────────────────────────────────
  cardText: {
    flex: 1,
  },
  notifTitle: {
    fontSize: scale(13),
    fontWeight: '700',
    color: C.textDark,
    marginBottom: vscale(3),
    includeFontPadding: false,
    lineHeight: scale(18),
  },
  notifBody: {
    fontSize: scale(12),
    fontWeight: '400',
    color: C.textGray,
    lineHeight: scale(17),
    marginBottom: vscale(6),
    includeFontPadding: false,
  },
  notifTime: {
    fontSize: scale(11),
    fontWeight: '500',
    color: C.textLight,
    includeFontPadding: false,
  },

  // ── Empty State ───────────────────────────────────────────
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: vscale(80),
    paddingHorizontal: scale(40),
  },
  emptyIconWrap: {
    width: scale(72),
    height: scale(72),
    borderRadius: scale(36),
    backgroundColor: '#EEF2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vscale(16),
  },
  emptyTitle: {
    fontSize: scale(16),
    fontWeight: '700',
    color: C.textDark,
    marginBottom: vscale(6),
    textAlign: 'center',
    includeFontPadding: false,
  },
  emptySub: {
    fontSize: scale(13),
    color: C.textGray,
    textAlign: 'center',
    lineHeight: scale(19),
    includeFontPadding: false,
  },
});

export default NotificationsScreen;