// src/screens/saved/SavedScreen.jsx
import React, { useState, useCallback, useRef, useEffect, memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Dimensions,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons     from 'react-native-vector-icons/Feather';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useFocusEffect } from '@react-navigation/native';

import { useAppContext }                         from '../../context/AppContext';
import { useSavedCampaigns, useUnsaveCampaign }  from '../../hooks/useSavedCampaigns';
import { getUserId }                             from '../../utils/storage';
import SavedCampaignCard from '../../components/saved/SavedCampaignCard';

const { width: SW } = Dimensions.get('window');
const sp = n => (SW / 375) * n;

const P = {
  bg:        '#F4F5F7',
  white:     '#FFFFFF',
  dark:      '#111827',
  gray:      '#6B7280',
  light:     '#9CA3AF',
  border:    '#E5E7EB',
  red:       '#EF4444',
  green:     '#22C55E',
  darkOcean: '#0a3d62',
};

// ─────────────────────────────────────────────────────────────
const EmptyState = memo(() => (
  <View style={emSt.wrap}>
    <Icons name="heart" size={sp(52)} color={P.border} />
    <Text style={emSt.title}>Nothing saved yet</Text>
    <Text style={emSt.sub}>
      Tap the heart icon on any campaign to save it here.
    </Text>
  </View>
));

const emSt = StyleSheet.create({
  wrap:  { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: sp(80) },
  title: { fontSize: sp(16), fontWeight: '700', color: P.dark, marginTop: sp(16), marginBottom: sp(6) },
  sub:   { fontSize: sp(13), color: P.light, textAlign: 'center', paddingHorizontal: sp(40), lineHeight: sp(20) },
});

// ─────────────────────────────────────────────────────────────
const LoadingState = memo(() => (
  <View style={loadSt.wrap}>
    <ActivityIndicator size="large" color={P.darkOcean} />
    <Text style={loadSt.text}>Loading saved campaigns...</Text>
  </View>
));

const loadSt = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: sp(80) },
  text: { fontSize: sp(13), color: P.light, marginTop: sp(12) },
});

// ─────────────────────────────────────────────────────────────
const SavedScreen = ({ navigation }) => {
  const { currentUser } = useAppContext();
  console.log('🔍 [SavedScreen] currentUser:', JSON.stringify(currentUser));

  // ✅ THE FIX: AppContext stores the id as `userId` (not `id`).
  // saveUser() uses: user?.userId ?? user?.id
  // We mirror that exact fallback chain here.
  const resolveId = (user) => {
    if (!user) return null;
    const raw = user.userId ?? user.id ?? null;
    return raw ? Number(raw) : null;
  };

  const [userId, setUserId] = useState(() => resolveId(currentUser));

  const mountAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(sp(16))).current;

  useFocusEffect(
    useCallback(() => {
      // Try context first (instant, no async needed)
      const idFromContext = resolveId(currentUser);
      if (idFromContext) {
        console.log('🟢 [SavedScreen] userId from context:', idFromContext);
        setUserId(idFromContext);
        return;
      }

      // Fallback: AsyncStorage (cold-start / context not yet hydrated)
      getUserId().then((id) => {
        if (id) {
          console.log('🟢 [SavedScreen] userId from storage:', id);
          setUserId(id);
        }
      });
    }, [currentUser])
  );

  // ── Mount animation ───────────────────────────────────────
  useEffect(() => {
    Animated.parallel([
      Animated.timing(mountAnim, { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]).start();
  }, [mountAnim, slideAnim]);

  // ── Data ──────────────────────────────────────────────────
  const {
    data: saved = [],
    isLoading: isLoadingCampaigns,
    isError,
    refetch,
  } = useSavedCampaigns(userId);

  const { mutate: unsaveCampaign } = useUnsaveCampaign(userId);

  // ── Handlers ──────────────────────────────────────────────
  const handleUnsave = useCallback(
    (favouriteId) => {
      console.log('🔵 [SavedScreen] unsaving favouriteId:', favouriteId);
      unsaveCampaign(favouriteId);
    },
    [unsaveCampaign]
  );

  const handleCardPress = useCallback(
    (item) => {
      navigation?.navigate?.('CampaignDetailScreen', {
        campaignId: item.campaignId,
        campaign:   item.raw,
      });
    },
    [navigation]
  );

  // ── Render ────────────────────────────────────────────────
  const renderContent = () => {
    if (!userId) {
      return (
        <View style={emSt.wrap}>
          <Icons name="user-x" size={sp(52)} color={P.light} />
          <Text style={emSt.title}>Not Logged In</Text>
          <Text style={emSt.sub}>Please login to see saved campaigns</Text>
        </View>
      );
    }

    if (isLoadingCampaigns) {
      return <LoadingState />;
    }

    if (isError) {
      return (
        <View style={emSt.wrap}>
          <Icons name="alert-circle" size={sp(52)} color={P.red} />
          <Text style={emSt.title}>Failed to load</Text>
          <Text style={emSt.sub}>Please check your connection</Text>
          <TouchableOpacity style={retrySt.btn} onPress={() => refetch()}>
            <Text style={retrySt.txt}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <FlatList
        data={saved}
        keyExtractor={(item) => String(item.favouriteId)}
        renderItem={({ item }) => (
          <SavedCampaignCard
            item={item}
            onPress={handleCardPress}
            onUnsave={handleUnsave}
          />
        )}
        ListEmptyComponent={<EmptyState />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={scSt.listContent}
        style={scSt.list}
        bounces={false}
        overScrollMode="never"
      />
    );
  };

  return (
    <SafeAreaView style={scSt.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={P.white} />

      <View style={scSt.header}>
        <Text style={scSt.headerTitle}>Saved</Text>
        <View style={scSt.countBadge}>
          <AntDesign name="heart" size={sp(12)} color={P.red} />
          <Text style={scSt.countText}>{saved.length} saved</Text>
        </View>
      </View>

      <Animated.View
        style={[
          scSt.animatedWrapper,
          { opacity: mountAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {renderContent()}
      </Animated.View>
    </SafeAreaView>
  );
};

// ─────────────────────────────────────────────────────────────
const retrySt = StyleSheet.create({
  btn: {
    marginTop:         sp(16),
    backgroundColor:   P.darkOcean,
    paddingHorizontal: sp(24),
    paddingVertical:   sp(10),
    borderRadius:      sp(20),
  },
  txt: { color: P.white, fontSize: sp(13), fontWeight: '700' },
});

const scSt = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: P.bg },
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    backgroundColor:   P.white,
    paddingHorizontal: sp(16),
    paddingTop:        sp(10),
    paddingBottom:     sp(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: P.border,
  },
  headerTitle: {
    fontSize:      sp(22),
    fontWeight:    '800',
    color:         P.dark,
    letterSpacing: -0.4,
  },
  countBadge: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               sp(5),
    backgroundColor:   '#FEF2F2',
    paddingHorizontal: sp(12),
    paddingVertical:   sp(5),
    borderRadius:      sp(20),
  },
  countText:       { fontSize: sp(12), fontWeight: '700', color: P.red },
  animatedWrapper: { flex: 1 },
  list:            { flex: 1 },
  listContent:     { paddingTop: sp(8), paddingBottom: sp(16) },
});

export default SavedScreen;