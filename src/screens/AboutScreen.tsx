import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { OfflineNotice } from '../components/OfflineNotice';

const TMDB_LOGO_URL =
  'https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.png';

export const AboutScreen: React.FC = () => {
  const { usuario, logout } = useAuth();

  const manejarCerrarSesion = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Deseas cerrar tu sesión actual?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'No se pudo cerrar sesión.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <OfflineNotice />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Marca de la App */}
        <View style={styles.appHeader}>
          <Text style={styles.appIcono}>🎬</Text>
          <Text style={styles.appTitulo}>Mi Cartelera Personal</Text>
          <Text style={styles.appVersion}>Versión 1.0.0 • Expo SDK 58</Text>
        </View>

        {/* Sección de Sesión y Usuario */}
        <View style={styles.tarjeta}>
          <Text style={styles.tarjetaTitulo}>Cuenta de Usuario</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Correo:</Text>
            <Text style={styles.infoValor} numberOfLines={1}>
              {usuario?.email || 'No disponible'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID Usuario:</Text>
            <Text style={styles.infoValorId} numberOfLines={1}>
              {usuario?.uid || 'No disponible'}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.botonLogout}
            onPress={manejarCerrarSesion}
            accessibilityRole="button"
          >
            <Text style={styles.botonLogoutTexto}>🚪 Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        {/* Atribución Obligatoria de TMDB (RF9 / 1.8) */}
        <View style={styles.tarjeta}>
          <Text style={styles.tarjetaTitulo}>Créditos y Atribución</Text>

          <View style={styles.tmdbLogoContainer}>
            <Image
              source={{ uri: TMDB_LOGO_URL }}
              style={styles.tmdbLogo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.avisoTmdbBox}>
            <Text style={styles.avisoTmdbTexto}>
              "This product uses the TMDB API but is not endorsed or certified by TMDB."
            </Text>
          </View>

          <Text style={styles.descripcionAtribucion}>
            Esta aplicación utiliza los servicios y la base de datos de The Movie Database (TMDB)
            con fines exclusivamente educativos y no comerciales, bajo los lineamientos oficiales
            de la API v3.
          </Text>
        </View>

        {/* Tecnologías Utilizadas */}
        <View style={styles.tarjeta}>
          <Text style={styles.tarjetaTitulo}>Arquitectura de la App</Text>
          <Text style={styles.techItem}>• <Text style={styles.techBold}>React Native & Expo</Text> (TypeScript)</Text>
          <Text style={styles.techItem}>• <Text style={styles.techBold}>Firebase Auth</Text> (Persistencia de sesión)</Text>
          <Text style={styles.techItem}>• <Text style={styles.techBold}>Cloud Firestore</Text> (Subcolecciones por usuario)</Text>
          <Text style={styles.techItem}>• <Text style={styles.techBold}>TMDB API v3</Text> (Búsqueda y detalle con créditos)</Text>
          <Text style={styles.techItem}>• <Text style={styles.techBold}>AsyncStorage</Text> (Copia en caché y modo offline)</Text>
          <Text style={styles.techItem}>• <Text style={styles.techBold}>React Navigation</Text> (Bottom Tabs + Native Stack)</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  appHeader: {
    alignItems: 'center',
    marginVertical: 20,
  },
  appIcono: {
    fontSize: 50,
    marginBottom: 8,
  },
  appTitulo: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  appVersion: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 4,
  },
  tarjeta: {
    backgroundColor: '#1e293b',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tarjetaTitulo: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  infoLabel: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  infoValor: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '500',
    maxWidth: '65%',
  },
  infoValorId: {
    color: '#64748b',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    maxWidth: '65%',
  },
  botonLogout: {
    backgroundColor: '#334155',
    minHeight: 46, // Cumple > 44px
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#475569',
  },
  botonLogoutTexto: {
    color: '#f87171',
    fontSize: 15,
    fontWeight: '700',
  },
  tmdbLogoContainer: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tmdbLogo: {
    width: 140,
    height: 35,
  },
  avisoTmdbBox: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#38bdf8',
    marginBottom: 12,
  },
  avisoTmdbTexto: {
    color: '#bae6fd',
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
    textAlign: 'center',
  },
  descripcionAtribucion: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18,
  },
  techItem: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 22,
  },
  techBold: {
    color: '#f8fafc',
    fontWeight: '700',
  },
});
