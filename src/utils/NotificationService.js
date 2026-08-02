import notifee, { AndroidImportance } from '@notifee/react-native';

export async function createNotificationChannel() {
  await notifee.createChannel({
    id: 'fundme',
    name: 'FundMe Notifications',
    importance: AndroidImportance.HIGH,
  });
}

export async function displayNotification(remoteMessage) {
  await notifee.displayNotification({
    title: remoteMessage.notification?.title || 'FundMe',
    body: remoteMessage.notification?.body || '',
    data: remoteMessage.data,

    android: {
      channelId: 'fundme',
      importance: AndroidImportance.HIGH,
      pressAction: {
        id: 'default',
      },
    },
  });
}