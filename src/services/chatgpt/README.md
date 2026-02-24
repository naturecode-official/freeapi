# ChatGPT Service Adapter

## Overview
This service adapter provides access to ChatGPT through two modes:
1. **Public API Mode** - No login required, but has token limitations
2. **Authenticated Mode** - User provides credentials for better access

## Architecture

### Base URL Configuration
Users must be informed about the base URL they are using:
- **Public API**: `https://chat.openai.com/backend-api/`
- **Custom Endpoint**: User-provided URL for self-hosted or alternative endpoints

### Authentication Modes

#### 1. Public Mode (No Login)
- Uses public API endpoints
- Limited by max tokens per session
- No personalization
- Session-based with temporary tokens

#### 2. Authenticated Mode (User Login)
- Requires email and password
- Provides full ChatGPT features
- Personal conversation history
- Higher rate limits
- Persistent sessions

## API Endpoints

### Public Endpoints
- `POST /conversation` - Create new conversation
- `POST /conversation/{id}` - Continue conversation
- `GET /models` - List available models
- `POST /moderations` - Content moderation

### Authenticated Endpoints
- `POST /auth/login` - User authentication
- `GET /conversations` - List user conversations
- `DELETE /conversation/{id}` - Delete conversation
- `POST /account/usage` - Get usage statistics

## Configuration

### Required Configuration
```yaml
chatgpt:
  mode: "public" | "authenticated"
  base_url: "https://chat.openai.com/backend-api/"
  
  # For authenticated mode
  credentials:
    email: "user@example.com"
    password: "encrypted_password"
  
  # API settings
  max_tokens: 4096
  model: "gpt-4"
  temperature: 0.7
  timeout: 30000
```

### Session Management
- Token refresh mechanism
- Session persistence
- Automatic reconnection
- Conversation state tracking

## Implementation Notes

### Token Management
- Public tokens are session-scoped
- Authenticated tokens have longer lifespan
- Automatic refresh before expiration
- Fallback to public mode if auth fails

### Rate Limiting
- Respect API rate limits
- Exponential backoff for retries
- Queue management for concurrent requests

### Error Handling
- Network errors with retry logic
- Authentication failures
- Token expiration handling
- Content moderation violations