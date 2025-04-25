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
