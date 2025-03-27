import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar'; // Import StatusBar

import AppNavigator from './src/navigation/AppNavigator'; // Import the navigator

export default function App() {
  return (
    <NavigationContainer>
        <StatusBar style="auto" /> {/* Or "dark", "light" based on your design */}
        <AppNavigator />
    </NavigationContainer>
  );
}