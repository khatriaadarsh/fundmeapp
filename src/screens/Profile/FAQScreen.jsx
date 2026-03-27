import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

const C = {
  bg: '#F4F6F8',
  white: '#FFFFFF',
  dark: '#111827',
  gray: '#6B7280',
  light: '#9CA3AF',
  border: '#E5E7EB',
  primary: '#00B4CC',
  primaryDark: '#0B5E6B',
  card: '#FFFFFF',
  accent: '#8B5CF6',
};

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'donations', label: 'Donations' },
  { key: 'campaigns', label: 'Campaigns' },
  { key: 'payments', label: 'Payments' },
];

const FAQ_ITEMS = [
  {
    id: 'a',
    category: 'donations',
    question: 'How do donations work?',
    answer:
      'When you donate, your funds are securely processed and held until the campaign owner verifies their withdrawal request with necessary proof (e.g. hospital bills). 100% of your donation reaches the campaign.',
  },
  {
    id: 'b',
    category: 'all',
    question: 'Is FundMe secure?',
    answer:
      'FundMe uses bank-grade encryption and identity-verified campaign owners to protect your data and donations. Your payment details are never shared with campaign owners.',
  },
  {
    id: 'c',
    category: 'payments',
    question: 'Are there any fees?',
    answer:
      'FundMe charges a small processing fee to cover payment gateway costs. Donors and campaign owners are clearly shown this fee before confirming a donation.',
  },
  {
    id: 'd',
    category: 'donations',
    question: 'How do I withdraw funds?',
    answer:
      'Campaign owners can request withdrawal after reaching their goal or at any time. Withdrawals are reviewed and approved only after proof documents are verified.',
  },
  {
    id: 'e',
    category: 'campaigns',
    question: 'What happens if a campaign fails?',
    answer:
      'If a campaign does not reach its goal, donors can request a refund depending on its campaign policy. Each campaign page shows the refund conditions upfront.',
  },
  {
    id: 'f',
    category: 'campaigns',
    question: 'How is fraud prevented?',
    answer:
      'We review all campaigns and require identity verification. Our fraud team monitors suspicious activity and can freeze funds until investigations complete.',
  },
];

