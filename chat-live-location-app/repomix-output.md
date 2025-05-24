This file is a merged representation of the entire codebase, combined into a single document by Repomix.

# File Summary

## Purpose
This file contains a packed representation of the entire repository's contents.
It is designed to be easily consumable by AI systems for analysis, code review,
or other automated processes.

## File Format
The content is organized as follows:
1. This summary section
2. Repository information
3. Directory structure
4. Repository files (if enabled)
4. Multiple file entries, each consisting of:
  a. A header with the file path (## File: path/to/file)
  b. The full contents of the file in a code block

## Usage Guidelines
- This file should be treated as read-only. Any changes should be made to the
  original repository files, not this packed version.
- When processing this file, use the file path to distinguish
  between different files in the repository.
- Be aware that this file may contain sensitive information. Handle it with
  the same level of security as you would the original repository.

## Notes
- Some files may have been excluded based on .gitignore rules and Repomix's configuration
- Binary files are not included in this packed representation. Please refer to the Repository Structure section for a complete list of file paths, including binary files
- Files matching patterns in .gitignore are excluded
- Files matching default ignore patterns are excluded
- Files are sorted by Git change count (files with more changes are at the bottom)

## Additional Info

# Directory Structure
```
assets/
  MapIconSVG.tsx
src/
  components/
    MessageBubble.tsx
    UserLocationMarker.tsx
  contexts/
    AuthContext.tsx
    ConnectionContext.tsx
    TripContext.tsx
  hooks/
    useLocationTracking.ts
  lib/
    supabase.ts
  navigation/
    AppNavigator.tsx
  screens/
    ChatScreen.tsx
    LoginScreen.tsx
    MapScreen.tsx
    ProfileScreen.tsx
    SignupScreen.tsx
    UsersListScreen.tsx
  services/
    ChatService.ts
    ConnectionService.ts
    LocationService.ts
    TripService.ts
  types/
    index.ts
  utils/
    dateUtils.ts
    environment.ts
    locationUtils.ts
supabase/
  migrations/
    20250422_init.sql
.env.example
.gitignore
.repomixignore
app.json
App.tsx
babel.config.js
index.ts
LICENSE
package.json
README.md
repomix.config.json
tsconfig.json
```

# Files

## File: assets/MapIconSVG.tsx
````typescript
import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

type MapIconProps = {
  width?: number;
  height?: number;
  color?: string;
};

const MapIconSVG: React.FC<MapIconProps> = ({ 
  width = 200, 
  height = 200,
  color = '#4285F4'
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 200 200">
      <Circle cx="100" cy="100" r="90" fill="white" />
      <Path
        d="M100 30C61.34 30 30 61.34 30 100C30 138.66 61.34 170 100 170C138.66 170 170 138.66 170 100C170 61.34 138.66 30 100 30ZM100 60C111.05 60 120 68.95 120 80C120 91.05 111.05 100 100 100C88.95 100 80 91.05 80 80C80 68.95 88.95 60 100 60ZM100 154C83.33 154 68.67 146.67 60 134.67C60.33 117.33 77.67 110 100 110C122.33 110 139.67 117.33 140 134.67C131.33 146.67 116.67 154 100 154Z"
        fill={color}
      />
    </Svg>
  );
};

export default MapIconSVG;
````

## File: src/components/MessageBubble.tsx
````typescript
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwnMessage }) => {
  return (
    <View style={[
      styles.container,
      isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
    ]}>
      <View style={[
        styles.bubble,
        isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble
      ]}>
        <Text style={styles.messageText}>{message.content}</Text>
        <Text style={styles.timeText}>
          {new Date(message.created_at).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    marginVertical: 4,
    maxWidth: '80%',
  },
  ownMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  ownMessageBubble: {
    backgroundColor: '#DCF8C6',
    borderBottomRightRadius: 5,
  },
  otherMessageBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#7B7B7B',
    alignSelf: 'flex-end',
  },
});

export default MessageBubble;
````

## File: src/components/UserLocationMarker.tsx
````typescript
import React from 'react';
import { StyleSheet, View, Text, Image } from 'react-native';
import { Marker } from 'react-native-maps';
import { User, Location } from '../types';

interface UserLocationMarkerProps {
  user: User;
  location: Location;
  isCurrentUser?: boolean;
  onPress?: () => void;
}

const UserLocationMarker: React.FC<UserLocationMarkerProps> = ({
  user,
  location,
  isCurrentUser = false,
  onPress
}) => {
  return (
    <Marker
      coordinate={{
        latitude: location.latitude,
        longitude: location.longitude,
      }}
      rotation={location.heading || 0}
      onPress={onPress}
    >
      <View style={styles.markerContainer}>
        <View 
          style={[
            styles.markerBubble,
            isCurrentUser ? styles.currentUserBubble : styles.otherUserBubble
          ]}
        >
          {user.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
          )}
        </View>
        <View 
          style={[
            styles.markerArrow,
            isCurrentUser ? styles.currentUserArrow : styles.otherUserArrow
          ]} 
        />
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
  },
  markerBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  currentUserBubble: {
    backgroundColor: '#4285F4',
  },
  otherUserBubble: {
    backgroundColor: '#DB4437',
  },
  markerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 10,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
  currentUserArrow: {
    borderTopColor: '#4285F4',
  },
  otherUserArrow: {
    borderTopColor: '#DB4437',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  avatarPlaceholder: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default UserLocationMarker;
````

## File: src/contexts/ConnectionContext.tsx
````typescript
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
````

## File: src/contexts/TripContext.tsx
````typescript
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useAuth } from './AuthContext';
import { Trip, UserRole } from '../types';
import { 
  getUserActiveTrip, 
  subscribeTripUpdates, 
  updateTripStatus 
} from '../services/TripService';

