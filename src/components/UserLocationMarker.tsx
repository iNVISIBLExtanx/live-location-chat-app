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
