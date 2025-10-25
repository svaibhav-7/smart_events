import React, { createContext, useContext, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect to socket
      socketRef.current = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');

      // Join user's room
      socketRef.current.emit('join-campus', user.id);

      // Listen for events
      socketRef.current.on('new-event', (event) => {
        // Handle new event notification
        console.log('New event:', event);
      });

      socketRef.current.on('event-updated', (event) => {
        // Handle event update
        console.log('Event updated:', event);
      });

      socketRef.current.on('new-announcement', (announcement) => {
        // Handle new announcement
        console.log('New announcement:', announcement);
      });

      socketRef.current.on('lost-found-update', (item) => {
        // Handle lost & found update
        console.log('Lost & found update:', item);
      });

      socketRef.current.on('feedback-response', (feedback) => {
        // Handle feedback response
        console.log('Feedback response:', feedback);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, user]);

  const emit = (event, data) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  };

  const value = {
    socket: socketRef.current,
    emit,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
