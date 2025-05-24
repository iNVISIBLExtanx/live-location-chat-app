# Live Location Chat App

A mobile application built with React Native/Expo and Supabase that enables real-time location sharing and messaging between users. Inspired by the Uber driver-passenger interaction flow, this app allows users to see each other's live location on a map and communicate through real-time chat.

## Features

- **User Authentication**
  - Sign up and login functionality
  - Profile management
  - Role-based access (drivers and passengers)

- **Real-Time Location Sharing**
  - Live location tracking and updates
  - Location sharing toggle
  - Map visualization of all active users

- **Real-Time Chat**
  - One-to-one messaging
  - Message history
  - Read status
  - Real-time updates

- **Interactive Maps**
  - Current location display
  - Other users' locations
  - Smooth animations and updates

## Tech Stack

### Frontend
- **Expo/React Native** - Cross-platform mobile application framework
- **TypeScript** - For type-safe code
- **React Navigation** - For screen navigation
- **Expo Location** - For accessing device location
- **React Native Maps** - For map visualization

### Backend
- **Supabase** - Backend as a Service
  - Authentication
  - PostgreSQL Database
  - Real-time subscriptions
  - Row Level Security policies

## Project Structure

```
/src
  /components       # Reusable UI components
  /screens          # App screens
  /contexts         # React contexts for state management
  /hooks            # Custom React hooks
  /lib              # External library configurations
  /navigation       # Navigation setup
  /services         # Business logic and API calls
  /types            # TypeScript type definitions
  /utils            # Utility functions
/assets             # Images, fonts, etc.
/supabase           # Supabase-related configurations and migrations
```

## Implementation Details

### Key Features Implemented

- **Authentication System**
  - Complete email/password authentication flow using Supabase Auth
  - User profiles with role selection (driver/passenger)
  - Secure token storage and session management

- **Real-Time Location Tracking**
  - Location permission handling and background tracking
  - Real-time updates using Supabase's Realtime capabilities
  - Custom map markers for visualizing users on the map

- **Real-Time Chat**
  - One-to-one messaging with real-time updates
  - Message history with pagination support
  - Read status tracking and message timestamps

- **Trip Management**
  - Trip status tracking (requested, accepted, in progress, completed)
  - Integration with the map for route visualization
  - Trip-specific chat context

### Directory Structure

```
/src
  /components      # Reusable UI components like MessageBubble, UserLocationMarker
  /contexts        # React contexts for Authentication and Trip management
  /hooks           # Custom hooks for location tracking
  /lib             # External library configurations (Supabase)
  /navigation      # App navigation structure
  /screens         # Main app screens (Login, Map, Chat, etc.)
  /services        # Business logic (LocationService, ChatService, TripService)
  /types           # TypeScript type definitions
  /utils           # Utility functions for dates, locations, etc.
/assets            # App icons and images
/supabase          # Supabase database migrations
```

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Supabase account

### Installation Steps

1. **Clone the repository**

2. **Install dependencies**
   ```bash
   cd chat-live-location-app
   npm install
   ```

3. **Supabase Setup**
   - Create a new Supabase project at https://app.supabase.io
   - Run the SQL migrations from `/supabase/migrations/20250422_init.sql`
   - Enable the Realtime feature in your Supabase project settings
   - Update the Supabase URL and anon key in `.env` file

4. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials:
     ```
     SUPABASE_URL=https://your-project-id.supabase.co
     SUPABASE_ANON_KEY=your-anon-key
     ```

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Run on a device or emulator**
   - Press `a` for Android
   - Press `i` for iOS
   - Scan QR code with the Expo Go app on your physical device

## Security

- Authentication is handled by Supabase Auth
- Row Level Security (RLS) policies are implemented for all tables
- Sensitive data is protected with proper access controls

## Current Status and Next Steps

The app has a fully functional implementation of the core features:

✅ User Authentication and Profile Management  
✅ Real-time Location Sharing  
✅ Interactive Map with Custom Markers  
✅ Real-time Chat System  
✅ Trip Management Context and State Handling  

Next development priorities:

1. **Complete Push Notifications**  
   - Implement Expo Notifications for chat messages and trip updates
   - Add notification preferences in user settings

2. **Enhance Trip Management**  
   - Add a trip request form for passengers
   - Implement driver-passenger matching algorithm
   - Create trip history view and ratings

3. **Optimize for Performance**  
   - Add offline capabilities with local data caching
   - Optimize battery usage for location tracking
   - Implement data synchronization strategies

4. **Expand Features**  
   - Add voice/video messaging
   - Implement route visualization and ETA calculation
   - Add payment integration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
