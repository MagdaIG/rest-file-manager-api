# Guía de Pruebas con Postman

Guía rápida para probar la API REST de Gestión de Archivos usando Postman.

## Importar la Colección

1. Abre Postman
2. Haz clic en "Import"
3. Selecciona `docs/postman-collection.json`
4. La colección se importará con todas las rutas preconfiguradas

## Configuración

- `baseUrl`: `http://localhost:3000` (ajusta si usas otro puerto)
- `token`: Se guarda automáticamente después del login

## Orden de Pruebas Recomendado

### 1. Verificar Servidor
**Health Check** (GET /api/health)
- No requiere autenticación
- Debe devolver: `{"success": true, "message": "Servidor funcionando correctamente"}`

### 2. Autenticación

**Registro** (POST /api/users/register)
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123"
}
```

**Login** (POST /api/users/login)
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```
- El token se guarda automáticamente en `{{token}}`

### 3. Perfil de Usuario

**Obtener Perfil** (GET /api/users/profile)
- Headers: `Authorization: Bearer {{token}}`

**Actualizar Perfil** (PUT /api/users/profile)
- Headers: `Authorization: Bearer {{token}}`
- Body: `{"username": "nuevo_nombre", "email": "nuevo@email.com"}`

**Eliminar Cuenta** (DELETE /api/users/profile)
- Headers: `Authorization: Bearer {{token}}`
- ⚠️ Acción permanente

### 4. Avatares

**Obtener Avatares Predeterminados** (GET /api/users/avatars/defaults)
- Headers: `Authorization: Bearer {{token}}`

**Seleccionar Avatar** (POST /api/users/avatar/select)
- Headers: `Authorization: Bearer {{token}}`
- Body: `{"avatarId": "avatar1"}`

**Subir Avatar Personalizado** (POST /api/users/avatar/upload)
- Headers: `Authorization: Bearer {{token}}`
- Body: FormData → Key: `avatar`, Type: `file`
- Formatos: JPEG, PNG, GIF, WEBP (máx. 2MB)

**Eliminar Avatar** (DELETE /api/users/avatar)
- Headers: `Authorization: Bearer {{token}}`

### 5. Archivos

**Subir Archivo** (POST /api/files/upload)
- Headers: `Authorization: Bearer {{token}}`
- Body: FormData → Key: `file`, Type: `file`
- Tamaño máximo: 10MB

**Listar Archivos** (GET /api/files)
- Headers: `Authorization: Bearer {{token}}`

**Obtener Archivo por ID** (GET /api/files/:id)
- Headers: `Authorization: Bearer {{token}}`
- Reemplaza `:id` con el ID del archivo

**Eliminar Archivo** (DELETE /api/files/:id)
- Headers: `Authorization: Bearer {{token}}`
- Reemplaza `:id` con el ID del archivo

## Códigos de Estado HTTP

- **200**: Éxito
- **201**: Creado (registro, subida de archivo)
- **400**: Solicitud incorrecta
- **401**: No autenticado
- **404**: No encontrado
- **500**: Error del servidor

## Pruebas de Validación

### Errores Esperados

1. **Registro duplicado**: Email o username existente → 400
2. **Login inválido**: Credenciales incorrectas → 401
3. **Sin token**: Acceso sin Authorization → 401
4. **Archivo muy grande**: > 10MB → 400
5. **Avatar muy grande**: > 2MB → 400
6. **Tipo de archivo inválido**: Para avatares, solo imágenes → 400

## Flujo Rápido de Pruebas

1. Health Check
2. Registro → Login (token se guarda automáticamente)
3. Obtener Perfil
4. Obtener Avatares → Seleccionar Avatar
5. Subir Avatar Personalizado
6. Actualizar Perfil
7. Subir Archivo → Listar → Obtener por ID → Eliminar
8. Eliminar Avatar
9. Eliminar Cuenta (opcional)

## Notas Importantes

- Token JWT expira en 24 horas
- Si el token expira, hacer login nuevamente
- Cada usuario solo ve sus propios archivos
- Los archivos se guardan en `uploads/`
- Los avatares se guardan en `public/avatars/`

## Solución de Problemas

**Token no se guarda**: Ejecuta "Login" (no "Registro") para que el script guarde el token automáticamente.

**Error 401**: Verifica que el servidor esté corriendo y que hayas hecho login.

**Error al subir archivos**: Verifica el tamaño (máx. 10MB para archivos, 2MB para avatares) y que el directorio tenga permisos de escritura.
