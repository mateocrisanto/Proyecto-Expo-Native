import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import { ElementoLista, GuardarElementoPayload, TipoObra } from '../types';

/**
 * Genera el identificador único compuesto para Firestore (RF4: tipo_tmdbId)
 * Ej: 'movie_550' o 'tv_1399'
 */
export function generarItemId(tipo: TipoObra, tmdbId: number): string {
  return `${tipo}_${tmdbId}`;
}

/**
 * Referencia a la subcolección mi_lista de un usuario específico
 */
function getMiListaCollection(uid: string) {
  return collection(db, 'usuarios', uid, 'mi_lista');
}

/**
 * Obtiene todos los elementos de la lista personal del usuario en Firestore (RF5)
 */
export async function obtenerListaUsuario(uid: string): Promise<ElementoLista[]> {
  try {
    const colRef = getMiListaCollection(uid);
    // Ordenar por última actualización o agregado descendente
    const q = query(colRef, orderBy('actualizadoEn', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        itemId: docSnap.id,
        tmdbId: data.tmdbId,
        tipo: data.tipo,
        titulo: data.titulo,
        anio: data.anio,
        posterPath: data.posterPath ?? null,
        estado: data.estado,
        calificacionPersonal: data.calificacionPersonal ?? null,
        comentario: data.comentario ?? '',
        agregadoEn: data.agregadoEn ? data.agregadoEn.toDate?.()?.toISOString() ?? data.agregadoEn : undefined,
        actualizadoEn: data.actualizadoEn ? data.actualizadoEn.toDate?.()?.toISOString() ?? data.actualizadoEn : undefined,
      } as ElementoLista;
    });
  } catch (error) {
    // Si falla por índice faltante en orderBy, intentamos consulta básica sin ordenar
    const colRef = getMiListaCollection(uid);
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        itemId: docSnap.id,
        tmdbId: data.tmdbId,
        tipo: data.tipo,
        titulo: data.titulo,
        anio: data.anio,
        posterPath: data.posterPath ?? null,
        estado: data.estado,
        calificacionPersonal: data.calificacionPersonal ?? null,
        comentario: data.comentario ?? '',
        agregadoEn: data.agregadoEn ? data.agregadoEn.toDate?.()?.toISOString() ?? data.agregadoEn : undefined,
        actualizadoEn: data.actualizadoEn ? data.actualizadoEn.toDate?.()?.toISOString() ?? data.actualizadoEn : undefined,
      } as ElementoLista;
    });
  }
}

/**
 * Agrega una nueva obra a la lista personal del usuario (RF4)
 * Impide duplicados verificando la existencia previa del itemId
 */
export async function agregarALista(
  uid: string,
  payload: GuardarElementoPayload
): Promise<ElementoLista> {
  const itemId = generarItemId(payload.tipo, payload.tmdbId);
  const docRef = doc(db, 'usuarios', uid, 'mi_lista', itemId);

  // Verificar si ya existe para evitar sobreescritura accidental
  const snapshot = await getDoc(docRef);
  if (snapshot.exists()) {
    throw new Error('Esta obra ya se encuentra en tu lista personal.');
  }

  // Regla de negocio: solo se califica si estado es 'vista'
  const calificacionFinal = payload.estado === 'vista' ? payload.calificacionPersonal : null;
  const comentarioLimpio = (payload.comentario || '').slice(0, 500);

  const ahora = new Date().toISOString();

  await setDoc(docRef, {
    tmdbId: payload.tmdbId,
    tipo: payload.tipo,
    titulo: payload.titulo,
    anio: payload.anio,
    posterPath: payload.posterPath,
    estado: payload.estado,
    calificacionPersonal: calificacionFinal,
    comentario: comentarioLimpio,
    agregadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  });

  return {
    itemId,
    tmdbId: payload.tmdbId,
    tipo: payload.tipo,
    titulo: payload.titulo,
    anio: payload.anio,
    posterPath: payload.posterPath,
    estado: payload.estado,
    calificacionPersonal: calificacionFinal,
    comentario: comentarioLimpio,
    agregadoEn: ahora,
    actualizadoEn: ahora,
  };
}

/**
 * Actualiza una entrada existente en la lista personal (RF6)
 * Regla: solo se califica si el estado es 'vista'
 */
export async function actualizarEntrada(
  uid: string,
  itemId: string,
  cambios: {
    estado: 'por_ver' | 'viendo' | 'vista';
    calificacionPersonal: number | null;
    comentario: string;
  }
): Promise<void> {
  const docRef = doc(db, 'usuarios', uid, 'mi_lista', itemId);

  // Validación de regla de negocio
  const calificacionFinal = cambios.estado === 'vista' ? cambios.calificacionPersonal : null;
  const comentarioLimpio = (cambios.comentario || '').slice(0, 500);

  await updateDoc(docRef, {
    estado: cambios.estado,
    calificacionPersonal: calificacionFinal,
    comentario: comentarioLimpio,
    actualizadoEn: serverTimestamp(),
  });
}

/**
 * Elimina una entrada de la lista del usuario (RF7)
 */
export async function eliminarDeLista(uid: string, itemId: string): Promise<void> {
  const docRef = doc(db, 'usuarios', uid, 'mi_lista', itemId);
  await deleteDoc(docRef);
}

