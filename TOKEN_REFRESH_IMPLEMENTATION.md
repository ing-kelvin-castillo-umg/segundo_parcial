# JWT Token Refresh Implementation - Phase 2 Documentation

## Overview
Successfully implemented a complete JWT token refresh policy for the examination system (segundo_parcial). The implementation includes both backend (Spring Boot) and frontend (Next.js) components with automatic token refresh, logout functionality, and secure token storage.

## Architecture

### Token Flow
1. **Initial Login** → Returns `accessToken` (24h) + `refreshToken` (30 days)
2. **Automatic Refresh** → API client detects 401 → Silently refreshes → Retries request
3. **Token Expiration** → When both tokens expire → Redirects to login with message
4. **Logout** → Revokes refresh token in database → Clears storage

## Backend Implementation

### 1. Database Schema
**Created:** `refresh_tokens` table
- `id` (BIGSERIAL): Primary key
- `token` (TEXT, UNIQUE): Secure refresh token
- `user_id` (BIGINT, FK): References users table
- `expiry_date` (TIMESTAMP): Token expiration
- `created_at` (TIMESTAMP): Creation timestamp
- `revoked` (BOOLEAN): Revocation status
- `revoked_at` (TIMESTAMP): When token was revoked

**Indexes:**
- `idx_refresh_tokens_user_id`: For querying by user
- `uk_refresh_tokens_token`: For token lookup

### 2. Entity Classes
**RefreshToken.java**
- JPA entity with lazy loading to User
- Helper methods: `isExpired()`, `isValid()`
- Full getters/setters for all fields

### 3. Repository
**RefreshTokenRepository.java**
```java
- findByToken(String token): Fetch token by value
- deleteByUser(User user): Clean up user tokens
- deleteExpiredTokens(LocalDateTime): Maintenance
- revokeAllUserTokens(User user): Batch revocation
```

### 4. Services

**RefreshTokenService (Interface)**
```java
- createRefreshToken(User user)
- validateRefreshToken(String token)
- revokeRefreshToken(String token)
- revokeAllUserTokens(User user)
- deleteExpiredTokens()
```

**RefreshTokenServiceImpl**
- Generates secure UUID-based tokens
- Revokes existing tokens per user (single active token policy)
- 30-day validity period
- Validates token state (not expired, not revoked)

**AuthServiceImpl (Enhanced)**
```java
- login(): Creates RefreshToken on successful auth
- refreshToken(): Validates refresh token → Issues new tokens (rolling refresh)
- logout(): Revokes refresh token for clean logout
```

### 5. JWT Provider Enhancement
**JwtTokenProvider.java**
- `generateRefreshToken(String username)`: Creates refresh token JWT
- `getRolesFromJwt(String token)`: Extracts roles from JWT
- `getJwtExpirationMs()`: Exposes token expiry duration

**Configuration:**
- Access token: 24 hours (86400000 ms)
- Refresh token: 30 days (2592000000 ms)

### 6. DTOs
**RefreshTokenRequest.json**
```json
{ "refreshToken": "650b42f4-b3ca-49bf-8f86-ad0ab54c6cdd" }
```

**RefreshTokenResponse.json**
```json
{
  "accessToken": "eyJhbGciOiJIUzM4NCJ9...",
  "refreshToken": "e1adc343-0839-441d-a961-894ce96de0a6",
  "type": "Bearer",
  "expiresIn": 86400000
}
```

**Enhanced AuthResponse.java**
```json
{
  "token": "...",
  "refreshToken": "...",
  "type": "Bearer",
  "username": "admin",
  "fullName": "Administrador del Sistema",
  "email": "admin@umg.edu.gt",
  "roles": ["ROLE_ADMIN"]
}
```

### 7. REST Endpoints

**POST /api/auth/login**
- Returns access token + refresh token on successful authentication
- Sets both tokens in localStorage

