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
    // First sign up the user with Supabase Auth
    const { error, data } = await supabase.auth.signUp({
      email,
      password,
    });
    
    // If signup is successful, create the user profile
    if (!error && data.user) {
      // Get any existing session to ensure RLS policies work correctly
      await supabase.auth.getSession();
      
      // Prepare user data with required fields
      const newUser = {
        id: data.user.id,
        email,
        full_name: userData?.full_name || email.split('@')[0],
        role: userData?.role || 'passenger',
        avatar_url: userData?.avatar_url || null,
        created_at: new Date().toISOString(),
      };
      
      // Insert the user profile
      const { error: profileError } = await supabase
        .from('users')
        .upsert(newUser, { onConflict: 'id' });
      
      if (profileError) {
        console.error('Error creating user profile during signup:', profileError);
        // Note: We're not returning this error to avoid confusing the user
        // The auth account is created, but profile creation failed
      } else {
        console.log('User profile created successfully');
        setUser(newUser as User);
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

## File: src/hooks/useLocationTracking.ts
````typescript
import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { LocationSubscription } from 'expo-location';
import { useAuth } from '../contexts/AuthContext';
import { 
  requestLocationPermission, 
  startLocationUpdates, 
  subscribeToLocationUpdates,
  getLastKnownLocation
} from '../services/LocationService';
import { Location as LocationType, User } from '../types';

type UserLocationsMap = Map<string, LocationType>;

export const useLocationTracking = (initialUserIds: string[] = []) => {
  const { user } = useAuth();
  const [myLocation, setMyLocation] = useState<LocationType | null>(null);
  const [userLocations, setUserLocations] = useState<UserLocationsMap>(new Map());
  const [isTracking, setIsTracking] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  
  const locationWatcherRef = useRef<LocationSubscription | null>(null);
  const userSubscriptionsRef = useRef<Map<string, () => void>>(new Map());
  
  // Check permission and get initial location
  useEffect(() => {
    const checkPermissionAndGetLocation = async () => {
      const permissionResult = await requestLocationPermission();
      setPermissionGranted(permissionResult.granted);
      
      if (permissionResult.granted && user?.id) {
        const location = await getLastKnownLocation(user.id);
        if (location) {
          setMyLocation(location);
        } else {
          // If no prior location exists in database, get current location
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
      }
    };
    
    checkPermissionAndGetLocation();
  }, [user?.id]);
  
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
  
  // Subscribe to location updates for other users
  useEffect(() => {
    if (!user?.id) return;
    
    // Clean up old subscriptions
    userSubscriptionsRef.current.forEach((unsubscribe) => unsubscribe());
    userSubscriptionsRef.current.clear();
    
    // Create new subscriptions
    initialUserIds.forEach((userId) => {
      if (userId !== user.id) {
        subscribeToUserLocation(userId);
      }
    });
    
    return () => {
      userSubscriptionsRef.current.forEach((unsubscribe) => unsubscribe());
      userSubscriptionsRef.current.clear();
    };
  }, [initialUserIds, user?.id]);
  
  const startTracking = async () => {
    if (!user?.id || locationWatcherRef.current) return;
    
    console.log('Starting location tracking...');
    
    const locationResult = await startLocationUpdates(
      user.id,
      undefined,
      (location) => {
        console.log('Location update received:', location);
        setMyLocation(location);
      }
    );
    
    if (locationResult && 'error' in locationResult) {
      console.error('Error starting location tracking:', locationResult.error);
      // If permission denied, update permission state
      if (locationResult.error.denied) {
        setPermissionGranted(false);
      }
      return;
    }
    
    if (locationResult) {
      console.log('Location tracking started successfully');
      locationWatcherRef.current = locationResult;
      setIsTracking(true);
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
  
  const subscribeToUserLocation = (userId: string) => {
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
  };
  
  const unsubscribeFromUserLocation = (userId: string) => {
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

// Create a temporary profile screen until it's properly implemented
const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 20 }}>
        Profile
      </Text>
      {user && (
        <>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>
            Name: {user.full_name || 'Not set'}
          </Text>
          <Text style={{ fontSize: 18, marginBottom: 10 }}>
            Email: {user.email}
          </Text>
          <Text style={{ fontSize: 18, marginBottom: 20 }}>
            Role: {user.role || 'Not set'}
          </Text>
        </>
      )}
      <TouchableOpacity 
        style={{
          backgroundColor: '#4285F4',
          padding: 15,
          borderRadius: 10,
          marginTop: 20,
        }}
        onPress={() => signOut()}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

// Create a temporary settings screen until it's properly implemented
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
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: any = 'question-circle';
          
          if (route.name === 'Map') {
            iconName = 'map';
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
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import {
  sendMessage,
  getConversationHistory,
  markMessageAsRead,
  subscribeToConversation,
} from '../services/ChatService';
import { Message } from '../types';
import { RouteProp, useRoute } from '@react-navigation/native';

type ChatScreenParams = {
  userId: string;
  userName: string;
  tripId?: string;
};

type ChatScreenRouteProp = RouteProp<{ Chat: ChatScreenParams }, 'Chat'>;

const ChatScreen: React.FC = () => {
  const { user } = useAuth();
  const route = useRoute<ChatScreenRouteProp>();
  const { userId: receiverId, userName: receiverName, tripId } = route.params;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!user?.id) return;
    
    // Load initial chat history
    loadChatHistory();
    
    // Subscribe to new messages
    const unsubscribe = subscribeToConversation(user.id, receiverId, (newMessage) => {
      setMessages((prevMessages) => [newMessage, ...prevMessages]);
      
      // Mark message as read if received
      if (newMessage.sender_id === receiverId && newMessage.receiver_id === user.id) {
        markMessageAsRead(newMessage.id!);
      }
    });
    
    return () => {
      unsubscribe();
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
      const { data, error } = await sendMessage(user.id, receiverId, messageText, tripId);
      
      if (error) {
        console.error('Error sending message:', error);
      } else if (data) {
        // Add message to the list (this will be handled by the subscription,
        // but we add it immediately for responsive UI)
        setMessages((prevMessages) => [data, ...prevMessages]);
      }
    } catch (error) {
      console.error('Error in handleSendMessage:', error);
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
          onChangeText={setInputText}
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

## File: src/screens/MapScreen.tsx
````typescript
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Alert, Linking } from 'react-native';
import MapView from 'react-native-maps';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import { useTrip } from '../contexts/TripContext';
import useLocationTracking from '../hooks/useLocationTracking';
import UserLocationMarker from '../components/UserLocationMarker';
import { MainStackParamList } from '../navigation/AppNavigator';
import { supabase } from '../lib/supabase';
import { User } from '../types';

const { width, height } = Dimensions.get('window');
type MapScreenNavigationProp = StackNavigationProp<MainStackParamList, 'MainTabs'>;

const MapScreen: React.FC = () => {
  const { user } = useAuth();
  const { activeTrip } = useTrip();
  const navigation = useNavigation<MapScreenNavigationProp>();
  const [
    otherUsers, 
    setOtherUsers
  ] = useState<Map<string, User>>(new Map());
  
  const mapRef = useRef<MapView>(null);
  
  // Initialize with trip-related user IDs if there's an active trip
  const initialUserIds = activeTrip ? 
    [activeTrip.passenger_id, activeTrip.driver_id].filter(Boolean) as string[] : 
    [];
    
  const {
    myLocation,
    userLocations,
    isTracking,
    permissionGranted,
    toggleTracking,
    subscribeToUserLocation,
  } = useLocationTracking(initialUserIds);

  // Fetch information about other users
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchOnlineUsers = async () => {
      try {
        // Get all online users (in a real app, you would have a presence system)
        const { data } = await supabase
          .from('users')
          .select('*')
          .neq('id', user.id);

        if (data && data.length > 0) {
          const usersMap = new Map<string, User>();
          
          data.forEach(userData => {
            usersMap.set(userData.id, userData as User);
            // Subscribe to their location updates
            subscribeToUserLocation(userData.id);
          });
          
          setOtherUsers(usersMap);
        }
      } catch (error) {
        console.error('Error fetching online users:', error);
      }
    };
    
    fetchOnlineUsers();
  }, [user?.id]);

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
    const selectedUser = otherUsers.get(userId);
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

        {/* Render other users' locations */}
        {Array.from(userLocations.entries()).map(([userId, location]) => {
          const otherUser = otherUsers.get(userId);
          return otherUser ? (
            <UserLocationMarker
              key={userId}
              user={otherUser}
              location={location}
              onPress={() => handleMarkerPress(userId)}
            />
          ) : null;
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
      
      {/* Navigation buttons */}
      <View style={styles.navButtonsContainer}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => {
            // Placeholder - Add more navigation options here
            Alert.alert('Navigation', 'Add more screens to navigate to');
          }}
        >
          <FontAwesome name="user" size={20} color="white" />
          <Text style={styles.navButtonText}>Profile</Text>
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
              otherUsers.get(activeTrip.passenger_id)?.full_name || 'Passenger' :
              otherUsers.get(activeTrip.driver_id || '')?.full_name || 'Looking for driver...'}
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
                  userName: otherUsers.get(otherUserId)?.full_name || 'User',
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
  navButtonsContainer: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    flexDirection: 'column',
  },
  navButton: {
    backgroundColor: '#4285F4',
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  navButtonText: {
    color: 'white',
    fontSize: 10,
    marginTop: 2,
  },
});

export default MapScreen;
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

## File: src/screens/SignupScreen.tsx
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
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../contexts/AuthContext';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { UserRole } from '../types';

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

  const handleSignup = async () => {
    if (!email.trim() || !password.trim() || !fullName.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // Pass user data directly to the signUp method
      const userData = {
        full_name: fullName,
        role,
      };
      
      const { error } = await signUp(email, password, userData);
      
      if (error) {
        Alert.alert('Signup Failed', error.message);
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
              onPress={() => setRole('passenger')}
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
              onPress={() => setRole('driver')}
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
            style={styles.signupButton}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { FontAwesome } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';
import { MainStackParamList } from '../navigation/AppNavigator';

type UsersListNavigationProp = StackNavigationProp<MainStackParamList>;

const UsersListScreen: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigation = useNavigation<UsersListNavigationProp>();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .neq('id', currentUser.id);
      
      if (error) {
        console.error('Error fetching users:', error);
      } else {
        setUsers(data as User[]);
      }
    } catch (error) {
      console.error('Error in fetchUsers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const navigateToChat = (userId: string, userName: string) => {
    navigation.navigate('Chat', {
      userId,
      userName,
    });
  };

  const renderUserItem = ({ item }: { item: User }) => {
    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => navigateToChat(item.id, item.full_name || 'User')}
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
            styles.statusOnline, // Assuming online for demo, would need real status
          ]} />
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.full_name || 'User'}</Text>
          <Text style={styles.userRole}>
            {item.role === 'driver' ? 'Driver' : 'Passenger'}
          </Text>
        </View>
        
        <FontAwesome name="chevron-right" size={18} color="#ccc" />
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
            <Text style={styles.emptyText}>No users found</Text>
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
  statusOnline: {
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
});

export default UsersListScreen;
````

## File: src/services/ChatService.ts
````typescript
import { supabase } from '../lib/supabase';
import { Message } from '../types';

// Send a message
export const sendMessage = async (
  senderId: string,
  receiverId: string,
  content: string,
  tripId?: string
): Promise<{ data: Message | null; error: any }> => {
  const newMessage = {
    sender_id: senderId,
    receiver_id: receiverId,
    content,
    trip_id: tripId,
    read: false,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('messages')
    .insert(newMessage)
    .select()
    .single();

  return { data: data as Message, error };
};

// Get conversation history
export const getConversationHistory = async (
  userId1: string,
  userId2: string,
  tripId?: string,
  limit = 20,
  offset = 0
): Promise<{ data: Message[] | null; error: any }> => {
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

  return { data: data as Message[], error };
};

// Mark message as read
export const markMessageAsRead = async (messageId: string): Promise<{ error: any }> => {
  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('id', messageId);

  return { error };
};

// Subscribe to new messages in a conversation
export const subscribeToConversation = (
  currentUserId: string,
  otherUserId: string,
  callback: (message: Message) => void
) => {
  const channel = supabase
    .channel(`conversation:${currentUserId}-${otherUserId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `(sender_id=eq.${otherUserId} AND receiver_id=eq.${currentUserId}) OR (sender_id=eq.${currentUserId} AND receiver_id=eq.${otherUserId})`,
      },
      (payload) => {
        callback(payload.new as Message);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// Get unread message count
export const getUnreadMessageCount = async (userId: string): Promise<number> => {
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
````

## File: src/services/LocationService.ts
````typescript
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';
import { Location as LocationType } from '../types';

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
    // Return both permission status and whether we can ask again
    // If canAskAgain is false, user needs to go to settings
    return { 
      granted: false, 
      canAskAgain: permissionResponse.canAskAgain 
    };
  }
  
  return { granted: true, canAskAgain: true };
};

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

export const startLocationUpdates = async (
  userId: string,
  tripId?: string,
  onLocationUpdate?: (location: LocationType) => void
) => {
  console.log('Starting location updates for user:', userId);
  
  const permissionResult = await requestLocationPermission();
  console.log('Permission result:', permissionResult);
  
  if (!permissionResult.granted) {
    console.error('Location permission not granted');
    return { error: { denied: true, canAskAgain: permissionResult.canAskAgain } };
  }
  
  // Start watching position
  const locationSubscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      distanceInterval: 10, // Update every 10 meters
      timeInterval: 5000, // Or every 5 seconds
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
      
      // Log location data before saving
      console.log('New location data:', locationData);
      
      try {
        // Check if locations table exists and has the right schema
        const { error: tableError } = await supabase
          .from('locations')
          .select('user_id')
          .limit(1);
          
        if (tableError) {
          console.error('Error checking locations table:', tableError);
          // Try creating the table if it doesn't exist or has the wrong schema
          console.log('Attempting to save location anyway...');
        }
        
        // Save to Supabase
        const { error } = await supabase
          .from('locations')
          .upsert(
            {
              user_id: locationData.user_id,
              latitude: locationData.latitude,
              longitude: locationData.longitude,
              heading: locationData.heading,
              speed: locationData.speed,
              trip_id: locationData.trip_id,
              timestamp: locationData.timestamp,
            },
            { onConflict: 'user_id' }
          );
        
        if (error) {
          console.error('Error updating location:', error);
        } else {
          console.log('Location successfully updated in database');
          if (onLocationUpdate) {
            onLocationUpdate(locationData);
          }
        }
      } catch (e) {
        console.error('Unexpected error in location update:', e);
      }
    }
  );
  
  return locationSubscription;
};

export const subscribeToLocationUpdates = (userId: string, callback: (location: LocationType) => void) => {
  const channel = supabase
    .channel(`location:${userId}`)
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

// Get last known location for a user
export const getLastKnownLocation = async (userId: string) => {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(1)
    .single();
  
  if (error) {
    console.error('Error getting last known location:', error);
    return null;
  }
  
  return data as LocationType;
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
````

## File: .repomixignore
````
# Add patterns to ignore here, one per line
# Example:
# *.log
# tmp/
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

## File: App.tsx
````typescript
import 'react-native-gesture-handler';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { AuthProvider } from './src/contexts/AuthContext';
import { TripProvider } from './src/contexts/TripContext';
import AppNavigator from './src/navigation/AppNavigator';

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

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <AuthProvider>
          <TripProvider>
            <AppNavigator />
          </TripProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
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

## File: tsconfig.json
````json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true
  }
}
````
