// src/screens/profile/MyWithdrawalsScreen.jsx

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';

import { P, sp } from '../../theme/theme';

const { width } = Dimensions.get('window');

const withdrawalsData = [
  {
    id: '1',
    title: 'School supplies for children in underserved areas',
    amount: '150,000',
    status: 'pending',
    date: 'Requested: Oct 28, 2025',
    note: 'Under Review by Admin',
  },
  {
    id: '2',
    title: 'Flood relief for displaced families',
    amount: '320,000',
    status: 'approved',
    date: 'Processed: Oct 14, 2025',
    trx: 'Ref: TXN-98234-A',
  },
  {
    id: '3',
    title: 'Emergency medical fund for heart surgery',
    amount: '25,000',
    status: 'rejected',
    date: 'Requested: Nov 02, 2025',
    reason:
      'Incomplete hospital bill provided. Please upload the full document.',
  },
];

const TABS = ['all', 'pending', 'approved'];

const STATUS = {
  pending: {
    label: 'Pending',
    color: '#F59E0B',
    bg: '#FEF3C7',
    border: '#FBBF24',
  },
  approved: {
    label: 'Approved',
    color: '#10B981',
    bg: '#D1FAE5',
    border: '#34D399',
  },
  rejected: {
    label: 'Rejected',
    color: '#EF4444',
    bg: '#FEE2E2',
    border: '#F87171',
  },
};

const StatCard = ({ label, value }) => (
  <View style={styles.statCard}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const WithdrawalCard = ({ item }) => {
  const status = STATUS[item.status];

  return (
    <View
      style={[
        styles.card,
        {
          borderLeftColor: status.border,
        },
      ]}
    >
      <View style={styles.cardTop}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: status.bg,
            },
          ]}
        >
          <Text
            style={[
              styles.statusText,
              {
                color: status.color,
              },
            ]}
          >
            {status.label.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text style={styles.amount}>PKR {item.amount}</Text>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <Icon name="calendar" size={sp(13)} color="#94A3B8" />
        <Text style={styles.infoText}>{item.date}</Text>
      </View>

      {!!item.note && (
        <View style={styles.noteRow}>
          <View
            style={[
              styles.dot,
              {
                backgroundColor: status.color,
              },
            ]}
          />
          <Text
            style={[
              styles.noteText,
              {
                color: status.color,
              },
            ]}
          >
            {item.note}
          </Text>
        </View>
      )}

      {!!item.trx && (
        <View style={styles.copyBox}>
          <Icon name="copy" size={sp(12)} color={P.teal} />
          <Text style={styles.copyText}>Copy ID</Text>
        </View>
      )}

      {!!item.reason && (
        <View style={styles.reasonBox}>
          <Icon name="alert-circle" size={sp(14)} color="#EF4444" />
          <Text style={styles.reasonText}>{item.reason}</Text>
        </View>
      )}
    </View>
  );
};

const MyWithdrawalsScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('all');

  const filteredData = useMemo(() => {
    if (activeTab === 'all') return withdrawalsData;

    return withdrawalsData.filter(item => item.status === activeTab);
  }, [activeTab]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0891B2" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-left" size={sp(20)} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Withdrawal History</Text>

        <TouchableOpacity style={styles.headerBtn}>
          <Icon name="filter" size={sp(18)} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* TOP SUMMARY */}
      <View style={styles.topCard}>
        <Text style={styles.topLabel}>TOTAL WITHDRAWN</Text>

        <Text style={styles.totalAmount}>PKR 4,500,000</Text>

        <View style={styles.statsRow}>
          <StatCard label="Approved" value="4.18M" />
          <StatCard label="Pending" value="150K" />
          <StatCard label="Rejected" value="25K" />
        </View>
      </View>

      {/* CONTENT */}
      <View style={styles.content}>
        {/* TABS */}
        <View style={styles.tabsRow}>
          {TABS.map(tab => {
            const active = activeTab === tab;

            return (
              <TouchableOpacity
                key={tab}
                activeOpacity={0.8}
                onPress={() => setActiveTab(tab)}
                style={[styles.tabBtn, active && styles.tabBtnActive]}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {tab === 'all'
                    ? 'All Withdrawals'
                    : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* LIST */}
        <FlatList
          data={filteredData}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <WithdrawalCard item={item} />}
        />
      </View>
    </SafeAreaView>
  );
};

export default MyWithdrawalsScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0891B2',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: sp(16),
    paddingTop: Platform.OS === 'ios' ? sp(6) : sp(10),
    paddingBottom: sp(12),
  },

  headerBtn: {
    width: sp(38),
    height: sp(38),
    borderRadius: sp(19),
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: sp(18),
    fontWeight: '700',
    color: '#FFFFFF',
  },

  topCard: {
    paddingHorizontal: sp(20),
    paddingBottom: sp(24),
  },

  topLabel: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.75)',
    fontSize: sp(11),
    fontWeight: '600',
    marginBottom: sp(10),
    letterSpacing: 1,
  },

  totalAmount: {
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: width < 360 ? sp(28) : sp(34),
    fontWeight: '800',
    marginBottom: sp(22),
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: sp(10),
  },

  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: sp(14),
    paddingVertical: sp(14),
    paddingHorizontal: sp(10),
  },

  statLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: sp(11),
    fontWeight: '600',
    marginBottom: sp(6),
  },

  statValue: {
    color: '#FFFFFF',
    fontSize: sp(18),
    fontWeight: '700',
  },

  content: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderTopLeftRadius: sp(26),
    borderTopRightRadius: sp(26),
    paddingTop: sp(18),
  },

  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: sp(16),
    marginBottom: sp(18),
    gap: sp(10),
  },

  tabBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: sp(16),
    height: sp(38),
    borderRadius: sp(19),
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabBtnActive: {
    backgroundColor: '#0891B2',
  },

  tabText: {
    fontSize: sp(12),
    fontWeight: '600',
    color: '#64748B',
  },

  tabTextActive: {
    color: '#FFFFFF',
  },

  listContent: {
    paddingHorizontal: sp(16),
    paddingBottom: sp(30),
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: sp(18),
    padding: sp(16),
    marginBottom: sp(16),
    borderLeftWidth: sp(4),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: sp(10),
  },

  cardTitle: {
    flex: 1,
    fontSize: sp(14),
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: sp(20),
  },

  statusBadge: {
    paddingHorizontal: sp(10),
    paddingVertical: sp(6),
    borderRadius: sp(20),
    alignSelf: 'flex-start',
  },

  statusText: {
    fontSize: sp(10),
    fontWeight: '700',
  },

  amount: {
    fontSize: sp(28),
    fontWeight: '800',
    color: '#111827',
    marginTop: sp(14),
    marginBottom: sp(14),
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: sp(14),
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: sp(10),
  },

  infoText: {
    marginLeft: sp(8),
    fontSize: sp(12),
    color: '#64748B',
    fontWeight: '500',
  },

  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dot: {
    width: sp(7),
    height: sp(7),
    borderRadius: sp(4),
    marginRight: sp(8),
  },

  noteText: {
    fontSize: sp(12),
    fontWeight: '600',
  },

  copyBox: {
    marginTop: sp(14),
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFEFF',
    paddingHorizontal: sp(12),
    paddingVertical: sp(8),
    borderRadius: sp(10),
  },

  copyText: {
    marginLeft: sp(6),
    color: '#0891B2',
    fontSize: sp(11),
    fontWeight: '700',
  },

  reasonBox: {
    marginTop: sp(14),
    backgroundColor: '#FEF2F2',
    borderRadius: sp(12),
    padding: sp(12),
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  reasonText: {
    flex: 1,
    marginLeft: sp(8),
    color: '#DC2626',
    fontSize: sp(12),
    lineHeight: sp(18),
    fontWeight: '500',
  },
});
