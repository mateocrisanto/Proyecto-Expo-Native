import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuth } from '../context/AuthContext';
import { RootStackParamList, MainTabParamList } from '../types';

import { LoginScreen } from '../screens/LoginScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { MyListScreen } from '../screens/MyListScreen';
import { DetailScreen } from '../screens/DetailScreen';
import { EditEntryScreen } from '../screens/EditEntryScreen';
import { AboutScreen } from '../screens/AboutScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Navegador de pestañas inferiores principales (1.5)
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0f172a',
        },
        headerTintColor: '#f8fafc',
        headerTitleStyle: {
          fontWeight: '700',
        },
        tabBarStyle: {
          backgroundColor: '#0f172a',
          borderTopColor: '#1e293b',
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: '#e11d48',
        tabBarInactiveTintColor: '#64748b',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="BuscarTab"
        component={SearchScreen}
        options={{
          title: 'Buscar',
          tabBarLabel: 'Buscar',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>🔍</Text>
          ),
        }}
      />
      <Tab.Screen
        name="MiListaTab"
        component={MyListScreen}
        options={{
          title: 'Mi Lista',
          tabBarLabel: 'Mi Lista',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>📋</Text>
          ),
        }}
      />
      <Tab.Screen
        name="AcercaDeTab"
        component={AboutScreen}
        options={{
          title: 'Acerca de',
          tabBarLabel: 'Acerca de',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 20, color }}>ℹ️</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Navegador raíz con condicional según estado de sesión de Firebase Auth (RF1)
export function AppNavigator() {
  const { usuario, cargando } = useAuth();

  // Pantalla de carga mientras se restaura la sesión persistente desde AsyncStorage
  if (cargando) {
    return (
      <View style={styles.splashContainer}>
        <Text style={styles.splashIcon}>🎬</Text>
        <Text style={styles.splashTitulo}>Mi Cartelera</Text>
        <ActivityIndicator size="large" color="#e11d48" style={styles.spinner} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#0f172a',
          },
          headerTintColor: '#f8fafc',
          headerTitleStyle: {
            fontWeight: '700',
          },
          contentStyle: {
            backgroundColor: '#0f172a',
          },
        }}
      >
        {!usuario ? (
          // Flujo no autenticado
          <Stack.Screen
            name="Auth"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          // Flujo autenticado
          <>
            <Stack.Screen
              name="Main"
              component={MainTabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Detalle"
              component={DetailScreen}
              options={{
                title: 'Detalle de la obra',
                headerBackTitle: 'Volver',
              }}
            />
            <Stack.Screen
              name="EditarEntrada"
              component={EditEntryScreen}
              options={{
                title: 'Editar mi entrada',
                headerBackTitle: 'Volver',
                presentation: 'modal',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  splashTitulo: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '800',
  },
  spinner: {
    marginTop: 24,
  },
});

