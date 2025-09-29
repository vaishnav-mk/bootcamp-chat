# Types Directory Structure

This directory contains all centralized type definitions for the backend application, organized by domain for better maintainability and discoverability.

## File Organization

### `/types/index.ts`
Central export point for all types. Import any type from here using:
```typescript
import { User, SerializedUser, CreateMessageData } from "@/types";
```

### `/types/database.ts`
Raw database entity interfaces that match the database schema:
- `User` - User entity with BigInt IDs
- `Conversation` - Conversation entity  
- `Message` - Message entity
- `ConversationMember` - Conversation membership entity

### `/types/serialized.ts`
Serialized versions of entities for API responses:
- `SerializedUser` - User with string IDs and optional fields for responses
- `SerializedConversation` - Conversation with members included
- `SerializedMessage` - Message with sender info included

### `/types/auth.ts`
Authentication and user management related types:
- `AuthResult` - Login/register response format
- `JWTPayload` - JWT token payload structure
- `CreateUserData` - User creation parameters
- `UpdateUserData` - User update parameters

### `/types/api.ts` 
API request/response data structures:
- `CreateMessageData` - Message creation request
- `EditMessageData` - Message edit request  
- `CreateConversationData` - Conversation creation request

### `/types/websocket.ts`
WebSocket related interfaces:
- `AuthenticatedSocket` - Extended Socket.io socket with user info
- `WebSocketHandler` - Handler function interface
- `WebSocketContext` - Handler context parameters

### `/types/validation.ts`
Validation related types:
- `ValidationError` - Validation error structure
- `ValidationSchemas` - Schema validation configuration

### `/types/interfaces.ts` (Legacy)
Backwards compatibility re-exports from database.ts. 
**Deprecated**: Use direct imports from `/types` instead.

## Usage Guidelines

1. **Import from index**: Always import from `@/types` for consistency
2. **Use appropriate types**: 
   - Database types for internal operations
   - Serialized types for API responses
   - API types for request handling
3. **No inline interfaces**: Define all interfaces in appropriate type files
4. **Enum integration**: Types reference enums from `/constants/enums.ts`

## Migration Notes

All existing inline interfaces and types have been moved here:
- Controller interfaces → `/types/api.ts`
- Service interfaces → `/types/database.ts` 
- WebSocket types → `/types/websocket.ts`
- Auth types → `/types/auth.ts`
- Utility types → `/types/validation.ts`