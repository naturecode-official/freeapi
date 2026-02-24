# FreeAPI ChatGPT Service - Quick Start Guide

## Get Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
npm run build
```

### 2. Configure ChatGPT Service
```bash
# Run interactive configuration wizard
node -e "require('./dist/services/chatgpt/exports').runConfigWizard()"
```

Follow the prompts:
1. Select "Quick setup"
2. Enter your OpenAI API key (or leave empty for public mode)
3. Use default settings

### 3. Test the Service
```bash
node test-chatgpt.js
```

### 4. Use in Your Code
```javascript
const { createChatGPTService } = require('./dist/services/chatgpt/exports');

async function main() {
  const chatGPT = createChatGPTService();
  await chatGPT.initialize();
  
  const response = await chatGPT.sendMessage('Hello, world!');
  console.log('Response:', response.message.content);
  
  chatGPT.destroy();
}

main().catch(console.error);
```

## Configuration Examples

### Public Mode (No API Key)
```json
{
  "mode": "public",
  "base_url": "https://api.openai.com/v1/",
  "model": "gpt-3.5-turbo"
}
```

### Authenticated Mode (With API Key)
```json
{
  "mode": "authenticated",
  "api_key": "sk-your-api-key-here",
  "base_url": "https://api.openai.com/v1/",
  "model": "gpt-4"
}
```

## Common Commands

### Configuration
```bash
# Edit configuration
node -e "require('./dist/services/chatgpt/exports').runConfigWizard()"

# Test connection
node -e "
  const { createChatGPTService } = require('./dist/services/chatgpt/exports');
  const chatGPT = createChatGPTService();
  chatGPT.initialize().then(() => {
    chatGPT.testConnection().then(success => {
      console.log(success ? 'Connected!' : 'Failed');
      chatGPT.destroy();
    });
  });
"
```

### Basic Usage
```javascript
// Send message with options
const response = await chatGPT.sendMessage('Explain quantum computing', {
  maxTokens: 500,
  temperature: 0.8,
  systemPrompt: 'You are a physics professor.'
});

// Get conversation history
const conversations = chatGPT.getAllConversations();

// Get usage stats
const stats = chatGPT.getUsageStats();
```

## Next Steps

1. **Explore Features**: Try different models and settings
2. **Integrate with CLI**: Use `freeapi` commands
3. **Add Error Handling**: Implement retry logic
4. **Scale Up**: Add more AI services (DeepSeek, Wenxin, etc.)

## Need Help?

- Check `docs/chatgpt-service.md` for detailed documentation
- Run `node test-chatgpt.js --help` for test options
- Visit GitHub repository for issues and discussions

## Quick Reference

| Command | Description |
|---------|-------------|
| `createChatGPTService()` | Create service instance |
| `initialize()` | Load config and prepare service |
| `sendMessage()` | Send chat message |
| `getStatus()` | Get service status |
| `testConnection()` | Test API connection |
| `destroy()` | Clean up resources |

Enjoy using FreeAPI ChatGPT Service! 🚀