import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { ElementoLista, GuardarElementoPayload, TipoObra } from '../types';
import { useAuth } from './AuthContext';
import {
  obtenerListaUsuario,
  agregarALista,
  actualizarEntrada,
  eliminarDeLista,
  generarItemId,
} from '../services/listaService';

interface CarteleraContextType {
  lista: ElementoLista[];
  cargando: boolean;
  error: string | null;
  sinConexion: boolean;
  agregar: (payload: GuardarElementoPayload) => Promise<void>;
  actualizar: (
    itemId: string,
    cambios: {
      estado: 'por_ver' | 'viendo' | 'vista';
      calificacionPersonal: number | null;
      comentario: string;
    }
  ) => Promise<void>;
  eliminar: (itemId: string) => Promise<void>;
  estaEnLista: (tipo: TipoObra, tmdbId: number) => boolean;
  obtenerDeLista: (tipo: TipoObra, tmdbId: number) => ElementoLista | undefined;
  recargarLista: () => Promise<void>;
}

const CarteleraContext = createContext<CarteleraContextType | undefined>(undefined);

// Función auxiliar con tiempo límite para operaciones de red (RF9/Paso 9)
function conTiempoLimite<T>(promesa: Promise<T>, ms: number = 6000): Promise<T> {
  return Promise.race([
    promesa,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Tiempo de espera agotado. Modo sin conexión activo.')), ms)
    ),
  ]);
}

