import notifee, {
  AndroidImportance,
  AndroidVisibility,
} from '@notifee/react-native';

class NotifeeService {
  /**
   * Initialize Notification Channel
   */
  async initialize() {
    await notifee.requestPermission();

    await notifee.createChannel({
      id: 'fundme-default',
      name: 'FundMe Notifications',
      importance: AndroidImportance.HIGH,
      vibration: true,
      lights: true,
      sound: 'default',
    });
  }

  /**
   * Display Local Notification
   * (Used only when app is in Foreground)
   */
  async displayNotification(remoteMessage) {
    try {
      await notifee.displayNotification({
        title:
          remoteMessage?.notification?.title ??
          remoteMessage?.data?.title ??
          'FundMe',

        body:
          remoteMessage?.notification?.body ??
          remoteMessage?.data?.body ??
          '',

        android: {
          channelId: 'fundme-default',
          importance: AndroidImportance.HIGH,
          visibility: AndroidVisibility.PUBLIC,
          pressAction: {
            id: 'default',
          },
          smallIcon: 'ic_launcher', // Replace if you create a custom notification icon
          sound: 'default',
          vibrationPattern: [300, 500],
        },
      });
    } catch (e) {
      console.log('Notifee Error:', e);
    }
  }

  /**
   * Listen for notification clicks
   * Foreground + Background
   */
  onForegroundEvent(callback) {
    return notifee.onForegroundEvent(callback);
  }

  onBackgroundEvent(handler) {
    notifee.onBackgroundEvent(handler);
  }
}

export default new NotifeeService();