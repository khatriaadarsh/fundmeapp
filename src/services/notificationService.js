// src/services/notificationService.js
import apiClient from '../api/client';
// import { ENDPOINTS } from '../api/endpoint';
import { ENDPOINTS } from '../api/endpoints';

/**
 * Get Notification Count
 * POST /notification/count
 * Body: { userId }
 * Response data: { unreadCount }
 */
export const getNotificationCount = async (userId) => {
  if (!userId) throw new Error('userId is required');

  console.log('🔵 [notificationService] Getting count for userId:', userId);

  try {
    const res = await apiClient.post(ENDPOINTS.NOTIFICATION.COUNT, {
      userId: Number(userId),
    });
    console.log('🟢 [notificationService] Count response:', res.data);
    return res.data;
  } catch (error) {
    console.error('🔴 [notificationService] Get count error:', error.message);
    throw error;
  }
};

/**
 * List Notifications
 * POST /notification/list
 * Body: { userId }
 * Response data: [ { notificationId, notificationType, title, message,
 *                     createdDate, referenceId, referenceType,
 *                     screenName, read }, ... ]
 */
export const getNotificationList = async (userId) => {
  if (!userId) throw new Error('userId is required');

  console.log('🔵 [notificationService] Getting list for userId:', userId);

  try {
    const res = await apiClient.post(ENDPOINTS.NOTIFICATION.LIST, {
      userId: Number(userId),
    });
    console.log('🟢 [notificationService] List response:', res.data);
    return res.data;
  } catch (error) {
    console.error('🔴 [notificationService] Get list error:', error.message);
    throw error;
  }
};

/**
 * Mark single notification as read
 * POST /notification/read
 * Body: { userId, notificationId }
 */
export const markNotificationRead = async (userId, notificationId) => {
  console.log('🔵 [notificationService] Marking read:', { userId, notificationId });

  try {
    const res = await apiClient.post(ENDPOINTS.NOTIFICATION.READ, {
      userId: Number(userId),
      notificationId: Number(notificationId),
    });
    console.log('🟢 [notificationService] Mark read response:', res.data);
    return res.data;
  } catch (error) {
    console.error('🔴 [notificationService] Mark read error:', error.message);
    throw error;
  }
};

/**
 * Mark all notifications as read
 * POST /notification/read-all
 * Body: { userId }
 */
export const markAllNotificationsRead = async (userId) => {
  console.log('🔵 [notificationService] Marking all read for userId:', userId);

  try {
    const res = await apiClient.post(ENDPOINTS.NOTIFICATION.READ_ALL, {
      userId: Number(userId),
    });
    console.log('🟢 [notificationService] Mark all read response:', res.data);
    return res.data;
  } catch (error) {
    console.error('🔴 [notificationService] Mark all read error:', error.message);
    throw error;
  }
};

/**
 * Delete a notification
 * POST /notification/delete
 * Body: { userId, notificationId }
 *
 * NOTE: endpoint path is a placeholder — confirm with backend, see
 * ENDPOINTS.NOTIFICATION.DELETE comment in src/api/endpoint.js.
 */
export const deleteNotification = async (userId, notificationId) => {
  console.log('🔵 [notificationService] Deleting:', { userId, notificationId });

  try {
    const res = await apiClient.post(ENDPOINTS.NOTIFICATION.DELETE, {
      userId: Number(userId),
      notificationId: Number(notificationId),
    });
    console.log('🟢 [notificationService] Delete response:', res.data);
    return res.data;
  } catch (error) {
    console.error('🔴 [notificationService] Delete error:', error.message);
    throw error;
  }
};