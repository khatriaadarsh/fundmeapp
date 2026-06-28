// // src/screens/saved/SavedScreen.jsx
// import React, { useState, useCallback, useRef, useEffect } from 'react';
// import { StyleSheet, FlatList, StatusBar, Animated } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { MOCK_SAVED } from '../../constants/mockData';
// import { P, sp } from '../../theme/theme';

// // Import screen-specific components
// import SavedScreenHeader from '../../components/saved/SavedScreenHeader';
// import SavedCampaignCard from '../../components/saved/SavedCampaignCard';

// // ✅ REUSABILITY: Importing the generic, shared EmptyState component
// import EmptyState from '../../components/shared/EmptyState';

// const SavedScreen = ({ navigation }) => {
//   const [saved, setSaved] = useState(MOCK_SAVED);

//   const mountAnim = useRef(new Animated.Value(0)).current;
//   const slideAnim = useRef(new Animated.Value(sp(16))).current;

//   useEffect(() => {
//     Animated.parallel([
//       Animated.timing(mountAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
//       Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
//     ]).start();
//   }, [mountAnim, slideAnim]);

//   const handleUnsave = useCallback(id => {
//     setSaved(prev => prev.filter(c => c.id !== id));
//   }, []);

//   const handleCardPress = useCallback(item => {
//     navigation?.navigate?.('CampaignDetail', { id: item.id });
//   }, [navigation]);

//   return (
//     <SafeAreaView style={styles.safe}>
//       <StatusBar barStyle="dark-content" backgroundColor={P.white} />
//       <SavedScreenHeader count={saved.length} />

//       <Animated.View
//         style={[
//           styles.animatedWrapper,
//           {
//             opacity: mountAnim,
//             transform: [{ translateY: slideAnim }],
//           },
//         ]}
//       >
//         <FlatList
//           data={saved}
//           keyExtractor={item => item.id}
//           renderItem={({ item }) => (
//             <SavedCampaignCard
//               item={item}
//               onPress={handleCardPress}
//               onUnsave={handleUnsave}
//             />
//           )}
//           // ✅ REUSABILITY: Using the shared EmptyState with custom props
//           ListEmptyComponent={
//             <EmptyState
//               icon="heart"
//               title="Nothing saved yet"
//               subtitle="Tap the heart icon on any campaign to save it here."
//             />
//           }
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={styles.listContent}
//           bounces={false}
//           overScrollMode="never"
//         />
//       </Animated.View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safe: {
//     flex: 1,
//     backgroundColor: P.bg,
//   },
//   animatedWrapper: {
//     flex: 1,
//   },
//   listContent: {
//     flexGrow: 1, // Ensures EmptyState can fill the space and center itself
//     paddingTop: sp(8),
//     paddingBottom: sp(16),
//   },
// });

// export default SavedScreen;

// src/screens/saved/SavedScreen.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  StyleSheet, FlatList, StatusBar, Animated,
  View, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { P, sp } from '../../theme/theme';
import { useAppContext } from '../../context/AppContext';
import { useSavedCampaigns, useUnsaveCampaign } from '../../hooks/useSavedCampaigns';
import { getUserId } from '../../utils/storage';

import SavedScreenHeader from '../../components/saved/SavedScreenHeader';
import SavedCampaignCard from '../../components/saved/SavedCampaignCard';
import EmptyState from '../../components/shared/EmptyState';

const SavedScreen = ({ navigation }) => {
  const { currentUser } = useAppContext();

  const resolveId = (user) => {
    if (!user) return null;
    const raw = user.userId ?? user.id ?? null;
    return raw ? Number(raw) : null;
  };

  const [userId, setUserId] = useState(() => resolveId(currentUser));
  const [refreshing, setRefreshing] = useState(false);

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
      Animated.timing(mountAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [mountAnim, slideAnim]);

  // ── API ──
  const {
    data: saved = [],
    isLoading,
    refetch,
  } = useSavedCampaigns(userId);

  // ✅ Pass userId (not refetch) to the hook
  const { mutate: unsaveCampaign } = useUnsaveCampaign(userId);

  // ── Pull-to-refresh ──
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // ── Handlers ──
  const handleUnsave = useCallback(
    (favouriteId) => {
      console.log('🔵 [SavedScreen] unsaving favouriteId:', favouriteId);
      unsaveCampaign(favouriteId);
    },
    [unsaveCampaign]
  );

  const handleCardPress = useCallback(
    (item) => {
      navigation?.navigate?.('CampaignDetail', { id: item.campaignId });
    },
    [navigation]
  );

  // ── Render ──
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
        keyExtractor={(item) => String(item.favouriteId)}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: P.bg },
  animatedWrapper: { flex: 1 },
  listContent:     { flexGrow: 1, paddingTop: sp(8), paddingBottom: sp(16) },
  centered:        { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: sp(80) },
});

export default SavedScreen;