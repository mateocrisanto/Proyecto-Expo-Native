# Mi Cartelera Personal 🎬🍿

Una aplicación móvil desarrollada con **React Native**, **Expo** y **TypeScript** que permite a los usuarios buscar películas y series en la base de datos de The Movie Database (TMDB), agregarlas a su lista personal, organizarlas por estado de visionado (*Por ver*, *Viendo*, *Vista*), asignar calificaciones personales y redactar comentarios propios.

---

## 📌 1. Objetivo del Proyecto

Construir una aplicación móvil full-stack que integre:
- **Autenticación segura con Firebase Auth** (registro, inicio de sesión, persistencia de sesión y manejo de errores traducidos).
- **Base de datos en la nube con Cloud Firestore** (subcolección aislada por usuario bajo `usuarios/{uid}/mi_lista`).
- **Consumo de API REST externa (TMDB)** para búsqueda de películas y series, obtención de detalles completos, elenco y pósters.
- **Navegación fluida** mediante React Navigation (Stack y Bottom Tabs).
- **Gestión de estado global y modo sin conexión** con React Context API y caché local en `AsyncStorage`.
- **Reglas de seguridad en Firestore** para garantizar privacidad estricta de las listas de cada usuario.

---

## 📱 2. Pantallas de la Aplicación

1. **Login / Registro**: Formulario con validación de entradas, alternancia entre inicio de sesión y registro de nuevas cuentas, con manejo de errores en español. Visible únicamente cuando no hay una sesión activa.
2. **Buscar (Pestaña)**: Barra de búsqueda reactiva por título (películas y series combinadas), tarjetas con carátula, título, año de estreno y tipo de obra. Manejo de estados de carga, error y lista vacía (con imagen de relleno cuando no hay póster).
3. **Detalle de Obra (Stack)**: Información completa de TMDB (póster en alta resolución, sinopsis en español con texto alternativo si no está disponible, calificación oficial de TMDB y elenco principal). Incluye botón para agregar a la lista personal o ver si ya fue agregada.
4. **Mi Lista (Pestaña)**: Colección personal organizada con filtros rápidos por estado (*Todas*, *Por ver*, *Viendo*, *Vista*) y por tipo (*Todas*, *Película*, *Serie*). Tarjetas con la información esencial, calificación personal asignada y botón para editar o ver detalles.
5. **Editar Mi Entrada (Stack / Modal)**: Permite cambiar el estado de visionado, seleccionar una calificación personal de 1 a 5 estrellas (habilitada únicamente si el estado es *Vista*), agregar o modificar un comentario de hasta 500 caracteres, y eliminar la obra de la lista con diálogo de confirmación.
6. **Acerca de / Créditos (Pestaña)**: Información de la aplicación, atribución legal obligatoria y logotipo de TMDB, aviso de descargo de responsabilidad (*"This product uses the TMDB API but is not endorsed or certified by TMDB"*), datos del usuario autenticado y botón para cerrar sesión.

---

## 🛠️ 3. Tecnologías y Arquitectura

- **Framework**: [Expo SDK 58](https://expo.dev) + [React Native](https://reactnative.dev)
- **Lenguaje**: TypeScript (estricto, interfaces exhaustivas, sin `any` innecesarios)
- **Navegación**: `@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/native-stack`
- **Autenticación y BD**: Firebase v10+ (Authentication y Cloud Firestore)
- **API Externa**: [The Movie Database (TMDB) API v3](https://developer.themoviedb.org/docs)
- **Almacenamiento Local**: `@react-native-async-storage/async-storage`
- **Detección de Red**: `@react-native-community/netinfo`

### Estructura del Proyecto
```
src/
├── components/          # Componentes reutilizables (Badge, StarRating, EmptyState, etc.)
├── context/             # AuthContext (sesión) y CarteleraContext (lista + caché)
├── navigation/          # RootNavigator, AppNavigator (Tabs + Stack), AuthStack
├── screens/             # LoginScreen, SearchScreen, DetailScreen, MyListScreen, EditEntryScreen, AboutScreen
├── services/            # firebaseConfig.ts, authService.ts, firestoreService.ts, tmdbService.ts
└── types/               # Definiciones de TypeScript (TMDB, Lista, Navegación, Estados)
```

---

## 🚀 4. Instrucciones de Instalación y Ejecución

### Prerrequisitos
- Node.js (v18+)
- Dispositivo móvil físico con la aplicación **Expo Go** instalada (disponible en Google Play Store y Apple App Store) o un emulador de Android / simulador de iOS.

### Paso 1: Clonar e instalar dependencias
```bash
git clone <url-del-repositorio>
cd cartelera
npm install
```

### Paso 2: Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:
```bash
cp .env.example .env
```
Edita `.env` y coloca tus credenciales:
```env
# TMDB API
EXPO_PUBLIC_TMDB_TOKEN=tu_api_read_access_token_bearer_tmdb
EXPO_PUBLIC_TMDB_API_KEY=tu_api_key_opcional

# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-app.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=tu-app-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-app.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:...
```

### Paso 3: Iniciar el servidor de desarrollo
```bash
npx expo start
# o
npm start
```
Escanea el código QR que aparece en la terminal con la app **Expo Go** en Android o la app Cámara en iOS.

---

## 🔒 5. Reglas de Seguridad de Firestore

El archivo `firestore.rules` se encuentra en la raíz del proyecto:
- Cada usuario autenticado tiene acceso exclusivo a su propia subcolección `usuarios/{userId}/mi_lista/{itemId}`.
- Validación de esquemas en servidor: estados válidos (`por_ver`, `viendo`, `vista`), restricción de calificación (1-5 solo si el estado es `vista`), límite de 500 caracteres en comentarios.
- Regla de lectura y escritura protegida con `request.auth.uid == userId`.

---

## 📄 Atribución de TMDB
This product uses the TMDB API but is not endorsed or certified by TMDB.
Logotipos y recursos gráficos provistos bajo los términos de uso no comerciales de TMDB.

