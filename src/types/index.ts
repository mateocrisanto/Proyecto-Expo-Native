/**
 * Tipos de datos para Mi Cartelera Personal
 */

// Tipo de obra en TMDB: película o serie
export type TipoObra = 'movie' | 'tv';

// Estados de visionado permitidos
export type EstadoVisionado = 'por_ver' | 'viendo' | 'vista';

// Filtros para la pantalla de Mi Lista
export type FiltroEstado = 'todos' | EstadoVisionado;
export type FiltroTipo = 'todos' | TipoObra;

// Elemento guardado en Firestore (usuarios/{uid}/mi_lista/{itemId}) y en caché local
export interface ElementoLista {
  itemId: string; // formato: 'movie_550' o 'tv_1399'
  tmdbId: number;
  tipo: TipoObra;
  titulo: string;
  anio: string;
  posterPath: string | null;
  estado: EstadoVisionado;
  calificacionPersonal: number | null; // 1 a 5, solo si estado es 'vista'
  comentario: string; // hasta 500 caracteres
  agregadoEn?: any; // Timestamp de Firestore o string ISO
  actualizadoEn?: any; // Timestamp de Firestore o string ISO
}

// Datos para crear o actualizar un elemento
export interface GuardarElementoPayload {
  tmdbId: number;
  tipo: TipoObra;
  titulo: string;
  anio: string;
  posterPath: string | null;
  estado: EstadoVisionado;
  calificacionPersonal: number | null;
  comentario: string;
}

// Estructura genérica para peticiones asíncronas
export interface EstadoPeticion<T> {
  cargando: boolean;
  error: string | null;
  datos: T | null;
}

// Modelo de un actor o miembro de elenco
export interface MiembroElenco {
  id: number;
  nombre: string;
  personaje: string;
  fotoPath: string | null;
}

// Modelo normalizado de detalle de obra para la UI
export interface DetalleObra {
  id: number;
  tipo: TipoObra;
  titulo: string;
  anio: string;
  posterPath: string | null;
  backdropPath: string | null;
  sinopsis: string;
  calificacionTmdb: number;
  votosCount: number;
  generos: string[];
  duracion?: string;
  elenco: MiembroElenco[];
}

// Modelo de resultado simple de búsqueda en TMDB
export interface ItemBusqueda {
  id: number;
  tipo: TipoObra;
  titulo: string;
  anio: string;
  posterPath: string | null;
  sinopsis: string;
  calificacionTmdb: number;
}

// Parámetros de navegación
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Detalle: { tipo: TipoObra; tmdbId: number };
  EditarEntrada: { item: ElementoLista };
};

export type MainTabParamList = {
  BuscarTab: undefined;
  MiListaTab: undefined;
  AcercaDeTab: undefined;
};

