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
