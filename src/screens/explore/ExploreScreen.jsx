// src/screens/explore/ExploreScreen.jsx
// ─────────────────────────────────────────────────────────────
//  Explore / Search Screen  |  FundMe App (React Native CLI)
//
//  Fixes applied:
//  • Removed auto-focus on mount — keyboard no longer pops up
//    on navigation arrival. Input focuses only on user tap.
//  • Added Animated.View fade-in + slide-up on mount for smooth
//    navigation transition (no jarring instant render).
//
//  Layout:
//  ┌─ SafeAreaView ──────────────────────────────────────────┐
//  │  [SearchBar row — input + Cancel]           (fixed)    │
//  │  [Category filter chips]                    (fixed)    │
//  │  [Results count]                            (fixed)    │
//  │  ┌─ FlatList ─────────────────────────────────────── ┐ │
//  │  │  CampaignCard × N                               │ │
//  │  └─────────────────────────────────────────────────── ┘ │
//  │  [BottomTabBar]                             (fixed)    │
//  └─────────────────────────────────────────────────────────┘
//
//  Integration notes:
//  • Replace MOCK_CAMPAIGNS with API response
//  • onSearch(query, category) → call search API
//  • CampaignCard.onPress → navigation.navigate('CampaignDetail', {id})
// ─────────────────────────────────────────────────────────────

import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  memo,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Platform,
  Dimensions,
  Image,
  SafeAreaView,
  Animated,        // ← added for mount transition
} from 'react-native';
import Icons from 'react-native-vector-icons/Feather';
import BottomTabBar from '../../components/BottomTabBar';

// ── Responsive scale (base 375 pt) ─────────────────────────
const { width: SW } = Dimensions.get('window');
const sp = n => (SW / 375) * n;

const STATUSBAR_H =
  Platform.OS === 'android' ? (StatusBar.currentHeight ?? 24) : 0;

// ── Palette ─────────────────────────────────────────────────
const P = {
  bg:        '#F4F5F7',
  white:     '#FFFFFF',
  teal:      '#00B4CC',
  tealDark:  '#0097AA',
  dark:      '#111827',
  gray:      '#6B7280',
  light:     '#9CA3AF',
  border:    '#E5E7EB',
  red:       '#e74c3c',
  green:     '#22C55E',
  darkOcean: '#0a3d62',
};

// ── Filter categories ────────────────────────────────────────
const CATEGORIES = [
  { id: 'all',       label: 'All'       },
  { id: 'medical',   label: 'Medical'   },
  { id: 'education', label: 'Education' },
  { id: 'emergency', label: 'Emergency' },
  { id: 'food',      label: 'Food'      },
  { id: 'shelter',   label: 'Shelter'   },
];

// ── Mock data — replace with API response ───────────────────
const MOCK_CAMPAIGNS = [
  {
    id: '1',
    title:    'Urgent Heart Surgery for Little Sara',
    imageUri: 'https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=200',
    raised:   'PKR 325K',
    goal:     '500K',
    pct:      65,
    user:     'Ali Hassan',
    verified: true,
    category: 'medical',
  },
  {
    id: '2',
    title:    'Emergency Bypass for Father of 3',
    imageUri: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=200',
    raised:   'PKR 210K',
    goal:     '500K',
    pct:      42,
    user:     'Bilal A.',
    verified: true,
    category: 'medical',
  },
  {
    id: '3',
    title:    'Support Open Heart Surgery Fund',
    imageUri: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=200',
    raised:   'PKR 890K',
    goal:     '1M',
    pct:      89,
    user:     'Hope NGO',
    verified: true,
    category: 'medical',
  },
  {
    id: '4',
    title:    "Save Baby Ahmed's Heart",
    imageUri: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=200',
    raised:   'PKR 45K',
    goal:     '300K',
    pct:      15,
    user:     'Zainab K.',
    verified: true,
    category: 'medical',
  },
  {
    id: '5',
    title:    'Rural Clinic Heart Monitor Drive',
    imageUri: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=200',
    raised:   'PKR 110K',
    goal:     '200K',
    pct:      55,
    user:     'MediCare',
    verified: true,
    category: 'medical',
  },
  {
    id: '6',
    title:    'Scholarships for Underprivileged Girls',
    imageUri: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=200',
    raised:   'PKR 180K',
    goal:     '400K',
    pct:      45,
    user:     'EduTrust',
    verified: true,
    category: 'education',
  },
  {
    id: '7',
    title:    'Flood Relief for Balochistan Families',
    imageUri: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=200',
    raised:   'PKR 550K',
    goal:     '1M',
    pct:      55,
    user:     'Relief PK',
    verified: true,
    category: 'emergency',
  },
  {
    id: '8',
    title:    'Winter Food Drive for Orphanage',
    imageUri: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=200',
    raised:   'PKR 90K',
    goal:     '150K',
    pct:      60,
    user:     'CareNow',
    verified: false,
    category: 'food',
  },
];

