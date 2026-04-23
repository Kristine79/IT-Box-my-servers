'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  limit, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db, useAuth } from './providers';
import { toast } from 'sonner';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  link?: string;
  createdAt: any;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  sendNotification: (params: Omit<Notification, 'id' | 'isRead' | 'createdAt' | 'userId'>) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  loading: true,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  sendNotification: async () => {}
});

export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, notificationsEnabled } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !notificationsEnabled) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
      
      // Look for new unread notifications to show a toast
      snap.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const n = change.doc.data() as Notification;
          // Only toast if it's new (not initial load) and unread
          // Simple check for "new" as created in the last 10 seconds
          const createdAt = n.createdAt?.toDate?.() || new Date();
          const isNew = (Date.now() - createdAt.getTime()) < 10000;
          
          if (isNew && !n.isRead) {
            toast(n.title, {
              description: n.message,
              action: n.link ? {
                label: 'View',
                onClick: () => window.location.href = n.link!
              } : undefined
            });
          }
        }
      });
      
      setLoading(false);
    }, (err) => {
      console.error("Notifications listener error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { isRead: true });
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    if (unread.length === 0) return;

    const batch = writeBatch(db);
    unread.forEach(n => {
      batch.update(doc(db, 'notifications', n.id), { isRead: true });
    });
    
    try {
      await batch.commit();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const sendNotification = async (params: Omit<Notification, 'id' | 'isRead' | 'createdAt' | 'userId'>) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'notifications'), {
        ...params,
        userId: user.uid,
        isRead: false,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Failed to send notification:", err);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, loading, markAsRead, markAllAsRead, sendNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}
