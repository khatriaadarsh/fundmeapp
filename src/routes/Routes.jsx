import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import {View, Text, TouchableOpacity, StyleSheet, Dimensions,} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icons from 'react-native-vector-icons/Feather';

import Splash                   from '../screens/splash/Splash';
import OnboardingScreen         from '../screens/onboarding/OnboardingScreen';
import Login                    from '../screens/auth/Login';
import SignUpScreen              from '../screens/auth/SignUpScreen';
import OTPVerificationScreen    from '../screens/auth/OTPVerificationScreen';
import CNICUploadScreen         from '../screens/auth/CNICUploadScreen';
import ProfileCompletionScreen  from '../screens/auth/ProfileCompletionScreen';
import ForgotPasswordScreen     from '../screens/auth/ForgotPasswordScreen';
import NewPasswordScreen        from '../screens/auth/NewPasswordScreen';
import SendResetCode            from '../screens/auth/SendResetCode';
import HomeScreen               from '../screens/home/HomeScreen';
import ExploreScreen            from '../screens/explore/ExploreScreen';
// import SavedScreen              from '../components/saved/SavedScreen';
import SavedScreen              from '../screens/saved/SavedScreen';
import ProfileScreen            from '../components/ProfileScreen';
import CampaignDetails          from '../screens/campaigncreation/CampaignDetails';
import PhotosDocuments          from '../screens/campaigncreation/PhotosDocuments';
import ReviewSubmit             from '../screens/campaigncreation/ReviewSubmit';
import EditProfile              from '../screens/Profile/EditProfile';
import MyDonationScreen         from '../screens/donation/MyDonationsScreen';
import MyCampaignsScreen        from '../screens/campaigns/MyCampaignsScreen';
import RequestWithdrawalScreen  from '../screens/campaigns/RequestWithdrawalScreen';
import NotificationsScreen      from '../screens/notifications/NotificationsScreen';
import TermsConditions          from '../screens/campaigns/TermsConditions';
import FAQScreen                from '../screens/Profile/FAQScreen';
import SettingsScreen           from '../screens/settings/SettingsScreen';
import CampaignDetail from '../screens/campaigns/CampaignDetail';
// import CreateCampaign from '../screens/campaigncreation/CreateCampaign';
// import CampaignDetails from '../screens/campaigncreation/CampaignDetails';
import DonateScreen from '../screens/campaigns/DonateScreen';
import CheckUser from '../screens/auth/CheckUser';
import CreatorProfileScreen from '../screens/Profile/CreatorProfileScreen';

const { width: SW } = Dimensions.get('window');
const sp = n => (SW / 375) * n;

const INACTIVE   = '#9CA3AF';
const WHITE      = '#FFFFFF';
const OCEAN_BLUE = '#0A3D62';
const RED        = '#e74c3c';
const TEAL       = '#00B4CC';

const TAB_CONFIG = {
  HomeTab:    { icon: 'home',    label: 'Home'    },
  ExploreTab: { icon: 'compass', label: 'Explore' },
  SavedTab:   { icon: 'heart',   label: 'Saved'   },
  ProfileTab: { icon: 'user',    label: 'Me'      },
};

