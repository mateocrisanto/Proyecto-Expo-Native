import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import {
  iniciarSesion,
  registrarUsuario,
  cerrarSesion,
  observarAuth,
  traducirErrorFirebase,
} from '../services/authService';

interface AuthContextType {
  usuario: User | null;
  cargando: boolean;
  login: (email: string, pass: string) => Promise<void>;
  registro: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  errorAuth: string | null;
  limpiarError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorAuth, setErrorAuth] = useState<string | null>(null);

  useEffect(() => {
    // Suscripción al estado de sesión de Firebase Auth (persistencia automática)
    const desuscribir = observarAuth((user) => {
      setUsuario(user);
      setCargando(false);
    });

    return () => desuscribir();
  }, []);

  const limpiarError = () => setErrorAuth(null);

  const login = async (email: string, pass: string) => {
    setErrorAuth(null);
    try {
      await iniciarSesion(email, pass);
    } catch (err: any) {
      const mensaje = traducirErrorFirebase(err?.code || '');
      setErrorAuth(mensaje);
      throw new Error(mensaje);
    }
  };

  const registro = async (email: string, pass: string) => {
    setErrorAuth(null);
    try {
      await registrarUsuario(email, pass);
    } catch (err: any) {
      const mensaje = traducirErrorFirebase(err?.code || '');
      setErrorAuth(mensaje);
      throw new Error(mensaje);
    }
  };

  const logout = async () => {
    setErrorAuth(null);
    try {
      await cerrarSesion();
    } catch (err: any) {
      const mensaje = traducirErrorFirebase(err?.code || '');
      setErrorAuth(mensaje);
      throw new Error(mensaje);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        cargando,
        login,
        registro,
        logout,
        errorAuth,
        limpiarError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}