// ════════════════════════════════════════════════════════════
//  ProgressBar — reusable
// ════════════════════════════════════════════════════════════
const ProgressBar = memo(({ pct }) => (
  <View style={pbSt.bg}>
    <View style={[pbSt.fill, { width: `${Math.min(pct, 100)}%` }]} />
  </View>
));

const pbSt = StyleSheet.create({
  bg:   { height: sp(4), backgroundColor: P.border, borderRadius: sp(2), overflow: 'hidden' },
  fill: { height: sp(4), backgroundColor: P.green,  borderRadius: sp(2) },
});

// ════════════════════════════════════════════════════════════
//  CampaignCard
// ════════════════════════════════════════════════════════════
const CampaignCard = memo(({ item, onPress }) => (
  <TouchableOpacity style={ccSt.card} onPress={() => onPress?.(item)} activeOpacity={0.85}>
    {/* Thumbnail */}
    <View style={ccSt.imgWrap}>
      <Image
        source={{ uri: item.imageUri }}
        style={ccSt.img}
        resizeMode="cover"
        // defaultSource={require('../../assets/placeholder.png')}
      />
    </View>

    {/* Info */}
    <View style={ccSt.info}>
      <Text style={ccSt.title} numberOfLines={2}>{item.title}</Text>

      <ProgressBar pct={item.pct} />

      <View style={ccSt.meta}>
        {/* Raised / Goal */}
        <Text style={ccSt.raised}>{item.raised}</Text>
        <Text style={ccSt.sep}> / </Text>
        <Text style={ccSt.goal}>{item.goal}</Text>

        <View style={{ flex: 1 }} />

        {/* User + verified */}
        <Text style={ccSt.user} numberOfLines={1}>{item.user}</Text>
        {item.verified && (
          <View style={ccSt.verifiedDot}>
            <Icons name="check" size={sp(7)} color={P.white} />
          </View>
        )}
      </View>
    </View>
  </TouchableOpacity>
));

const ccSt = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: P.white,
    borderRadius: sp(12),
    marginHorizontal: sp(14),
    marginBottom: sp(10),
    padding: sp(10),
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  imgWrap: {
    width: sp(80),
    height: sp(80),
    borderRadius: sp(10),
    overflow: 'hidden',
    backgroundColor: P.border,
    marginRight: sp(12),
  },
  img: { width: '100%', height: '100%' },
  info: { flex: 1, justifyContent: 'space-between' },
  title: {
    fontSize: sp(13),
    fontWeight: '700',
    color: P.dark,
    lineHeight: sp(18),
    marginBottom: sp(8),
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: sp(6),
  },
  raised: { fontSize: sp(12), fontWeight: '700', color: P.green },
  sep:    { fontSize: sp(12), color: P.light },
  goal:   { fontSize: sp(12), color: P.light },
  user:   { fontSize: sp(11), color: P.gray, maxWidth: sp(70) },
  verifiedDot: {
    width: sp(14),
    height: sp(14),
    borderRadius: sp(7),
    backgroundColor: P.red,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: sp(3),
  },
});

