import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface RatingStarsProps {
  valor: number | null;
  onChange?: (nuevoValor: number) => void;
  editable?: boolean;
  tamano?: number;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  valor,
  onChange,
  editable = false,
  tamano = 24,
}) => {
  const ratingActual = valor ?? 0;

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((estrella) => {
        const seleccionada = estrella <= ratingActual;
        const contenido = (
          <Text
            style={[
              styles.estrella,
              { fontSize: tamano },
              seleccionada ? styles.estrellaActiva : styles.estrellaInactiva,
            ]}
          >
            ★
          </Text>
        );

        if (editable && onChange) {
          return (
            <TouchableOpacity
              key={estrella}
              onPress={() => onChange(estrella)}
              style={styles.touchableArea}
              accessibilityRole="button"
              accessibilityLabel={`${estrella} estrella${estrella > 1 ? 's' : ''}`}
            >
              {contenido}
            </TouchableOpacity>
          );
        }

        return <View key={estrella}>{contenido}</View>;
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  touchableArea: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  estrella: {
    marginHorizontal: 2,
  },
  estrellaActiva: {
    color: '#fbbf24', // Dorado brillante
  },
  estrellaInactiva: {
    color: '#475569', // Gris oscuro
  },
});

