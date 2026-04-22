import { create } from 'zustand';
import { INotification } from '@/types';

interface NotificationState {
  notifications: INotification[];
  unreadCount: number;

  setNotifications: (notifications: INotification[]) => void;
  addNotification: (notification: INotification) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  updateUnreadCount: () => void;
}

const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  setNotifications: (notifications) => set({ notifications }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n._id !== id),
    })),

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n._id === id ? { ...n, read: true } : n
      ),
    })),

  clearAll: () => set({ notifications: [] }),

  updateUnreadCount: () => {
    const { notifications } = get();
    const unreadCount = notifications.filter((n) => !n.read).length;
    set({ unreadCount });
  },
}));

export default useNotificationStore;
