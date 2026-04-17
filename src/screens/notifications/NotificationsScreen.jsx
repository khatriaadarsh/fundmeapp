// src/screens/notifications/NotificationsScreen.jsx
import React, { useState, useCallback, memo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar, SectionList, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/Feather';

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

// --- Mock Data ---
const INITIAL_DATA = [
  {
    title: 'TODAY',
    data: [
      { id: '1', type: 'donation', title: 'Donation Received 🎉', body: 'Ahmed donated PKR 5,000 to your campaign', time: '2h ago', unread: true },
      { id: '2', type: 'approved', title: 'Campaign Approved ✅', body: 'Your campaign "Help Fatima\'s Heart Surgery" is now live.', time: '5h ago', unread: true },
    ],
  },
  {
    title: 'YESTERDAY',
    data: [
      { id: '3', type: 'cnic', title: 'CNIC Verified', body: 'Your identity verification has been successfully completed.', time: 'Yesterday', unread: false },
    ],
  },
];

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

const EmptyState = memo(() => (
  <View style={styles.empty_wrap}>
    <View style={styles.empty_iconWrap}><Icons name="bell-off" size={sp(32)} color={C.textLight} /></View>
    <Text style={styles.empty_title}>No Notifications</Text>
    <Text style={styles.empty_sub}>You're all caught up! Check back later.</Text>
  </View>
));

// --- Main Screen ---
const NotificationsScreen = ({ navigation }) => {
  const [sections, setSections] = useState(INITIAL_DATA);

  const handleMarkAll = useCallback(() => {
    setSections(prev => prev.map(section => ({ ...section, data: section.data.map(n => ({ ...n, unread: false })) })));
  }, []);

  const handleNotifPress = useCallback(item => {
    setSections(prev => prev.map(section => ({ ...section, data: section.data.map(n => n.id === item.id ? { ...n, unread: false } : n) })));
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.pageBg} />
      <Header onBack={() => navigation.goBack()} onMarkAll={handleMarkAll} />
      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.list_content, sections.flatMap(s => s.data).length === 0 && styles.list_contentEmpty]}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => <Text style={styles.section_title}>{section.title}</Text>}
        renderItem={({ item }) => <NotifCard item={item} onPress={handleNotifPress} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<EmptyState />}
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
  
  empty_wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: vsp(80), paddingHorizontal: sp(40) },
  empty_iconWrap: { width: sp(72), height: sp(72), borderRadius: sp(36), backgroundColor: '#EEF2F7', alignItems: 'center', justifyContent: 'center', marginBottom: vsp(16) },
  empty_title: { fontSize: sp(16), fontWeight: '700', color: C.textDark, marginBottom: vsp(6), textAlign: 'center' },
  empty_sub: { fontSize: sp(13), color: C.textGray, textAlign: 'center', lineHeight: sp(19) },
});