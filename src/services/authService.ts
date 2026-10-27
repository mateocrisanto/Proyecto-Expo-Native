import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from './firebaseConfig';

/**
 * Traduce códigos de error de Firebase Auth a mensajes amigables en español (RF1)
 */
export function traducirErrorFirebase(codigo: string): string {
  switch (codigo) {
    case 'auth/invalid-email':
      return 'El formato del correo electrónico no es válido.';
    case 'auth/user-disabled':
      return 'Esta cuenta ha sido inhabilitada.';
    case 'auth/user-not-found':
      return 'No existe ninguna cuenta registrada con este correo.';
    case 'auth/wrong-password':
      return 'La contraseña ingresada es incorrecta.';
    case 'auth/invalid-credential':
      return 'Credenciales incorrectas. Verifica tu correo y contraseña.';
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta registrada con este correo electrónico.';
    case 'auth/weak-password':
      return 'La contraseña es muy débil. Debe tener al menos 6 caracteres.';
    case 'auth/network-request-failed':
      return 'No hay conexión a internet o falló la red. Intenta nuevamente.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos. Por seguridad, espera unos momentos.';
    case 'auth/operation-not-allowed':
      return 'El inicio de sesión con correo y contraseña no está habilitado en Firebase.';
    default:
      return 'Ocurrió un error inesperado al procesar la autenticación.';
  }
}

/**
 * Registra un nuevo usuario con correo y contraseña
 */
export async function registrarUsuario(email: string, pass: string): Promise<User> {
  const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
  return userCredential.user;
}

/**
 * Inicia sesión con correo y contraseña
 */
export async function iniciarSesion(email: string, pass: string): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
  return userCredential.user;
}

/**
 * Cierra la sesión activa
 */
export async function cerrarSesion(): Promise<void> {
  await signOut(auth);
}

/**
 * Suscribe un observador al cambio de estado de autenticación (sesión persistente)
 */
export function observarAuth(callback: (usuario: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

