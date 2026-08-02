// src/hooks/useNotifications.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getNotificationCount,
  getNotificationList,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '../services/notificationService';

/**
 * Hook to fetch unread notification count
 */
export const useNotificationCount = (userId) => {
  return useQuery({
    queryKey: ['notification-count', String(userId)],
    queryFn: async () => {
      const response = await getNotificationCount(userId);
      if (response?.responseCode === '000' && response?.data) {
        return response.data.unreadCount ?? 0;
      }
      throw new Error(response?.responseMessage || 'Failed to load notification count');
    },
    enabled: !!userId,
    staleTime: 1000 * 30,
  });
};

/**
 * Hook to fetch the raw notification list. Returns the raw API array —
 * screen-level transformation into sections happens via
 * groupNotificationsIntoSections() so the query cache always holds the
 * canonical backend shape (easiest to patch optimistically on
 * read/read-all/delete below).
 */
export const useNotificationList = (userId) => {
  return useQuery({
    queryKey: ['notifications', String(userId)],
    queryFn: async () => {
      const response = await getNotificationList(userId);
      if (response?.responseCode === '000' && Array.isArray(response.data)) {
        return response.data;
      }
      throw new Error(response?.responseMessage || 'Failed to load notifications');
    },
    enabled: !!userId,
  });
};

/**
 * Hook to mark a single notification as read.
 * mutate(notificationId)
 */
export const useMarkNotificationRead = (userId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId) => markNotificationRead(userId, notificationId),
    onSuccess: (_response, notificationId) => {
      queryClient.setQueryData(['notifications', String(userId)], (old) => {
        if (!old) return old;
        return old.map((n) =>
          n.notificationId === notificationId ? { ...n, read: true } : n,
        );
      });
      queryClient.invalidateQueries({ queryKey: ['notification-count', String(userId)] });
    },
  });
};

/**
 * Hook to mark all notifications as read.
 * mutate()
 */
export const useMarkAllNotificationsRead = (userId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllNotificationsRead(userId),
    onSuccess: () => {
      queryClient.setQueryData(['notifications', String(userId)], (old) =>
        old ? old.map((n) => ({ ...n, read: true })) : old,
      );
      queryClient.setQueryData(['notification-count', String(userId)], 0);
    },
  });
};

/**
 * Hook to delete a notification.
 * mutate(notificationId, { onError })
 *
 * The screen handles the optimistic removal itself (so the swipe/trash
 * animation isn't blocked waiting on the network) — this hook's
 * onSuccess just keeps the query cache in sync so a background refetch
 * doesn't bring the deleted item back.
 */
export const useDeleteNotification = (userId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId) => deleteNotification(userId, notificationId),
    onSuccess: (_response, notificationId) => {
      queryClient.setQueryData(['notifications', String(userId)], (old) =>
        old ? old.filter((n) => n.notificationId !== notificationId) : old,
      );
      queryClient.invalidateQueries({ queryKey: ['notification-count', String(userId)] });
    },
  });
};