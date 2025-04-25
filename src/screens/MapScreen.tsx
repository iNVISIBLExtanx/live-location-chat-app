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