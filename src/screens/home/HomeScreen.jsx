// // src/screens/home/HomeScreen.jsx

// import React, { useState, useCallback } from 'react';
// import { View, StyleSheet, ScrollView, StatusBar } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';

// import { P, sp } from '../../theme/theme';
// import { URGENT, FEATURED, CURRENT_USER } from '../../constants/mockData';

// import TopBar from '../../components/TopBar';
// import SearchBar from '../../components/SearchBar';
// import HeroBanner from '../../components/HeroBanner';
// import StatsRow from '../../components/StatsRow';
// import SectionHeader from '../../components/SectionHeader';
// import CategoryChips from '../../components/shared/CategoryChips';
// import UrgentCard from '../../components/UrgentCard';
// import FeaturedItem from '../../components/FeaturedItem';

// const HomeScreen = ({ navigation }) => {
//   const [activeCat, setActiveCat] = useState('all');
//   const [search, setSearch] = useState('');

//   const handleCatChange = useCallback(id => setActiveCat(id), []);
//   const handleSearchChange = useCallback(text => setSearch(text), []);

//   const openProfile = useCallback(() => {
//     navigation?.navigate?.('ProfileTab');
//   }, [navigation]);

//   const handleSeeAll = () => {
//     navigation.navigate('ExploreScreen');
//   };

//   return (
//     <SafeAreaView style={styles.safe}>
//       <StatusBar barStyle="dark-content" backgroundColor={P.white} />
//       <TopBar
//         user={CURRENT_USER}
//         onAvatarPress={openProfile}
//         onBellPress={() => {
//           /* Handle notification press */
//         }}
//       />
//       <ScrollView
//         style={styles.scroll}
//         contentContainerStyle={styles.content}
//         showsVerticalScrollIndicator={false}
//         bounces={false}
//         overScrollMode="never"
//       >
//         <SearchBar value={search} onChange={handleSearchChange} />
//         <HeroBanner />
//         <StatsRow />

//         <SectionHeader
//           title="Categories"
//           linkText="See All"
//           onPress={handleSeeAll}
//         />
//         <CategoryChips active={activeCat} onChange={handleCatChange} />

//         {/* ✅ FIX: "linkText" is now identical to the one above, ensuring perfect alignment. */}
//         <SectionHeader
//           title="🔥 Urgent Campaigns"
//           linkText="See All"
//           onPress={() => {}}
//         />
//         <ScrollView
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={styles.horizontalList}
//         >
//           {URGENT.map(item => (
//             <UrgentCard key={item.id} item={item} />
//           ))}
//         </ScrollView>

//         <SectionHeader
//           title="⭐ Featured"
//           linkText="See All"
//           onPress={() => {}}
//         />
//         <View style={styles.featuredList}>
//           {FEATURED.map(item => (
//             <FeaturedItem key={item.id} item={item} />
//           ))}
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   safe: {
//     flex: 1,
//     backgroundColor: P.white,
//   },
//   scroll: {
//     flex: 1,
//     backgroundColor: P.bg,
//   },
//   content: {
//     paddingBottom: sp(28),
//   },
//   horizontalList: {
//     paddingLeft: sp(16),
//     paddingRight: sp(2),
//   },
//   featuredList: {
//     paddingHorizontal: sp(16),
//     backgroundColor: P.white,
//     borderTopWidth: StyleSheet.hairlineWidth,
//     borderTopColor: P.border,
//   },
// });

// export default HomeScreen;



// src/screens/home/HomeScreen.jsx
import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { P, sp } from '../../theme/theme';
import { URGENT, FEATURED } from '../../constants/mockData';

import TopBar          from '../../components/TopBar';
import SearchBar       from '../../components/SearchBar';
import HeroBanner      from '../../components/HeroBanner';
import StatsRow        from '../../components/StatsRow';
import SectionHeader   from '../../components/SectionHeader';
import CategoryChips   from '../../components/shared/CategoryChips';
import UrgentCard      from '../../components/UrgentCard';
import FeaturedItem    from '../../components/FeaturedItem';

import { useAppContext } from '../../context/AppContext';

const HomeScreen = ({ navigation }) => {
  const { currentUser } = useAppContext();

  const [activeCat, setActiveCat] = useState('all');
  const [search,    setSearch]    = useState('');

  // ─── Build user object for TopBar from real API data ────
  const user = useMemo(() => {
    const firstName = currentUser?.firstName || '';
    const lastName  = currentUser?.lastName  || '';
    const fullName  = `${firstName} ${lastName}`.trim() || 'User';

    return {
      name:      fullName,
      avatarUri: currentUser?.profileImage || null,
      role:      currentUser?.role || 'user',
    };
  }, [currentUser]);

  const isCreator = (currentUser?.role || '').toLowerCase() === 'creator';

  const handleCatChange    = useCallback((id)   => setActiveCat(id), []);
  const handleSearchChange = useCallback((text) => setSearch(text),  []);

  const openProfile = useCallback(() => {
    navigation?.navigate?.('ProfileTab');
  }, [navigation]);

  const openNotifications = useCallback(() => {
    // Donor/User has Notifications in tabs → switch tab
    // Creator doesn't → go to stack screen
    if (isCreator) {
      navigation?.navigate?.('NotificationsScreen');
    } else {
      navigation?.navigate?.('NotificationsTab');
    }
  }, [navigation, isCreator]);

  const handleSeeAll = useCallback(() => {
    navigation.navigate('ExploreScreen');
  }, [navigation]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={P.white} />

      <TopBar
        user={user}
        onAvatarPress={openProfile}
        onBellPress={openNotifications}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
      >
        <SearchBar value={search} onChange={handleSearchChange} />
        <HeroBanner />

        {/* Static for now — will become real API later */}
        <StatsRow />

        <SectionHeader
          title="Categories"
          linkText="See All"
          onPress={handleSeeAll}
        />
        <CategoryChips active={activeCat} onChange={handleCatChange} />

        <SectionHeader
          title="🔥 Urgent Campaigns"
          linkText="See All"
          onPress={() => {}}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {URGENT.map((item) => (
            <UrgentCard key={item.id} item={item} />
          ))}
        </ScrollView>

        <SectionHeader
          title="⭐ Featured"
          linkText="See All"
          onPress={() => {}}
        />
        <View style={styles.featuredList}>
          {FEATURED.map((item) => (
            <FeaturedItem key={item.id} item={item} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: P.white,
  },
  scroll: {
    flex: 1,
    backgroundColor: P.bg,
  },
  content: {
    paddingBottom: sp(28),
  },
  horizontalList: {
    paddingLeft: sp(16),
    paddingRight: sp(2),
  },
  featuredList: {
    paddingHorizontal: sp(16),
    backgroundColor: P.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: P.border,
  },
});

export default HomeScreen;