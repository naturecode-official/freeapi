# AGENTS.md - Development Guide for FreeAPI Project

## Project Overview
FreeAPI is a tool that runs multiple AI web-based free chat services in the background, providing users with a unified interface to access these services.

## Build and Development Commands

### Environment Setup
```bash
# Initialize Node.js project (if using Node.js)
npm init -y

# Initialize Python virtual environment (if using Python)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
npm install  # For Node.js
pip install -r requirements.txt  # For Python
```

### Development Commands
```bash
# Start development server (Node.js)
npm run dev

# Start development server (Python)
python app.py

# Run tests
npm test  # Node.js
pytest  # Python

# Run single test
npm test -- testname  # Node.js
pytest tests/test_file.py::test_function  # Python

# Linting and formatting
npm run lint  # Node.js
flake8 .  # Python linting
black .  # Python formatting

# Type checking
npm run typecheck  # TypeScript
mypy .  # Python type checking
```

### Docker Commands
```bash
# Build Docker image
docker build -t freeapi .

# Run container
docker run -p 3000:3000 freeapi

# Docker compose
docker-compose up
```

## Code Style Guidelines

### File Structure
```
freeapi/
├── src/
│   ├── core/           # Core framework
│   ├── services/       # AI service integrations
│   ├── api/           # API endpoints
│   ├── models/        # Data models
│   ├── utils/         # Utility functions
│   └── config/        # Configuration
├── tests/
├── docs/
├── scripts/
├── Dockerfile
├── docker-compose.yml
├── package.json       # Node.js
├── requirements.txt   # Python
└── README.md
```

### Imports/Exports

#### Node.js/TypeScript
```typescript
// Group imports: built-in, external, internal
import path from 'path';
import axios from 'axios';
import { ServiceAdapter } from './core/ServiceAdapter';
import { logger } from './utils/logger';

// Use named exports for utilities
export { ServiceAdapter, logger };

// Use default export for main classes
export default class FreeAPIService { ... }
```

#### Python
```python
# Standard library imports
import os
import sys
from typing import Dict, List, Optional

# Third-party imports
import requests
from pydantic import BaseModel

# Local imports
from .core.service_adapter import ServiceAdapter
from .utils.logger import get_logger
```

### Naming Conventions

#### General
- **Classes**: `PascalCase` (ServiceAdapter, ApiClient, ConfigManager)
- **Variables/Functions**: `snake_case` (api_client, get_service_status)
- **Constants**: `UPPER_SNAKE_CASE` (MAX_RETRIES, DEFAULT_TIMEOUT)
- **Private Members**: `_prefix_with_underscore` (_internal_method, _cache_data)
- **Type Parameters**: `T`, `K`, `V` (generic types)

#### Specific to FreeAPI
- **Service Names**: `snake_case` (chatgpt_web, deepseek_api, wenxin_ai)
- **API Endpoints**: `kebab-case` (/api/v1/chat, /api/v1/services)
- **Configuration Keys**: `dot.notation` (services.chatgpt.enabled)

### Error Handling

#### Node.js/TypeScript
```typescript
// Use try-catch with specific error types
try {
  const response = await service.sendMessage(message);
  return response;
} catch (error) {
  if (error instanceof ServiceUnavailableError) {
    logger.warn(`Service ${service.name} unavailable: ${error.message}`);
    throw new RetryableError('Service temporarily unavailable');
  } else if (error instanceof RateLimitError) {
    logger.error(`Rate limit exceeded for ${service.name}`);
    throw error;
  } else {
    logger.error(`Unexpected error: ${error.message}`);
    throw new InternalServerError('Failed to process request');
  }
}

// Validate inputs
function validateMessage(message: string): void {
  if (!message || typeof message !== 'string') {
    throw new ValidationError('Message must be a non-empty string');
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    throw new ValidationError(`Message exceeds ${MAX_MESSAGE_LENGTH} characters`);
  }
}
```

#### Python
```python
# Use specific exception classes
class ServiceError(Exception):
    """Base exception for service errors."""
    pass

class RateLimitError(ServiceError):
    """Raised when rate limit is exceeded."""
    pass

# Context managers for resource cleanup
async with aiohttp.ClientSession() as session:
    try:
        async with session.post(url, json=data) as response:
            response.raise_for_status()
            return await response.json()
    except aiohttp.ClientError as e:
        logger.error(f"HTTP request failed: {e}")
        raise ServiceError(f"Service request failed: {e}")
```

### Type Safety and Validation

#### TypeScript
```typescript
// Use interfaces for API contracts
interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
}

interface ServiceConfig {
  name: string;
  enabled: boolean;
  apiKey?: string;
  endpoint: string;
  timeout: number;
}

// Runtime validation with Zod or class-validator
import { z } from 'zod';

const MessageSchema = z.object({
  content: z.string().min(1).max(1000),
  role: z.enum(['user', 'assistant', 'system']),
  timestamp: z.date().optional(),
});

type ValidatedMessage = z.infer<typeof MessageSchema>;
```

