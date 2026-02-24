# @cuijy/free-api 🤖

[![npm version](https://img.shields.io/npm/v/@cuijy/free-api.svg)](https://www.npmjs.com/package/@cuijy/free-api)
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
npm install -g @cuijy/free-api

# Verify installation
free-api --version
```

### Basic Usage

```bash
# Initialize configuration
free-api init

# List available services
free-api list

# Configure ChatGPT service
free-api config chatgpt

# Start interactive chat with ChatGPT
free-api chat chatgpt
```

## 📖 Documentation

### Available Commands

```bash
free-api [options] [command]

Options:
  -V, --version               output the version number
  -h, --help                  display help for command

Commands:
  init [options]              Initialize FreeAPI configuration
  list [options]              List available services
  config [options] <service>  Configure a specific service
  start <service>             Start a service
  chat <service>              Interactive chat with a service
  status                      Check service status
  logs [options]              View logs
  stop [options] [service]    Stop services
```

### ChatGPT Service

The ChatGPT service supports two modes:

1. **Public Mode**: No login required, limited functionality
2. **Authenticated Mode**: Full access with OpenAI API key

```bash
# Configure ChatGPT
free-api config chatgpt

# Choose mode during configuration
? Select ChatGPT mode: (Use arrow keys)
❯ Public (no login required, limited functionality)
  Authenticated (requires OpenAI API key, full access)

# Start chat
free-api chat chatgpt
```

## 🔧 Configuration

Configuration is stored in `~/.freeapi/config.json`:

```json
{
  "services": {
    "chatgpt": {
      "enabled": true,
      "mode": "public",
      "apiKey": "",
      "model": "gpt-3.5-turbo"
    }
  }
}
```

## 📁 Project Structure

```
~/.freeapi/
├── config.json      # Main configuration
├── logs/           # Service logs
└── cache/          # Cached data
```

## 🛠 Development

For development and source code, visit the GitHub repository:
[https://github.com/naturecode-official/freeapi](https://github.com/naturecode-official/freeapi)

## 🤝 Contributing

Contributions are welcome! Please see the [GitHub repository](https://github.com/naturecode-official/freeapi) for contribution guidelines.

## 📄 License

MIT © [NatureCode](https://github.com/naturecode-official)

## 🔗 Links

- **npm Package**: [https://www.npmjs.com/package/@cuijy/free-api](https://www.npmjs.com/package/@cuijy/free-api)
- **GitHub Repository**: [https://github.com/naturecode-official/freeapi](https://github.com/naturecode-official/freeapi)
- **Issues**: [https://github.com/naturecode-official/freeapi/issues](https://github.com/naturecode-official/freeapi/issues)

## 🙏 Acknowledgments

- OpenAI for ChatGPT API
- All contributors and users

---

**Enjoy your AI conversations!** 🚀