import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, EstadoVisionado } from '../types';
import { useCartelera } from '../context/CarteleraContext';
import { PosterImage } from '../components/PosterImage';
import { RatingStars } from '../components/RatingStars';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type EditRouteProp = RouteProp<RootStackParamList, 'EditarEntrada'>;

export const EditEntryScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EditRouteProp>();
  const { item } = route.params;

  const { actualizar, eliminar } = useCartelera();

  const [estado, setEstado] = useState<EstadoVisionado>(item.estado);
  const [calificacion, setCalificacion] = useState<number | null>(item.calificacionPersonal);
  const [comentario, setComentario] = useState<string>(item.comentario || '');
  const [guardando, setGuardando] = useState<boolean>(false);
  const [eliminando, setEliminando] = useState<boolean>(false);

  // Cuando cambia el estado, si no es 'vista', la calificación debe ser nula (RF6)
  const cambiarEstado = (nuevoEstado: EstadoVisionado) => {
    setEstado(nuevoEstado);
    if (nuevoEstado !== 'vista') {
      setCalificacion(null);
    } else if (calificacion === null) {
      // Si pasa a vista y no tenía calificación, sugerimos 5 o dejamos elegir
      setCalificacion(5);
    }
  };

  const manejarGuardar = async () => {
    setGuardando(true);
    try {
      await actualizar(item.itemId, {
        estado,
        calificacionPersonal: estado === 'vista' ? calificacion : null,
        comentario: comentario.trim(),
      });

      Alert.alert('Guardado', 'Los cambios se actualizaron correctamente.', [
        { text: 'Aceptar', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'No se pudieron guardar los cambios.');
    } finally {
      setGuardando(false);
    }
  };

  // RF7: Quitar de Mi lista pide confirmación antes de borrar
  const confirmarEliminar = () => {
    Alert.alert(
      'Quitar de Mi Lista',
      `¿Estás seguro de que deseas eliminar "${item.titulo}" de tu lista personal? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setEliminando(true);
            try {
              await eliminar(item.itemId);
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'No se pudo eliminar la obra.');
            } finally {
              setEliminando(false);
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardView}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header con Poster y Título */}
        <View style={styles.header}>
          <PosterImage
            path={item.posterPath}
            size="w200"
            width={70}
            height={105}
            borderRadius={8}
            tituloFallback={item.titulo}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.titulo}>{item.titulo}</Text>
            <Text style={styles.subtitulo}>
              {item.tipo === 'movie' ? 'Película' : 'Serie'} • {item.anio}
            </Text>
          </View>
        </View>

        {/* Selector de Estado (RF6) */}
        <View style={styles.seccion}>
          <Text style={styles.seccionLabel}>Estado de visionado:</Text>
          <View style={styles.selectorEstado}>
            {(
              [
                { id: 'por_ver', label: 'Por ver' },
                { id: 'viendo', label: 'Viendo' },
                { id: 'vista', label: 'Vista' },
              ] as const
            ).map((opcion) => {
              const seleccionado = estado === opcion.id;
              return (
                <TouchableOpacity
                  key={opcion.id}
                  style={[styles.botonOpcion, seleccionado && styles.botonOpcionActivo]}
                  onPress={() => cambiarEstado(opcion.id)}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.botonOpcionTexto,
                      seleccionado && styles.botonOpcionTextoActivo,
                    ]}
                  >
                    {opcion.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Calificación Personal (RF6: Solo si estado es 'vista') */}
        <View style={styles.seccion}>
          <Text style={styles.seccionLabel}>Mi Calificación (1 a 5 estrellas):</Text>
          {estado === 'vista' ? (
            <View style={styles.calificacionContainer}>
              <RatingStars
                valor={calificacion}
                onChange={(nuevo) => setCalificacion(nuevo)}
                editable={true}
                tamano={36}
              />
              <Text style={styles.calificacionTexto}>
                {calificacion ? `${calificacion} de 5 estrellas` : 'Toca una estrella para calificar'}
              </Text>
            </View>
          ) : (
            <View style={styles.avisoBloqueo}>
              <Text style={styles.avisoBloqueoIcono}>ℹ️</Text>
              <Text style={styles.avisoBloqueoTexto}>
                Solo puedes asignar una calificación si la obra está marcada como "Vista".
              </Text>
            </View>
          )}
        </View>

        {/* Comentario (RF6: hasta 500 caracteres) */}
        <View style={styles.seccion}>
          <View style={styles.comentarioHeader}>
            <Text style={styles.seccionLabel}>Mi Comentario personal:</Text>
            <Text
              style={[
                styles.contadorTexto,
                comentario.length >= 500 && styles.contadorLimite,
              ]}
            >
              {comentario.length} / 500
            </Text>
          </View>
          <TextInput
            style={styles.comentarioInput}
            multiline
            numberOfLines={4}
            maxLength={500}
            placeholder="Escribe tu opinión, reseña o notas sobre esta obra..."
            placeholderTextColor="#64748b"
            value={comentario}
            onChangeText={setComentario}
            textAlignVertical="top"
          />
        </View>

        {/* Botón Guardar Cambios */}
        <TouchableOpacity
          style={[styles.botonGuardar, guardando && styles.botonDeshabilitado]}
          onPress={manejarGuardar}
          disabled={guardando || eliminando}
          accessibilityRole="button"
        >
          {guardando ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.botonGuardarTexto}>Guardar Cambios</Text>
          )}
        </TouchableOpacity>

        {/* Botón Destructivo: Quitar de Mi Lista (RF7) */}
        <TouchableOpacity
          style={[styles.botonEliminar, eliminando && styles.botonDeshabilitado]}
          onPress={confirmarEliminar}
          disabled={guardando || eliminando}
          accessibilityRole="button"
        >
          {eliminando ? (
            <ActivityIndicator color="#ef4444" />
          ) : (
            <Text style={styles.botonEliminarTexto}>🗑️ Quitar de mi lista</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
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
  header: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  titulo: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
  },
  subtitulo: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 4,
  },
  seccion: {
    marginBottom: 22,
  },
  seccionLabel: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  selectorEstado: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  botonOpcion: {
    flex: 1,
    minHeight: 44, // Cumple > 44px
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  botonOpcionActivo: {
    backgroundColor: '#e11d48',
  },
  botonOpcionTexto: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  botonOpcionTextoActivo: {
    color: '#ffffff',
    fontWeight: '700',
  },
  calificacionContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  calificacionTexto: {
    color: '#fbbf24',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  avisoBloqueo: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  avisoBloqueoIcono: {
    fontSize: 18,
    marginRight: 10,
  },
  avisoBloqueoTexto: {
    flex: 1,
    color: '#94a3b8',
    fontSize: 13,
    lineHeight: 18,
  },
  comentarioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contadorTexto: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  contadorLimite: {
    color: '#ef4444',
  },
  comentarioInput: {
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    color: '#f8fafc',
    fontSize: 14,
    padding: 12,
    minHeight: 110,
  },
  botonGuardar: {
    backgroundColor: '#e11d48',
    minHeight: 48, // Cumple > 44px
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  botonGuardarTexto: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  botonEliminar: {
    backgroundColor: 'transparent',
    minHeight: 48, // Cumple > 44px
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonEliminarTexto: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '700',
  },
  botonDeshabilitado: {
    opacity: 0.5,
  },
});

