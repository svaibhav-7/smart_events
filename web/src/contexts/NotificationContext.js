import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (socket) {
      // Listen for new events
      socket.on('new-event', (event) => {
        addNotification({
          id: `event-${event._id}-${Date.now()}`,
          type: 'event',
          title: 'New Event',
          message: event.title,
          data: event,
          timestamp: new Date(),
          read: false,
        });
      });

      // Listen for new announcements
      socket.on('new-announcement', (announcement) => {
        addNotification({
          id: `announcement-${announcement._id}-${Date.now()}`,
          type: 'announcement',
          title: 'New Announcement',
          message: announcement.title,
          data: announcement,
          timestamp: new Date(),
          read: false,
        });
      });

      // Listen for event updates
      socket.on('event-updated', (event) => {
        addNotification({
          id: `event-update-${event._id}-${Date.now()}`,
          type: 'event',
          title: 'Event Updated',
          message: event.title,
          data: event,
          timestamp: new Date(),
          read: false,
        });
      });

      // Listen for announcement updates
      socket.on('announcement-updated', (announcement) => {
        addNotification({
          id: `announcement-update-${announcement._id}-${Date.now()}`,
          type: 'announcement',
          title: 'Announcement Updated',
          message: announcement.title,
          data: announcement,
          timestamp: new Date(),
          read: false,
        });
      });
    }

    return () => {
      if (socket) {
        socket.off('new-event');
        socket.off('new-announcement');
        socket.off('event-updated');
        socket.off('announcement-updated');
      }
    };
  }, [socket]);

  const addNotification = (notification) => {
    setNotifications((prev) => {
      // Keep only the latest 5 notifications
      const updated = [notification, ...prev].slice(0, 5);
      return updated;
    });
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, read: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const getUnreadCount = () => {
    return notifications.filter((n) => !n.read).length;
  };

  const value = {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    getUnreadCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
