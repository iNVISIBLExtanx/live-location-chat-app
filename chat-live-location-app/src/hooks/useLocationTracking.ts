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