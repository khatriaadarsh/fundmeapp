// src/screens/saved/SavedScreen.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { StyleSheet, FlatList, StatusBar, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MOCK_SAVED } from '../../constants/mockData';
import { P, sp } from '../../theme/theme';

// Import screen-specific components
import SavedScreenHeader from '../../components/saved/SavedScreenHeader';
import SavedCampaignCard from '../../components/saved/SavedCampaignCard';

// ✅ REUSABILITY: Importing the generic, shared EmptyState component
import EmptyState from '../../components/shared/EmptyState';

const SavedScreen = ({ navigation }) => {
  const [saved, setSaved] = useState(MOCK_SAVED);

  const mountAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(sp(16))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(mountAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
  }, [mountAnim, slideAnim]);

  const handleUnsave = useCallback(id => {
    setSaved(prev => prev.filter(c => c.id !== id));
  }, []);

  const handleCardPress = useCallback(item => {
    navigation?.navigate?.('CampaignDetail', { id: item.id });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={P.white} />
      <SavedScreenHeader count={saved.length} />

      <Animated.View
        style={[
          styles.animatedWrapper,
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
          // ✅ REUSABILITY: Using the shared EmptyState with custom props
          ListEmptyComponent={
            <EmptyState
              icon="heart"
              title="Nothing saved yet"
              subtitle="Tap the heart icon on any campaign to save it here."
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          bounces={false}
          overScrollMode="never"
        />
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: P.bg,
  },
  animatedWrapper: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1, // Ensures EmptyState can fill the space and center itself
    paddingTop: sp(8),
    paddingBottom: sp(16),
  },
});

export default SavedScreen;