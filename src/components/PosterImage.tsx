import React, { useState } from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { armarUrlImagen } from '../services/tmdbService';

interface PosterImageProps {
  path: string | null | undefined;
  size?: 'w200' | 'w342' | 'w500' | 'w780';
  width: number;
  height: number;
  borderRadius?: number;
  tituloFallback?: string;
}

export const PosterImage: React.FC<PosterImageProps> = ({
  path,
  size = 'w342',
  width,
  height,
  borderRadius = 8,
  tituloFallback,
}) => {
  const [errorCarga, setErrorCarga] = useState<boolean>(false);
  const url = armarUrlImagen(path, size);

  if (!url || errorCarga) {
    return (
      <View
        style={[
          styles.placeholderContainer,
          { width, height, borderRadius },
        ]}
      >
        <Text style={styles.placeholderIcon}>🎬</Text>
        <Text style={styles.placeholderText} numberOfLines={2}>
          {tituloFallback || 'Sin carátula'}
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri: url }}
      style={[{ width, height, borderRadius }, styles.imagen]}
      resizeMode="cover"
      onError={() => setErrorCarga(true)}
    />
  );
};

const styles = StyleSheet.create({
  imagen: {
    backgroundColor: '#1e293b',
  },
  placeholderContainer: {
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#475569',
  },
  placeholderIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  placeholderText: {
    color: '#94a3b8',
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '500',
  },
});

