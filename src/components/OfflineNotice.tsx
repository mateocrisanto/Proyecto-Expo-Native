import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useCartelera } from '../context/CarteleraContext';

/**
 * Banner superior que notifica al usuario cuando se encuentra sin conexión (RF8)
 */
export const OfflineNotice: React.FC = () => {
  const { sinConexion } = useCartelera();

  if (!sinConexion) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.texto}>
        📡 Modo sin conexión activo: Mostrando datos de la última copia local (AsyncStorage).
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#b91c1c', // Rojo advertencia
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  texto: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});

