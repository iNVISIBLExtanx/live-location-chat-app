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
