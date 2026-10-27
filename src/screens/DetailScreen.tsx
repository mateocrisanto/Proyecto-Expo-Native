import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, DetalleObra } from '../types';
import { obtenerDetalle } from '../services/tmdbService';
import { useCartelera } from '../context/CarteleraContext';
import { PosterImage } from '../components/PosterImage';
import { EstadoBadge } from '../components/EstadoBadge';
import { RatingStars } from '../components/RatingStars';
import { OfflineNotice } from '../components/OfflineNotice';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type DetailRouteProp = RouteProp<RootStackParamList, 'Detalle'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const DetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<DetailRouteProp>();
  const { tipo, tmdbId } = route.params;

  const { estaEnLista, obtenerDeLista, agregar } = useCartelera();

  const [detalle, setDetalle] = useState<DetalleObra | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState<boolean>(false);

  const enLista = estaEnLista(tipo, tmdbId);
  const itemGuardado = obtenerDeLista(tipo, tmdbId);

  useEffect(() => {
    let montado = true;

    const cargar = async () => {
      setCargando(true);
      setError(null);
      try {
        const datos = await obtenerDetalle(tipo, tmdbId);
        if (montado) {
          setDetalle(datos);
        }
      } catch (err: any) {
        if (montado) {
          setError(err?.message || 'No se pudo cargar el detalle de la obra.');
        }
      } finally {
        if (montado) setCargando(false);
      }
    };

    cargar();

    return () => {
      montado = false;
    };
  }, [tipo, tmdbId]);

  const manejarAgregar = async () => {
    if (!detalle) return;

    setGuardando(true);
    try {
      await agregar({
        tmdbId: detalle.id,
        tipo: detalle.tipo,
        titulo: detalle.titulo,
        anio: detalle.anio,
        posterPath: detalle.posterPath,
        estado: 'por_ver', // Estado inicial por defecto (RF4)
        calificacionPersonal: null,
        comentario: '',
      });

      Alert.alert(
        '¡Agregada con éxito! 🎬',
        `"${detalle.titulo}" se agregó a tu lista con estado "Por ver".`,
        [
          { text: 'Aceptar' },
          {
            text: 'Personalizar ahora',
            onPress: () => {
              const actualizado = obtenerDeLista(tipo, tmdbId);
              if (actualizado) {
                navigation.navigate('EditarEntrada', { item: actualizado });
              }
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'No se pudo agregar a la lista.');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <View style={styles.centroCarga}>
        <ActivityIndicator size="large" color="#e11d48" />
        <Text style={styles.textoCarga}>Cargando información de TMDB...</Text>
      </View>
    );
  }

  if (error || !detalle) {
    return (
      <View style={styles.centroCarga}>
        <Text style={styles.errorIcono}>⚠️</Text>
        <Text style={styles.errorTexto}>{error || 'Detalles no encontrados.'}</Text>
        <TouchableOpacity
          style={styles.botonVolver}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
        >
          <Text style={styles.botonVolverTexto}>Regresar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <OfflineNotice />

      {/* Header con Poster y datos principales */}
      <View style={styles.header}>
        <PosterImage
          path={detalle.posterPath}
          size="w500"
          width={SCREEN_WIDTH * 0.42}
          height={SCREEN_WIDTH * 0.63}
          borderRadius={12}
          tituloFallback={detalle.titulo}
        />

        <View style={styles.headerInfo}>
          <Text style={styles.titulo}>{detalle.titulo}</Text>

          <View style={styles.subMeta}>
            <Text style={styles.metaTexto}>{detalle.anio}</Text>
            {detalle.duracion && (
              <>
                <Text style={styles.puntoSeparador}>•</Text>
                <Text style={styles.metaTexto}>{detalle.duracion}</Text>
              </>
            )}
          </View>

          {/* Calificación TMDB */}
          <View style={styles.calificacionBox}>
            <Text style={styles.estrellaIcon}>★</Text>
            <Text style={styles.puntajeTmdb}>{detalle.calificacionTmdb}</Text>
            <Text style={styles.votosTmdb}>({detalle.votosCount} votos)</Text>
          </View>

          {/* Géneros */}
          <View style={styles.generosContainer}>
            {detalle.generos.map((g, idx) => (
              <View key={idx} style={styles.generoChip}>
                <Text style={styles.generoTexto}>{g}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Sección Estado en Mi Lista */}
      <View style={styles.seccionLista}>
        {enLista && itemGuardado ? (
          <View style={styles.tarjetaEnLista}>
            <View style={styles.enListaHeader}>
              <Text style={styles.enListaTitulo}>✓ En tu lista personal</Text>
              <EstadoBadge estado={itemGuardado.estado} />
            </View>

            {itemGuardado.estado === 'vista' && itemGuardado.calificacionPersonal && (
              <View style={styles.enListaRating}>
                <Text style={styles.enListaRatingLabel}>Tu calificación:</Text>
                <RatingStars valor={itemGuardado.calificacionPersonal} tamano={18} />
              </View>
            )}

            {itemGuardado.comentario ? (
              <Text style={styles.enListaComentario} numberOfLines={2}>
                "{itemGuardado.comentario}"
              </Text>
            ) : null}

            <TouchableOpacity
              style={styles.botonEditarEntrada}
              onPress={() => navigation.navigate('EditarEntrada', { item: itemGuardado })}
              accessibilityRole="button"
            >
              <Text style={styles.botonEditarTexto}>✏️ Editar mi entrada</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.botonAgregar, guardando && styles.botonDeshabilitado]}
            onPress={manejarAgregar}
            disabled={guardando}
            accessibilityRole="button"
          >
            {guardando ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.botonAgregarTexto}>+ Agregar a Mi Lista</Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Sinopsis (RF3: Texto alternativo si falta) */}
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>Sinopsis</Text>
        <Text style={styles.sinopsisTexto}>{detalle.sinopsis}</Text>
      </View>

      {/* Elenco principal (RF3: funciona si falta el elenco) */}
      <View style={styles.seccion}>
        <Text style={styles.seccionTitulo}>Elenco Principal</Text>
        {detalle.elenco.length === 0 ? (
          <Text style={styles.sinElencoTexto}>Información de elenco no disponible.</Text>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.elencoList}
          >
            {detalle.elenco.map((actor) => (
              <View key={actor.id} style={styles.actorCard}>
                <PosterImage
                  path={actor.fotoPath}
                  size="w200"
                  width={80}
                  height={110}
                  borderRadius={8}
                  tituloFallback={actor.nombre}
                />
                <Text style={styles.actorNombre} numberOfLines={1}>
                  {actor.nombre}
                </Text>
                <Text style={styles.actorPersonaje} numberOfLines={1}>
                  {actor.personaje}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    paddingBottom: 40,
  },
  centroCarga: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  textoCarga: {
    color: '#cbd5e1',
    marginTop: 12,
    fontSize: 15,
  },
  errorIcono: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorTexto: {
    color: '#f87171',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
  },
  botonVolver: {
    backgroundColor: '#334155',
    minHeight: 44,
    paddingHorizontal: 24,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonVolverTexto: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '700',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  titulo: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
  },
  subMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  metaTexto: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  puntoSeparador: {
    color: '#64748b',
    marginHorizontal: 6,
  },
  calificacionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  estrellaIcon: {
    color: '#fbbf24',
    fontSize: 16,
    marginRight: 4,
  },
  puntajeTmdb: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '800',
  },
  votosTmdb: {
    color: '#94a3b8',
    fontSize: 12,
    marginLeft: 6,
  },
  generosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    gap: 6,
  },
  generoChip: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  generoTexto: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '600',
  },
  seccionLista: {
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  botonAgregar: {
    backgroundColor: '#e11d48',
    minHeight: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#e11d48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
  botonAgregarTexto: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  tarjetaEnLista: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  enListaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  enListaTitulo: {
    color: '#4ade80',
    fontSize: 15,
    fontWeight: '700',
  },
  enListaRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  enListaRatingLabel: {
    color: '#cbd5e1',
    fontSize: 13,
  },
  enListaComentario: {
    color: '#94a3b8',
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 6,
  },
  botonEditarEntrada: {
    marginTop: 12,
    backgroundColor: '#334155',
    minHeight: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonEditarTexto: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '700',
  },
  seccion: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  seccionTitulo: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  sinopsisTexto: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 22,
  },
  sinElencoTexto: {
    color: '#94a3b8',
    fontSize: 14,
    fontStyle: 'italic',
  },
  elencoList: {
    paddingVertical: 4,
    gap: 12,
  },
  actorCard: {
    width: 80,
  },
  actorNombre: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  actorPersonaje: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 1,
  },
});

