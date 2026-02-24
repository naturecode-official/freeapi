# ChatGPT Service for FreeAPI

## Overview

The ChatGPT service is the first real service implementation for FreeAPI. It provides a wrapper around OpenAI's ChatGPT API with support for both public (no login) and authenticated modes.

## Features

- **Dual Mode Support**: Public mode (limited tokens) and Authenticated mode (full access)
- **Real API Integration**: Connects to actual ChatGPT API endpoints
- **Professional Architecture**: Modular, type-safe, well-documented codebase
- **Error Recovery**: Automatic retry, rate limiting, and recovery actions
- **Session Management**: Token refresh, conversation persistence
- **CLI Integration**: Ready for FreeAPI command system
- **Configuration Wizard**: Interactive setup for users

## Installation

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- OpenAI API key (for authenticated mode)

### Setup
```bash
# Clone the repository
git clone https://github.com/naturecode-official/freeapi.git
cd freeapi

# Install dependencies
npm install

# Build the project
npm run build
```

## Configuration

### Quick Setup
```bash
# Run the configuration wizard
node -e "require('./dist/services/chatgpt/exports').runConfigWizard()"
```

### Manual Configuration
Create a configuration file at `~/.freeapi/chatgpt-config.json`:

```json
{
  "mode": "authenticated",
  "enabled": true,
  "base_url": "https://api.openai.com/v1/",
  "api_key": "sk-your-api-key-here",
  "model": "gpt-3.5-turbo",
  "max_tokens": 4096,
  "temperature": 0.7,
  "timeout": 30000,
  "max_retries": 3,
  "requests_per_minute": 60,
  "tokens_per_minute": 150000
}
```

## Usage

### JavaScript/TypeScript API
```typescript
import { createChatGPTService } from './src/services/chatgpt/exports';

// Create service instance
const chatGPT = createChatGPTService();

// Initialize
await chatGPT.initialize();

// Send message
const response = await chatGPT.sendMessage('Hello, how are you?', {
  maxTokens: 100,
  systemPrompt: 'You are a helpful assistant.'
});

console.log(response.message.content);

// Get service status
const status = chatGPT.getStatus();
console.log(status);

// Clean up
chatGPT.destroy();
```

### CLI Usage
```bash
# Configure ChatGPT service
freeapi config chatgpt

# Start ChatGPT service
freeapi start chatgpt

# Interactive chat
freeapi chat chatgpt

# Check status
freeapi status

# View logs
freeapi logs

# Stop service
freeapi stop
```

## API Reference

### ChatGPTServiceAdapter
Main service adapter class with the following methods:

#### `initialize(): Promise<void>`
Initialize the service with loaded configuration.

#### `sendMessage(message: string, options?: ChatOptions): Promise<ChatResponse>`
Send a chat message to ChatGPT.

#### `getStatus(): ServiceStatus`
Get current service status including mode, authentication, and usage.

#### `getConfiguration(): ChatGPTConfig`
Get current configuration.

#### `updateConfiguration(config: Partial<ChatGPTConfig>): void`
Update service configuration.

#### `testConnection(): Promise<boolean>`
Test connection to ChatGPT API.

#### `getAllConversations(): Conversation[]`
Get all stored conversations.

#### `getUsageStats(): UsageStats`
Get usage statistics.

#### `destroy(): void`
Clean up resources.

### Configuration Options

#### Mode Settings
- `mode`: `'public'` or `'authenticated'`
- `enabled`: `boolean` - Enable/disable service

#### API Settings
- `base_url`: `string` - API endpoint URL
- `api_key`: `string` - OpenAI API key (for authenticated mode)
- `model`: `string` - ChatGPT model to use
- `max_tokens`: `number` - Maximum tokens per response
- `temperature`: `number` - Creativity level (0.0 to 2.0)

#### Performance Settings
- `timeout`: `number` - Request timeout in milliseconds
- `max_retries`: `number` - Maximum retry attempts
- `requests_per_minute`: `number` - Rate limiting
- `tokens_per_minute`: `number` - Token rate limiting

## Authentication Modes

### Public Mode
- No login required
- Limited token usage
- Basic functionality only
- Suitable for testing and demos

### Authenticated Mode
- Requires OpenAI API key
- Full access to all features
- Higher rate limits
- Conversation persistence
- Recommended for production use

## Error Handling

The service includes comprehensive error handling:

- **Automatic Retry**: For network errors and rate limits
- **Rate Limiting**: Built-in rate limit management
- **Error Recovery**: Suggested actions for common errors
- **Logging**: Detailed error logs for debugging

## Testing

Run the test suite:
```bash
# Run all tests
npm test

# Run ChatGPT-specific tests
npm test -- chatgpt.test.ts

# Test with coverage
npm run test:coverage
```

Run manual test:
```bash
node test-chatgpt.js
```

## Development

### Project Structure
```
src/services/chatgpt/
├── README.md                    # Service documentation
├── types.ts                     # TypeScript interfaces
├── api-client.ts                # HTTP client with auth
├── session-manager.ts           # User authentication
├── index.ts                     # Main service class
├── config-manager.ts            # Configuration handling
├── error-handler.ts             # Error handling
├── service-adapter.ts           # Main service adapter
├── cli-adapter.ts              # CLI integration
├── config-wizard.ts            # Interactive wizard
└── exports.ts                   # Public API exports
```

### Adding New Features
1. Follow existing code patterns
2. Add comprehensive error handling
3. Include unit tests
4. Update documentation
5. Test with real API

## Troubleshooting

### Common Issues

#### "API key not found"
- Run configuration wizard: `node -e "require('./dist/services/chatgpt/exports').runConfigWizard()"`
- Check API key format (should start with `sk-`)
- Verify API key has sufficient permissions

#### "Connection failed"
- Check internet connection
- Verify API endpoint URL
- Check firewall settings
- Test with `testConnection()` method

#### "Rate limit exceeded"
- Reduce request frequency
- Increase `requests_per_minute` in config
- Use authenticated mode for higher limits
- Implement exponential backoff

#### "Invalid response format"
- Check API version compatibility
- Verify response parsing logic
- Update to latest service version

### Debugging
```bash
# Enable debug logging
export DEBUG=freeapi:chatgpt*

# Run with verbose output
node test-chatgpt.js --verbose

# Check logs
freeapi logs
```

## Security Considerations

- **API Keys**: Store securely, never commit to version control
- **Encryption**: Configuration files can be encrypted
- **Rate Limiting**: Prevent abuse with built-in limits
- **Input Validation**: Sanitize all user inputs
- **Error Messages**: Avoid exposing sensitive information

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes following code style guidelines
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - See LICENSE file for details.

## Support

- GitHub Issues: https://github.com/naturecode-official/freeapi/issues
- Documentation: https://github.com/naturecode-official/freeapi/docs
- Email: support@naturecode.ai

## Changelog

### v1.0.0 (Initial Release)
- Initial ChatGPT service implementation
- Dual mode support (public/authenticated)
- Real API integration
- Configuration wizard
- CLI integration
- Comprehensive error handling
- Session management
- Rate limiting
- Test suite