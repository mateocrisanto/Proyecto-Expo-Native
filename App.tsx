import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { CarteleraProvider } from './src/context/CarteleraContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CarteleraProvider>
          <StatusBar style="light" />
          <AppNavigator />
        </CarteleraProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
