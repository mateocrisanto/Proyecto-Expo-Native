import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EstadoVisionado } from '../types';

interface EstadoBadgeProps {
  estado: EstadoVisionado;
}

export const EstadoBadge: React.FC<EstadoBadgeProps> = ({ estado }) => {
  const getInfo = () => {
    switch (estado) {
      case 'por_ver':
        return { label: 'Por ver', bg: '#1e3a8a', text: '#93c5fd' };
      case 'viendo':
        return { label: 'Viendo', bg: '#78350f', text: '#fde68a' };
      case 'vista':
        return { label: 'Vista', bg: '#064e3b', text: '#6ee7b7' };
      default:
        return { label: estado, bg: '#334155', text: '#cbd5e1' };
    }
  };

  const { label, bg, text } = getInfo();

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.texto, { color: text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  texto: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

