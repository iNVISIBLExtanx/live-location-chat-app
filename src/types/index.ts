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
