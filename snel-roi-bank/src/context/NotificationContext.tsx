import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { notificationService, Notification, NotificationFilters } from '@/services/notificationService';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  filters: NotificationFilters;
  setFilters: (filters: NotificationFilters) => void;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  refreshNotifications: () => void;
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<NotificationFilters>({ page: 1, page_size: 20 });
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Query for notifications
  const {
    data: notificationData,
    isLoading,
    refetch: refreshNotifications,
  } = useQuery({
    queryKey: ['notifications', filters],
    queryFn: () => notificationService.getNotifications(filters),
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refetch every 30 seconds as fallback
  });

  // Query for unread count
  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationService.getUnreadCount(),
    enabled: isAuthenticated,
    refetchInterval: 15000, // Refetch every 15 seconds
  });

  // Mutations
  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => notificationService.updateNotification(id, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive',
      });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: 'Success',
        description: `Marked ${data.count} notifications as read`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read',
        variant: 'destructive',
      });
    },
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: (id: number) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: 'Success',
        description: 'Notification deleted',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to delete notification',
        variant: 'destructive',
      });
    },
  });

  // WebSocket connection
  const connectWebSocket = useCallback(() => {
    if (!isAuthenticated || !user || websocket) return;

    try {
      const token = localStorage.getItem('snel-roi-token');
      const wsUrl = `ws://localhost:8000/ws/notifications/?token=${token}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('Notification WebSocket connected');
        setError(null);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'notification') {
            // New notification received
            const notification = data.notification as Notification;
            
            // Show toast notification
            toast({
              title: notification.title,
              description: notification.message,
              variant: notification.priority === 'HIGH' || notification.priority === 'URGENT' ? 'destructive' : 'default',
            });

            // Update queries
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            
          } else if (data.type === 'connection_established') {
            console.log('Notification WebSocket connection established');
          } else if (data.type === 'pong') {
            // Heartbeat response
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('Notification WebSocket disconnected:', event.code);
        setWebsocket(null);
        
        // Attempt to reconnect after 5 seconds if not a normal closure
        if (event.code !== 1000 && isAuthenticated) {
          setTimeout(() => {
            connectWebSocket();
          }, 5000);
        }
      };

      ws.onerror = (error) => {
        console.error('Notification WebSocket error:', error);
        setError('WebSocket connection failed');
      };

      setWebsocket(ws);

      // Send heartbeat every 30 seconds
      const heartbeat = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);

      // Cleanup heartbeat on close
      ws.addEventListener('close', () => {
        clearInterval(heartbeat);
      });

    } catch (error) {
      console.error('Failed to connect to notification WebSocket:', error);
      setError('Failed to connect to notifications');
    }
  }, [isAuthenticated, user, websocket, queryClient]);

  const disconnectWebSocket = useCallback(() => {
    if (websocket) {
      websocket.close(1000); // Normal closure
      setWebsocket(null);
    }
  }, [websocket]);

  // Connect/disconnect WebSocket based on auth status
  useEffect(() => {
    if (isAuthenticated) {
      connectWebSocket();
    } else {
      disconnectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [isAuthenticated, connectWebSocket, disconnectWebSocket]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectWebSocket();
    };
  }, [disconnectWebSocket]);

  const contextValue: NotificationContextType = {
    notifications: notificationData?.notifications || [],
    unreadCount: unreadData?.unread_count || 0,
    isLoading,
    error,
    filters,
    setFilters,
    markAsRead: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    deleteNotification: deleteNotificationMutation.mutateAsync,
    refreshNotifications,
    connectWebSocket,
    disconnectWebSocket,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};