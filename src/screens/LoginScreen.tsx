import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export const LoginScreen: React.FC = () => {
  const { login, registro, errorAuth, limpiarError } = useAuth();

  const [esRegistro, setEsRegistro] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [cargando, setCargando] = useState<boolean>(false);
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);

  const validarFormulario = (): boolean => {
    setErrorValidacion(null);
    limpiarError();

    const emailTrim = email.trim();
    if (!emailTrim) {
      setErrorValidacion('Por favor ingresa tu correo electrónico.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrim)) {
      setErrorValidacion('El correo electrónico no tiene un formato válido.');
      return false;
    }

    if (!password) {
      setErrorValidacion('Por favor ingresa tu contraseña.');
      return false;
    }

    if (password.length < 6) {
      setErrorValidacion('La contraseña debe tener al menos 6 caracteres.');
      return false;
    }

    return true;
  };

  const manejarEnvio = async () => {
    if (!validarFormulario()) return;

    setCargando(true);
    try {
      if (esRegistro) {
        await registro(email, password);
      } else {
        await login(email, password);
      }
    } catch {
      // El error se gestiona mediante el contexto y se muestra en pantalla
    } finally {
      setCargando(false);
    }
  };

  const alternarModo = () => {
    setEsRegistro(!esRegistro);
    setErrorValidacion(null);
    limpiarError();
  };

  const errorVisible = errorValidacion || errorAuth;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.logoIcon}>🎬</Text>
            <Text style={styles.titulo}>Mi Cartelera</Text>
            <Text style={styles.subtitulo}>
              {esRegistro
                ? 'Crea tu cuenta para organizar tus películas y series'
                : 'Inicia sesión para acceder a tu cartelera personal'}
            </Text>
          </View>

          <View style={styles.formContainer}>
            {errorVisible && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errorVisible}</Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <TextInput
                style={styles.input}
                placeholder="ejemplo@correo.com"
                placeholderTextColor="#64748b"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errorValidacion) setErrorValidacion(null);
                }}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="#64748b"
                secureTextEntry
                autoCapitalize="none"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errorValidacion) setErrorValidacion(null);
                }}
              />
            </View>

            <TouchableOpacity
              style={[styles.botonPrincipal, cargando && styles.botonDeshabilitado]}
              onPress={manejarEnvio}
              disabled={cargando}
              accessibilityRole="button"
            >
              {cargando ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.botonPrincipalTexto}>
                  {esRegistro ? 'Crear Cuenta' : 'Iniciar Sesión'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botonAlternar}
              onPress={alternarModo}
              disabled={cargando}
              accessibilityRole="button"
            >
              <Text style={styles.botonAlternarTexto}>
                {esRegistro
                  ? '¿Ya tienes una cuenta? Inicia sesión aquí'
                  : '¿No tienes cuenta? Regístrate aquí'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a', // Slate 900
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoIcon: {
    fontSize: 54,
    marginBottom: 12,
  },
  titulo: {
    fontSize: 28,
    fontWeight: '800',
    color: '#f8fafc',
    letterSpacing: -0.5,
  },
  subtitulo: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 280,
  },
  formContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    padding: 12,
    borderRadius: 6,
    marginBottom: 16,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 13,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 14,
    minHeight: 48, // Cumple > 44px
    color: '#f8fafc',
    fontSize: 15,
  },
  botonPrincipal: {
    backgroundColor: '#e11d48', // Crimson primario
    minHeight: 48, // Cumple > 44px
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
  botonPrincipalTexto: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  botonAlternar: {
    minHeight: 44, // Cumple > 44px
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  botonAlternarTexto: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

