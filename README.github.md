# FreeAPI 🤖

[![npm version](https://img.shields.io/npm/v/freeapi.svg)](https://www.npmjs.com/package/freeapi)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

> A powerful CLI tool that runs multiple AI web-based free chat services in the background. Start with ChatGPT as your first AI assistant!

## ✨ Features

- **🚀 Multiple AI Services**: Support for ChatGPT, DeepSeek, Wenxin, Qwen and more
- **🔧 Easy Configuration**: Interactive setup wizard for each service
- **💬 Interactive Chat**: Command-line chat interface with conversation history
- **⚡ Real API Integration**: Connect to real AI APIs (OpenAI, etc.)
- **🔐 Dual Authentication Modes**: Public (no login) and Authenticated (full access)
- **📊 Usage Statistics**: Track tokens, requests, and rate limits
- **🛡️ Error Recovery**: Automatic retry and rate limiting
- **🌐 Global CLI**: Install once, use anywhere

## 🚀 Quick Start

### Installation

```bash
# Install globally from npm
npm install -g freeapi

# Or from source
git clone https://github.com/naturecode-official/freeapi.git
cd freeapi
npm install
npm run build
npm link
```

### Get Started in 30 Seconds

```bash
# 1. Initialize FreeAPI
freeapi init

# 2. Configure ChatGPT (interactive wizard)
freeapi config chatgpt

# 3. Start chatting!
freeapi chat chatgpt
```

### Quick Test with curl

Want to quickly test if the service is running? Use curl:

```bash
# Test if npm package exists
curl -s "https://registry.npmjs.org/@cuijy/free-api" | jq '._id'

# Test specific version
curl -s "https://registry.npmjs.org/@cuijy/free-api/0.1.2" | jq '.version'

# Test GitHub API
curl -s "https://api.github.com/repos/naturecode-official/freeapi" | jq '.name'

# If you don't have jq, use grep
curl -s "https://registry.npmjs.org/@cuijy/free-api" | grep -o '"name":"[^"]*"'
```

### Verify Installation

```bash
# After installing, verify with curl-like commands
freeapi --version
freeapi list
freeapi status

# Or test the service directly
echo "Hello" | freeapi chat chatgpt --stdin
```

## 🧪 Testing & Verification

### API Testing with curl

```bash
# Test npm registry API
curl -s "https://registry.npmjs.org/@cuijy/free-api" \
  | python3 -c "import json,sys;d=json.load(sys.stdin);print(f'Package: {d.get(\"_id\")}\nLatest: {d.get(\"dist-tags\",{}).get(\"latest\")}')"

# Test specific version details
curl -s "https://registry.npmjs.org/@cuijy/free-api/0.1.2" \
  | python3 -c "import json,sys;d=json.load(sys.stdin);print(f'Version: {d.get(\"version\")}\nDescription: {d.get(\"description\")}')"

# Test GitHub repository
curl -s "https://api.github.com/repos/naturecode-official/freeapi" \
  | python3 -c "import json,sys;d=json.load(sys.stdin);print(f'Repo: {d.get(\"name\")}\nStars: {d.get(\"stargazers_count\")}\nForks: {d.get(\"forks_count\")}')"

# Simple grep version (no Python required)
curl -s "https://registry.npmjs.org/@cuijy/free-api" | grep -o '"description":"[^"]*"'
```

### Local Testing

```bash
# Build and test from source
git clone https://github.com/naturecode-official/freeapi.git
cd freeapi
npm install
npm run build

# Run all tests
npm test

# Run specific test file
npm test -- test-file.test.js

# Test CLI functionality
node dist/index.js --help
node dist/index.js list
```

### Integration Testing

```bash
# Test service startup
freeapi start chatgpt --test

# Test configuration
freeapi config chatgpt --test

# Test chat functionality (non-interactive)
echo "Hello, how are you?" | freeapi chat chatgpt --stdin

# Test error handling
freeapi config nonexistent-service
```

## 📖 Documentation

### Basic Commands

```bash
# Initialize configuration
freeapi init

# List available services
freeapi list

# Configure a specific service
freeapi config chatgpt
freeapi config deepseek

# Start interactive chat
freeapi chat chatgpt

# Check service status
freeapi status

# View logs
freeapi logs

# Stop services
freeapi stop
```

### ChatGPT Service

FreeAPI comes with a fully-featured ChatGPT service:

#### Features:
- **Public Mode**: Use without API key (limited functionality)
- **Authenticated Mode**: Full access with OpenAI API key
- **Multiple Models**: GPT-3.5 Turbo, GPT-4, GPT-4 Turbo
- **Conversation History**: Save and continue conversations
- **Rate Limiting**: Built-in protection against API limits

#### Configuration:
```bash
# Run the interactive configuration wizard
freeapi config chatgpt

# Or configure manually
node -e "require('freeapi/dist/services/chatgpt/exports').runConfigWizard()"
```

#### Example Usage:
```javascript
// Programmatic usage
const { createChatGPTService } = require('freeapi/dist/services/chatgpt/exports');

async function chat() {
  const chatGPT = createChatGPTService();
  await chatGPT.initialize();
  
  const response = await chatGPT.sendMessage('Hello, how are you?', {
    maxTokens: 100,
    temperature: 0.7,
    systemPrompt: 'You are a helpful assistant.'
  });
  
  console.log(response.message.content);
  chatGPT.destroy();
}

chat().catch(console.error);
```

## 🛠️ Development

### Project Structure
```
freeapi/
├── bin/freeapi              # CLI entry point
├── src/
│   ├── index.ts            # Main entry point
│   ├── cli/                # CLI command implementations
│   │   ├── commands/       # Individual CLI commands
│   │   └── index.ts        # CLI setup
│   ├── services/           # AI service implementations
│   │   └── chatgpt/        # ChatGPT service (first implementation)
│   │       ├── api-client.ts      # HTTP client with auth
│   │       ├── session-manager.ts # User session management
│   │       ├── config-wizard.ts   # Interactive setup
│   │       └── exports.ts         # Public API
│   └── utils/              # Utility functions
├── dist/                   # Compiled JavaScript
├── tests/                  # Test suite
└── docs/                   # Documentation
```

### Adding New Services

1. Create a new service directory in `src/services/`
2. Implement the `BaseServiceAdapter` interface
3. Add configuration wizard
4. Register with CLI commands
5. Add tests

Example service structure:
```typescript
// src/services/myservice/index.ts
export class MyService extends BaseServiceAdapter {
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    // Implementation
  }
  
  async initialize(): Promise<void> {
    // Initialization
  }
  
  // ... other required methods
}
```

### Building from Source

```bash
# Clone the repository
git clone https://github.com/naturecode-official/freeapi.git
cd freeapi

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run tests
npm test

# Link globally for development
npm link
```

## 📦 Installation Methods

### Method 1: npm (Recommended)
```bash
npm install -g freeapi
```

### Method 2: From Source
```bash
git clone https://github.com/naturecode-official/freeapi.git
cd freeapi
./install-global.sh
```

### Method 3: Docker (Coming Soon)
```bash
docker pull naturecode/freeapi
docker run -it naturecode/freeapi freeapi --help
```

## 🔧 Configuration

### Configuration Directory
FreeAPI stores configuration in `~/.freeapi/`:
```
~/.freeapi/
├── config.json          # Global configuration
├── services/           # Service configurations
│   ├── chatgpt.json    # ChatGPT configuration
│   └── deepseek.json   # DeepSeek configuration
└── logs/               # Application logs
```

### Environment Variables
```bash
# Set OpenAI API key
export OPENAI_API_KEY=sk-your-key-here

# Enable debug logging
export DEBUG=freeapi:*

# Custom configuration directory
export FREEAPI_CONFIG_DIR=/path/to/config
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Run tests**: `npm test`
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Setup
```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/freeapi.git
cd freeapi

# 2. Install dependencies
npm install

# 3. Create development branch
git checkout -b dev/feature-name

# 4. Make changes and test
npm run build
npm test

# 5. Link for testing
npm link
freeapi --help  # Test your changes
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for the ChatGPT API
- All contributors and testers
- The open-source community

## 📞 Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/naturecode-official/freeapi/issues)
- **Documentation**: See `docs/` directory for detailed guides
- **Quick Help**: Run `freeapi --help` for command reference

## 🚀 Roadmap

- [x] ChatGPT service implementation
- [ ] DeepSeek service integration
- [ ] Wenxin AI support
- [ ] Qwen AI integration
- [ ] Docker containerization
- [ ] Web dashboard
- [ ] Plugin system for custom services
- [ ] Mobile app (React Native)

---

<div align="center">
  
**Made with ❤️ by NatureCode**

[GitHub](https://github.com/naturecode-official) • [npm](https://www.npmjs.com/package/freeapi) • [Report Bug](https://github.com/naturecode-official/freeapi/issues)

</div>