type TripContextType = {
  activeTrip: Trip | null;
  loading: boolean;
  startTrip: () => Promise<void>;
  completeTrip: () => Promise<void>;
  cancelTrip: () => Promise<void>;
  refreshTrip: () => Promise<void>;
};

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch active trip and subscribe to updates
  useEffect(() => {
    if (!user?.id) return;

    let unsubscribe: (() => void) | null = null;

    const fetchActiveTrip = async () => {
      setLoading(true);
      try {
        const { data, error } = await getUserActiveTrip(user.id);
        
        if (!error && data) {
          setActiveTrip(data);
          
          // Subscribe to trip updates
          unsubscribe = subscribeTripUpdates(data.id!, (updatedTrip) => {
            setActiveTrip(updatedTrip);
          });
        } else {
          setActiveTrip(null);
        }
      } catch (error) {
        console.error('Error fetching active trip:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchActiveTrip();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user?.id]);

  const startTrip = async () => {
    if (!activeTrip?.id || !user?.id) return;
    
    if (user.role === 'driver') {
      await updateTripStatus(activeTrip.id, 'in_progress');
    }
  };

  const completeTrip = async () => {
    if (!activeTrip?.id || !user?.id) return;
    
    if (user.role === 'driver' || user.id === activeTrip.passenger_id) {
      await updateTripStatus(activeTrip.id, 'completed');
    }
  };

  const cancelTrip = async () => {
    if (!activeTrip?.id || !user?.id) return;
    
    if (user.role === 'driver' || user.id === activeTrip.passenger_id) {
      await updateTripStatus(activeTrip.id, 'canceled');
    }
  };

  const refreshTrip = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await getUserActiveTrip(user.id);
      
      if (!error && data) {
        setActiveTrip(data);
      } else {
        setActiveTrip(null);
      }
    } catch (error) {
      console.error('Error refreshing trip:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TripContext.Provider
      value={{
        activeTrip,
        loading,
        startTrip,
        completeTrip,
        cancelTrip,
        refreshTrip,
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
};
````

## File: src/lib/supabase.ts
````typescript
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Direct hardcoded values from .env file
const supabaseUrl = 'https://moqakiplpdzwvzdurlnf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vcWFraXBscGR6d3Z6ZHVybG5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNzc0MjMsImV4cCI6MjA2MDk1MzQyM30.H0mVwr1GzPhygCZNlsuR1ozbLusNQovqQNerlt0WiV8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
````

## File: src/screens/LoginScreen.tsx
````typescript
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../contexts/AuthContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';

type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  Main: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const { signIn } = useAuth();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        Alert.alert('Login Failed', error.message);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const navigateToSignup = () => {
    navigation.navigate('Signup');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Live Location Chat</Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={navigateToSignup}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 100,
    marginBottom: 50,
  },
  logo: {
    width: 100,
    height: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#333',
  },
  formContainer: {
    paddingHorizontal: 30,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#4285F4',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: {
    color: '#333',
    fontSize: 14,
  },
  signupLink: {
    color: '#4285F4',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
````

## File: src/screens/ProfileScreen.tsx
````typescript
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

const ProfileScreen: React.FC = () => {
  const { user, signOut, updateProfile } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [role, setRole] = useState<UserRole>(user?.role || 'passenger');
  const [saving, setSaving] = useState(false);
  const [locationSharing, setLocationSharing] = useState(true);

  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    
    setSaving(true);
    try {
      const { error } = await updateProfile({
        full_name: fullName,
        role,
      });
      
      if (error) {
        Alert.alert('Error', error.message || 'Failed to update profile');
      } else {
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: signOut
        }
      ]
    );
  };

  const toggleLocationSharing = () => {
    setLocationSharing(!locationSharing);
    // Implement actual location sharing toggle logic here
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          {user?.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.profileImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <FontAwesome name="user" size={60} color="#ccc" />
            </View>
          )}
          
          {/* Image upload button, not implemented fully */}
          {isEditing && (
            <TouchableOpacity style={styles.editImageButton}>
              <FontAwesome name="camera" size={16} color="white" />
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.userInfoContainer}>
          {isEditing ? (
            <TextInput
              style={styles.nameInput}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your Name"
            />
          ) : (
            <Text style={styles.userName}>{user?.full_name || 'No Name'}</Text>
          )}
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
      </View>

      <View style={styles.content}>
        {isEditing ? (
          <View style={styles.editSection}>
            <Text style={styles.sectionTitle}>Select Role:</Text>
            <View style={styles.roleToggle}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'passenger' && styles.activeRoleButton,
                ]}
                onPress={() => setRole('passenger')}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    role === 'passenger' && styles.activeRoleButtonText,
                  ]}
                >
                  Passenger
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'driver' && styles.activeRoleButton,
                ]}
                onPress={() => setRole('driver')}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    role === 'driver' && styles.activeRoleButtonText,
                  ]}
                >
                  Driver
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setIsEditing(false);
                  setFullName(user?.full_name || '');
                  setRole(user?.role || 'passenger');
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSaveProfile}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Account Info</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Role</Text>
                <Text style={styles.infoValue}>
                  {user?.role ? (user.role === 'driver' ? 'Driver' : 'Passenger') : 'Not set'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Join Date</Text>
                <Text style={styles.infoValue}>
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                </Text>
              </View>
            </View>

            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>Settings</Text>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Location Sharing</Text>
                <Switch
                  value={locationSharing}
                  onValueChange={toggleLocationSharing}
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={locationSharing ? '#4285F4' : '#f4f3f4'}
                  ios_backgroundColor="#3e3e3e"
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={() => setIsEditing(true)}
            >
              <FontAwesome name="edit" size={16} color="white" style={styles.editIcon} />
              <Text style={styles.editProfileButtonText}>Edit Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <FontAwesome name="sign-out" size={16} color="white" style={styles.logoutIcon} />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#4285F4',
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  editImageButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#4285F4',
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  userInfoContainer: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  content: {
    padding: 20,
  },
  nameInput: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 5,
    fontSize: 18,
    width: 200,
    textAlign: 'center',
  },
  editSection: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  roleToggle: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  activeRoleButton: {
    backgroundColor: '#4285F4',
    borderColor: '#4285F4',
  },
  roleButtonText: {
    color: '#333',
  },
  activeRoleButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  infoSection: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
  },
  infoLabel: {
    color: '#666',
    fontSize: 16,
  },
  infoValue: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  settingsSection: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
  },
  settingLabel: {
    color: '#666',
    fontSize: 16,
  },
  editProfileButton: {
    flexDirection: 'row',
    backgroundColor: '#4285F4',
    borderRadius: 5,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  editIcon: {
    marginRight: 10,
  },
  editProfileButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#f44336',
    borderRadius: 5,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutIcon: {
    marginRight: 10,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ProfileScreen;
````

## File: src/services/ConnectionService.ts
````typescript
import { supabase } from '../lib/supabase';
import { User } from '../types';

export type Connection = {
  id?: string;
  initiator_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'active' | 'inactive';
  created_at: string;
  updated_at: string;
};

/**
 * Get all connections for the current user
 */
export const getUserConnections = async (userId: string): Promise<{
  data: Connection[] | null;
  error: any;
}> => {
  const { data, error } = await supabase
    .from('connections')
    .select('*')
    .or(`initiator_id.eq.${userId},receiver_id.eq.${userId}`)
    .in('status', ['accepted', 'active']);
  
  return { data: data as Connection[], error };
};

/**
 * Check if two users are connected
 */
export const checkConnectionStatus = async (
  userId1: string,
  userId2: string
): Promise<{
  isConnected: boolean;
  connection: Connection | null;
  error: any;
}> => {
  const { data, error } = await supabase
    .from('connections')
    .select('*')
    .or(`and(initiator_id.eq.${userId1},receiver_id.eq.${userId2}),and(initiator_id.eq.${userId2},receiver_id.eq.${userId1})`)
    .in('status', ['accepted', 'active'])
    .maybeSingle();
  
  return {
    isConnected: !!data,
    connection: data as Connection,
    error,
  };
};

/**
 * Create a connection request between users
 */
export const requestConnection = async (
  initiatorId: string,
  receiverId: string
): Promise<{ data: Connection | null; error: any }> => {
  // Check if connection already exists
  const { data: existingConn } = await supabase
    .from('connections')
    .select('*')
    .or(`and(initiator_id.eq.${initiatorId},receiver_id.eq.${receiverId}),and(initiator_id.eq.${receiverId},receiver_id.eq.${initiatorId})`)
    .maybeSingle();
  
  if (existingConn) {
    // If connection exists but is inactive, reactivate it
    if (existingConn.status === 'inactive' || existingConn.status === 'rejected') {
      const { data, error } = await supabase
        .from('connections')
        .update({ 
          status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', existingConn.id)
        .select()
        .single();
      
      return { data: data as Connection, error };
    }
    
    // Otherwise return existing connection
    return { data: existingConn as Connection, error: null };
  }
  
  // Create new connection
  const newConnection = {
    initiator_id: initiatorId,
    receiver_id: receiverId,
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  const { data, error } = await supabase
    .from('connections')
    .insert(newConnection)
    .select()
    .single();
  
  return { data: data as Connection, error };
};

/**
 * Accept a connection request
 */
export const acceptConnection = async (
  connectionId: string,
  userId: string
): Promise<{ data: Connection | null; error: any }> => {
  const { data, error } = await supabase
    .from('connections')
    .update({
      status: 'accepted',
      updated_at: new Date().toISOString(),
    })
    .eq('id', connectionId)
    .eq('receiver_id', userId) // Ensure the user accepting is the receiver
    .select()
    .single();
  
  return { data: data as Connection, error };
};

/**
 * Reject a connection request
 */
export const rejectConnection = async (
  connectionId: string,
  userId: string
): Promise<{ error: any }> => {
  const { error } = await supabase
    .from('connections')
    .update({
      status: 'rejected',
      updated_at: new Date().toISOString(),
    })
    .eq('id', connectionId)
    .eq('receiver_id', userId); // Ensure the user rejecting is the receiver
  
  return { error };
};

/**
 * End an active connection
 */
export const endConnection = async (
  connectionId: string,
  userId: string
): Promise<{ error: any }> => {
  const { error } = await supabase
    .from('connections')
    .update({
      status: 'inactive',
      updated_at: new Date().toISOString(),
    })
    .eq('id', connectionId)
    .or(`initiator_id.eq.${userId},receiver_id.eq.${userId}`); // Either user can end the connection
  
  return { error };
};

/**
 * Get pending connection requests for a user
 */
export const getPendingConnections = async (
  userId: string
): Promise<{ data: (Connection & { initiator: User })[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('connections')
    .select('*, initiator:users!initiator_id(*)')
    .eq('receiver_id', userId)
    .eq('status', 'pending');
  
  return { data: data as (Connection & { initiator: User })[], error };
};

/**
 * Subscribe to connection changes
 */
export const subscribeToConnections = (
  userId: string,
  callback: (connection: Connection) => void
) => {
  const channel = supabase
    .channel(`connections:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'connections',
        filter: `or(initiator_id=eq.${userId},receiver_id=eq.${userId})`,
      },
      (payload) => {
        callback(payload.new as Connection);
      }
    )
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
};
````

## File: src/services/TripService.ts
````typescript
import { supabase } from '../lib/supabase';
import { Trip } from '../types';

// Create a new trip request
export const createTripRequest = async (
  passengerId: string,
  pickupLocation: { latitude: number; longitude: number; address?: string },
  destination: { latitude: number; longitude: number; address?: string }
): Promise<{ data: Trip | null; error: any }> => {
  const newTrip = {
    passenger_id: passengerId,
    pickup_location: pickupLocation,
    destination,
    status: 'requested',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('trips')
    .insert(newTrip)
    .select()
    .single();

  return { data: data as Trip, error };
};

// Fetch available trip requests for drivers
export const getAvailableTrips = async (): Promise<{ data: Trip[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('trips')
    .select('*, passengers:users!passenger_id(*)')
    .eq('status', 'requested')
    .order('created_at', { ascending: false });

  return { data: data as Trip[], error };
};

// Accept a trip request
export const acceptTripRequest = async (
  tripId: string,
  driverId: string
): Promise<{ data: Trip | null; error: any }> => {
  const { data, error } = await supabase
    .from('trips')
    .update({
      driver_id: driverId,
      status: 'accepted',
      updated_at: new Date().toISOString(),
    })
    .eq('id', tripId)
    .eq('status', 'requested') // Make sure the trip is still in 'requested' status
    .select()
    .single();

  return { data: data as Trip, error };
};

// Update trip status
export const updateTripStatus = async (
  tripId: string,
  status: 'requested' | 'accepted' | 'in_progress' | 'completed' | 'canceled'
): Promise<{ data: Trip | null; error: any }> => {
  const { data, error } = await supabase
    .from('trips')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', tripId)
    .select()
    .single();

  return { data: data as Trip, error };
};

// Get trip by ID
export const getTripById = async (tripId: string): Promise<{ data: Trip | null; error: any }> => {
  const { data, error } = await supabase
    .from('trips')
    .select('*, passengers:users!passenger_id(*), drivers:users!driver_id(*)')
    .eq('id', tripId)
    .single();

  return { data: data as Trip, error };
};

// Get user's active trip (as passenger or driver)
export const getUserActiveTrip = async (userId: string): Promise<{ data: Trip | null; error: any }> => {
  // First check if user is a passenger in an active trip
  let { data, error } = await supabase
    .from('trips')
    .select('*, drivers:users!driver_id(*)')
    .eq('passenger_id', userId)
    .in('status', ['requested', 'accepted', 'in_progress'])
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();

  if (data) {
    return { data: data as Trip, error };
  }

  // If not found as passenger, check if user is a driver
  ({ data, error } = await supabase
    .from('trips')
    .select('*, passengers:users!passenger_id(*)')
    .eq('driver_id', userId)
    .in('status', ['accepted', 'in_progress'])
    .order('updated_at', { ascending: false })
    .limit(1)
    .single());

  return { data: data as Trip, error };
};

// Subscribe to trip status updates
export const subscribeTripUpdates = (tripId: string, callback: (trip: Trip) => void) => {
  const channel = supabase
    .channel(`trip:${tripId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'trips',
        filter: `id=eq.${tripId}`,
      },
      (payload) => {
        callback(payload.new as Trip);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// Get user's trip history
export const getUserTripHistory = async (
  userId: string,
  limit = 10,
  offset = 0
): Promise<{ data: Trip[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('trips')
    .select('*, passengers:users!passenger_id(*), drivers:users!driver_id(*)')
    .or(`passenger_id.eq.${userId},driver_id.eq.${userId}`)
    .in('status', ['completed', 'canceled'])
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1);

  return { data: data as Trip[], error };
};
````

## File: src/utils/dateUtils.ts
````typescript
/**
 * Utility functions for date and time formatting
 */

/**
 * Format a timestamp to display in chat messages
 * @param timestamp ISO string date
 */
export const formatMessageTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  
  // Format time part (hours:minutes)
  const timeFormatOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  };
  
  if (isToday) {
    // If message is from today, just show the time
    return date.toLocaleTimeString([], timeFormatOptions);
  } else if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
    // If message is from this week, show the day name and time
    return `${date.toLocaleDateString([], { weekday: 'short' })} ${date.toLocaleTimeString([], timeFormatOptions)}`;
  } else {
    // Otherwise show month, day and time
    return `${date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    })} ${date.toLocaleTimeString([], timeFormatOptions)}`;
  }
};

/**
 * Format a timestamp for chat session headers or grouping
 * @param timestamp ISO string date
 */
export const formatMessageDate = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === date.toDateString();
  
  if (isToday) {
    return 'Today';
  } else if (isYesterday) {
    return 'Yesterday';
  } else if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) {
    // If within the last week, show the day name
    return date.toLocaleDateString([], { weekday: 'long' });
  } else {
    // Otherwise show full date
    return date.toLocaleDateString([], {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }
};

/**
 * Format a relative time for "last seen" or similar displays
 * @param timestamp ISO string date
 */
export const formatRelativeTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffSeconds < 60) {
    return 'just now';
  } else if (diffSeconds < 3600) {
    const minutes = Math.floor(diffSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffSeconds < 86400) {
    const hours = Math.floor(diffSeconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else if (diffSeconds < 604800) {
    const days = Math.floor(diffSeconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  } else {
    // If more than a week, just show the date
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
};
````

## File: src/utils/environment.ts
````typescript
/**
 * Environment utility for managing configuration settings
 */

// Import environment variables - in a real app, use a proper environment loading library
// For now, we'll use hard-coded values with a note to replace them
const ENV = {
  SUPABASE_URL: process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL_HERE',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY_HERE',
};

/**
 * Get environment variable by key
 */
export const getEnv = (key: keyof typeof ENV): string => {
  return ENV[key];
};

/**
 * Check if environment is correctly configured
 */
export const isEnvironmentConfigured = (): boolean => {
  return (
    ENV.SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE' &&
    ENV.SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY_HERE'
  );
};

/**
 * Get user-friendly error message for missing environment configuration
 */
export const getEnvironmentErrorMessage = (): string => {
  const missingVars = [];
  
  if (ENV.SUPABASE_URL === 'YOUR_SUPABASE_URL_HERE') {
    missingVars.push('SUPABASE_URL');
  }
  
  if (ENV.SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY_HERE') {
    missingVars.push('SUPABASE_ANON_KEY');
  }
  
  return `Missing environment variables: ${missingVars.join(', ')}. Please update the .env file.`;
};
````

## File: src/utils/locationUtils.ts
````typescript
/**
 * Utility functions for location-related calculations
 */

import { Location } from '../types';

/**
 * Calculate the distance between two locations in kilometers
 * Uses the Haversine formula
 */
export const calculateDistance = (
  location1: { latitude: number; longitude: number },
  location2: { latitude: number; longitude: number }
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(location2.latitude - location1.latitude);
  const dLon = toRad(location2.longitude - location1.longitude);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(location1.latitude)) *
      Math.cos(toRad(location2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
      
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

/**
 * Convert degrees to radians
 */
const toRad = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

/**
 * Calculate estimated time of arrival in minutes
 * @param distance Distance in kilometers
 * @param speed Speed in km/h (defaults to 30 km/h for urban travel)
 */
export const calculateETA = (distance: number, speed = 30): number => {
  // Convert speed from km/h to km/minute
  const speedInKmPerMinute = speed / 60;
  // Calculate time in minutes
  return distance / speedInKmPerMinute;
};

/**
 * Format the estimated time of arrival into a human-readable string
 * @param etaMinutes ETA in minutes
 */
export const formatETA = (etaMinutes: number): string => {
  if (etaMinutes < 1) {
    return 'Less than a minute';
  }
  
  if (etaMinutes < 60) {
    const minutes = Math.round(etaMinutes);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  const hours = Math.floor(etaMinutes / 60);
  const minutes = Math.round(etaMinutes % 60);
  
  let result = `${hours} hour${hours !== 1 ? 's' : ''}`;
  if (minutes > 0) {
    result += ` ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  return result;
};

/**
 * Get a formatted address from coordinates using reverse geocoding
 * This is a placeholder - in a production app, you would use a geocoding service
 */
export const getAddressFromCoordinates = async (
  latitude: number,
  longitude: number
): Promise<string> => {
  // Placeholder - in a real app, you would implement reverse geocoding
  // using Google Maps Geocoding API, Mapbox, or another service
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
};
````

## File: supabase/migrations/20250422_init.sql
````sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('driver', 'passenger')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  heading DOUBLE PRECISION,
  speed DOUBLE PRECISION,
  trip_id UUID,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  trip_id UUID,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passenger_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES users(id) ON DELETE SET NULL,
  pickup_location JSONB NOT NULL,
  destination JSONB NOT NULL,
  status TEXT CHECK (status IN ('requested', 'accepted', 'in_progress', 'completed', 'canceled')) DEFAULT 'requested',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create RLS policies

-- Users policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view other users"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Locations policies
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view any location"
  ON locations FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own location"
  ON locations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own location"
  ON locations FOR UPDATE
  USING (auth.uid() = user_id);

-- Messages policies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own messages"
  ON messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update read status of their received messages"
  ON messages FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Trips policies
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view trips they're involved in"
  ON trips FOR SELECT
  USING (auth.uid() = passenger_id OR auth.uid() = driver_id);

CREATE POLICY "Passengers can create trips"
  ON trips FOR INSERT
  WITH CHECK (auth.uid() = passenger_id);

CREATE POLICY "Drivers or passengers can update trip status"
  ON trips FOR UPDATE
  USING (auth.uid() = passenger_id OR auth.uid() = driver_id);

-- Set up realtime subscriptions
ALTER publication supabase_realtime ADD TABLE locations;
ALTER publication supabase_realtime ADD TABLE messages;
ALTER publication supabase_realtime ADD TABLE trips;
````

## File: .env.example
````
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
````

## File: .gitignore
````
# Learn more https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files

# dependencies
node_modules/

# Expo
.expo/
dist/
web-build/
expo-env.d.ts

# Native
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision

# Metro
.metro-health-check*

# debug
npm-debug.*
yarn-debug.*
yarn-error.*

# macOS
.DS_Store
*.pem

# local env files
.env*.local

# typescript
*.tsbuildinfo
# dependencies
node_modules/
.pnp
.pnp.js

# testing
coverage/

# Expo
.expo/
web-build/
dist/

# Native
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision

# Metro
.metro-health-check*

# debug
npm-debug.*
yarn-debug.*
yarn-error.*

# macOS
.DS_Store
*.pem

# local env files
.env
.env*.local

# typescript
*.tsbuildinfo

# Supabase
.supabase/

# IDE
.idea/
.vscode/
````

## File: .repomixignore
````
# Add patterns to ignore here, one per line
# Example:
# *.log
# tmp/
````

## File: app.json
````json
{
  "expo": {
    "name": "Live Location Chat",
    "slug": "chat-live-location-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#4285F4"
    },
    "ios": {
      "supportsTablet": true,
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "We need your location to show you on the map and share with other users.",
        "NSLocationAlwaysAndWhenInUseUsageDescription": "We need your location to show you on the map and share with other users.",
        "UIBackgroundModes": [
          "location",
          "fetch"
        ]
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#4285F4"
      },
      "permissions": [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
````

## File: babel.config.js
````javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
    ],
  };
};
````

## File: index.ts
````typescript
import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
````

## File: LICENSE
````
MIT License

Copyright (c) 2025

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

## File: package.json
````json
{
  "name": "chat-live-location-app",
  "version": "1.0.0",
  "main": "index.ts",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "@react-native-async-storage/async-storage": "1.23.1",
    "@react-navigation/bottom-tabs": "^6.5.16",
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/stack": "^6.3.20",
    "@supabase/supabase-js": "^2.49.4",
    "expo": "~52.0.46",
    "expo-linking": "^7.0.5",
    "expo-location": "~18.0.10",
    "expo-secure-store": "^14.0.1",
    "expo-status-bar": "~2.0.1",
    "react": "18.3.1",
    "react-native": "0.76.9",
    "react-native-gesture-handler": "~2.20.2",
    "react-native-maps": "1.18.0",
    "react-native-paper": "^5.10.4",
    "react-native-reanimated": "~3.16.1",
    "react-native-safe-area-context": "4.12.0",
    "react-native-screens": "~4.4.0",
    "react-native-svg": "15.8.0"
  },
  "devDependencies": {
    "@babel/core": "^7.25.2",
    "@types/react": "~18.3.12",
    "typescript": "^5.3.3"
  },
  "private": true,
  "packageManager": "yarn@1.22.22+sha512.a6b2f7906b721bba3d67d4aff083df04dad64c399707841b7acf00f6b133b7ac24255f2652fa22ae3534329dc6180534e98d17432037ff6fd140556e2bb3137e"
}
````

## File: README.md
````markdown
# Live Location Chat App

A mobile application built with React Native/Expo and Supabase that enables real-time location sharing and messaging between users. Inspired by the Uber driver-passenger interaction flow, this app allows users to see each other's live location on a map and communicate through real-time chat.

## Features

- **User Authentication**
  - Sign up and login functionality
  - Profile management
  - Role-based access (drivers and passengers)

- **Real-Time Location Sharing**
  - Live location tracking and updates
  - Location sharing toggle
  - Map visualization of all active users

- **Real-Time Chat**
  - One-to-one messaging
  - Message history
  - Read status
  - Real-time updates

- **Interactive Maps**
  - Current location display
  - Other users' locations
  - Smooth animations and updates

## Tech Stack

### Frontend
- **Expo/React Native** - Cross-platform mobile application framework
- **TypeScript** - For type-safe code
- **React Navigation** - For screen navigation
- **Expo Location** - For accessing device location
- **React Native Maps** - For map visualization

### Backend
- **Supabase** - Backend as a Service
  - Authentication
  - PostgreSQL Database
  - Real-time subscriptions
  - Row Level Security policies

## Project Structure

```
/src
  /components       # Reusable UI components
  /screens          # App screens
  /contexts         # React contexts for state management
  /hooks            # Custom React hooks
  /lib              # External library configurations
  /navigation       # Navigation setup
  /services         # Business logic and API calls
  /types            # TypeScript type definitions
  /utils            # Utility functions
/assets             # Images, fonts, etc.
/supabase           # Supabase-related configurations and migrations
```

## Implementation Details

### Key Features Implemented

- **Authentication System**
  - Complete email/password authentication flow using Supabase Auth
  - User profiles with role selection (driver/passenger)
  - Secure token storage and session management

- **Real-Time Location Tracking**
  - Location permission handling and background tracking
  - Real-time updates using Supabase's Realtime capabilities
  - Custom map markers for visualizing users on the map

- **Real-Time Chat**
  - One-to-one messaging with real-time updates
  - Message history with pagination support
  - Read status tracking and message timestamps

- **Trip Management**
  - Trip status tracking (requested, accepted, in progress, completed)
  - Integration with the map for route visualization
  - Trip-specific chat context

### Directory Structure

```
/src
  /components      # Reusable UI components like MessageBubble, UserLocationMarker
  /contexts        # React contexts for Authentication and Trip management
  /hooks           # Custom hooks for location tracking
  /lib             # External library configurations (Supabase)
  /navigation      # App navigation structure
  /screens         # Main app screens (Login, Map, Chat, etc.)
  /services        # Business logic (LocationService, ChatService, TripService)
  /types           # TypeScript type definitions
  /utils           # Utility functions for dates, locations, etc.
/assets            # App icons and images
/supabase          # Supabase database migrations
```

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Supabase account

### Installation Steps

1. **Clone the repository**

2. **Install dependencies**
   ```bash
   cd chat-live-location-app
   npm install
   ```

3. **Supabase Setup**
   - Create a new Supabase project at https://app.supabase.io
   - Run the SQL migrations from `/supabase/migrations/20250422_init.sql`
   - Enable the Realtime feature in your Supabase project settings
   - Update the Supabase URL and anon key in `.env` file

4. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials:
     ```
     SUPABASE_URL=https://your-project-id.supabase.co
     SUPABASE_ANON_KEY=your-anon-key
     ```

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Run on a device or emulator**
   - Press `a` for Android
   - Press `i` for iOS
   - Scan QR code with the Expo Go app on your physical device

## Security

- Authentication is handled by Supabase Auth
- Row Level Security (RLS) policies are implemented for all tables
- Sensitive data is protected with proper access controls

## Current Status and Next Steps

The app has a fully functional implementation of the core features:

✅ User Authentication and Profile Management  
✅ Real-time Location Sharing  
✅ Interactive Map with Custom Markers  
✅ Real-time Chat System  
✅ Trip Management Context and State Handling  

Next development priorities:

1. **Complete Push Notifications**  
   - Implement Expo Notifications for chat messages and trip updates
   - Add notification preferences in user settings

2. **Enhance Trip Management**  
   - Add a trip request form for passengers
   - Implement driver-passenger matching algorithm
   - Create trip history view and ratings

3. **Optimize for Performance**  
   - Add offline capabilities with local data caching
   - Optimize battery usage for location tracking
   - Implement data synchronization strategies

4. **Expand Features**  
   - Add voice/video messaging
   - Implement route visualization and ETA calculation
   - Add payment integration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
````

## File: repomix.config.json
````json
{
  "input": {
    "maxFileSize": 52428800
  },
  "output": {
    "filePath": "repomix-output.md",
    "style": "markdown",
    "parsableStyle": false,
    "fileSummary": true,
    "directoryStructure": true,
    "files": true,
    "removeComments": false,
    "removeEmptyLines": false,
    "compress": false,
    "topFilesLength": 5,
    "showLineNumbers": false,
    "copyToClipboard": false,
    "git": {
      "sortByChanges": true,
      "sortByChangesMaxCommits": 100
    }
  },
  "include": [],
  "ignore": {
    "useGitignore": true,
    "useDefaultPatterns": true,
    "customPatterns": []
  },
  "security": {
    "enableSecurityCheck": true
  },
  "tokenCount": {
    "encoding": "o200k_base"
  }
}
````

## File: tsconfig.json
````json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true
  }
}
````

## File: src/contexts/AuthContext.tsx
````typescript
import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User } from '../types';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, userData?: Partial<User>) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<{ error: any }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'SIGNED_IN' && session?.user) {
        fetchUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    // Get the user profile
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle(); // Use maybeSingle instead of single to avoid error when no results

    if (error) {
      console.error('Error fetching user profile:', error);
      return;
    }
    
    // If user profile exists, set it
    if (data) {
      console.log('User profile found:', data);
      setUser(data as User);
    } else {
      console.warn('User authenticated but no profile found. Creating profile automatically.');
      
      // Get user email from session
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        // Create a basic profile for the authenticated user
        const newUser: User = {
          id: userId,
          email: authUser.email || 'unknown@example.com',
          full_name: authUser.email ? authUser.email.split('@')[0] : 'User',
          role: 'passenger', // Default role
          created_at: new Date().toISOString(),
        };
        
        // Simpler alternative to bypass RLS issues - The client with AUTH headers should be able to 
        // insert their own user record if the RLS policy is set correctly
        console.log('Attempting to create new user profile with ID matching auth.uid()');
        
        // Try regular insert first
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            ...newUser,
            // Ensure ID matches the authenticated user ID exactly
            id: userId
          });
          
        // If that fails due to RLS, log the complete error for debugging
        if (insertError) {
          console.log('Full insert error details:', JSON.stringify(insertError));
        }
        
        // Only log the error but still set the user object in memory
        // This allows the app to function even if the database insert fails
        if (insertError) {
          console.error('Error creating user profile:', insertError);
          
          // Set the user in memory anyway so the app can function
          console.log('Setting user in memory despite database error');
          setUser(newUser);
        } else {
          console.log('Successfully created user profile');
          setUser(newUser);
        }
      }
    }
  };

  const signUp = async (email: string, password: string, userData?: Partial<User>) => {
    console.log('SignUp called with userData:', userData);
    
    // First sign up the user with Supabase Auth
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
    });
    
    // If signup is successful, create the user profile
    if (!error && data.user) {
      console.log('Auth signup successful, user ID:', data.user.id);
      console.log('Creating profile with role:', userData?.role);
      
      try {
        // Wait for the session to be established
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Explicitly save the role - this is the value we need to ensure is used
        const userRole = userData?.role || 'passenger';
        console.log('Using role for new user:', userRole);
        
        // Get any existing session to ensure RLS policies work correctly
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData.session) {
          console.log('No valid session available for profile creation');
        }
        
        // We need to ensure the user exists first before we can update the role
        const { data: checkUser } = await supabase
          .from('users')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();
          
        if (!checkUser) {
          // Try to create a basic user record first
          console.log('User record does not exist yet, creating basic record...');
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email: email,
              full_name: userData?.full_name || email.split('@')[0],
              created_at: new Date().toISOString()
            });
            
          if (insertError) {
            console.log('Error creating basic user record:', insertError);
          } else {
            console.log('Basic user record created successfully');
          }
        } else {
          console.log('User record already exists');
        }
        
        // Now use the admin function to update the role directly
        console.log('Using admin function to update role to:', userRole);
        const { error: rpcError } = await supabase.rpc(
          'admin_update_user_role',
          { 
            user_id: data.user.id,
            new_role: userRole
          }
        );
        
        if (rpcError) {
          console.error('Error updating role via admin function:', rpcError);
        } else {
          console.log('Role updated successfully via admin function');
        }
        
        // Verify the role was set correctly
        const { data: verifyData, error: verifyError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (verifyError) {
          console.error('Error verifying user data:', verifyError);
        } else {
          console.log('Verified user data:', verifyData);
          console.log('VERIFIED ROLE IN DATABASE:', verifyData.role);
          setUser(verifyData as User);
        }
      } catch (error) {
        console.error('Exception during profile creation:', error);
      }
    }
    
    return { error };
  };
  
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user?.id) return { error: new Error('User not authenticated') };

    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id);

    if (!error) {
      setUser({ ...user, ...updates });
    }

    return { error };
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
````

## File: src/navigation/AppNavigator.tsx
````typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, Alert, Linking } from 'react-native';
import * as Location from 'expo-location';
import { useAuth } from '../contexts/AuthContext';

// Screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import MapScreen from '../screens/MapScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import UserListScreen from '../screens/UsersListScreen';

// Settings Screen
const SettingsScreen = () => {
  const [locationPermission, setLocationPermission] = React.useState('checking...');
  
  React.useEffect(() => {
    const checkPermission = async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        setLocationPermission(status);
      } catch (error) {
        console.error('Error checking location permission:', error);
        setLocationPermission('error');
      }
    };
    
    checkPermission();
  }, []);
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 20 }}>
        Settings
      </Text>
      <View style={{ marginBottom: 20, width: '100%' }}>
        <Text style={{ fontSize: 18, marginBottom: 10 }}>
          Location Permission: {locationPermission}
        </Text>
        <TouchableOpacity 
          style={{
            backgroundColor: '#4285F4',
            padding: 15,
            borderRadius: 10,
            alignItems: 'center',
          }}
          onPress={async () => {
            try {
              await Linking.openSettings();
            } catch (error) {
              console.error('Error opening settings:', error);
              Alert.alert('Error', 'Could not open settings');
            }
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Open Location Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Stack Navigator Param Lists
export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  Chat: {
    userId: string;
    userName: string;
    tripId?: string;
  };
};

export type TabParamList = {
  Map: undefined;
  Users: undefined;
  Profile: undefined;
  Settings: undefined;
};

// Create navigators
const AuthStack = createStackNavigator<AuthStackParamList>();
const MainStack = createStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Auth navigator
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
};

// Tab navigator
const MainTabNavigator = () => {
  const { user } = useAuth();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: any = 'question-circle';
          
          if (route.name === 'Map') {
            iconName = 'map';
          } else if (route.name === 'Users') {
            iconName = 'users';
          } else if (route.name === 'Profile') {
            iconName = 'user';
          } else if (route.name === 'Settings') {
            iconName = 'cog';
          }
          
          return <FontAwesome name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4285F4',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
      })}
    >
      <Tab.Screen name="Map" component={MapScreen} options={{ title: 'Live Map' }} />
      <Tab.Screen 
        name="Users" 
        component={UserListScreen} 
        options={{ 
          title: user?.role === 'driver' ? 'Passengers' : 'Drivers' 
        }} 
      />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
};

// Main navigator with tabs and chat
const MainNavigator = () => {
  return (
    <MainStack.Navigator>
      <MainStack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <MainStack.Screen
        name="Chat"
        component={ChatScreen}
        options={({ route }: any) => ({
          title: route.params.userName,
        })}
      />
    </MainStack.Navigator>
  );
};

// Root navigator
export const AppNavigator = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      {session ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator;
````

## File: src/screens/MapScreen.tsx
````typescript
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Alert, Linking } from 'react-native';
import MapView from 'react-native-maps';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { useTrip } from '../contexts/TripContext';
import { useConnection } from '../contexts/ConnectionContext';
import useLocationTracking from '../hooks/useLocationTracking';
import UserLocationMarker from '../components/UserLocationMarker';
import { MainStackParamList } from '../navigation/AppNavigator';
import { supabase } from '../lib/supabase';
import { User, Location as LocationType } from '../types';

const { width, height } = Dimensions.get('window');
type MapScreenNavigationProp = StackNavigationProp<MainStackParamList, 'MainTabs'>;

const MapScreen: React.FC = () => {
  const { user } = useAuth();
  const { activeTrip } = useTrip();
  const { connections, isConnectedWithUser } = useConnection();
  const navigation = useNavigation<MapScreenNavigationProp>();
  
  const [connectedUsers, setConnectedUsers] = useState<Map<string, User>>(new Map());
  // Store connection IDs as strings instead of objects to avoid dependency issues
  const [activeConnectionIds, setActiveConnectionIds] = useState<string[]>([]);
  
  const mapRef = useRef<MapView>(null);
  
  // Calculate connected user IDs - crucial to prevent infinite loops
  const getConnectedUserIds = useCallback(() => {
    if (!user?.id) return [];
    
    const userIds: string[] = [];
    
    // Include trip-related users if there's an active trip
    if (activeTrip) {
      if (activeTrip.passenger_id && activeTrip.passenger_id !== user.id) {
        userIds.push(activeTrip.passenger_id);
      }
      if (activeTrip.driver_id && activeTrip.driver_id !== user.id) {
        userIds.push(activeTrip.driver_id);
      }
    }
    
    // Include users from active connections
    if (connections) {
      // Use values() to iterate over connections Map
      Array.from(connections.values()).forEach(conn => {
        if (!conn) return;
        const otherUserId = conn.initiator_id === user.id ? conn.receiver_id : conn.initiator_id;
        if (!userIds.includes(otherUserId)) {
          userIds.push(otherUserId);
        }
      });
    }
    
    return userIds;
  }, [user?.id, activeTrip, connections && Array.from(connections.keys()).join(',')]);
  
  // Get the actual user IDs once using the callback - prevent re-renders
  const initialUserIds = React.useMemo(() => getConnectedUserIds(), 
    [getConnectedUserIds]);
    
  const {
    myLocation,
    userLocations,
    isTracking,
    permissionGranted,
    toggleTracking,
    subscribeToUserLocation,
    unsubscribeFromUserLocation,
  } = useLocationTracking(initialUserIds);

  // Fetch information about connected users - without creating dependencies on locations
  useEffect(() => {
    if (!user?.id) return;
    
    const connectedUserIds = getConnectedUserIds();
    
    const fetchConnectedUsers = async () => {
      try {
        if (connectedUserIds.length === 0) {
          setConnectedUsers(new Map());
          return;
        }
        
        // Get user details for all connected users
        const { data } = await supabase
          .from('users')
          .select('*')
          .in('id', connectedUserIds);

        if (data && data.length > 0) {
          const usersMap = new Map<string, User>();
          
          data.forEach(userData => {
            usersMap.set(userData.id, userData as User);
            // Subscribe to their location updates
            subscribeToUserLocation(userData.id);
          });
          
          setConnectedUsers(usersMap);
        }
      } catch (error) {
        console.error('Error fetching connected users:', error);
      }
    };
    
    fetchConnectedUsers();
    
    // Cleanup function to unsubscribe from locations
    return () => {
      connectedUserIds.forEach(userId => {
        unsubscribeFromUserLocation(userId);
      });
    };
  }, [user?.id, getConnectedUserIds]);

  // Center map on current location when it changes
  useEffect(() => {
    if (myLocation) {
      animateToLocation(myLocation.latitude, myLocation.longitude);
    }
  }, [myLocation?.latitude, myLocation?.longitude]);

  // If location permission was denied, show alert with option to open settings
  useEffect(() => {
    if (permissionGranted === false) {
      Alert.alert(
        'Location Permission Denied',
        'We need your location to show you on the map. Please enable location services.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open Settings', 
            onPress: () => {
              Linking.openSettings();
            }
          }
        ]
      );
    }
  }, [permissionGranted]);

  // Safely handle setting connection IDs - extract IDs only to avoid object references
  useEffect(() => {
    if (connections) {
      setActiveConnectionIds(Array.from(connections.keys()));
    }
  }, [connections]);

  const animateToLocation = (latitude: number, longitude: number) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };
  
  const handleMarkerPress = (userId: string) => {
    const selectedUser = connectedUsers.get(userId);
    if (selectedUser) {
      navigation.navigate('Chat', {
        userId,
        userName: selectedUser.full_name || 'User',
        tripId: activeTrip?.id,
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with navigation title */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live Map</Text>
        {connectedUsers.size === 0 && !isTracking && (
          <Text style={styles.headerSubtitle}>
            No connected users. Connect with users in the Users tab.
          </Text>
        )}
      </View>
      
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation
        showsMyLocationButton
        followsUserLocation
      >
        {/* Render current user location */}
        {myLocation && user && (
          <UserLocationMarker
            user={user}
            location={myLocation}
            isCurrentUser={true}
          />
        )}

        {/* Render connected users' locations */}
        {Array.from(userLocations.entries()).map(([userId, location]) => {
          const otherUser = connectedUsers.get(userId);
          
          // Only show users that we're connected with
          if (otherUser && isConnectedWithUser(userId)) {
            return (
              <UserLocationMarker
                key={userId}
                user={otherUser}
                location={location}
                onPress={() => handleMarkerPress(userId)}
              />
            );
          }
          return null;
        })}
      </MapView>

      {/* Location tracking toggle button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, isTracking ? styles.activeButton : {}]}
          onPress={toggleTracking}
        >
          <FontAwesome
            name={isTracking ? "stop-circle" : "play-circle"}
            size={24}
            color="white"
          />
          <Text style={styles.buttonText}>
            {isTracking ? "Stop Sharing" : "Share Location"}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Trip information if there's an active trip */}
      {activeTrip && (
        <View style={styles.tripContainer}>
          <Text style={styles.tripTitle}>
            {activeTrip.status === 'requested' ? 'Trip Requested' :
             activeTrip.status === 'accepted' ? 'Trip Accepted' :
             activeTrip.status === 'in_progress' ? 'Trip In Progress' : 'Trip'}
          </Text>
          <Text style={styles.tripText}>
            {user?.role === 'driver' ? 'Passenger: ' : 'Driver: '}
            {user?.role === 'driver' ? 
              connectedUsers.get(activeTrip.passenger_id)?.full_name || 'Passenger' :
              connectedUsers.get(activeTrip.driver_id || '')?.full_name || 'Looking for driver...'}
          </Text>
          <TouchableOpacity
            style={styles.chatButton}
            onPress={() => {
              const otherUserId = user?.role === 'driver' ? 
                activeTrip.passenger_id : 
                activeTrip.driver_id;
              
              if (otherUserId) {
                navigation.navigate('Chat', {
                  userId: otherUserId,
                  userName: connectedUsers.get(otherUserId)?.full_name || 'User',
                  tripId: activeTrip.id,
                });
              }
            }}
          >
            <FontAwesome name="comment" size={20} color="white" />
            <Text style={styles.chatButtonText}>Chat</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Empty state message when no connections */}
      {connectedUsers.size === 0 && (
        <View style={styles.emptyStateOverlay}>
          <FontAwesome name="users" size={60} color="#ccc" />
          <Text style={styles.emptyStateTitle}>No Connected Users</Text>
          <Text style={styles.emptyStateText}>
            Connect with {user?.role === 'driver' ? 'passengers' : 'drivers'} in the Users tab to see them on the map.
          </Text>
          <TouchableOpacity
            style={styles.findUsersButton}
            onPress={() => {
              // Navigate back to the main tabs first, then programmatically select the Users tab
              navigation.navigate('MainTabs');
              // The actual tab switch will happen via the tab UI
            }}
          >
            <FontAwesome name="search" size={16} color="white" style={styles.buttonIcon} />
            <Text style={styles.findUsersButtonText}>
              Find {user?.role === 'driver' ? 'Passengers' : 'Drivers'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#4285F4',
    paddingTop: 40, // For status bar
    paddingBottom: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
    zIndex: 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  map: {
    width,
    height: height - 60, // Subtract header height
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
  },
  button: {
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  activeButton: {
    backgroundColor: '#DB4437',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  tripContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  tripText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  chatButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  chatButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  emptyStateOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  findUsersButton: {
    backgroundColor: '#4285F4',
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  findUsersButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default MapScreen;
````

## File: src/screens/SignupScreen.tsx
````typescript
import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../contexts/AuthContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { UserRole } from '../types';

// Existing debug function remains the same
const debugSignupProcess = async (email: string, password: string, fullName: string, selectedRole: UserRole) => {
  // ... keep existing implementation
};

type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  Main: undefined;
};

type SignupScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Signup'>;

const SignupScreen: React.FC = () => {
  const { signUp } = useAuth();
  const navigation = useNavigation<SignupScreenNavigationProp>();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('passenger');
  const [loading, setLoading] = useState(false);
  
  // Add these new state variables for rate limiting
  const [rateLimited, setRateLimited] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Add this effect to log role changes
  useEffect(() => {
    console.log('Current selected role:', role);
  }, [role]);
  
  // Add this effect to clean up timer
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleSignup = async () => {
    if (!email.trim() || !password.trim() || !fullName.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    
    // Check if rate limited
    if (rateLimited) {
      Alert.alert('Rate Limited', `Please try again in ${timeRemaining} seconds.`);
      return;
    }
    
    console.log('About to call signUp with role:', role);
    
    // Debug process - keep this
    await debugSignupProcess(email, password, fullName, role);

    setLoading(true);
    try {
      // Pass user data directly to the signUp method
      const userData = {
        full_name: fullName,
        role, // Make sure role is being passed correctly
      };
      
      console.log('Sending user data to signup:', userData);
      
      const { error } = await signUp(email, password, userData);
      
      if (error) {
        // Check for rate limiting error
        if (error.message && error.message.includes('For security purposes')) {
          const waitTimeMatch = error.message.match(/after (\d+) seconds/);
          const waitTime = waitTimeMatch ? parseInt(waitTimeMatch[1]) : 60;
          
          setRateLimited(true);
          setTimeRemaining(waitTime);
          
          // Start a countdown timer
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          
          timerRef.current = setInterval(() => {
            setTimeRemaining(prev => {
              if (prev <= 1) {
                setRateLimited(false);
                if (timerRef.current) clearInterval(timerRef.current);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          
          Alert.alert('Rate Limited', `Please try again in ${waitTime} seconds.`);
        } else {
          Alert.alert('Signup Failed', error.message);
        }
      } else {
        Alert.alert(
          'Signup Successful', 
          'Your account has been created. Please check your email for verification.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Create Account</Text>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.roleLabel}>Select Role:</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === 'passenger' && styles.selectedRoleButton,
              ]}
              onPress={() => {
                console.log('Setting role to passenger');
                setRole('passenger');
              }}
            >
              <Text
                style={[
                  styles.roleText,
                  role === 'passenger' && styles.selectedRoleText,
                ]}
              >
                Passenger
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === 'driver' && styles.selectedRoleButton,
              ]}
              onPress={() => {
                console.log('Setting role to driver');
                setRole('driver');
              }}
            >
              <Text
                style={[
                  styles.roleText,
                  role === 'driver' && styles.selectedRoleText,
                ]}
              >
                Driver
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.signupButton,
              (loading || rateLimited) && styles.disabledButton
            ]}
            onPress={handleSignup}
            disabled={loading || rateLimited}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : rateLimited ? (
              <Text style={styles.buttonText}>Try again in {timeRemaining}s</Text>
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  formContainer: {
    paddingHorizontal: 15,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  roleLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  roleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRoleButton: {
    backgroundColor: '#4285F4',
    borderColor: '#4285F4',
  },
  roleText: {
    color: '#333',
    fontSize: 16,
  },
  selectedRoleText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  signupButton: {
    backgroundColor: '#4285F4',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#A4C2F4', // Lighter shade for disabled state
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#333',
    fontSize: 14,
  },
  loginLink: {
    color: '#4285F4',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default SignupScreen;
````

## File: src/screens/UsersListScreen.tsx
````typescript
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FontAwesome } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useConnection } from '../contexts/ConnectionContext';
import { User } from '../types';
import { MainStackParamList } from '../navigation/AppNavigator';

type UserListNavigationProp = StackNavigationProp<MainStackParamList>;

const RoleBasedUserListScreen: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { 
    isConnectedWithUser, 
    requestConnectionWithUser, 
    connections, 
    pendingConnections,
    acceptConnectionRequest,
  } = useConnection();
  const navigation = useNavigation<UserListNavigationProp>();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [connectionRequests, setConnectionRequests] = useState<User[]>([]);

  // Get opposite role from current user
  const targetRole = currentUser?.role === 'driver' ? 'passenger' : 'driver';

  useEffect(() => {
    fetchUsers();
    fetchConnectionRequests();
  }, [currentUser?.id, connections, pendingConnections]);

  const fetchUsers = async () => {
    if (!currentUser?.id) return;
    
    try {
      setLoading(true);
      
      // Fetch users with opposite role
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .neq('id', currentUser.id)
        .eq('role', targetRole);
      
      if (error) {
        console.error('Error fetching users:', error);
      } else if (data) {
        setUsers(data as User[]);
      }
    } catch (error) {
      console.error('Error in fetchUsers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchConnectionRequests = async () => {
    // Convert pending connections to an array of users
    const requests: User[] = [];
    pendingConnections.forEach(conn => {
      if (conn.receiver_id === currentUser?.id) {
        requests.push(conn.initiator);
      }
    });
    setConnectionRequests(requests);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
    fetchConnectionRequests();
  };

  const handleUserPress = async (selectedUser: User) => {
    if (!currentUser?.id) return;
    
    // Check if already connected
    if (isConnectedWithUser(selectedUser.id)) {
      // If connected, navigate to chat
      navigation.navigate('Chat', {
        userId: selectedUser.id,
        userName: selectedUser.full_name || 'User',
      });
    } else {
      // If not connected, prompt to connect
      Alert.alert(
        'Connect with user',
        `Would you like to connect with ${selectedUser.full_name || 'this user'}?`,
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Connect',
            onPress: async () => {
              const connection = await requestConnectionWithUser(selectedUser.id);
              if (connection) {
                Alert.alert(
                  'Connection request sent',
                  'The user will be notified of your request.'
                );
              } else {
                Alert.alert(
                  'Error',
                  'Could not send connection request. Please try again later.'
                );
              }
            }
          }
        ]
      );
    }
  };

  const handleAcceptConnection = async (connectionId: string) => {
    const connection = await acceptConnectionRequest(connectionId);
    if (connection) {
      Alert.alert(
        'Connection Accepted',
        'You are now connected with this user'
      );
      fetchUsers(); // Refresh list
    } else {
      Alert.alert(
        'Error',
        'Could not accept connection request. Please try again later.'
      );
    }
  };

  const getConnectionStatus = (userId: string) => {
    // Check if there's a pending request from this user
    for (const [id, conn] of pendingConnections.entries()) {
      if (conn.initiator_id === userId && conn.receiver_id === currentUser?.id) {
        return {
          status: 'pending',
          connectionId: id
        };
      }
    }
    
    // Check if already connected
    if (isConnectedWithUser(userId)) {
      return {
        status: 'connected'
      };
    }
    
    return {
      status: 'none'
    };
  };

  const renderConnectionRequest = ({ item }: { item: User }) => {
    // Find the connection ID
    let connectionId = '';
    for (const [id, conn] of pendingConnections.entries()) {
      if (conn.initiator_id === item.id && conn.receiver_id === currentUser?.id) {
        connectionId = id;
        break;
      }
    }
    
    return (
      <View style={styles.connectionRequest}>
        <View style={styles.requestUserInfo}>
          {item.avatar_url ? (
            <Image source={{ uri: item.avatar_url }} style={styles.requestAvatar} />
          ) : (
            <View style={styles.requestAvatarPlaceholder}>
              <Text style={styles.avatarText}>
                {item.full_name ? item.full_name.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
          )}
          <Text style={styles.requestUserName}>{item.full_name || 'User'}</Text>
        </View>
        <View style={styles.requestActions}>
          <TouchableOpacity 
            style={styles.acceptButton}
            onPress={() => handleAcceptConnection(connectionId)}
          >
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectButton}>
            <Text style={styles.rejectButtonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderUserItem = ({ item }: { item: User }) => {
    const connectionStatus = getConnectionStatus(item.id);
    
    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => handleUserPress(item)}
      >
        <View style={styles.avatarContainer}>
          {item.avatar_url ? (
            <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <FontAwesome name="user" size={24} color="#888" />
            </View>
          )}
          <View style={[
            styles.statusIndicator,
            connectionStatus.status === 'connected' ? styles.statusConnected : styles.statusOffline,
          ]} />
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.full_name || 'User'}</Text>
          <Text style={styles.userRole}>
            {item.role === 'driver' ? 'Driver' : 'Passenger'}
          </Text>
        </View>
        
        {connectionStatus.status === 'connected' ? (
          <TouchableOpacity 
            style={styles.chatButton}
            onPress={() => navigation.navigate('Chat', {
              userId: item.id,
              userName: item.full_name || 'User',
            })}
          >
            <FontAwesome name="comment" size={16} color="white" />
            <Text style={styles.chatButtonText}>Chat</Text>
          </TouchableOpacity>
        ) : connectionStatus.status === 'pending' ? (
          <TouchableOpacity 
            style={styles.pendingButton}
            onPress={() => handleAcceptConnection(connectionStatus.connectionId!)}
          >
            <Text style={styles.pendingButtonText}>Accept</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.connectButton}
            onPress={() => handleUserPress(item)}
          >
            <Text style={styles.connectButtonText}>Connect</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={36} color="#4285F4" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {connectionRequests.length > 0 && (
        <View style={styles.requestsContainer}>
          <Text style={styles.requestsTitle}>Connection Requests</Text>
          <FlatList
            data={connectionRequests}
            renderItem={renderConnectionRequest}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}
      
      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#4285F4']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FontAwesome name="users" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No {targetRole}s found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingVertical: 8,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: 'white',
  },
  statusConnected: {
    backgroundColor: '#4CAF50',
  },
  statusOffline: {
    backgroundColor: '#ccc',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  userRole: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  chatButton: {
    flexDirection: 'row',
    backgroundColor: '#4285F4',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  chatButtonText: {
    color: 'white',
    marginLeft: 4,
    fontWeight: '500',
  },
  connectButton: {
    backgroundColor: '#E8F0FE',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  connectButtonText: {
    color: '#4285F4',
    fontWeight: '500',
  },
  pendingButton: {
    backgroundColor: '#FFECB3',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  pendingButtonText: {
    color: '#FF8F00',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888',
  },
  requestsContainer: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  requestsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  connectionRequest: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    marginRight: 12,
    width: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  requestUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  requestAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  requestAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontWeight: 'bold',
    color: '#888',
  },
  requestUserName: {
    fontWeight: '500',
    fontSize: 16,
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flex: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  rejectButton: {
    backgroundColor: '#F44336',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    flex: 1,
    marginLeft: 8,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default RoleBasedUserListScreen;
````

## File: src/types/index.ts
````typescript
export type UserRole = 'driver' | 'passenger';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role?: UserRole;
  created_at: string;
}

export interface Location {
  id?: string;
  user_id: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  trip_id?: string;
  timestamp: string;
}

export interface Message {
  id?: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  trip_id?: string;
  read: boolean;
  created_at: string;
}

export interface Trip {
  id?: string;
  passenger_id: string;
  driver_id?: string;
  pickup_location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  destination: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  status: 'requested' | 'accepted' | 'in_progress' | 'completed' | 'canceled';
  created_at: string;
  updated_at: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Connection {
  id?: string;
  initiator_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}
````

## File: App.tsx
````typescript
import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LogBox, AppState, AppStateStatus } from 'react-native';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { AuthProvider } from './src/contexts/AuthContext';
import { ConnectionProvider } from './src/contexts/ConnectionContext';
import { TripProvider } from './src/contexts/TripContext';
import AppNavigator from './src/navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ignore specific warnings that might be caused by external libraries
LogBox.ignoreLogs([
  'AsyncStorage has been extracted from react-native',
  'Setting a timer',
  'Non-serializable values were found in the navigation state',
]);

// Define a custom theme for React Native Paper
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#4285F4',
    accent: '#f1c40f',
    background: '#ffffff',
  },
};

// Import services for ensuring synchronization
import { syncMessageQueue } from './src/services/ChatService'; 

// Main App Component
export default function App() {
  // Handle app state changes to sync data when app goes to background
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        console.log('App going to background, syncing pending data...');
        
        // Force sync messages
        await syncMessageQueue(true);
        
        // Record last active time
        await AsyncStorage.setItem('last_active', new Date().toISOString());
      } else if (nextAppState === 'active') {
        // App came to foreground
        const lastActiveStr = await AsyncStorage.getItem('last_active');
        if (lastActiveStr) {
          const lastActive = new Date(lastActiveStr);
          const now = new Date();
          const timeDiff = now.getTime() - lastActive.getTime();
          
          console.log(`App was inactive for ${timeDiff / 1000} seconds`);
          
          // If app was inactive for more than 5 minutes, refresh data
          if (timeDiff > 5 * 60 * 1000) {
            console.log('App was inactive for more than 5 minutes, refreshing data...');
            // We'll let the individual components handle their own refreshing
          }
        }
      }
    };

    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <AuthProvider>
          <ConnectionProvider>
            <TripProvider>
              <AppNavigator />
            </TripProvider>
          </ConnectionProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
````

## File: src/hooks/useLocationTracking.ts
````typescript
import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';
import { LocationSubscription } from 'expo-location';
import { useAuth } from '../contexts/AuthContext';
import { 
  requestLocationPermission, 
  startLocationUpdates, 
  subscribeToLocationUpdates,
  getLastKnownLocation,
} from '../services/LocationService';
import { Location as LocationType } from '../types';

type UserLocationsMap = Map<string, LocationType>;

export const useLocationTracking = (initialUserIds: string[] = []) => {
  const { user } = useAuth();
  const [myLocation, setMyLocation] = useState<LocationType | null>(null);
  const [userLocations, setUserLocations] = useState<UserLocationsMap>(new Map());
  const [isTracking, setIsTracking] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  
  // Use refs to track current state without triggering effect dependencies
  const locationWatcherRef = useRef<LocationSubscription | null>(null);
  const userSubscriptionsRef = useRef<Map<string, () => void>>(new Map());
  const initialUserIdsRef = useRef<string[]>(initialUserIds);
  
  // Update ref when props change without triggering effects
  useEffect(() => {
    initialUserIdsRef.current = initialUserIds;
  }, [initialUserIds]);

  // Check permission and get initial location - only once at mount
  useEffect(() => {
    const checkPermissionAndGetLocation = async () => {
      const permissionResult = await requestLocationPermission();
      setPermissionGranted(permissionResult.granted);
      
      if (permissionResult.granted && user?.id) {
        try {
          const location = await getLastKnownLocation(user.id);
          if (location) {
            setMyLocation(location);
          } else {
            // If no prior location exists, get current location
            const currentLocation = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.High,
            });
            
            if (currentLocation) {
              // Format the location into our app's format
              const formattedLocation: LocationType = {
                user_id: user.id,
                latitude: currentLocation.coords.latitude,
                longitude: currentLocation.coords.longitude,
                heading: currentLocation.coords.heading || 0,
                speed: currentLocation.coords.speed || 0,
                timestamp: new Date(currentLocation.timestamp).toISOString(),
              };
              
              setMyLocation(formattedLocation);
            }
          }
        } catch (error) {
          console.error('Error getting initial location:', error);
        }
      }
    };
    
    checkPermissionAndGetLocation();
    // Only run this effect once when component mounts
  }, []);
  
  // Start tracking when isTracking becomes true
  useEffect(() => {
    if (isTracking && permissionGranted && user?.id) {
      startTracking();
    } else if (!isTracking && locationWatcherRef.current) {
      stopTracking();
    }
    
    return () => {
      stopTracking();
    };
  }, [isTracking, permissionGranted, user?.id]);
  
  // Subscribe to location updates for specified users, using stable callback
  const subscribeToUserLocation = useCallback((userId: string) => {
    if (!user?.id || userId === user.id) return;
    
    // Unsubscribe from previous subscription if exists
    if (userSubscriptionsRef.current.has(userId)) {
      const unsubscribe = userSubscriptionsRef.current.get(userId);
      if (unsubscribe) unsubscribe();
      userSubscriptionsRef.current.delete(userId);
    }
    
    // Get initial location
    getLastKnownLocation(userId).then((location) => {
      if (location) {
        setUserLocations((prev) => {
          const newMap = new Map(prev);
          newMap.set(userId, location);
          return newMap;
        });
      }
    }).catch(err => {
      console.error('Error getting initial location for user:', userId, err);
    });
    
    // Subscribe to real-time updates
    const unsubscribe = subscribeToLocationUpdates(userId, (location) => {
      setUserLocations((prev) => {
        const newMap = new Map(prev);
        newMap.set(userId, location);
        return newMap;
      });
    });
    
    userSubscriptionsRef.current.set(userId, unsubscribe);
    return unsubscribe;
  }, [user?.id]);
  
  // Clean up function with stable reference
  const unsubscribeFromUserLocation = useCallback((userId: string) => {
    if (userSubscriptionsRef.current.has(userId)) {
      const unsubscribe = userSubscriptionsRef.current.get(userId);
      if (unsubscribe) unsubscribe();
      userSubscriptionsRef.current.delete(userId);
      
      setUserLocations((prev) => {
        const newMap = new Map(prev);
        newMap.delete(userId);
        return newMap;
      });
    }
  }, []);
  
  // Subscribe to location updates for users, using refs to avoid dependency cycles
  useEffect(() => {
    if (!user?.id) return;
    
    // Use a local copy so it doesn't change during the effect
    const currentUserIds = [...initialUserIdsRef.current];

    // Clean up all existing subscriptions
    userSubscriptionsRef.current.forEach((unsubscribe) => {
      if (unsubscribe) unsubscribe();
    });
    userSubscriptionsRef.current.clear();
    
    // Create new subscriptions for users in currentUserIds
    currentUserIds.forEach((userId) => {
      if (userId !== user.id) {
        subscribeToUserLocation(userId);
      }
    });
    
    // Clean up on unmount
    return () => {
      userSubscriptionsRef.current.forEach((unsubscribe) => {
        if (unsubscribe) unsubscribe();
      });
      userSubscriptionsRef.current.clear();
    };
  }, [user?.id, subscribeToUserLocation]);
  
  const startTracking = async () => {
    // Don't start tracking if user is not available or already tracking
    if (!user?.id || locationWatcherRef.current) return;
    
    console.log('Starting location tracking...');
    
    try {
      const locationResult = await startLocationUpdates(
        user.id,
        undefined,
        (location) => {
          console.log('Location update received');
          setMyLocation(location);
        }
      );
      
      if (locationResult && 'error' in locationResult && locationResult.error) {
        console.error('Error starting location tracking:', locationResult.error);
        // If permission denied, update permission state
        if (locationResult.error.denied) {
          setPermissionGranted(false);
        }
        // Ensure isTracking is false on error
        setIsTracking(false);
        return;
      }
      
      if (locationResult) {
        console.log('Location tracking started successfully');
        locationWatcherRef.current = locationResult;
        // Only update isTracking if it's not already true to avoid re-renders
        if (!isTracking) {
          setIsTracking(true);
        }
      }
    } catch (error) {
      console.error('Unexpected error starting location tracking:', error);
      // Ensure isTracking is false on error
      setIsTracking(false);
    }
  };
  
  const stopTracking = () => {
    if (locationWatcherRef.current) {
      locationWatcherRef.current.remove();
      locationWatcherRef.current = null;
    }
    setIsTracking(false);
  };
  
  const toggleTracking = () => {
    setIsTracking((prev) => !prev);
  };
  
  return {
    myLocation,
    userLocations,
    isTracking,
    permissionGranted,
    startTracking,
    stopTracking,
    toggleTracking,
    subscribeToUserLocation,
    unsubscribeFromUserLocation,
  };
};

export default useLocationTracking;
````

## File: src/screens/ChatScreen.tsx
````typescript
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useConnection } from '../contexts/ConnectionContext';
import {
  sendMessage,
  getConversationHistory,
  markMessageAsRead,
  setupChatPresence,
  subscribeToConversation,
} from '../services/ChatService';
import { Message } from '../types';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';

type ChatScreenParams = {
  userId: string;
  userName: string;
  tripId?: string;
};

type ChatScreenRouteProp = RouteProp<{ Chat: ChatScreenParams }, 'Chat'>;

const ChatScreen: React.FC = () => {
  const { user } = useAuth();
  const { isConnectedWithUser, getConnectionWithUser, requestConnectionWithUser } = useConnection();
  const route = useRoute<ChatScreenRouteProp>();
  const navigation = useNavigation();
  const { userId: receiverId, userName: receiverName, tripId } = route.params;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  const presenceRef = useRef<any>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    
    // Check if connected with the user
    if (!isConnectedWithUser(receiverId) && !tripId) {
      Alert.alert(
        'Not Connected',
        `You are not connected with ${receiverName}. Would you like to send a connection request?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => navigation.goBack()
          },
          {
            text: 'Connect',
            onPress: async () => {
              const connection = await requestConnectionWithUser(receiverId);
              if (connection) {
                Alert.alert(
                  'Connection Request Sent',
                  `${receiverName} will be notified of your request.`
                );
              } else {
                Alert.alert(
                  'Error',
                  'Could not send connection request. Please try again later.'
                );
                navigation.goBack();
              }
            }
          }
        ]
      );
    }
    
    // Load initial chat history
    loadChatHistory();
    
    // Set up presence channel for typing indicators and online status
    const connection = getConnectionWithUser(receiverId);
    
    if (connection || tripId) {
      presenceRef.current = setupChatPresence(user.id, receiverId, {
        onTyping: (isTyping) => {
          setIsOtherUserTyping(isTyping);
        },
        onOnlineStatus: (isOnline) => {
          setIsOtherUserOnline(isOnline);
        },
        onNewMessage: (newMessage) => {
          // Add new message to the list
          setMessages((prevMessages) => [newMessage, ...prevMessages]);
          
          // Mark message as read if received
          if (newMessage.sender_id === receiverId && newMessage.receiver_id === user.id) {
            markMessageAsRead(newMessage.id!);
          }
        }
      });
      
      // Subscribe to database changes for real-time messages
      // This is critical for ensuring messages appear instantly for both sender and receiver
      unsubscribeRef.current = subscribeToConversation(user.id, receiverId, (newMessage) => {
        console.log('Real-time message received from database subscription:', newMessage);
        // Check if message already exists in our list to avoid duplicates
        setMessages((prevMessages) => {
          // Check if we already have this message
          const messageExists = prevMessages.some(msg => 
            msg.id === newMessage.id || 
            (msg.sender_id === newMessage.sender_id && 
             msg.created_at === newMessage.created_at && 
             msg.content === newMessage.content)
          );
          
          if (messageExists) {
            return prevMessages;
          }
          
          // If it's a new message, add it to the list
          return [newMessage, ...prevMessages];
        });
        
        // Mark message as read if received
        if (newMessage.sender_id === receiverId && newMessage.receiver_id === user.id) {
          markMessageAsRead(newMessage.id!);
        }
      });
    }
    
    return () => {
      // Clean up presence channel
      if (presenceRef.current && presenceRef.current.cleanup) {
        presenceRef.current.cleanup();
      }
      
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Unsubscribe from conversation updates
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [user?.id, receiverId]);

  const loadChatHistory = async (offset = 0) => {
    if (!user?.id) return;
    
    try {
      setRefreshing(true);
      const { data, error } = await getConversationHistory(user.id, receiverId, tripId, 20, offset);
      
      if (error) {
        console.error('Error loading chat history:', error);
      } else if (data) {
        if (offset === 0) {
          setMessages(data);
        } else {
          setMessages((prev) => [...prev, ...data]);
        }
        
        // Mark unread messages as read
        data.forEach((message) => {
          if (message.sender_id === receiverId && message.receiver_id === user.id && !message.read) {
            markMessageAsRead(message.id!);
          }
        });
      }
    } catch (error) {
      console.error('Error in loadChatHistory:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !user?.id) return;
    
    const messageText = inputText.trim();
    setInputText('');
    
    try {
      // Check if we should use presence for sending
      if (presenceRef.current && presenceRef.current.sendPresenceMessage) {
        // Create message object
        const newMessage = {
          sender_id: user.id,
          receiver_id: receiverId,
          content: messageText,
          trip_id: tripId,
          read: false,
          created_at: new Date().toISOString(),
        };
        
        // Send via presence for immediate delivery
        await presenceRef.current.sendPresenceMessage(newMessage);
        
        // Update UI immediately
        setMessages((prevMessages) => [newMessage, ...prevMessages]);
      } else {
        // Fall back to regular sending
        const { data, error } = await sendMessage(user.id, receiverId, messageText, tripId);
        
        if (error) {
          console.error('Error sending message:', error);
        } else if (data) {
          // Add message to the list
          setMessages((prevMessages) => [data, ...prevMessages]);
        }
      }
      
      // Clear typing indicator
      if (presenceRef.current && presenceRef.current.setTyping) {
        presenceRef.current.setTyping(false);
      }
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
    }
  };

  const handleTextInputChange = (text: string) => {
    setInputText(text);
    
    // Update typing indicator
    if (presenceRef.current && presenceRef.current.setTyping) {
      // Set typing to true
      presenceRef.current.setTyping(true);
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set a timeout to clear typing indicator after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        if (presenceRef.current && presenceRef.current.setTyping) {
          presenceRef.current.setTyping(false);
        }
      }, 2000);
    }
  };

  const loadMoreMessages = () => {
    if (refreshing || loading || messages.length === 0) return;
    loadChatHistory(messages.length);
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isMyMessage = item.sender_id === user?.id;
    
    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.mySentMessage : styles.receivedMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.mySentBubble : styles.receivedBubble
        ]}>
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.mySentMessageText : styles.receivedMessageText
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.messageTime,
            isMyMessage ? styles.mySentMessageTime : styles.receivedMessageTime
          ]}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size={36} color="#4285F4" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Status bar showing online/typing status */}
      <View style={styles.statusBar}>
        <View style={[
          styles.onlineIndicator,
          isOtherUserOnline ? styles.online : styles.offline
        ]} />
        <Text style={styles.statusText}>
          {isOtherUserTyping ? 'Typing...' : (isOtherUserOnline ? 'Online' : 'Offline')}
        </Text>
      </View>
      
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id || item.created_at}
        inverted
        onEndReached={loadMoreMessages}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={() => loadChatHistory()}
        contentContainerStyle={styles.messagesContainer}
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          value={inputText}
          onChangeText={handleTextInputChange}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !inputText.trim() && styles.disabledButton
          ]}
          onPress={handleSendMessage}
          disabled={!inputText.trim()}
        >
          <FontAwesome name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  onlineIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  online: {
    backgroundColor: '#4CAF50',
  },
  offline: {
    backgroundColor: '#9E9E9E',
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  messagesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginVertical: 4,
    flexDirection: 'row',
  },
  mySentMessage: {
    justifyContent: 'flex-end',
  },
  receivedMessage: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: '70%',
  },
  mySentBubble: {
    backgroundColor: '#DCF8C6',
    borderBottomRightRadius: 5,
  },
  receivedBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
  },
  mySentMessageText: {
    color: '#000',
  },
  receivedMessageText: {
    color: '#000',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  mySentMessageTime: {
    color: '#7B7B7B',
  },
  receivedMessageTime: {
    color: '#7B7B7B',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 120,
    backgroundColor: '#F8F8F8',
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#4285F4',
    borderRadius: 25,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  disabledButton: {
    backgroundColor: '#B5B5B5',
  },
});

export default ChatScreen;
````

## File: src/services/ChatService.ts
````typescript
import { supabase } from '../lib/supabase';
import { Message } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Add this to the top level of your OptimizedChatService.ts file
// This exports the syncMessageQueue function needed by App.tsx

// Add this to the top level of your OptimizedChatService.ts file
// This exports the syncMessageQueue function needed by App.tsx

// Make sure this function is exported
export const syncMessageQueue = async (force = false): Promise<boolean> => {
  if (messageQueue.length === 0) return true;
  
  // Only sync if we have enough messages or force is true
  if (!force && messageQueue.length < MESSAGE_BATCH_SIZE) return true;
  
  try {
    console.log(`Syncing ${messageQueue.length} messages to server`);
    
    // Take a snapshot of current queue
    const messagesToSync = [...messageQueue];
    
    // Insert all messages in a single request
    const { data, error } = await supabase
      .from('messages')
      .insert(messagesToSync)
      .select();
    
    if (error) {
      console.error('Error syncing message queue:', error);
      return false;
    }
    
    // Remove synced messages from queue
    messageQueue = messageQueue.filter(msg => {
      // Keep messages that were not in the sync batch
      return !messagesToSync.some(syncMsg => 
        syncMsg.sender_id === msg.sender_id && 
        syncMsg.receiver_id === msg.receiver_id && 
        syncMsg.content === msg.content && 
        syncMsg.created_at === msg.created_at
      );
    });
    
    // Update storage
    await AsyncStorage.setItem(UNSENT_MESSAGES_KEY, JSON.stringify(messageQueue));
    
    // Update last sync time
    await AsyncStorage.setItem(LAST_MESSAGE_SYNC_KEY, Date.now().toString());
    
    return true;
  } catch (error) {
    console.error('Unexpected error in syncMessageQueue:', error);
    return false;
  }
};

// Constants
const MESSAGE_BATCH_SIZE = 10; // Number of messages to store before syncing
const MESSAGE_SYNC_INTERVAL = 30000; // 30 seconds
const UNSENT_MESSAGES_KEY = 'unsent_messages';
const CONVERSATION_CACHE_KEY = 'conversation_cache_';
const LAST_MESSAGE_SYNC_KEY = 'last_message_sync';

// In-memory message queue for batching
let messageQueue: Message[] = [];
let syncTimer: NodeJS.Timeout | null = null;

/**
 * Initialize the message queue and sync timer
 */
const initMessageQueue = () => {
  if (syncTimer) return;
  
  // Load any unsent messages from storage
  AsyncStorage.getItem(UNSENT_MESSAGES_KEY)
    .then(messages => {
      if (messages) {
        messageQueue = JSON.parse(messages);
        console.log(`Loaded ${messageQueue.length} unsent messages from storage`);
      }
    })
    .catch(error => {
      console.error('Error loading unsent messages:', error);
    });
  
  // Start periodic sync
  syncTimer = setInterval(syncMessageQueue, MESSAGE_SYNC_INTERVAL);
  
  // Add event listener for app state changes to sync when app goes to background
  // This would require additional setup with AppState from react-native
};

/**
 * Cache conversation history locally
 */
const cacheConversationHistory = async (
  userId1: string,
  userId2: string,
  messages: Message[]
) => {
  try {
    // Sort by created_at descending (newest first)
    const sortedMessages = [...messages].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    // Create a conversation ID (consistent regardless of order)
    const conversationId = [userId1, userId2].sort().join('-');
    
    // Save to storage
    await AsyncStorage.setItem(
      CONVERSATION_CACHE_KEY + conversationId,
      JSON.stringify(sortedMessages)
    );
  } catch (error) {
    console.error('Error caching conversation history:', error);
  }
};

/**
 * Get cached conversation history
 */
const getCachedConversationHistory = async (
  userId1: string,
  userId2: string
): Promise<Message[] | null> => {
  try {
    // Create a conversation ID (consistent regardless of order)
    const conversationId = [userId1, userId2].sort().join('-');
    
    const cachedConversation = await AsyncStorage.getItem(
      CONVERSATION_CACHE_KEY + conversationId
    );
    
    if (cachedConversation) {
      return JSON.parse(cachedConversation);
    }
    
    return null;
  } catch (error) {
    console.error('Error getting cached conversation history:', error);
    return null;
  }
};

/**
 * Send a message with optimized database writes
 */
export const sendMessage = async (
  senderId: string,
  receiverId: string,
  content: string,
  tripId?: string
): Promise<{ data: Message | null; error: any }> => {
  // Ensure message queue is initialized
  if (!syncTimer) {
    initMessageQueue();
  }
  
  const newMessage = {
    sender_id: senderId,
    receiver_id: receiverId,
    content,
    trip_id: tripId,
    read: false,
    created_at: new Date().toISOString(),
  };

  // Add to memory queue
  messageQueue.push(newMessage);
  
  // Update storage
  try {
    await AsyncStorage.setItem(UNSENT_MESSAGES_KEY, JSON.stringify(messageQueue));
    
    // Update local conversation cache
    const cachedMessages = await getCachedConversationHistory(senderId, receiverId) || [];
    cachedMessages.unshift(newMessage); // Add to beginning (newest first)
    await cacheConversationHistory(senderId, receiverId, cachedMessages);
    
    // Try to sync if we have enough messages
    if (messageQueue.length >= MESSAGE_BATCH_SIZE) {
      syncMessageQueue();
    }
    
    return { data: newMessage, error: null };
  } catch (error) {
    console.error('Error queuing message:', error);
    return { data: null, error };
  }
};

/**
 * Get conversation history with caching strategy
 */
export const getConversationHistory = async (
  userId1: string,
  userId2: string,
  tripId?: string,
  limit = 20,
  offset = 0
): Promise<{ data: Message[] | null; error: any }> => {
  // Force sync any pending messages first
  await syncMessageQueue(true);
  
  try {
    // Try cache first for faster response
    const cachedMessages = await getCachedConversationHistory(userId1, userId2);
    
    // Get database records
    let query = supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${userId1},receiver_id.eq.${userId1}`)
      .or(`sender_id.eq.${userId2},receiver_id.eq.${userId2}`)
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);

    if (tripId) {
      query = query.eq('trip_id', tripId);
    }

    const { data, error } = await query;
    
    if (error) {
      // Return cached data if available, otherwise return error
      if (cachedMessages) {
        const paginatedCache = cachedMessages.slice(offset, offset + limit);
        return { data: paginatedCache, error: null };
      }
      return { data: null, error };
    }
    
    // Update cache with new data
    if (data && data.length > 0) {
      // Merge with existing cache if offset is > 0
      if (offset > 0 && cachedMessages) {
        const mergedMessages = [...cachedMessages];
        // Add new messages that aren't in cache
        data.forEach(newMsg => {
          if (!mergedMessages.some(msg => msg.id === newMsg.id)) {
            mergedMessages.push(newMsg as Message);
          }
        });
        
        // Sort and update cache
        mergedMessages.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        await cacheConversationHistory(userId1, userId2, mergedMessages);
      } else {
        // Replace cache if this is the first page
        await cacheConversationHistory(userId1, userId2, data as Message[]);
      }
    }
    
    // Add any pending messages from the queue that match this conversation
    const pendingMessages = messageQueue.filter(msg => 
      (msg.sender_id === userId1 && msg.receiver_id === userId2) ||
      (msg.sender_id === userId2 && msg.receiver_id === userId1)
    );
    
    // Merge with database results
    const allMessages = [...(data as Message[]), ...pendingMessages];
    
    // Sort by created_at descending (newest first)
    allMessages.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    
    // Return paginated results
    return { data: allMessages.slice(0, limit), error: null };
  } catch (error) {
    console.error('Error in getConversationHistory:', error);
    
    // Return cached data as fallback
    const cachedMessages = await getCachedConversationHistory(userId1, userId2);
    if (cachedMessages) {
      const paginatedCache = cachedMessages.slice(offset, offset + limit);
      return { data: paginatedCache, error: null };
    }
    
    return { data: null, error };
  }
};

/**
 * Mark message as read (optimized)
 */
export const markMessageAsRead = async (messageId: string): Promise<{ error: any }> => {
  // Queue it for next sync if there's no ID (locally created message)
  if (!messageId.includes('-')) {
    return { error: null }; // Local messages don't need marking as read
  }
  
  // Otherwise update in the database directly
  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('id', messageId);

  return { error };
};

/**
 * Use Presence for real-time typing indicators and online status
 * This avoids database writes for ephemeral statuses
 */
export const setupChatPresence = (
  userId: string,
  otherUserId: string,
  callbacks: {
    onTyping?: (isTyping: boolean) => void;
    onOnlineStatus?: (isOnline: boolean) => void;
    onNewMessage?: (message: Message) => void;
  }
) => {
  // Create a unique channel name based on the two user IDs (sorted to be consistent)
  // Sorting ensures both users join the same channel regardless of who created it
  const channelName = `presence:chat:${[userId, otherUserId].sort().join('-')}`;
  
  console.log(`Setting up chat presence channel: ${channelName}`);
  
  // Create the presence channel
  const channel = supabase.channel(channelName, {
    config: {
      presence: {
        key: userId,
      },
    },
  });
  
  // Track presence changes
  channel.on('presence', { event: 'sync' }, () => {
    console.log('Presence sync event received');
    const state = channel.presenceState();
    
    // Check if the other user is present
    const otherUserState = state[otherUserId];
    if (otherUserState && otherUserState.length > 0) {
      const userData = otherUserState[0] as { isTyping?: boolean; presence_ref: string };
      
      // Update typing status
      if (callbacks.onTyping && userData.isTyping !== undefined) {
        callbacks.onTyping(userData.isTyping);
      }
      
      // Update online status
      if (callbacks.onOnlineStatus) {
        callbacks.onOnlineStatus(true);
      }
    } else if (callbacks.onOnlineStatus) {
      callbacks.onOnlineStatus(false);
    }
  });
  
  // Handle broadcast messages (new messages)
  channel.on('broadcast', { event: 'new_message' }, (payload) => {
    console.log('Broadcast message received:', payload);
    if (callbacks.onNewMessage && payload.message) {
      callbacks.onNewMessage(payload.message as Message);
    }
  });
  
  // Subscribe to the channel
  channel.subscribe(async (status) => {
    console.log(`Chat presence channel status: ${status}`);
    if (status !== 'SUBSCRIBED') return;
    
    // Set initial presence
    await channel.track({
      isTyping: false,
      online_at: new Date().toISOString(),
    } as { isTyping: boolean; online_at: string });
  });
  
  // Return functions to update status and send messages
  return {
    setTyping: async (isTyping: boolean) => {
      await channel.track({ isTyping } as { isTyping: boolean });
    },
    
    sendPresenceMessage: async (message: Message) => {
      console.log('Sending presence message:', message);
      
      // Add to local queue for eventual database sync
      messageQueue.push(message);
      await AsyncStorage.setItem(UNSENT_MESSAGES_KEY, JSON.stringify(messageQueue));
      
      // Broadcast to the channel for immediate delivery
      await channel.send({
        type: 'broadcast',
        event: 'new_message',
        payload: { message },
      });
      
      // Update local conversation cache
      const cachedMessages = await getCachedConversationHistory(userId, otherUserId) || [];
      cachedMessages.unshift(message);
      await cacheConversationHistory(userId, otherUserId, cachedMessages);
      
      // Force immediate sync to database to ensure it's available via postgres_changes
      try {
        console.log('Forcing immediate message sync to database');
        await syncMessageQueue(true);
      } catch (error) {
        console.error('Error syncing message to database:', error);
      }
    },
    
    cleanup: () => {
      console.log('Cleaning up chat presence channel');
      supabase.removeChannel(channel);
    }
  };
};

/**
 * Subscribe to conversation updates
 * Use traditional subscription as a fallback for reliable message delivery
 */
export const subscribeToConversation = (
  currentUserId: string,
  otherUserId: string,
  callback: (message: Message) => void
) => {
  // First check if there's cached data
  getCachedConversationHistory(currentUserId, otherUserId).then(cachedMessages => {
    if (cachedMessages) {
      // Sort newest first for consistency with UI
      const sortedMessages = [...cachedMessages].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      // Only send the most recent messages to avoid flooding the UI
      sortedMessages.slice(0, 20).forEach(callback);
    }
  });
  
  // Check the message queue for unsent messages to this conversation
  const unsentMessages = messageQueue.filter(msg => 
    (msg.sender_id === currentUserId && msg.receiver_id === otherUserId) ||
    (msg.sender_id === otherUserId && msg.receiver_id === currentUserId)
  );
  
  // Call callback with any unsent messages
  unsentMessages.forEach(callback);
  
  console.log(`Setting up realtime subscription for conversation between ${currentUserId} and ${otherUserId}`);
  
  // Create a unique channel name that is the same regardless of which user creates it
  // This ensures both users are listening on the same channel
  const userIds = [currentUserId, otherUserId].sort();
  const channelName = `conversation:${userIds[0]}-${userIds[1]}`;
  
  // Then subscribe to real-time updates
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `(sender_id=eq.${otherUserId} AND receiver_id=eq.${currentUserId}) OR (sender_id=eq.${currentUserId} AND receiver_id=eq.${otherUserId})`,
      },
      (payload) => {
        console.log('Received message via postgres_changes:', payload.new);
        callback(payload.new as Message);
      }
    )
    .subscribe((status) => {
      console.log(`Realtime subscription status for conversation: ${status}`);
      
      // If subscription fails, try to resubscribe
      if (status === 'CHANNEL_ERROR') {
        console.error('Channel error, will try to reconnect in 5 seconds');
        setTimeout(() => {
          // Remove the channel and resubscribe
          supabase.removeChannel(channel);
          subscribeToConversation(currentUserId, otherUserId, callback);
        }, 5000);
      }
    });

  return () => {
    console.log('Unsubscribing from conversation channel');
    supabase.removeChannel(channel);
  };
};

/**
 * Get unread message count
 */
export const getUnreadMessageCount = async (userId: string): Promise<number> => {
  // Force sync any pending messages first
  await syncMessageQueue(true);
  
  const { data, error, count } = await supabase
    .from('messages')
    .select('*', { count: 'exact' })
    .eq('receiver_id', userId)
    .eq('read', false);

  if (error) {
    console.error('Error getting unread message count:', error);
    return 0;
  }

  return count || 0;
};

// Initialize message queue when the service is imported
initMessageQueue();
````

## File: src/services/LocationService.ts
````typescript
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';
import { Location as LocationType } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Constants for optimization settings
const LOCATION_UPDATE_INTERVAL = 10000; // 10 seconds
const LOCATION_DB_SYNC_INTERVAL = 60000; // 1 minute
const LOCATION_MOVEMENT_THRESHOLD = 20; // 20 meters

// Cache keys
const LOCATION_CACHE_KEY = 'location_cache_';
const LAST_DB_SYNC_KEY = 'last_location_db_sync';

/**
 * Request location permission
 */
export const requestLocationPermission = async (): Promise<{granted: boolean; canAskAgain: boolean}> => {
  // First check current permission status
  let { status } = await Location.getForegroundPermissionsAsync();
  
  // If already granted, return success
  if (status === 'granted') {
    return { granted: true, canAskAgain: true };
  }
  
  // If not granted, request permission
  const permissionResponse = await Location.requestForegroundPermissionsAsync();
  status = permissionResponse.status;
  
  if (status !== 'granted') {
    console.error('Permission to access location was denied');
    return { 
      granted: false, 
      canAskAgain: permissionResponse.canAskAgain 
    };
  }
  
  return { granted: true, canAskAgain: true };
};

/**
 * Get current location
 */
export const getCurrentLocation = async () => {
  const permissionResult = await requestLocationPermission();
  
  if (!permissionResult.granted) {
    return { error: { denied: true, canAskAgain: permissionResult.canAskAgain } };
  }
  
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      heading: location.coords.heading,
      speed: location.coords.speed,
      timestamp: new Date(location.timestamp).toISOString(),
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    return null;
  }
};

/**
 * Calculate distance between two coordinates in meters
 */
const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a = 
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Cache location locally
 */
const cacheLocation = async (userId: string, location: LocationType) => {
  try {
    await AsyncStorage.setItem(
      LOCATION_CACHE_KEY + userId,
      JSON.stringify(location)
    );
  } catch (error) {
    console.error('Error caching location:', error);
  }
};

/**
 * Get cached location
 */
const getCachedLocation = async (userId: string): Promise<LocationType | null> => {
  try {
    const cachedLocation = await AsyncStorage.getItem(LOCATION_CACHE_KEY + userId);
    if (cachedLocation) {
      return JSON.parse(cachedLocation);
    }
    return null;
  } catch (error) {
    console.error('Error getting cached location:', error);
    return null;
  }
};

/**
 * Sync location with Supabase
 */
const syncLocationWithDatabase = async (
  userId: string, 
  location: LocationType, 
  forceSync = false
): Promise<boolean> => {
  try {
    // Get last sync time
    const lastSyncStr = await AsyncStorage.getItem(LAST_DB_SYNC_KEY + userId);
    const lastSync = lastSyncStr ? parseInt(lastSyncStr) : 0;
    const now = Date.now();
    
    // Check if we need to sync
    if (!forceSync && now - lastSync < LOCATION_DB_SYNC_INTERVAL) {
      return false; // No need to sync yet
    }
    
    // Get last known location from DB or cache
    const { data: lastKnownLocation } = await supabase
      .from('locations')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    // If no significant movement since last sync, don't update DB
    if (lastKnownLocation && !forceSync) {
      const distance = calculateDistance(
        lastKnownLocation.latitude,
        lastKnownLocation.longitude,
        location.latitude,
        location.longitude
      );
      
      if (distance < LOCATION_MOVEMENT_THRESHOLD) {
        // Just update the timestamp in cache
        await AsyncStorage.setItem(LAST_DB_SYNC_KEY + userId, now.toString());
        return false;
      }
    }
    
    // Save to Supabase
    const { error } = await supabase
      .from('locations')
      .upsert(
        {
          user_id: location.user_id,
          latitude: location.latitude,
          longitude: location.longitude,
          heading: location.heading,
          speed: location.speed,
          trip_id: location.trip_id,
          timestamp: location.timestamp,
        },
        { onConflict: 'user_id' }
      );
    
    if (error) {
      console.error('Error updating location in DB:', error);
      return false;
    }
    
    // Update last sync time
    await AsyncStorage.setItem(LAST_DB_SYNC_KEY + userId, now.toString());
    return true;
  } catch (error) {
    console.error('Error in syncLocationWithDatabase:', error);
    return false;
  }
};

/**
 * Start location tracking with optimized database writes
 */
export const startLocationUpdates = async (
  userId: string,
  tripId?: string,
  onLocationUpdate?: (location: LocationType) => void
) => {
  console.log('Starting optimized location updates for user:', userId);
  
  const permissionResult = await requestLocationPermission();
  console.log('Permission result:', permissionResult);
  
  if (!permissionResult.granted) {
    console.error('Location permission not granted');
    return { error: { denied: true, canAskAgain: permissionResult.canAskAgain } };
  }
  
  // Initialize last known location from cache or DB
  const cachedLocation = await getCachedLocation(userId);
  if (cachedLocation && onLocationUpdate) {
    onLocationUpdate(cachedLocation);
  }
  
  // Force a database sync when starting
  const currentLocation = await getCurrentLocation();
  if (currentLocation && !('error' in currentLocation)) {
    const locationData: LocationType = {
      user_id: userId,
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      heading: currentLocation.heading || 0,
      speed: currentLocation.speed || 0,
      trip_id: tripId,
      timestamp: currentLocation.timestamp,
    };
    
    await cacheLocation(userId, locationData);
    await syncLocationWithDatabase(userId, locationData, true);
    
    if (onLocationUpdate) {
      onLocationUpdate(locationData);
    }
  }
  
  // Start watching position with optimized updates
  const locationSubscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      distanceInterval: 10, // Update every 10 meters
      timeInterval: LOCATION_UPDATE_INTERVAL, // Or every 10 seconds
    },
    async (location) => {
      const locationData: LocationType = {
        user_id: userId,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        heading: location.coords.heading || 0,
        speed: location.coords.speed || 0,
        trip_id: tripId,
        timestamp: new Date(location.timestamp).toISOString(),
      };
      
      // Always cache locally
      await cacheLocation(userId, locationData);
      
      // Only update callbacks with significant movement
      const lastCachedLocation = await getCachedLocation(userId);
      if (lastCachedLocation && onLocationUpdate) {
        const distance = calculateDistance(
          lastCachedLocation.latitude,
          lastCachedLocation.longitude,
          locationData.latitude,
          locationData.longitude
        );
        
        if (distance > LOCATION_MOVEMENT_THRESHOLD) {
          onLocationUpdate(locationData);
        }
      } else if (onLocationUpdate) {
        onLocationUpdate(locationData);
      }
      
      // Attempt to sync with database (will respect intervals)
      await syncLocationWithDatabase(userId, locationData);
    }
  );
  
  // Set up a periodic database sync
  const syncInterval = setInterval(async () => {
    const cachedLoc = await getCachedLocation(userId);
    if (cachedLoc) {
      await syncLocationWithDatabase(userId, cachedLoc, true);
    }
  }, LOCATION_DB_SYNC_INTERVAL);
  
  // Return cleanup function that handles both resources
  return {
    remove: () => {
      locationSubscription.remove();
      clearInterval(syncInterval);
    }
  };
};

/**
 * Use Supabase Presence for real-time location sharing between connected users
 * This avoids frequent database writes for active sessions
 */
export const setupLocationPresence = async (
  userId: string,
  connection: { id: string },
  initialLocation: LocationType,
  onLocationUpdate?: (userId: string, location: LocationType) => void
) => {
  // Create a unique channel name based on the connection ID
  const channelName = `location:connection:${connection.id}`;
  
  // Create the presence channel
  const channel = supabase.channel(channelName, {
    config: {
      presence: {
        key: userId,
      },
    },
  });
  
  // Track presence changes
  channel.on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState();
    
    // Process all users in the presence state
    Object.keys(state).forEach((presenceUserId) => {
      const userState = state[presenceUserId][0] as { location?: LocationType; presence_ref: string };
      if (userState?.location && onLocationUpdate) {
        onLocationUpdate(presenceUserId, userState.location);
      }
    });
  });
  
  // Track presence changes
  channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
    const userState = newPresences[0] as { location?: LocationType; presence_ref: string };
    if (userState?.location && onLocationUpdate) {
      onLocationUpdate(key, userState.location);
    }
  });
  
  // Subscribe to the channel
  channel.subscribe(async (status) => {
    if (status !== 'SUBSCRIBED') return;
    
    // Set initial presence with location
    await channel.track({
      location: initialLocation,
      online_at: new Date().toISOString(),
    } as { location: LocationType; online_at: string });
  });
  
  // Return update function and cleanup
  return {
    updateLocation: async (location: LocationType) => {
      // Update presence with new location
      await channel.track({
        location,
        online_at: new Date().toISOString(),
      } as { location: LocationType; online_at: string });
      
      // Still occasionally sync to database for persistence
      const now = Date.now();
      const lastSyncStr = await AsyncStorage.getItem(LAST_DB_SYNC_KEY + userId);
      const lastSync = lastSyncStr ? parseInt(lastSyncStr) : 0;
      
      if (now - lastSync > LOCATION_DB_SYNC_INTERVAL) {
        await syncLocationWithDatabase(userId, location, true);
      }
    },
    cleanup: () => {
      supabase.removeChannel(channel);
    }
  };
};

/**
 * Subscribe to location updates via Supabase Realtime
 * Only used for initial connection and fallbacked
 */
export const subscribeToLocationUpdates = (userId: string, callback: (location: LocationType) => void) => {
  // First check if there's cached data
  getCachedLocation(userId).then(cachedLocation => {
    if (cachedLocation) {
      callback(cachedLocation);
    }
  });
  
  // Then subscribe to real-time updates
  const channel = supabase
    .channel(`db-location:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'locations',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        callback(payload.new as LocationType);
      }
    )
    .subscribe();
  
  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Get last known location with cache priority
 */
export const getLastKnownLocation = async (userId: string): Promise<LocationType | null> => {
  try {
    // First try to get from cache
    const cachedLocation = await getCachedLocation(userId);
    if (cachedLocation) {
      return cachedLocation;
    }
    
    // Fall back to database
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) {
      console.error('Error getting last known location:', error);
      return null;
    }
    
    // Cache the result for future use
    if (data) {
      await cacheLocation(userId, data as LocationType);
    }
    
    return data as LocationType;
  } catch (error) {
    console.error('Unexpected error in getLastKnownLocation:', error);
    return null;
  }
};
````