// ════════════════════════════════════════════════════════════
//  CategoryChips — horizontal filter row
// ════════════════════════════════════════════════════════════
const CategoryChips = memo(({ active, onChange }) => {
  const listRef = useRef(null);
  return (
    <FlatList
      ref={listRef}
      data={CATEGORIES}
      horizontal
      keyExtractor={item => item.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={chipSt.list}
      renderItem={({ item }) => {
        const isActive = active === item.id;
        return (
          <TouchableOpacity
            style={[chipSt.chip, isActive && chipSt.chipActive]}
            onPress={() => onChange(item.id)}
            activeOpacity={0.75}
          >
            <Text style={[chipSt.label, isActive && chipSt.labelActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );
});

const chipSt = StyleSheet.create({
  list: {
    paddingHorizontal: sp(14),
    paddingVertical: sp(10),
    gap: sp(8),
  },
  chip: {
    paddingHorizontal: sp(16),
    paddingVertical: sp(7),
    borderRadius: sp(20),
    borderWidth: 1.5,
    borderColor: P.border,
    backgroundColor: P.white,
  },
  chipActive: {
    backgroundColor: P.darkOcean,
    borderColor: P.darkOcean,
  },
  label:       { fontSize: sp(13), fontWeight: '600', color: P.gray },
  labelActive: { color: P.white },
});

// ════════════════════════════════════════════════════════════
//  EmptyState
// ════════════════════════════════════════════════════════════
const EmptyState = memo(({ query }) => (
  <View style={emSt.wrap}>
    <Icons name="search" size={sp(48)} color={P.border} />
    <Text style={emSt.title}>No results found</Text>
    <Text style={emSt.sub}>
      {query
        ? `We couldn't find anything for "${query}"`
        : 'Start typing to search campaigns'}
    </Text>
  </View>
));

const emSt = StyleSheet.create({
  wrap:  { alignItems: 'center', justifyContent: 'center', paddingTop: sp(60) },
  title: { fontSize: sp(16), fontWeight: '700', color: P.dark, marginTop: sp(16), marginBottom: sp(6) },
  sub:   { fontSize: sp(13), color: P.light, textAlign: 'center', paddingHorizontal: sp(40) },
});

// ════════════════════════════════════════════════════════════
//  ExploreScreen — main
// ════════════════════════════════════════════════════════════
const ExploreScreen = ({ navigation }) => {
  const [query,      setQuery    ] = useState('');
  const [activecat,  setActiveCat] = useState('all');
  const [results,    setResults  ] = useState(MOCK_CAMPAIGNS);
  const [activeTab,  setActiveTab] = useState('explore');
  const [isFocused,  setIsFocused] = useState(false);

  const inputRef = useRef(null);

  // ── Smooth mount transition (fade-in + subtle slide-up) ──
  // Runs once on mount; does NOT touch the TextInput at all.
  const mountAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(sp(16))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(mountAnim, {
        toValue: 1,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
    // ⚠️  NO auto-focus here — keyboard must NOT open automatically.
    //     User taps the input → onFocus fires → keyboard appears naturally.
  }, [mountAnim, slideAnim]);

  // ── Filter logic — replace body with API call ──────────
  const runSearch = useCallback((text, cat) => {
    const q   = text.trim().toLowerCase();
    let   res = MOCK_CAMPAIGNS;
    if (cat !== 'all') res = res.filter(c => c.category === cat);
    if (q) res = res.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.user.toLowerCase().includes(q),
    );
    setResults(res);
  }, []);

  const handleQueryChange = useCallback(text => {
    setQuery(text);
    runSearch(text, activecat);
  }, [activecat, runSearch]);

  const handleCatChange = useCallback(cat => {
    setActiveCat(cat);
    runSearch(query, cat);
  }, [query, runSearch]);

  // Cancel — clears input & dismisses keyboard, does NOT go back
  const handleCancel = useCallback(() => {
    setQuery('');
    setActiveCat('all');
    setResults(MOCK_CAMPAIGNS);
    setIsFocused(false);
    inputRef.current?.blur();
  }, []);

  const handleCardPress = useCallback(item => {
    navigation?.navigate?.('CampaignDetail', { id: item.id });
  }, [navigation]);

  // ── Tab routing ────────────────────────────────────────
  const handleTabPress = useCallback(id => {
    setActiveTab(id);
    const routes = {
      home:    'HomeScreen',
      explore: 'ExploreScreen',
      saved:   'SavedScreen',
      me:      'ProfileScreen',
    };
    if (id !== 'explore' && routes[id]) {
      navigation?.navigate?.(routes[id]);
    }
  }, [navigation]);

  // ── List header ────────────────────────────────────────
  const ListHeader = useCallback(() => (
    <View>
      <CategoryChips active={activecat} onChange={handleCatChange} />
      <Text style={scSt.resultCount}>
        {results.length} result{results.length !== 1 ? 's' : ''} found
      </Text>
    </View>
  ), [activecat, handleCatChange, results.length]);

  return (
    <SafeAreaView style={scSt.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={P.white} />

      {/* ══ ANIMATED WRAPPER — screen fades + slides up on mount ═ */}
      <Animated.View
        style={[
          scSt.animatedWrapper,
          {
            opacity: mountAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* ══ FIXED SEARCH BAR ROW ═══════════════════════════ */}
        <View style={scSt.searchRow}>
          {/* Input — border turns red when focused */}
          <View style={[scSt.inputWrap, isFocused && scSt.inputWrapFocused]}>
            <Icons
              name="search"
              size={sp(16)}
              color={isFocused ? P.red : P.light}
              style={scSt.searchIcon}
            />
            <TextInput
              ref={inputRef}
              style={scSt.input}
              placeholder="Search campaigns..."
              placeholderTextColor={P.light}
              value={query}
              onChangeText={handleQueryChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
              clearButtonMode="never"
              onSubmitEditing={() => runSearch(query, activecat)}
            />
            {/* ✕ clear — only when text exists */}
            {query.length > 0 && (
              <TouchableOpacity
                onPress={() => handleQueryChange('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={scSt.clearBtn}
              >
                <Icons name="x-circle" size={sp(16)} color={P.light} />
              </TouchableOpacity>
            )}
          </View>

          {/* Cancel — only visible when input is focused OR has text */}
          {(isFocused || query.length > 0) && (
            <TouchableOpacity
              onPress={handleCancel}
              activeOpacity={0.7}
              style={scSt.cancelBtn}
            >
              <Text style={scSt.cancelTxt}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ══ RESULTS LIST (includes category chips as header) ═ */}
        <FlatList
          data={results}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <CampaignCard item={item} onPress={handleCardPress} />
          )}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={<EmptyState query={query} />}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={scSt.listContent}
          style={scSt.list}
          bounces={false}
          overScrollMode="never"
        />

        {/* ══ BOTTOM TAB BAR ══════════════════════════════════ */}
        <BottomTabBar
          active={activeTab}
          navigation={navigation}
          onPress={handleTabPress}
        />
      </Animated.View>
    </SafeAreaView>
  );
};

export default ExploreScreen;

// ════════════════════════════════════════════════════════════
//  Screen styles
// ════════════════════════════════════════════════════════════
const scSt = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: P.bg,
  },

  // Animated wrapper covers the full safe area
  animatedWrapper: {
    flex: 1,
  },

  // Search bar row
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: P.white,
    paddingHorizontal: sp(14),
    paddingTop: sp(10) + STATUSBAR_H,
    paddingBottom: sp(10),
    gap: sp(10),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: P.border,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: P.white,
    borderRadius: sp(10),
    borderWidth: 1.5,
    borderColor: P.border,     // grey by default
    paddingHorizontal: sp(10),
    height: sp(42),
  },
  inputWrapFocused: {
    borderColor: P.red,        // red when focused
  },
  searchIcon: { marginRight: sp(7) },
  input: {
    flex: 1,
    fontSize: sp(14),
    color: P.dark,
    paddingVertical: 0,
  },
  clearBtn: { padding: sp(2) },
  cancelBtn: { paddingVertical: sp(6) },
  cancelTxt: {
    fontSize: sp(14),
    fontWeight: '600',
    color: P.red,
  },

  // Result count
  resultCount: {
    fontSize: sp(12),
    color: P.gray,
    fontWeight: '500',
    paddingHorizontal: sp(16),
    paddingBottom: sp(8),
  },

  // FlatList
  list:        { flex: 1 },
  listContent: { paddingBottom: sp(16) },
});