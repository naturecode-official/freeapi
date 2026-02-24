# FreeAPI

A tool that runs multiple AI web-based free chat services in the background, providing users with a unified interface to access these services.

## Features

- **Multi-service integration**: Support for ChatGPT Web, DeepSeek, Wenxin, Qwen and more
- **Unified interface**: Single CLI interface for all AI services
- **Cross-platform**: Works on Windows, macOS, and Linux
- **Easy configuration**: Interactive setup and configuration
- **Session management**: Automatic session keeping and recovery

## Installation

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Install from npm (Coming soon)
```bash
npm install -g freeapi
```

### Install from source
```bash
git clone https://github.com/yourusername/freeapi.git
cd freeapi
npm install
npm run build
npm link
```

## Quick Start

1. **Initialize configuration**
   ```bash
   freeapi init
   ```

2. **List available services**
   ```bash
   freeapi list
   ```

3. **Configure a service**
   ```bash
   freeapi config chatgpt_web
   ```

4. **Start a service**
   ```bash
   freeapi start chatgpt_web
   ```

5. **Interactive chat**
   ```bash
   freeapi chat chatgpt_web
   ```

## Available Commands

| Command | Description |
|---------|-------------|
| `freeapi` | Show available configurations and commands |
| `freeapi init` | Initialize FreeAPI configuration |
| `freeapi list` | List available services |
| `freeapi config <service>` | Configure a specific service |
| `freeapi start <service>` | Start a service |
| `freeapi chat <service>` | Interactive chat with a service |
| `freeapi status` | Check service status |
| `freeapi logs` | View logs |
| `freeapi stop` | Stop services |

## Supported Services

### Currently Planned
- **ChatGPT Web**: Browser-based ChatGPT access
- **DeepSeek**: DeepSeek API integration
- **文心一言 (Wenxin)**: Baidu AI service
- **通义千问 (Qwen)**: Alibaba AI service

### Coming Soon
- **智谱清言 (GLM)**: Tsinghua AI service
- **月之暗面 (Moonshot)**: Moonshot AI
- **零一万物 (01.AI)**: 01.AI services

## Configuration

FreeAPI stores configuration in `~/.freeapi/`:

```
~/.freeapi/
├── config.json          # Global configuration
├── services/           # Service configurations
│   ├── chatgpt_web.json
│   ├── deepseek.json
│   └── wenxin.json
├── sessions/          # Session data
├── logs/             # Log files
├── data/             # Application data
└── cache/            # Cache files
```

## Development

### Setup
```bash
git clone https://github.com/yourusername/freeapi.git
cd freeapi
npm install
```

### Build
```bash
npm run build
```

### Development mode
```bash
npm run dev
```

### Testing
```bash
npm test
```

### Linting
```bash
npm run lint
```

## Project Structure

```
freeapi/
├── bin/              # CLI executable
├── src/              # Source code
│   ├── cli/         # Command-line interface
│   ├── core/        # Core framework
│   ├── services/    # Service adapters
│   ├── browser/     # Browser automation
│   └── api/         # Internal API
├── configs/         # Default configurations
├── tests/           # Test files
└── docs/            # Documentation
```

## Roadmap

### Phase 1: Foundation (Current)
- [x] Project structure setup
- [x] CLI framework
- [x] Configuration system
- [ ] Basic service adapters

### Phase 2: Core Features
- [ ] ChatGPT Web integration
- [ ] DeepSeek API integration
- [ ] Interactive chat interface
- [ ] Service lifecycle management

### Phase 3: Advanced Features
- [ ] More service integrations
- [ ] Concurrent request handling
- [ ] Advanced session management
- [ ] Performance optimization

### Phase 4: Production Ready
- [ ] Cross-platform packaging
- [ ] Comprehensive testing
- [ ] Documentation
- [ ] Performance benchmarking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- Issues: [GitHub Issues](https://github.com/yourusername/freeapi/issues)
- Documentation: [GitHub Wiki](https://github.com/yourusername/freeapi/wiki)
- Discussions: [GitHub Discussions](https://github.com/yourusername/freeapi/discussions)