// // import { ThemeProvider, AuthProvider } from '@react-navigation/native';
// // import { StyleSheet } from 'react-native';
// import React from 'react';
// import Routes from './src/routes/Routes';

// const App = () => {
//   return <Routes />;
// };

// export default App;


// App.jsx
import React, { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';

import { fetchFcmToken, setFcmToken } from './src/config/device';
import NotifeeService from './src/config/notifeeService';
import Routes from './src/routes/Routes';

const App = () => {

  useEffect(() => {

    let unsubscribeForeground;
    let unsubscribeOpen;
    let unsubscribeToken;
    let unsubscribeNotifee;

    const initializeFirebase = async () => {

      // Create notification channel
      await NotifeeService.initialize();

      // Fetch latest FCM Token
      await fetchFcmToken();

      /**
       * Foreground Notification
       */
      unsubscribeForeground =
        messaging().onMessage(async remoteMessage => {

          console.log(
            'Foreground Notification',
            JSON.stringify(remoteMessage, null, 2),
          );

          await NotifeeService.displayNotification(remoteMessage);

        });

      /**
       * Notification clicked while app in background
       */
      unsubscribeOpen =
        messaging().onNotificationOpenedApp(remoteMessage => {

          console.log(
            'Opened from Background',
            JSON.stringify(remoteMessage, null, 2),
          );

          handleNavigation(remoteMessage);

        });

      /**
       * Notification clicked while app was killed
       */
      const initialNotification =
        await messaging().getInitialNotification();

      if (initialNotification) {

        console.log(
          'Opened from Quit State',
          JSON.stringify(initialNotification, null, 2),
        );

        handleNavigation(initialNotification);

      }

      /**
       * Notifee click events
       */
      unsubscribeNotifee =
        notifee.onForegroundEvent(({ type, detail }) => {

          if (type === EventType.PRESS) {

            console.log(
              'Notifee Press',
              detail.notification?.data,
            );

            handleNavigation({
              data: detail.notification?.data,
            });

          }

        });

      /**
       * Token refresh
       */
      unsubscribeToken =
        messaging().onTokenRefresh(async token => {

          console.log('FCM Token Refreshed:', token);

          await setFcmToken(token);

          // Optional:
          // Update backend token API

        });

    };

    initializeFirebase();

    return () => {

      unsubscribeForeground?.();
      unsubscribeOpen?.();
      unsubscribeToken?.();
      unsubscribeNotifee?.();

    };

  }, []);

  const handleNavigation = remoteMessage => {

    const screen = remoteMessage?.data?.screen;

    console.log('Navigate To:', screen);

    /**
     * Example:
     *
     * if(screen==="CAMPAIGN_DETAIL"){
     *     navigation.navigate(...)
     * }
     */

  };

  return <Routes />;

};

export default App;