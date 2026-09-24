# 🎯 GUÍA DE DEMOSTRACIÓN: TOKEN REFRESH IMPLEMENTATION

## Estado Actual ✅
✅ **SERVICIO CORRIENDO:** Todos los contenedores activos  
✅ **BASE DE DATOS:** PostgreSQL inicializada con tabla `refresh_tokens`  
✅ **BACKEND:** Spring Boot en http://localhost:8080  
✅ **FRONTEND:** Next.js en http://localhost:3000  

---

## OPCIÓN 1: Demostración Automática (Línea de Comandos)

### Método rápido - Ejecutar script de prueba
```bash
cd /Users/melaniemarianamoraleslopez/Documents/GitHub/segundo_parcial
chmod +x test_token_refresh.sh
./test_token_refresh.sh
```

**Resultado esperado:**
```
✓ Login successful with access and refresh tokens
✓ Protected endpoint accessible with access token
✓ Token refresh successful with new tokens
✓ New token works on protected endpoint
✓ Logout revokes the refresh token
✓ Revoked token cannot be used for refresh
```

---

## OPCIÓN 2: Demostración Manual con cURL

### Paso 1️⃣: Login (obtener tokens)
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**Respuesta (guarda estos valores):**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzM4NCJ9.eyJz...",          // <-- ACCESS TOKEN
    "refreshToken": "8e917825-f163-475...",            // <-- REFRESH TOKEN
    "username": "admin",
    "fullName": "Administrador del Sistema",
    "roles": ["ROLE_ADMIN"]
  }
}
```

### Paso 2️⃣: Usar Access Token en endpoint protegido
```bash
# Reemplaza 'YOUR_ACCESS_TOKEN' con el token del paso 1
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Respuesta:**
```json
{
  "data": {
    "id": 1,
    "username": "admin",
    "fullName": "Administrador del Sistema",
    "email": "admin@umg.edu.gt",
    "enabled": true,
    "roles": ["ROLE_ADMIN"]
  }
}
```

### Paso 3️⃣: Renovar el Access Token
```bash
# Reemplaza 'YOUR_REFRESH_TOKEN' con el token del paso 1
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
```

**Respuesta (nuevo token + nuevo refresh token):**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzM4NCJ9.eyJz...",    // <-- NUEVO ACCESS TOKEN
    "refreshToken": "af14ca37-03a0-406...",            // <-- NUEVO REFRESH TOKEN
    "type": "Bearer",
    "expiresIn": 86400000
  }
}
```

### Paso 4️⃣: Usar el nuevo Access Token
```bash
# El nuevo token funciona inmediatamente
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer NEW_ACCESS_TOKEN"
```

### Paso 5️⃣: Logout (revocar Refresh Token)
```bash
curl -X POST http://localhost:8080/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"NUEVO_REFRESH_TOKEN"}'
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Sesión cerrada correctamente"
}
```

### Paso 6️⃣: Intentar usar token revocado (DEBE FALLAR)
```bash
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"NUEVO_REFRESH_TOKEN"}'
```

**Respuesta (error esperado):**
```json
{
  "success": false,
  "message": "Refresh token inválido o expirado"
}
```

---

## OPCIÓN 3: Demostración con Swagger UI

### 1. Abrir Swagger
Ir a: **http://localhost:8080/swagger-ui.html**

### 2. En sección "Autenticación"

#### Llamada 1: Login
- Click en **POST /api/auth/login**
- Click en "Try it out"
- Body:
```json
{
  "username": "admin",
  "password": "admin123"
}
```
- Click "Execute"
- **Copiar** los valores de `token` y `refreshToken`

#### Llamada 2: Obtener usuario actual
- Click en **GET /api/auth/me**
- Click en "Try it out"
- Click en ícono de candado 🔒
- Pegar el `token` como "Bearer token"
- Click "Authorize"
- Click "Execute"
- ✅ Ver perfil del usuario

#### Llamada 3: Renovar token
- Click en **POST /api/auth/refresh**
- Click en "Try it out"
- Body:
```json
{
  "refreshToken": "PEGAR_REFRESH_TOKEN_AQUI"
}
```
- Click "Execute"
- ✅ Recibir nuevo access token + nuevo refresh token

#### Llamada 4: Confirmar nuevo token funciona
- Repetir **Llamada 2** con el nuevo token
- ✅ Debe funcionar perfectamente

#### Llamada 5: Logout
- Click en **POST /api/auth/logout**
- Body: nuevo refresh token
- Click "Execute"
- ✅ Sesión cerrada

#### Llamada 6: Token revocado no funciona
- Click en **POST /api/auth/refresh** nuevamente
- Usar el refresh token revocado
- ❌ Debe retornar error

---

## OPCIÓN 4: Demostración en Navegador

### 1. Abrir la aplicación Frontend
Ir a: **http://localhost:3000**

### 2. Login
- Ingresar credenciales:
  - Usuario: `admin`
  - Contraseña: `admin123`
- Click "Iniciar Sesión"

### 3. Ver tokens en DevTools
**Pasos:**
1. Abrir DevTools: `F12` o `Cmd+Option+I`
2. Ir a pestaña **Application** (o Storage)
3. Click en **Local Storage** → http://localhost:3000
4. Ver:
   - `token` → Access Token (JWT)
   - `refreshToken` → Refresh Token (UUID)
   - `user` → Datos del usuario

### 4. Ver Network Tab (refresh automático)
**Pasos:**
1. Abrir DevTools → Pestaña **Network**
2. Acceder al Dashboard (ruta protegida)
3. El token se incluye en header: `Authorization: Bearer ...`

### 5. Logout
- Click en "Cerrar Sesión"
- Verificar en DevTools que `token` y `refreshToken` se limpian
- ✅ localStorage vacío

---

## 📊 Flujo de Tokens Visualizado

```
┌─────────────────────────────────────────────────────────────┐
│                     USUARIO FINAL                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ 1. Credenciales
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  POST /api/auth/login                       │
├─────────────────────────────────────────────────────────────┤
│ ✅ Retorna:                                                 │
│   - accessToken (24 horas)                                  │
│   - refreshToken (30 días)                                  │
└─────────────────────────────────────────────────────────────┘
                            │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
        ┌───────────────┐        ┌──────────────────┐
        │ Guardar en    │        │ Guardar en       │
        │ localStorage  │        │ localStorage     │
        │ "token"       │        │ "refreshToken"   │
        └───────────────┘        └──────────────────┘
                │                           │
                │ Requests posteriores      │ Cuando token expira
                │ Authorization: Bearer...  │
                ▼                           ▼
        ┌───────────────┐        ┌──────────────────┐
        │ Endpoint      │        │ POST             │
        │ Protegido     │        │ /api/auth/refresh│
        │ (GET /auth/me)│        └──────────────────┘
        │ ✅ 200 OK     │                 │
        └───────────────┘                 ▼
                                 ┌──────────────────┐
                                 │ ✅ Nuevo Token   │
                                 │ + Refresh Token  │
                                 │ (rolling)        │
                                 └──────────────────┘
                                         │
                                         ▼
                                 ┌──────────────────┐
                                 │ Reintentar req   │
                                 │ con nuevo token  │
                                 │ ✅ 200 OK        │
                                 └──────────────────┘