// ─── CustomTabBar ────────────────────────────────────────────
const CustomTabBar = ({ state, navigation }) => {
  const { bottom } = useSafeAreaInsets();
  const pb = bottom > 0 ? bottom : sp(10);

  return (
    <View style={[tabSt.bar, { paddingBottom: pb }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        // ── FAB (centre button) ──
        if (route.name === 'CreateTab') {
          return (
            <View key={route.key} style={tabSt.fabSlot}>
              <TouchableOpacity
                // onPress={() => navigation.navigate('CreateCampaign')}
                 onPress={() => navigation.navigate('ReviewSubmit')}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[OCEAN_BLUE, OCEAN_BLUE]}
                  style={tabSt.fab}
                >
                  <Icons name="plus" size={sp(24)} color={WHITE} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          );
        }

        // ── Regular tab ──
        const config = TAB_CONFIG[route.name] ?? { icon: 'circle', label: '' };

        return (
          <TouchableOpacity
            key={route.key}
            style={tabSt.tab}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented)
                navigation.navigate(route.name);
            }}
            activeOpacity={0.7}
          >
            <Icons
              name={config.icon}
              size={sp(22)}
              color={isFocused ? RED : INACTIVE}
            />
            <Text style={[tabSt.label, isFocused && tabSt.labelActive]}>
              {config.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const tabSt = StyleSheet.create({
  bar: {
    flexDirection:    'row',
    alignItems:       'center',
    backgroundColor:  WHITE,
    borderTopWidth:   1,
    borderTopColor:   '#EFEFEF',
    paddingTop:       sp(6),
    // paddingBottom set inline via insets.bottom
    paddingHorizontal: sp(6),
    elevation:        14,
    shadowColor:      '#000',
    shadowOffset:     { width: 0, height: -2 },
    shadowOpacity:    0.07,
    shadowRadius:     8,
  },
  tab: {
    flex:           1,
    alignItems:     'center',
    paddingVertical: sp(2),
  },
  label:       { fontSize: sp(10), color: INACTIVE, marginTop: sp(3) },
  labelActive: { color: RED, fontWeight: '700' },
  fabSlot: {
    flex:       1,
    alignItems: 'center',
    marginTop:  sp(-24),
  },
  fab: {
    width:          sp(56),
    height:         sp(56),
    borderRadius:   sp(28),
    alignItems:     'center',
    justifyContent: 'center',
    elevation:      8,
    shadowColor:    TEAL,
    shadowOffset:   { width: 0, height: 4 },
    shadowOpacity:  0.4,
    shadowRadius:   8,
  },
});

// ─── Navigators ──────────────────────────────────────────────
const DummyScreen = () => null;
const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MainTabNavigator = () => (
  <Tab.Navigator
    tabBar={props => <CustomTabBar {...props} />}
    screenOptions={{ headerShown: false, lazy: true }}
  >
    <Tab.Screen name="HomeTab"    component={HomeScreen}    />
    <Tab.Screen name="ExploreTab" component={ExploreScreen} />
    <Tab.Screen
      name="CreateTab"
      component={DummyScreen}
      listeners={({ navigation }) => ({
        // tabPress: e => { e.preventDefault(); navigation.navigate('CreateCampaign'); },
          tabPress: e => { e.preventDefault(); navigation.navigate('CreateCampaign'); },
      })}
    />
    <Tab.Screen name="SavedTab"   component={SavedScreen}   />
    <Tab.Screen name="ProfileTab" component={ProfileScreen} />
  </Tab.Navigator>
);

const StackNavigator = () => (
  <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Splash"                   component={Splash}                  />
    <Stack.Screen name="OnboardingScreen"         component={OnboardingScreen}        />
    <Stack.Screen name="Login"                    component={Login}                   />
    <Stack.Screen name="ForgotPasswordScreen"     component={ForgotPasswordScreen}    />
    <Stack.Screen name="SendResetCode"            component={SendResetCode}           />
    <Stack.Screen name="NewPasswordScreen"        component={NewPasswordScreen}       />
    <Stack.Screen name="SignUpScreen"             component={SignUpScreen}            />
    <Stack.Screen name="OTPVerificationScreen"    component={OTPVerificationScreen}   />
    <Stack.Screen name="CNICUploadScreen"         component={CNICUploadScreen}        />
    <Stack.Screen name="ProfileCompletionScreen"  component={ProfileCompletionScreen} />
    <Stack.Screen name="MainTabs"                 component={MainTabNavigator}        />
    <Stack.Screen name="HomeScreen"               component={HomeScreen}              />
    <Stack.Screen name="ProfileScreen"            component={ProfileScreen}           />
    <Stack.Screen name="CampaignDetails"          component={CampaignDetails}         />
    <Stack.Screen name="PhotosDocuments"          component={PhotosDocuments}         />
    <Stack.Screen name="ReviewSubmit"             component={ReviewSubmit}            />
    <Stack.Screen name="EditProfile"              component={EditProfile}             />
    <Stack.Screen name="MyDonationScreen"         component={MyDonationScreen}        />
    <Stack.Screen name="MyCampaignsScreen"        component={MyCampaignsScreen}       />
    <Stack.Screen name="RequestWithdrawalScreen"  component={RequestWithdrawalScreen} />
    <Stack.Screen name="TermsConditions"          component={TermsConditions}         />
    <Stack.Screen name="FAQScreen"                component={FAQScreen}               />
    <Stack.Screen name="NotificationsScreen"      component={NotificationsScreen}     />
    <Stack.Screen name="SettingsScreen"           component={SettingsScreen}          />
    <Stack.Screen name="CampaignDetail"            component={CampaignDetail}           />
    {/* <Stack.Screen name="CreateCampaign"            component={CreateCampaign}           /> */}
    {/* <Stack.Screen name="CampaignDetails"            component={CampaignDetails}           /> */}
    <Stack.Screen name="DonateScreen"             component={DonateScreen}           />
    {/* <Stack.Navigator initialRouteName="CheckUser"> */}
  <Stack.Screen name="CheckUser" component={CheckUser} options={{ headerShown: false }} />
  <Stack.Screen  name="CreatorProfileScreen" component={CreatorProfileScreen}  options={{ headerShown: false }}/>
  </Stack.Navigator>
);

const Routes = () => (
  <NavigationContainer>
    <StackNavigator />
  </NavigationContainer>
);

export default Routes;