**POST /api/auth/refresh**
- Input: `{ "refreshToken": "..." }`
- Output: New access token + new refresh token (rolling refresh)
- HTTP 401: If refresh token is invalid/expired

**POST /api/auth/logout**
- Input: `{ "refreshToken": "..." }`
- Revokes the refresh token in database
- Prevents token reuse after logout

**GET /api/auth/me**
- Protected endpoint (requires valid access token)
- Returns current user information

## Frontend Implementation

### 1. DTOs
**Enhanced auth.dto.ts**
```typescript
interface AuthResponseDto {
  token: string;
  refreshToken: string;  // New field
  type: string;
  username: string;
  fullName: string;
  email: string;
  roles: string[];
}

interface RefreshTokenResponseDto {
  accessToken: string;
  refreshToken: string;
  type: string;
  expiresIn: number;
}

interface RefreshTokenRequestDto {
  refreshToken: string;
}
```

### 2. Entity Updates
**user.entity.ts**
```typescript
interface AuthSession {
  token: string;
  refreshToken: string;  // New field
  user: User;
  isAuthenticated: boolean;
  isAdmin: boolean;
}
```

### 3. API Client Enhancement
**api.client.ts** - Token Refresh Interceptor
- Monitors 401 Unauthorized responses
- Automatically refreshes tokens when access token expires
- Implements refresh queue to prevent multiple concurrent refresh attempts
- Retries original request with new token
- Redirects to login if refresh fails

Key features:
```typescript
- isRefreshing: Prevents concurrent refresh requests
- refreshSubscribers: Queue for requests during refresh
- onRefreshed(): Notifies queued requests of new token
- Automatic retry: After successful refresh, retry original request
```

### 4. Auth Service
**auth.service.ts** Updates
```typescript
- login(): Stores both access and refresh tokens
- logout(): Calls backend to revoke token, clears storage
- getStoredSession(): Returns session with both tokens
- getStoredRefreshToken(): Helper for refresh process
```

Storage structure:
```
localStorage.setItem("token", accessToken)
localStorage.setItem("refreshToken", refreshToken)
localStorage.setItem("user", JSON.stringify(user))
```

### 5. Auth Context
**AuthContext.tsx** - Automatic Integration
- Uses AuthService for all auth operations
- Session persists across page reloads
- Automatic token refresh handled transparently

## Security Features

1. **Refresh Token Storage**
   - Stored in localStorage (accessible to JS)
   - Single active token per user (previous tokens revoked)
   - Unique UUID per token (not derived from JWT)

2. **Token Lifecycle**
   - Access token: Short-lived (24 hours)
   - Refresh token: Long-lived (30 days)
   - Rolling refresh: New refresh token issued on each refresh
   - Revocation: Tokens can be invalidated in database

3. **Logout Protection**
   - Refresh token revoked in database
   - localStorage cleared
   - Cannot reuse revoked tokens
   - Backend notified of logout

4. **Error Handling**
   - Expired tokens: Auto-refresh attempt
   - Failed refresh: Redirect to login with message
   - Network errors: Graceful degradation
   - Revoked tokens: Immediate re-authentication

## Testing Demonstration

Run the included test script:
```bash
./test_token_refresh.sh
```

### Test Flow:
1. **Login** → Receives access + refresh tokens
2. **Protected Call** → Uses access token successfully
3. **Refresh** → Exchanges refresh token for new access token
4. **Reuse** → New access token works on protected endpoint
5. **Logout** → Revokes refresh token
6. **Revoked Refresh** → Attempt to refresh with revoked token fails

### Sample Output:
```
✓ Login successful with access and refresh tokens
✓ Protected endpoint accessible with access token
✓ Token refresh successful with new tokens
✓ New token works on protected endpoint
✓ Logout revokes the refresh token
✓ Revoked token cannot be used for refresh
```

## Database Migrations

