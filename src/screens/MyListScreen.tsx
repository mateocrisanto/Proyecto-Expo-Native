import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, ElementoLista, FiltroEstado, FiltroTipo } from '../types';
import { useCartelera } from '../context/CarteleraContext';
import { PosterImage } from '../components/PosterImage';
import { EstadoBadge } from '../components/EstadoBadge';
import { RatingStars } from '../components/RatingStars';
import { OfflineNotice } from '../components/OfflineNotice';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const MyListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { lista, cargando, recargarLista } = useCartelera();

  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todos');
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('todos');
  const [refrescando, setRefrescando] = useState<boolean>(false);

  const manejarRefresh = async () => {
    setRefrescando(true);
    await recargarLista();
    setRefrescando(false);
  };

  // Filtrado reactivo por estado y tipo (RF5)
  const listaFiltrada = useMemo(() => {
    return lista.filter((item) => {
      const coincideEstado = filtroEstado === 'todos' || item.estado === filtroEstado;
      const coincideTipo = filtroTipo === 'todos' || item.tipo === filtroTipo;
      return coincideEstado && coincideTipo;
    });
  }, [lista, filtroEstado, filtroTipo]);

  const renderItem = ({ item }: { item: ElementoLista }) => {
    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardHeaderArea}
          onPress={() => navigation.navigate('Detalle', { tipo: item.tipo, tmdbId: item.tmdbId })}
          accessibilityRole="button"
          accessibilityLabel={`Ver detalle de ${item.titulo}`}
        >
          <PosterImage
            path={item.posterPath}
            size="w200"
            width={75}
            height={112}
            borderRadius={8}
            tituloFallback={item.titulo}
          />

          <View style={styles.cardDetalles}>
            <View style={styles.badgeRow}>
              <View
                style={[
                  styles.badgeTipo,
                  { backgroundColor: item.tipo === 'movie' ? '#1d4ed8' : '#7c3aed' },
                ]}
              >
                <Text style={styles.badgeTipoTexto}>
                  {item.tipo === 'movie' ? 'PELÍCULA' : 'SERIE'}
                </Text>
              </View>
              <EstadoBadge estado={item.estado} />
            </View>

            <Text style={styles.cardTitulo} numberOfLines={2}>
              {item.titulo}
            </Text>
            <Text style={styles.cardAnio}>{item.anio}</Text>

            {/* Calificación personal: solo si está vista (RF6) */}
            {item.estado === 'vista' && item.calificacionPersonal && (
              <View style={styles.ratingRow}>
                <RatingStars valor={item.calificacionPersonal} tamano={15} />
                <Text style={styles.ratingNumero}>
                  {item.calificacionPersonal} / 5
                </Text>
              </View>
            )}

            {item.comentario ? (
              <Text style={styles.comentarioPreview} numberOfLines={2}>
                "{item.comentario}"
              </Text>
            ) : null}
          </View>
        </TouchableOpacity>

        {/* Botón de editar entrada */}
        <TouchableOpacity
          style={styles.botonEditar}
          onPress={() => navigation.navigate('EditarEntrada', { item })}
          accessibilityRole="button"
          accessibilityLabel={`Editar estado y calificación de ${item.titulo}`}
        >
          <Text style={styles.botonEditarTexto}>✏️ Editar</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <OfflineNotice />

      <View style={styles.container}>
        {/* Barra de Filtros por Estado */}
        <View style={styles.filtrosSeccion}>
          <Text style={styles.filtrosLabel}>Estado:</Text>
          <View style={styles.chipsContainer}>
            {(
              [
                { id: 'todos', label: 'Todos' },
                { id: 'por_ver', label: 'Por ver' },
                { id: 'viendo', label: 'Viendo' },
                { id: 'vista', label: 'Vista' },
              ] as const
            ).map((filtro) => {
              const activo = filtroEstado === filtro.id;
              return (
                <TouchableOpacity
                  key={filtro.id}
                  style={[styles.chip, activo && styles.chipActivo]}
                  onPress={() => setFiltroEstado(filtro.id)}
                  accessibilityRole="button"
                >
                  <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]}>
                    {filtro.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Barra de Filtros por Tipo */}
        <View style={styles.filtrosSeccion}>
          <Text style={styles.filtrosLabel}>Tipo:</Text>
          <View style={styles.chipsContainer}>
            {(
              [
                { id: 'todos', label: 'Todos' },
                { id: 'movie', label: 'Películas' },
                { id: 'tv', label: 'Series' },
              ] as const
            ).map((filtro) => {
              const activo = filtroTipo === filtro.id;
              return (
                <TouchableOpacity
                  key={filtro.id}
                  style={[styles.chip, activo && styles.chipActivo]}
                  onPress={() => setFiltroTipo(filtro.id)}
                  accessibilityRole="button"
                >
                  <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]}>
                    {filtro.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Conteo de resultados */}
        <View style={styles.conteoBarra}>
          <Text style={styles.conteoTexto}>
            Mostrando {listaFiltrada.length} de {lista.length} obras
          </Text>
        </View>

        {cargando && lista.length === 0 ? (
          <View style={styles.centroVacio}>
            <ActivityIndicator size="large" color="#e11d48" />
            <Text style={styles.cargandoTexto}>Cargando tu cartelera...</Text>
          </View>
        ) : listaFiltrada.length === 0 ? (
          <View style={styles.centroVacio}>
            <Text style={styles.iconoVacio}>📋</Text>
            <Text style={styles.tituloVacio}>
              {lista.length === 0 ? 'Tu lista está vacía' : 'Sin obras en este filtro'}
            </Text>
            <Text style={styles.subtituloVacio}>
              {lista.length === 0
                ? 'Busca películas y series en la pestaña Buscar para agregarlas aquí.'
                : 'Prueba cambiando los filtros de estado o tipo para ver otras obras.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={listaFiltrada}
            keyExtractor={(item) => item.itemId}
            renderItem={renderItem}
            contentContainerStyle={styles.listaContent}
            refreshControl={
              <RefreshControl
                refreshing={refrescando}
                onRefresh={manejarRefresh}
                tintColor="#e11d48"
                colors={['#e11d48']}
              />
            }
          />
        )}
      </View>
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
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  filtrosSeccion: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  filtrosLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
    width: 52,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    flex: 1,
  },
  chip: {
    paddingHorizontal: 10,
    minHeight: 34,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#1e293b',
    borderWidth: 1,
    borderColor: '#334155',
  },
  chipActivo: {
    backgroundColor: '#e11d48',
    borderColor: '#e11d48',
  },
  chipTexto: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextoActivo: {
    color: '#ffffff',
    fontWeight: '700',
  },
  conteoBarra: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    marginBottom: 10,
  },
  conteoTexto: {
    color: '#64748b',
    fontSize: 12,
  },
  listaContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeaderArea: {
    flexDirection: 'row',
  },
  cardDetalles: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  badgeTipo: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeTipoTexto: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  cardTitulo: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 18,
  },
  cardAnio: {
    color: '#94a3b8',
    fontSize: 12,
    marginVertical: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 6,
  },
  ratingNumero: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '700',
  },
  comentarioPreview: {
    color: '#cbd5e1',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  botonEditar: {
    marginTop: 10,
    backgroundColor: '#334155',
    minHeight: 40,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#475569',
  },
  botonEditarTexto: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '600',
  },
  centroVacio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  cargandoTexto: {
    color: '#cbd5e1',
    marginTop: 12,
    fontSize: 14,
  },
  iconoVacio: {
    fontSize: 48,
    marginBottom: 12,
  },
  tituloVacio: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtituloVacio: {
    color: '#94a3b8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});