const FAQScreen = ({ navigation }) => {
  const { width: SW } = useWindowDimensions();
  const sp = n => (SW / 375) * n;

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openId, setOpenId] = useState('a');

  const filteredFAQs = useMemo(() => {
    return FAQ_ITEMS.filter(item => {
      const matchesCategory =
        activeCategory === 'all' || item.category === activeCategory;
      const matchesSearch =
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchTerm]);

  const onToggle = useCallback(
    id => {
      setOpenId(prev => (prev === id ? null : id));
    },
    [setOpenId],
  );

  return (
    <SafeAreaView style={styles(C, sp).container}>
      <View style={styles(C, sp).headerBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles(C, sp).backBtn}
          activeOpacity={0.7}
        >
          <Icons name="arrow-left" size={sp(20)} color={C.dark} />
        </TouchableOpacity>
        <Text style={styles(C, sp).headerTitle}>FAQs</Text>
        <TouchableOpacity style={styles(C, sp).topIcon}>
          <Icons name="search" size={sp(20)} color={C.dark} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles(C, sp).content}
        contentContainerStyle={styles(C, sp).contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <TextInput
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholder="Search questions..."
          placeholderTextColor={C.light}
          style={styles(C, sp).searchBox}
          returnKeyType="search"
        />

        <ScrollView
          style={styles(C, sp).categoriesRow}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles(C, sp).categoriesContent}
        >
          {CATEGORIES.map(item => {
            const isActive = activeCategory === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles(C, sp).pill,
                  isActive && styles(C, sp).pillActive,
                ]}
                onPress={() => setActiveCategory(item.key)}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    styles(C, sp).pillText,
                    isActive && styles(C, sp).pillTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles(C, sp).faqList}>
          {filteredFAQs.length === 0 ? (
            <Text style={styles(C, sp).emptyText}>No questions found.</Text>
          ) : (
            filteredFAQs.map(item => {
              const expanded = openId === item.id;
              return (
                <View key={item.id} style={styles(C, sp).faqCard}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => onToggle(item.id)}
                    style={styles(C, sp).faqQuestionRow}
                  >
                    <Text style={styles(C, sp).faqQuestion}>
                      {item.question}
                    </Text>
                    <Icons
                      name={expanded ? 'chevron-up' : 'chevron-down'}
                      size={sp(20)}
                      color={C.gray}
                    />
                  </TouchableOpacity>
                  {expanded ? (
                    <Text style={styles(C, sp).faqAnswer}>{item.answer}</Text>
                  ) : null}
                </View>
              );
            })
          )}
        </View>

        <View style={styles(C, sp).supportCard}>
          <Text style={styles(C, sp).supportTitle}>Still need help?</Text>
          <Text style={styles(C, sp).supportSubtitle}>
            Contact our support team anytime
          </Text>
          <TouchableOpacity
            style={styles(C, sp).supportButtonWrapper}
            activeOpacity={0.85}
            onPress={() => {
              // add support action
            }}
          >
            <LinearGradient
              colors={[C.primary, C.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles(C, sp).supportButton}
            >
              <Text style={styles(C, sp).supportButtonText}>
                Contact Support
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = (colors, sp) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    headerBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: sp(16),
      paddingTop: sp(10),
      paddingBottom: sp(8),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: C.border,
      backgroundColor: C.white,
    },
    backBtn: {
      width: sp(36),
      height: sp(36),
      borderRadius: sp(12),
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: sp(8),
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
    },
    topIcon: {
      width: sp(36),
      height: sp(36),
      borderRadius: sp(12),
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 'auto',
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
    },
    headerTitle: {
      position: 'absolute',
      left: sp(44),
      right: sp(36),
      textAlign: 'center',
      fontSize: sp(20),
      fontWeight: 'bold',
      color: C.dark,
      zIndex: 1,
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      padding: sp(16),
      paddingBottom: sp(24),
    },
    searchBox: {
      height: sp(44),
      borderRadius: sp(12),
      backgroundColor: C.white,
      paddingHorizontal: sp(12),
      marginBottom: sp(14),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: C.border,
      color: C.dark,
      fontSize: sp(14),
    },
    categoriesRow: {
      marginBottom: sp(12),
      height: sp(44),
    },
    categoriesContent: {
      alignItems: 'center',
      paddingLeft: sp(0),
    },
    pill: {
      minWidth: sp(82),
      paddingVertical: sp(8),
      paddingHorizontal: sp(12),
      borderRadius: sp(30),
      backgroundColor: C.white,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: C.border,
      marginRight: sp(10),
      marginBottom: sp(8),
    },
    pillActive: {
      backgroundColor: C.primary,
      borderColor: C.primary,
    },
    pillText: {
      fontSize: sp(12),
      color: C.dark,
      fontWeight: '500',
      textAlign: 'center',
    },
    pillTextActive: {
      color: C.white,
    },
    faqList: {
      marginTop: sp(4),
    },
    faqCard: {
      borderRadius: sp(14),
      backgroundColor: C.white,
      marginBottom: sp(10),
      overflow: 'hidden',
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: C.border,
    },
    faqQuestionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: sp(14),
      paddingVertical: sp(14),
    },
    faqQuestion: {
      flex: 1,
      paddingRight: sp(10),
      fontSize: sp(15),
      color: C.dark,
      fontWeight: '600',
    },
    faqAnswer: {
      paddingHorizontal: sp(14),
      paddingBottom: sp(14),
      color: C.gray,
      fontSize: sp(14),
      lineHeight: sp(20),
    },
    emptyText: {
      color: C.gray,
      fontSize: sp(14),
      textAlign: 'center',
      paddingVertical: sp(20),
    },
    supportCard: {
      marginTop: sp(12),
      borderRadius: sp(16),
      backgroundColor: C.white,
      padding: sp(14),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: C.border,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 7,
      elevation: 2,
    },
    supportTitle: {
      fontSize: sp(17),
      fontWeight: '700',
      color: C.dark,
      marginBottom: sp(4),
    },
    supportSubtitle: {
      fontSize: sp(13),
      color: C.gray,
      marginBottom: sp(12),
    },
    supportButtonWrapper: {
      borderRadius: sp(12),
      overflow: 'hidden',
    },
    supportButton: {
      paddingVertical: sp(12),
      alignItems: 'center',
      justifyContent: 'center',
    },
    supportButtonText: {
      color: C.white,
      fontSize: sp(15),
      fontWeight: '700',
    },
  });

export default FAQScreen;
