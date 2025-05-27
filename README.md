# SmartFit Mobile App

A React Native mobile application for fitness tracking and workout management.

## Project Overview

SmartFit is a mobile application built with React Native and Expo that allows users to track their workouts, monitor progress, and achieve their fitness goals. The app connects to a Ruby on Rails backend API for data management and user authentication.

## Features

- **User Authentication**
  - Registration with email, first name, and last name
  - Login with email and password
  - Token-based authentication

- **Clean UI/UX**
  - Modern interface with NativeWind styling
  - Responsive design for various device sizes
  - Smooth navigation between screens

## Tech Stack

- **Frontend**
  - React Native with Expo
  - TypeScript for type safety
  - NativeWind (Tailwind CSS for React Native)
  - React Navigation for screen management
  - Axios for API requests

- **Backend**
  - Ruby on Rails API
  - PostgreSQL database
  - JWT authentication

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd smartfitfront
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

4. Run on a device or emulator:
   - Press `a` to run on Android emulator
   - Press `i` to run on iOS simulator (macOS only)
   - Scan the QR code with the Expo Go app on your physical device

### Environment Configuration

The app is configured to connect to a local backend API running on:
- `http://10.0.2.2:3000/` for Android emulator
- `http://localhost:3000/` for iOS simulator

To change the API URL, modify the `API_URL` constant in `services/authService.ts`.

## Project Structure

```
smartfitfront/
├── assets/                  # Images, fonts, and other static assets
├── components/              # Reusable UI components
├── screens/                 # Screen components
│   ├── LoginScreen.tsx      # User login screen
│   ├── RegisterScreen.tsx   # User registration screen
│   └── HomeScreen.tsx       # Main app screen after authentication
├── services/                # API services
│   └── authService.ts       # Authentication service
├── types/                   # TypeScript type definitions
│   ├── declarations/        # Module declarations for third-party libraries
│   └── index.ts             # Shared type definitions
├── App.tsx                  # Main application component
├── global.css               # Global styles for NativeWind
└── nativewind-setup.ts      # NativeWind configuration
```

## Development Notes

### TypeScript Declarations

The project uses TypeScript declarations in the `types/declarations/` directory to handle module compatibility issues, particularly with React Navigation v7 which is distributed as an ESM module.

### Styling

The app uses NativeWind v4.0.1 for styling, which provides a Tailwind CSS-like experience for React Native. Styles are applied using the `className` prop.

### Authentication Flow

1. User registers or logs in
2. Backend returns a JWT token
3. Token is stored in AsyncStorage
4. Token is included in subsequent API requests via Axios interceptors
5. User is navigated to the Home screen

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
