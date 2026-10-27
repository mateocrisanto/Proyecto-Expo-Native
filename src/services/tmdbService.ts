import { DetalleObra, ItemBusqueda, MiembroElenco, TipoObra } from '../types';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

/**
 * Obtiene los headers y parámetros de autenticación para TMDB
 */
function getAuthHeaders(): { headers: Record<string, string>; queryParams: string } {
  const token = process.env.EXPO_PUBLIC_TMDB_TOKEN?.trim();
  const apiKey = process.env.EXPO_PUBLIC_TMDB_API_KEY?.trim();

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  let queryParams = '';

  if (token && token.length > 20) {
    headers['Authorization'] = `Bearer ${token}`;
  } else if (apiKey) {
    queryParams = `api_key=${apiKey}`;
  }

  return { headers, queryParams };
}

/**
 * Construye la URL completa de una imagen de TMDB (RF3)
 * @param path Ruta devuelta por la API (poster_path, backdrop_path, profile_path)
 * @param size Tamaño deseado ('w200', 'w342', 'w500', 'w780', 'original')
 */
export function armarUrlImagen(
  path: string | null | undefined,
  size: 'w200' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'
): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

/**
 * Busca películas y series combinadas por título (RF2)
 */
export async function buscarObras(
  titulo: string,
  pagina: number = 1
): Promise<{ resultados: ItemBusqueda[]; totalPaginas: number; totalResultados: number }> {
  const texto = titulo.trim();
  if (!texto) {
    return { resultados: [], totalPaginas: 0, totalResultados: 0 };
  }

  const { headers, queryParams } = getAuthHeaders();
  let url = `${TMDB_BASE_URL}/search/multi?query=${encodeURIComponent(texto)}&include_adult=false&language=es-MX&page=${pagina}`;
  if (queryParams) {
    url += `&${queryParams}`;
  }

  const respuesta = await fetch(url, { headers });

  if (!respuesta.ok) {
    if (respuesta.status === 401) {
      throw new Error('Token o API Key de TMDB inválido o no configurado.');
    }
    throw new Error(`Error en TMDB (${respuesta.status}): no se pudo completar la búsqueda.`);
  }

  const datos = await respuesta.json();

  // Filtrar solo películas y series (descartando 'person')
  const obrasFiltradas = (datos.results || []).filter(
    (item: any) => item.media_type === 'movie' || item.media_type === 'tv'
  );

  const resultados: ItemBusqueda[] = obrasFiltradas.map((item: any) => {
    const esPelicula = item.media_type === 'movie';
    const tituloItem = esPelicula ? (item.title || item.original_title) : (item.name || item.original_name);
    const fecha = esPelicula ? item.release_date : item.first_air_date;
    const anio = fecha ? fecha.substring(0, 4) : 'Desconocido';

    return {
      id: item.id,
      tipo: esPelicula ? ('movie' as TipoObra) : ('tv' as TipoObra),
      titulo: tituloItem || 'Sin título',
      anio,
      posterPath: item.poster_path || null,
      sinopsis: item.overview || 'Sinopsis no disponible en español.',
      calificacionTmdb: item.vote_average ? Number(item.vote_average.toFixed(1)) : 0,
    };
  });

  return {
    resultados,
    totalPaginas: datos.total_pages || 1,
    totalResultados: datos.total_results || 0,
  };
}

/**
 * Obtiene el detalle de una película o serie incluyendo elenco en una sola petición (RF3)
 */
export async function obtenerDetalle(tipo: TipoObra, id: number): Promise<DetalleObra> {
  const { headers, queryParams } = getAuthHeaders();
  let url = `${TMDB_BASE_URL}/${tipo}/${id}?append_to_response=credits&language=es-MX`;
  if (queryParams) {
    url += `&${queryParams}`;
  }

  const respuesta = await fetch(url, { headers });

  if (!respuesta.ok) {
    if (respuesta.status === 404) {
      throw new Error('La obra solicitada no fue encontrada en TMDB.');
    }
    throw new Error(`Error al obtener detalles (${respuesta.status}).`);
  }

  const datos = await respuesta.json();

  const esPelicula = tipo === 'movie';
  const titulo = esPelicula ? (datos.title || datos.original_title) : (datos.name || datos.original_name);
  const fecha = esPelicula ? datos.release_date : datos.first_air_date;
  const anio = fecha ? fecha.substring(0, 4) : 'Desconocido';

  // Géneros
  const generos: string[] = (datos.genres || []).map((g: any) => g.name);

  // Elenco principal (primeros 10)
  const castRaw = datos.credits?.cast || [];
  const elenco: MiembroElenco[] = castRaw.slice(0, 10).map((actor: any) => ({
    id: actor.id,
    nombre: actor.name || 'Actor desconocido',
    personaje: actor.character || 'Personaje no acreditado',
    fotoPath: actor.profile_path || null,
  }));

  // Duración para películas o temporadas para series
  let duracion: string | undefined;
  if (esPelicula && datos.runtime) {
    const horas = Math.floor(datos.runtime / 60);
    const mins = datos.runtime % 60;
    duracion = horas > 0 ? `${horas}h ${mins}m` : `${mins}m`;
  } else if (!esPelicula && datos.number_of_seasons) {
    duracion = `${datos.number_of_seasons} ${datos.number_of_seasons === 1 ? 'temporada' : 'temporadas'}`;
  }

  return {
    id: datos.id,
    tipo,
    titulo: titulo || 'Sin título',
    anio,
    posterPath: datos.poster_path || null,
    backdropPath: datos.backdrop_path || null,
    sinopsis: datos.overview && datos.overview.trim().length > 0
      ? datos.overview
      : 'Sinopsis no disponible en español.',
    calificacionTmdb: datos.vote_average ? Number(datos.vote_average.toFixed(1)) : 0,
    votosCount: datos.vote_count || 0,
    generos,
    duracion,
    elenco,
  };
}