LOGOUT:
                                 ┌──────────────────┐
                                 │ POST              │
                                 │ /api/auth/logout  │
                                 └──────────────────┘
                                         │
                                         ▼
                                 ┌──────────────────┐
                                 │ Revoca token en  │
                                 │ base de datos    │
                                 │ Limpia storage   │
                                 └──────────────────┘
```

---

## 🔍 Validación Técnica

### Base de Datos
Verificar tabla `refresh_tokens`:
```bash
docker exec examen_postgres psql -U postgres -d examen_db -c "SELECT * FROM refresh_tokens;"
```

Deberías ver registros con:
- `token` → UUID único
- `user_id` → 1 (admin)
- `expiry_date` → 30 días en el futuro
- `revoked` → false (o true después de logout)

### Logs del Backend
Ver logs en tiempo real:
```bash
docker logs -f examen_backend | grep -E "token|refresh|auth"
```

### Logs del Frontend
Abrir DevTools Console (F12) para ver:
```javascript
// Token refresh automático
console.log("Refreshing token...");
// Reintentar request
console.log("Retrying request with new token");
```

---

## ⏱️ Tiempos de Expiración

| Token | Duración | Configuración |
|-------|----------|---------------|
| Access Token | 24 horas | `JWT_EXPIRATION_MS=86400000` |
| Refresh Token | 30 días | `JWT_REFRESH_EXPIRATION_MS=2592000000` |

### Para pruebas rápidas (OPCIONAL):
Editar `docker-compose.yml`:
```yaml
environment:
  JWT_EXPIRATION_MS: "10000"          # 10 segundos
  JWT_REFRESH_EXPIRATION_MS: "300000" # 5 minutos
```

---

## 🎬 Demostración Paso a Paso Recomendada

1. **Terminal 1:** Ver logs
   ```bash
   docker logs -f examen_backend
   ```

2. **Terminal 2:** Ejecutar pruebas
   ```bash
   ./test_token_refresh.sh
   ```

3. **Navegador:** Abrir Swagger
   ```
   http://localhost:8080/swagger-ui.html
   ```

4. **Navegador (otra pestaña):** Abrir Frontend
   ```
   http://localhost:3000
   ```

5. **DevTools:** Ver tokens en storage
   - F12 → Application → Local Storage

---

## ✅ Checklist de Validación

- [ ] ✅ Servicio backend corriendo (puerto 8080)
- [ ] ✅ Servicio frontend corriendo (puerto 3000)
- [ ] ✅ Base de datos accesible (puerto 5432)
- [ ] ✅ Script `test_token_refresh.sh` ejecuta sin errores
- [ ] ✅ Login retorna access + refresh tokens
- [ ] ✅ Access token funciona en endpoint protegido
- [ ] ✅ Refresh funciona con refresh token
- [ ] ✅ Nuevo token es válido inmediatamente
- [ ] ✅ Logout revoca el token
- [ ] ✅ Token revocado rechazado en refresh
- [ ] ✅ Tabla `refresh_tokens` existe en BD
- [ ] ✅ Swagger UI documentación visible

---

## 🐛 Troubleshooting

**Problema:** "Connection refused" en puerto 8080
```bash
docker ps # Verificar que backend está UP
docker logs examen_backend | tail -20 # Ver errores
```

**Problema:** Token no se envía en header
```bash
# Verificar en DevTools Network tab
# Debe mostrar: Authorization: Bearer eyJhbg...
```

**Problema:** "Token inválido o expirado"
```bash
# Token expiró (24 horas)
# Hacer login de nuevo
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## 📱 Próximas Fases

- **Fase 3:** Logout por inactividad (2-5 minutos)
- **Fase 4:** Renovación de paleta de colores y UI

---

**Última actualización:** 24 de septiembre de 2026  
**Estado:** ✅ Funcionando correctamente