export function CarteleraProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  const [lista, setLista] = useState<ElementoLista[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sinConexion, setSinConexion] = useState<boolean>(false);

  const cacheKey = usuario ? `@cartelera_cache_${usuario.uid}` : null;

  // Escuchar estado de conectividad con NetInfo
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const conectado = state.isConnected && state.isInternetReachable !== false;
      setSinConexion(!conectado);
    });
    return () => unsubscribe();
  }, []);

  // Guardar en la caché local de AsyncStorage
  const guardarEnCache = useCallback(async (datos: ElementoLista[]) => {
    if (!cacheKey) return;
    try {
      await AsyncStorage.setItem(cacheKey, JSON.stringify(datos));
    } catch (e) {
      console.warn('Error al guardar caché en AsyncStorage:', e);
    }
  }, [cacheKey]);

  // Cargar lista: primero de AsyncStorage (instantáneo) y luego sincronizar con Firestore
  const cargarLista = useCallback(async () => {
    if (!usuario || !cacheKey) {
      setLista([]);
      setCargando(false);
      return;
    }

    setCargando(true);
    setError(null);

    // 1. Cargar caché de AsyncStorage inmediatamente para disponibilidad offline
    try {
      const cacheGuardada = await AsyncStorage.getItem(cacheKey);
      if (cacheGuardada) {
        const datosParseados: ElementoLista[] = JSON.parse(cacheGuardada);
        setLista(datosParseados);
      }
    } catch (e) {
      console.warn('No se pudo leer la caché local:', e);
    }

    // 2. Intentar sincronización con Firestore con tiempo límite de 6 segundos
    try {
      const datosRemotos = await conTiempoLimite(obtenerListaUsuario(usuario.uid), 6000);
      setLista(datosRemotos);
      setSinConexion(false);
      await guardarEnCache(datosRemotos);
    } catch (err: any) {
      console.log('Fallo o timeout al consultar Firestore, usando copia local:', err?.message);
      setSinConexion(true);
    } finally {
      setCargando(false);
    }
  }, [usuario, cacheKey, guardarEnCache]);

  useEffect(() => {
    cargarLista();
  }, [cargarLista]);

  // Agregar obra a la lista personal
  const agregar = async (payload: GuardarElementoPayload) => {
    if (!usuario) throw new Error('Debes iniciar sesión para agregar obras a tu lista.');

    const itemId = generarItemId(payload.tipo, payload.tmdbId);
    if (lista.some((item) => item.itemId === itemId)) {
      throw new Error('Esta obra ya se encuentra en tu lista.');
    }

    // Objeto provisional para actualización visual instantánea
    const nuevoElemento: ElementoLista = {
      itemId,
      tmdbId: payload.tmdbId,
      tipo: payload.tipo,
      titulo: payload.titulo,
      anio: payload.anio,
      posterPath: payload.posterPath,
      estado: payload.estado,
      calificacionPersonal: payload.estado === 'vista' ? payload.calificacionPersonal : null,
      comentario: (payload.comentario || '').slice(0, 500),
      agregadoEn: new Date().toISOString(),
      actualizadoEn: new Date().toISOString(),
    };

    const nuevaLista = [nuevoElemento, ...lista];
    setLista(nuevaLista);
    await guardarEnCache(nuevaLista);

    // Persistir en Firestore con tiempo límite
    try {
      await conTiempoLimite(agregarALista(usuario.uid, payload), 6000);
      setSinConexion(false);
    } catch (err: any) {
      setSinConexion(true);
      // No revertimos el estado local porque el usuario está en modo offline y ya se guardó en AsyncStorage
      console.warn('Guardado localmente en caché debido a conexión lenta o ausente:', err.message);
    }
  };

  // Actualizar una entrada existente
  const actualizar = async (
    itemId: string,
    cambios: {
      estado: 'por_ver' | 'viendo' | 'vista';
      calificacionPersonal: number | null;
      comentario: string;
    }
  ) => {
    if (!usuario) throw new Error('Debes iniciar sesión para modificar tu lista.');

    const calificacionFinal = cambios.estado === 'vista' ? cambios.calificacionPersonal : null;
    const comentarioLimpio = (cambios.comentario || '').slice(0, 500);

    const nuevaLista = lista.map((elem) => {
      if (elem.itemId === itemId) {
        return {
          ...elem,
          estado: cambios.estado,
          calificacionPersonal: calificacionFinal,
          comentario: comentarioLimpio,
          actualizadoEn: new Date().toISOString(),
        };
      }
      return elem;
    });

    setLista(nuevaLista);
    await guardarEnCache(nuevaLista);

    try {
      await conTiempoLimite(
        actualizarEntrada(usuario.uid, itemId, {
          estado: cambios.estado,
          calificacionPersonal: calificacionFinal,
          comentario: comentarioLimpio,
        }),
        6000
      );
      setSinConexion(false);
    } catch (err: any) {
      setSinConexion(true);
      console.warn('Actualizado localmente en caché por falta de conexión:', err.message);
    }
  };

  // Eliminar una obra de la lista
  const eliminar = async (itemId: string) => {
    if (!usuario) throw new Error('Debes iniciar sesión.');

    const nuevaLista = lista.filter((elem) => elem.itemId !== itemId);
    setLista(nuevaLista);
    await guardarEnCache(nuevaLista);

    try {
      await conTiempoLimite(eliminarDeLista(usuario.uid, itemId), 6000);
      setSinConexion(false);
    } catch (err: any) {
      setSinConexion(true);
      console.warn('Eliminado localmente por falta de conexión:', err.message);
    }
  };

  const estaEnLista = (tipo: TipoObra, tmdbId: number): boolean => {
    const itemId = generarItemId(tipo, tmdbId);
    return lista.some((elem) => elem.itemId === itemId);
  };

  const obtenerDeLista = (tipo: TipoObra, tmdbId: number): ElementoLista | undefined => {
    const itemId = generarItemId(tipo, tmdbId);
    return lista.find((elem) => elem.itemId === itemId);
  };

  return (
    <CarteleraContext.Provider
      value={{
        lista,
        cargando,
        error,
        sinConexion,
        agregar,
        actualizar,
        eliminar,
        estaEnLista,
        obtenerDeLista,
        recargarLista: cargarLista,
      }}
    >
      {children}
    </CarteleraContext.Provider>
  );
}

export function useCartelera(): CarteleraContextType {
  const context = useContext(CarteleraContext);
  if (!context) {
    throw new Error('useCartelera debe usarse dentro de un CarteleraProvider');
  }
  return context;
}

