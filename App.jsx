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
import { fetchFcmToken, setFcmToken } from './src/config/device';
import Routes from './src/routes/Routes';

const App = () => {
  useEffect(() => {
    // 1. Fetch FCM token on app start
    fetchFcmToken();

    // 2. Listen for token refresh (Firebase rotates tokens occasionally)
    const unsubscribe = messaging().onTokenRefresh((token) => {
      console.log('🔄 FCM token refreshed:', token);
      setFcmToken(token);
    });

    return unsubscribe;
  }, []);

  return <Routes />;
};

export default App;