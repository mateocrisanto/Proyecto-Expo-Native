# Documentación y Capturas de Pantalla 📸

Esta carpeta contiene la documentación gráfica y evidencias de funcionamiento requeridas para la entrega del proyecto **Mi Cartelera Personal**:

## 📋 Evidencias solicitadas:

1. **`auth-users.png`**:
   - Captura de la consola de Firebase en **Authentication → Users** mostrando las cuentas creadas y registradas desde la aplicación móvil.

2. **`firestore-mi-lista.png`**:
   - Captura de **Cloud Firestore** mostrando la ruta del documento `usuarios/{uid}/mi_lista` con al menos 3 documentos creados (películas/series guardadas con sus respectivos `itemId` tales como `movie_550`, `tv_1399`, campos de estado, calificación y comentarios).

3. **`reglas-simulador-denegado.png`**:
   - Captura del **Simulador de Reglas de Firestore (Rules Playground)** demostrando que una cuenta de usuario B no puede leer ni modificar la subcolección de una cuenta de usuario A (`request.auth.uid != userId` => Acceso denegado).

4. **`app-demo.png` / `app-offline.png`**:
   - Capturas de la aplicación ejecutándose en Expo Go (Pantalla de búsqueda, detalle de obra, mi lista con filtros y aviso de modo sin conexión activado).

