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
