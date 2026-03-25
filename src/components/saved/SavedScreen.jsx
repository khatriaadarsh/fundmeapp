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
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icons from 'react-native-vector-icons/Feather';

const { width: SW } = Dimensions.get('window');
const sp = n => (SW / 375) * n;

const P = {
  bg: '#F4F5F7',
  white: '#FFFFFF',
  dark: '#111827',
  gray: '#6B7280',
  light: '#9CA3AF',
  border: '#E5E7EB',
  red: '#e74c3c',
  green: '#22C55E',
  darkOcean: '#0a3d62',
  categoryColors: {
    medical: { bg: '#EFF6FF', text: '#3B82F6' },
    education: { bg: '#F0FDF4', text: '#16A34A' },
    emergency: { bg: '#FFF7ED', text: '#EA580C' },
    food: { bg: '#FEF9C3', text: '#CA8A04' },
    shelter: { bg: '#F5F3FF', text: '#7C3AED' },
    default: { bg: '#F3F4F6', text: '#6B7280' },
  },
};

const MOCK_SAVED = [
  {
    id: '1',
    title: "Help Fatima's Heart Surgery",
    imageUri:
      'https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=600',
    raised: 'PKR 325,000',
    goal: '500,000',
    pct: 65,
    user: 'Ali Hassan',
    verified: true,
    category: 'medical',
  },
  {
    id: '6',
    title: 'Build a Primary School in Rural Sindh',
    imageUri:
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600',
    raised: 'PKR 800,000',
    goal: '2,000,000',
    pct: 40,
    user: 'Sarah Ahmed',
    verified: true,
    category: 'education',
  },
  {
    id: '7',
    title: 'Flood Relief for Balochistan Families',
    imageUri: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600',
    raised: 'PKR 1,250,000',
    goal: '1,500,000',
    pct: 83,
    user: 'Community Hope',
    verified: true,
    category: 'emergency',
  },
  {
    id: '3',
    title: 'Support Open Heart Surgery Fund',
    imageUri: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=600',
    raised: 'PKR 890K',
    goal: '1M',
    pct: 89,
    user: 'Hope NGO',
    verified: true,
    category: 'medical',
  },
  {
    id: '8',
    title: 'Winter Food Drive for Orphanage',
    imageUri:
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600',
    raised: 'PKR 90K',
    goal: '150K',
    pct: 60,
    user: 'CareNow',
    verified: false,
    category: 'food',
  },
];

const ProgressBar = memo(({ pct }) => (
  <View style={pbSt.bg}>
    <View style={[pbSt.fill, { width: `${Math.min(pct, 100)}%` }]} />
  </View>
));

const pbSt = StyleSheet.create({
  bg: {
    height: sp(4),
    backgroundColor: P.border,
    borderRadius: sp(2),
    overflow: 'hidden',
  },
  fill: {
    height: sp(4),
    backgroundColor: P.green,
    borderRadius: sp(2),
  },
});

const CategoryBadge = memo(({ category }) => {
  const colour = P.categoryColors[category] ?? P.categoryColors.default;
  const label = category
    ? category.charAt(0).toUpperCase() + category.slice(1)
    : 'General';
  return (
    <View style={[badgeSt.pill, { backgroundColor: colour.bg }]}>
      <Text style={[badgeSt.text, { color: colour.text }]}>{label}</Text>
    </View>
  );
});

const badgeSt = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: sp(10),
    paddingVertical: sp(4),
    borderRadius: sp(20),
    marginBottom: sp(8),
  },
  text: { fontSize: sp(11), fontWeight: '700' },
});