#### Python
```python
# Use Pydantic for data validation
from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime

class ChatMessage(BaseModel):
    id: str
    content: str = Field(..., min_length=1, max_length=1000)
    role: str = Field(..., regex='^(user|assistant|system)$')
    timestamp: datetime = Field(default_factory=datetime.now)
    
    @validator('content')
    def validate_content(cls, v):
        if not v.strip():
            raise ValueError('Content cannot be empty')
        return v
```

### Formatting & Spacing

#### General Rules
- Use 2 spaces for indentation (no tabs)
- Maximum line length: 100 characters
- Use single quotes for strings (JavaScript/TypeScript)
- Use double quotes for strings (Python)
- Blank lines between logical sections
- Consistent spacing around operators

#### JavaScript/TypeScript
```typescript
// Good
function calculateTimeout(retries: number): number {
  const baseTimeout = 1000;
  const multiplier = 2;
  
  return baseTimeout * Math.pow(multiplier, retries);
}

// Use template literals for string interpolation
const message = `Service ${serviceName} responded in ${responseTime}ms`;
```

#### Python
```python
# Good
def calculate_timeout(retries: int) -> int:
    base_timeout = 1000
    multiplier = 2
    
    return base_timeout * (multiplier ** retries)

# Use f-strings for string interpolation
message = f"Service {service_name} responded in {response_time}ms"
```

### Comments and Documentation

#### Code Comments
- Use `//` for single-line comments (JavaScript/TypeScript)
- Use `#` for single-line comments (Python)
- Use `/** */` for JSDoc comments
- Use `"""` for docstrings (Python)
- Comment complex logic and non-obvious code
- Avoid obvious comments

#### Documentation Examples
```typescript
/**
 * Sends a message to the specified AI service.
 * @param serviceName - Name of the AI service to use
 * @param message - The message content to send
 * @param options - Additional options for the request
 * @returns Promise resolving to the service response
 * @throws {ServiceError} If the service fails to respond
 * @throws {RateLimitError} If rate limit is exceeded
 */
async function sendToService(
  serviceName: string,
  message: string,
  options?: SendOptions
): Promise<ServiceResponse> {
  // Implementation
}
```

```python
def send_to_service(
    service_name: str,
    message: str,
    options: Optional[Dict] = None
) -> ServiceResponse:
    """
    Sends a message to the specified AI service.
    
    Args:
        service_name: Name of the AI service to use
        message: The message content to send
        options: Additional options for the request
        
    Returns:
        ServiceResponse object containing the response
        
    Raises:
        ServiceError: If the service fails to respond
        RateLimitError: If rate limit is exceeded
    """
    # Implementation
```

## Testing Guidelines

### Test Structure
```bash
tests/
├── unit/
│   ├── core/
│   ├── services/
│   └── utils/
├── integration/
│   ├── api/
│   └── services/
└── e2e/
```

### Test Examples
```typescript
// Jest/TypeScript example
describe('ServiceAdapter', () => {
  let adapter: ServiceAdapter;
  
  beforeEach(() => {
    adapter = new ServiceAdapter();
  });
  
  test('should handle successful response', async () => {
    const response = await adapter.send('test message');
    expect(response).toHaveProperty('content');
    expect(response.content).toBeString();
  });
  
  test('should throw on invalid message', async () => {
    await expect(adapter.send('')).rejects.toThrow(ValidationError);
  });
});
```

```python
# Pytest example
def test_service_adapter_success():
    """Test successful service adapter response."""
    adapter = ServiceAdapter()
    response = adapter.send("test message")
    assert "content" in response
    assert isinstance(response["content"], str)

def test_service_adapter_invalid_message():
    """Test adapter raises error on invalid message."""
    adapter = ServiceAdapter()
    with pytest.raises(ValidationError):
        adapter.send("")
```

## Agent Instructions

### Before Making Changes
1. Read existing code patterns in similar files
2. Check package.json/requirements.txt for dependencies
3. Review related service implementations
4. Examine API contracts and data models
5. Check for existing constants and configuration

### When Editing Code
1. Maintain backward compatibility with existing API
2. Follow established error handling patterns
3. Add comprehensive input validation
4. Remove debug console.log/print statements before finalizing
5. Use existing constants instead of hardcoded values
6. Follow the established file structure
7. Add proper error messages and logging

### After Changes
1. Run tests to verify functionality
2. Check linting and formatting
3. Test API endpoints if applicable
4. Update documentation if APIs change
5. Verify no console errors in development
6. Test with different service configurations