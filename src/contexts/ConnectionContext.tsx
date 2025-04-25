import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { Connection, User } from '../types';
import {
  getUserConnections,
  requestConnection,
  acceptConnection,
  rejectConnection,
  endConnection,
  getPendingConnections,
  subscribeToConnections,
} from '../services/ConnectionService';

type ConnectionContextType = {
  connections: Map<string, Connection>;
  pendingConnections: Map<string, Connection & { initiator: User }>;
  loading: boolean;
  requestConnectionWithUser: (userId: string) => Promise<Connection | null>;
  acceptConnectionRequest: (connectionId: string) => Promise<Connection | null>;
  rejectConnectionRequest: (connectionId: string) => Promise<boolean>;
  endActiveConnection: (connectionId: string) => Promise<boolean>;
  isConnectedWithUser: (userId: string) => boolean;
  getConnectionWithUser: (userId: string) => Connection | null;
  refreshConnections: () => Promise<void>;
};

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export const ConnectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [connections, setConnections] = useState<Map<string, Connection>>(new Map());
  const [pendingConnections, setPendingConnections] = useState<Map<string, Connection & { initiator: User }>>(new Map());
  const [loading, setLoading] = useState(true);

  // Fetch connections and subscribe to updates
  useEffect(() => {
    if (!user?.id) return;

    let unsubscribe: (() => void) | null = null;

    const fetchConnections = async () => {
      setLoading(true);
      try {
        // Get active connections
        const { data: activeConnections, error: activeError } = await getUserConnections(user.id);
        
        if (!activeError && activeConnections) {
          const connectionsMap = new Map<string, Connection>();
          activeConnections.forEach(conn => {
            connectionsMap.set(conn.id!, conn);
          });
          setConnections(connectionsMap);
        }
        
        // Get pending connection requests
        const { data: pendingRequests, error: pendingError } = await getPendingConnections(user.id);
        
        if (!pendingError && pendingRequests) {
          const pendingMap = new Map<string, Connection & { initiator: User }>();
          pendingRequests.forEach(conn => {
            pendingMap.set(conn.id!, conn);
          });
          setPendingConnections(pendingMap);
        }
        
        // Subscribe to connection updates
        unsubscribe = subscribeToConnections(user.id, (updatedConnection) => {
          handleConnectionUpdate(updatedConnection);
        });
      } catch (error) {
        console.error('Error fetching connections:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchConnections();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.id]);

  // Handle connection updates from subscription
  const handleConnectionUpdate = (connection: Connection) => {
    if (!user?.id) return;
    
    // Add/update in the appropriate collection based on status
    if (connection.status === 'accepted' || connection.status === 'active') {
      setConnections(prev => {
        const newMap = new Map(prev);
        newMap.set(connection.id!, connection);
        return newMap;
      });
      
      // Remove from pending if it was there
      setPendingConnections(prev => {
        const newMap = new Map(prev);
        newMap.delete(connection.id!);
        return newMap;
      });
    } else if (connection.status === 'pending' && connection.receiver_id === user.id) {
      // Only show pending connections if current user is the receiver
      // We'll need to fetch initiator details
      fetchConnectionInitiator(connection);
    } else if (connection.status === 'rejected' || connection.status === 'inactive') {
      // Remove from both collections
      setConnections(prev => {
        const newMap = new Map(prev);
        newMap.delete(connection.id!);
        return newMap;
      });
      
      setPendingConnections(prev => {
        const newMap = new Map(prev);
        newMap.delete(connection.id!);
        return newMap;
      });
    }
  };

  // Fetch initiator details for pending connections
  const fetchConnectionInitiator = async (connection: Connection) => {
    try {
      // Fetch the user details of the initiator
      const { data: initiatorData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', connection.initiator_id)
        .single();
        
      if (!error && initiatorData) {
        setPendingConnections(prev => {
          const newMap = new Map(prev);
          newMap.set(connection.id!, {
            ...connection,
            initiator: initiatorData as User
          });
          return newMap;
        });
      }
    } catch (error) {
      console.error('Error fetching connection initiator:', error);
    }
  };

  // Request a connection with another user
  const requestConnectionWithUser = async (userId: string) => {
    if (!user?.id) return null;
    
    try {
      const { data, error } = await requestConnection(user.id, userId);
      
      if (error) {
        console.error('Error requesting connection:', error);
        return null;
      }
      
      if (data) {
        // If status is already accepted, add to connections
        if (data.status === 'accepted' || data.status === 'active') {
          setConnections(prev => {
            const newMap = new Map(prev);
            newMap.set(data.id!, data);
            return newMap;
          });
        }
        
        return data;
      }
      
      return null;
    } catch (error) {
      console.error('Error in requestConnectionWithUser:', error);
      return null;
    }
  };

  // Accept a connection request
  const acceptConnectionRequest = async (connectionId: string) => {
    if (!user?.id) return null;
    
    try {
      const { data, error } = await acceptConnection(connectionId, user.id);
      
      if (error) {
        console.error('Error accepting connection:', error);
        return null;
      }
      
      if (data) {
        // Add to active connections
        setConnections(prev => {
          const newMap = new Map(prev);
          newMap.set(data.id!, data);
          return newMap;
        });
        
        // Remove from pending
        setPendingConnections(prev => {
          const newMap = new Map(prev);
          newMap.delete(connectionId);
          return newMap;
        });
        
        return data;
      }
      
      return null;
    } catch (error) {
      console.error('Error in acceptConnectionRequest:', error);
      return null;
    }
  };

  // Reject a connection request
  const rejectConnectionRequest = async (connectionId: string) => {
    if (!user?.id) return false;
    
    try {
      const { error } = await rejectConnection(connectionId, user.id);
      
      if (error) {
        console.error('Error rejecting connection:', error);
        return false;
      }
      
      // Remove from pending
      setPendingConnections(prev => {
        const newMap = new Map(prev);
        newMap.delete(connectionId);
        return newMap;
      });
      
      return true;
    } catch (error) {
      console.error('Error in rejectConnectionRequest:', error);
      return false;
    }
  };

  // End an active connection
  const endActiveConnection = async (connectionId: string) => {
    if (!user?.id) return false;
    
    try {
      const { error } = await endConnection(connectionId, user.id);
      
      if (error) {
        console.error('Error ending connection:', error);
        return false;
      }
      
      // Remove from active connections
      setConnections(prev => {
        const newMap = new Map(prev);
        newMap.delete(connectionId);
        return newMap;
      });
      
      return true;
    } catch (error) {
      console.error('Error in endActiveConnection:', error);
      return false;
    }
  };

  // Check if user is connected with another user
  const isConnectedWithUser = (userId: string) => {
    if (!user?.id) return false;
    
    // Check all active connections
    for (const connection of connections.values()) {
      if ((connection.initiator_id === user.id && connection.receiver_id === userId) ||
          (connection.initiator_id === userId && connection.receiver_id === user.id)) {
        return true;
      }
    }
    
    return false;
  };

  // Get connection with a specific user
  const getConnectionWithUser = (userId: string) => {
    if (!user?.id) return null;
    
    // Check all active connections
    for (const connection of connections.values()) {
      if ((connection.initiator_id === user.id && connection.receiver_id === userId) ||
          (connection.initiator_id === userId && connection.receiver_id === user.id)) {
        return connection;
      }
    }
    
    return null;
  };

  // Refresh connections data
  const refreshConnections = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Get active connections
      const { data: activeConnections, error: activeError } = await getUserConnections(user.id);
      
      if (!activeError && activeConnections) {
        const connectionsMap = new Map<string, Connection>();
        activeConnections.forEach(conn => {
          connectionsMap.set(conn.id!, conn);
        });
        setConnections(connectionsMap);
      }
      
      // Get pending connection requests
      const { data: pendingRequests, error: pendingError } = await getPendingConnections(user.id);
      
      if (!pendingError && pendingRequests) {
        const pendingMap = new Map<string, Connection & { initiator: User }>();
        pendingRequests.forEach(conn => {
          pendingMap.set(conn.id!, conn);
        });
        setPendingConnections(pendingMap);
      }
    } catch (error) {
      console.error('Error refreshing connections:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConnectionContext.Provider
      value={{
        connections,
        pendingConnections,
        loading,
        requestConnectionWithUser,
        acceptConnectionRequest,
        rejectConnectionRequest,
        endActiveConnection,
        isConnectedWithUser,
        getConnectionWithUser,
        refreshConnections,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
};

// Need to import supabase for fetching user details
import { supabase } from '../lib/supabase';