const SavedCampaignCard = memo(({ item, onPress, onUnsave }) => (
  <TouchableOpacity
    style={cardSt.card}
    onPress={() => onPress?.(item)}
    activeOpacity={0.88}
  >
    <View style={cardSt.imgWrap}>
      <Image
        source={{ uri: item.imageUri }}
        style={cardSt.img}
        resizeMode="cover"
      />
      <TouchableOpacity
        style={cardSt.heartBtn}
        onPress={() => onUnsave?.(item.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        activeOpacity={0.7}
      >
        <Icons name="heart" size={sp(18)} color={P.red} />
      </TouchableOpacity>
    </View>

    <View style={cardSt.body}>
      <CategoryBadge category={item.category} />
      <Text style={cardSt.title} numberOfLines={2}>
        {item.title}
      </Text>
      <ProgressBar pct={item.pct} />
      <View style={cardSt.metaRow}>
        <Text style={cardSt.raised}>PKR {item.raised.replace('PKR ', '')}</Text>
        <Text style={cardSt.sep}> / </Text>
        <Text style={cardSt.goal}>{item.goal}</Text>
        <View style={styles.fill} />
        <View style={cardSt.userRow}>
          <View style={cardSt.avatar}>
            <Icons name="user" size={sp(10)} color={P.white} />
          </View>
          <Text style={cardSt.userName} numberOfLines={1}>
            {item.user}
          </Text>
          {item.verified && (
            <View style={cardSt.verifiedDot}>
              <Icons name="check" size={sp(7)} color={P.white} />
            </View>
          )}
        </View>
      </View>
    </View>
  </TouchableOpacity>
));

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});

const cardSt = StyleSheet.create({
  card: {
    backgroundColor: P.white,
    borderRadius: sp(14),
    marginHorizontal: sp(14),
    marginBottom: sp(14),
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  imgWrap: {
    width: '100%',
    height: sp(170),
    backgroundColor: P.border,
  },
  img: { width: '100%', height: '100%' },
  heartBtn: {
    position: 'absolute',
    top: sp(10),
    right: sp(10),
    width: sp(34),
    height: sp(34),
    borderRadius: sp(17),
    backgroundColor: P.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  body: {
    padding: sp(14),
  },
  title: {
    fontSize: sp(15),
    fontWeight: '700',
    color: P.dark,
    lineHeight: sp(21),
    marginBottom: sp(10),
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: sp(8),
  },
  raised: { fontSize: sp(13), fontWeight: '700', color: P.green },
  sep: { fontSize: sp(13), color: P.light },
  goal: { fontSize: sp(13), color: P.light },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp(4),
  },
  avatar: {
    width: sp(18),
    height: sp(18),
    borderRadius: sp(9),
    backgroundColor: P.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: { fontSize: sp(11), color: P.gray, maxWidth: sp(80) },
  verifiedDot: {
    width: sp(14),
    height: sp(14),
    borderRadius: sp(7),
    backgroundColor: P.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

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
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: sp(80),
  },
  title: {
    fontSize: sp(16),
    fontWeight: '700',
    color: P.dark,
    marginTop: sp(16),
    marginBottom: sp(6),
  },
  sub: {
    fontSize: sp(13),
    color: P.light,
    textAlign: 'center',
    paddingHorizontal: sp(40),
    lineHeight: sp(20),
  },
});

const SavedScreen = ({ navigation }) => {
  const [saved, setSaved] = useState(MOCK_SAVED);

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
  }, [mountAnim, slideAnim]);

  const handleUnsave = useCallback(id => {
    setSaved(prev => prev.filter(c => c.id !== id));
  }, []);

  const handleCardPress = useCallback(
    item => {
      navigation?.navigate?.('CampaignDetail', { id: item.id });
    },
    [navigation],
  );

  return (
    <SafeAreaView style={scSt.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={P.white} />

      <View style={scSt.header}>
        <Text style={scSt.headerTitle}>Saved</Text>
        <View style={scSt.countBadge}>
          <Icons name="heart" size={sp(12)} color={P.red} />
          <Text style={scSt.countText}>{saved.length} saved</Text>
        </View>
      </View>

      <Animated.View
        style={[
          scSt.animatedWrapper,
          {
            opacity: mountAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <FlatList
          data={saved}
          keyExtractor={item => item.id}
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
      </Animated.View>
    </SafeAreaView>
  );
};

export default SavedScreen;

const scSt = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: P.bg,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: P.white,
    paddingHorizontal: sp(16),
    paddingTop: sp(10),
    paddingBottom: sp(12),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: P.border,
  },
  headerTitle: {
    fontSize: sp(22),
    fontWeight: '800',
    color: P.dark,
    letterSpacing: -0.4,
  },
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: sp(5),
    backgroundColor: '#FEF2F2',
    paddingHorizontal: sp(12),
    paddingVertical: sp(5),
    borderRadius: sp(20),
  },
  countText: {
    fontSize: sp(12),
    fontWeight: '700',
    color: P.red,
  },

  animatedWrapper: {
    flex: 1,
  },

  list: { flex: 1 },
  listContent: { paddingTop: sp(8), paddingBottom: sp(16) },
});
