// /**
//  * @format
//  */

// import { AppRegistry } from 'react-native';
// import App from './App';
// import { name as appName } from './app.json';

// AppRegistry.registerComponent(appName, () => App);

/**
 * @format
 */

import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';

import App from './App';
import { name as appName } from './app.json';

/**
 * Background Messages
 */
messaging().setBackgroundMessageHandler(async remoteMessage => {

  console.log(
    'Background Notification',
    JSON.stringify(remoteMessage, null, 2),
  );

  // Android automatically displays notification
  // because backend sends notification payload.

});

AppRegistry.registerComponent(appName, () => App);