import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Keyboard,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, ItemBusqueda } from '../types';
import { buscarObras } from '../services/tmdbService';
import { PosterImage } from '../components/PosterImage';
import { OfflineNotice } from '../components/OfflineNotice';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SearchScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [textoBusqueda, setTextoBusqueda] = useState<string>('');
  const [resultados, setResultados] = useState<ItemBusqueda[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [busquedaRealizada, setBusquedaRealizada] = useState<boolean>(false);

  const ejecutarBusqueda = async () => {
    const query = textoBusqueda.trim();
    if (!query) return;

    Keyboard.dismiss();
    setCargando(true);
    setError(null);
    setBusquedaRealizada(true);

    try {
      const data = await buscarObras(query);
      setResultados(data.resultados);
    } catch (err: any) {
      setError(err?.message || 'Ocurrió un error al conectar con TMDB.');
      setResultados([]);
    } finally {
      setCargando(false);
    }
  };

  const limpiarBusqueda = () => {
    setTextoBusqueda('');
    setResultados([]);
    setError(null);
    setBusquedaRealizada(false);
  };

  const renderItem = ({ item }: { item: ItemBusqueda }) => {
    const esPelicula = item.tipo === 'movie';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('Detalle', { tipo: item.tipo, tmdbId: item.id })}
        accessibilityRole="button"
        accessibilityLabel={`${item.titulo}, ${item.anio}`}
      >
        <PosterImage
          path={item.posterPath}
          size="w200"
          width={80}
          height={120}
          borderRadius={8}
          tituloFallback={item.titulo}
        />
        <View style={styles.cardInfo}>
          <View style={styles.badgeTipoContainer}>
            <View
              style={[
                styles.badgeTipo,
                { backgroundColor: esPelicula ? '#1d4ed8' : '#7c3aed' },
              ]}
            >
              <Text style={styles.badgeTipoTexto}>
                {esPelicula ? 'PELÍCULA' : 'SERIE'}
              </Text>
            </View>
            {item.calificacionTmdb > 0 && (
              <View style={styles.badgeCalificacion}>
                <Text style={styles.estrellaIcon}>★</Text>
                <Text style={styles.calificacionTexto}>{item.calificacionTmdb}</Text>
              </View>
            )}
          </View>

          <Text style={styles.cardTitulo} numberOfLines={2}>
            {item.titulo}
          </Text>

          <Text style={styles.cardAnio}>{item.anio}</Text>

          <Text style={styles.cardSinopsis} numberOfLines={2}>
            {item.sinopsis}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <OfflineNotice />

      <View style={styles.container}>
        <View style={styles.searchBarContainer}>
          <TextInput
            style={styles.input}
            placeholder="Buscar películas o series..."
            placeholderTextColor="#94a3b8"
            value={textoBusqueda}
            onChangeText={setTextoBusqueda}
            onSubmitEditing={ejecutarBusqueda}
            returnKeyType="search"
            autoCorrect={false}
          />
          {textoBusqueda.length > 0 && (
            <TouchableOpacity
              style={styles.botonLimpiar}
              onPress={limpiarBusqueda}
              accessibilityLabel="Limpiar texto"
            >
              <Text style={styles.botonLimpiarTexto}>✕</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.botonBuscar}
            onPress={ejecutarBusqueda}
            accessibilityRole="button"
            accessibilityLabel="Buscar"
          >
            <Text style={styles.botonBuscarTexto}>Buscar</Text>
          </TouchableOpacity>
        </View>

        {cargando && (
          <View style={styles.centroEstado}>
            <ActivityIndicator size="large" color="#e11d48" />
            <Text style={styles.estadoTexto}>Buscando en TMDB...</Text>
          </View>
        )}

        {!cargando && error && (
          <View style={styles.centroEstado}>
            <Text style={styles.iconoEstado}>⚠️</Text>
            <Text style={styles.errorTexto}>{error}</Text>
            <TouchableOpacity
              style={styles.botonReintentar}
              onPress={ejecutarBusqueda}
              accessibilityRole="button"
            >
              <Text style={styles.botonReintentarTexto}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {!cargando && !error && busquedaRealizada && resultados.length === 0 && (
          <View style={styles.centroEstado}>
            <Text style={styles.iconoEstado}>🔍</Text>
            <Text style={styles.sinResultadosTitulo}>Sin resultados</Text>
            <Text style={styles.sinResultadosSubtitulo}>
              No se encontraron coincidencias para "{textoBusqueda}". Intenta con otro término.
            </Text>
          </View>
        )}

        {!cargando && !error && !busquedaRealizada && (
          <View style={styles.centroEstado}>
            <Text style={styles.iconoEstado}>🍿</Text>
            <Text style={styles.sinResultadosTitulo}>Explora el catálogo</Text>
            <Text style={styles.sinResultadosSubtitulo}>
              Escribe el nombre de una película o serie para comenzar a buscar.
            </Text>
          </View>
        )}

        {!cargando && !error && resultados.length > 0 && (
          <FlatList
            data={resultados}
            keyExtractor={(item) => `${item.tipo}_${item.id}`}
            renderItem={renderItem}
            contentContainerStyle={styles.listaContent}
            keyboardShouldPersistTaps="handled"
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
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  input: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 15,
    minHeight: 48,
    paddingHorizontal: 8,
  },
  botonLimpiar: {
    width: 36,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonLimpiarTexto: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '700',
  },
  botonBuscar: {
    backgroundColor: '#e11d48',
    paddingHorizontal: 16,
    minHeight: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  botonBuscarTexto: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  listaContent: {
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: 'center',
  },
  badgeTipoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  badgeTipo: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  badgeTipoTexto: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  badgeCalificacion: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  estrellaIcon: {
    color: '#fbbf24',
    fontSize: 12,
    marginRight: 2,
  },
  calificacionTexto: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '700',
  },
  cardTitulo: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  cardAnio: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 2,
    marginBottom: 4,
  },
  cardSinopsis: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 16,
  },
  centroEstado: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconoEstado: {
    fontSize: 48,
    marginBottom: 12,
  },
  estadoTexto: {
    color: '#cbd5e1',
    fontSize: 15,
    marginTop: 12,
  },
  errorTexto: {
    color: '#f87171',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  botonReintentar: {
    backgroundColor: '#334155',
    minHeight: 44,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botonReintentarTexto: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '600',
  },
  sinResultadosTitulo: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  sinResultadosSubtitulo: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