**Migration File:** `005-create-refresh-tokens.xml`
- Created refresh_tokens table
- Added foreign key to users table
- Created performance indexes
- Properly nested constraints in column definitions

## Configuration

**application.yml**
```yaml
app:
  jwt:
    secret: ${JWT_SECRET:...}
    expiration-ms: ${JWT_EXPIRATION_MS:86400000}         # 24 hours
    refresh-expiration-ms: ${JWT_REFRESH_EXPIRATION_MS:2592000000}  # 30 days
```

**Environment Variables**
- `JWT_SECRET`: Base64-encoded 256-bit key
- `JWT_EXPIRATION_MS`: Access token lifetime in milliseconds
- `JWT_REFRESH_EXPIRATION_MS`: Refresh token lifetime in milliseconds

## Files Modified/Created

### Backend
- ✅ `entity/RefreshToken.java` (NEW)
- ✅ `repository/RefreshTokenRepository.java` (NEW)
- ✅ `service/RefreshTokenService.java` (NEW)
- ✅ `service/impl/RefreshTokenServiceImpl.java` (NEW)
- ✅ `dto/request/RefreshTokenRequest.java` (NEW)
- ✅ `dto/response/RefreshTokenResponse.java` (NEW)
- ✅ `security/JwtTokenProvider.java` (MODIFIED)
- ✅ `service/impl/AuthServiceImpl.java` (MODIFIED)
- ✅ `controller/AuthController.java` (MODIFIED)
- ✅ `dto/response/AuthResponse.java` (MODIFIED)
- ✅ `mapper/UserMapper.java` (MODIFIED)
- ✅ `resources/application.yml` (MODIFIED)
- ✅ `db/changelog/005-create-refresh-tokens.xml` (NEW)
- ✅ `db/changelog/db.changelog-master.xml` (MODIFIED)

### Frontend
- ✅ `dtos/auth.dto.ts` (MODIFIED)
- ✅ `entities/user.entity.ts` (MODIFIED)
- ✅ `mappers/auth.mapper.ts` (MODIFIED)
- ✅ `services/api.client.ts` (ENHANCED)
- ✅ `services/auth.service.ts` (MODIFIED)

### Docker
- ✅ `docker-compose.yml` (MODIFIED - Added backend port mapping)

## API Documentation

All endpoints are documented in Swagger:
- **URL:** http://localhost:8080/swagger-ui.html
- **API Docs:** http://localhost:8080/v3/api-docs

## Compliance with Exam Requirements

Phase 2 Requirements: ✅ COMPLETE

1. ✅ **Refresh Token Design**
   - Backend generates refreshToken on login
   - Frontend stores both tokens securely

2. ✅ **Automatic Refresh**
   - Frontend detects token expiration (401 response)
   - Automatically requests new token without user interruption
   - Transparent to user application

3. ✅ **Fallback to Login**
   - If refresh token expires or is revoked
   - System redirects to login page
   - Shows appropriate message

4. ✅ **Token Validation**
   - Backend validates token existence and expiration
   - Database tracks revocation status
   - Prevents reuse of invalid tokens

## Future Enhancements

1. **Token Rotation** - Issue new refresh tokens on each refresh (already implemented: rolling refresh)
2. **Refresh Token Persistence** - Optional: Store in database across server restarts
3. **Multi-Device Sessions** - Allow multiple active tokens per user
4. **Token Introspection** - Endpoint to check token status
5. **Refresh Token Rotation Policy** - Automatic revocation after N days
6. **Rate Limiting** - Prevent refresh token abuse

## Conclusion

The JWT token refresh implementation provides a robust, secure, and transparent session management system that:
- ✅ Maintains user sessions without interruption
- ✅ Automatically handles token expiration
- ✅ Prevents unauthorized token reuse
- ✅ Supports clean logout with server-side revocation
- ✅ Integrates seamlessly with existing authentication flow

The implementation follows REST API best practices and Spring Security conventions, making it maintainable and extensible for future requirements.
