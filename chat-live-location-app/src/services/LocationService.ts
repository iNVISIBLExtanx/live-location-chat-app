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