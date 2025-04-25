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

export const getLastKnownLocation = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .maybeSingle(); // Changed from single() to maybeSingle()
    
    if (error) {
      console.error('Error getting last known location:', error);
      return null;
    }
    
    return data as LocationType;
  } catch (error) {
    console.error('Unexpected error in getLastKnownLocation:', error);
    return null;
  }
};
