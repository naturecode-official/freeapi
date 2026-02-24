# Contributing to FreeAPI

Thank you for your interest in contributing to FreeAPI! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and considerate of others when contributing to this project.

## How to Contribute

### 1. Reporting Issues
- Check if the issue already exists
- Use the issue template if available
- Provide detailed information:
  - Steps to reproduce
  - Expected behavior
  - Actual behavior
  - Screenshots if applicable
  - Environment information

### 2. Feature Requests
- Describe the feature clearly
- Explain the use case
- Consider if it aligns with project goals
- Discuss implementation approach

### 3. Pull Requests
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Update documentation
6. Submit a pull request

## Development Setup

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Git

### Setup Steps
```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/freeapi.git
cd freeapi

# Install dependencies
npm install

# Build the project
npm run build

# Link for local testing
npm link
```

### Development Commands
```bash
# Development mode (watch for changes)
npm run dev

# Run tests
npm test

# Run linting
npm run lint

# Run type checking
npm run typecheck

# Format code
npm run format
```

## Coding Standards

### TypeScript/JavaScript
- Follow existing code style
- Use TypeScript for new code
- Add proper type annotations
- Write meaningful comments
- Keep functions small and focused

### Commit Messages
Use conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

### Testing
- Write tests for new features
- Ensure existing tests pass
- Test edge cases
- Use descriptive test names

### Documentation
- Update README.md if needed
- Add JSDoc comments for public APIs
- Update inline comments
- Keep documentation current

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
├── tests/           # Test files
└── docs/            # Documentation
```

## Adding New Services

1. Create a new directory in `src/services/`
2. Implement the service adapter interface
3. Add configuration template
4. Register the service
5. Add tests
6. Update documentation

Example:
```typescript
// src/services/myservice/index.ts
import { BaseServiceAdapter } from '../base';

export class MyServiceAdapter extends BaseServiceAdapter {
  // Implement required methods
}
```

## Review Process

1. Automated checks (CI/CD) must pass
2. Code review by maintainers
3. Address review comments
4. Merge when approved

## Getting Help

- Check existing documentation
- Look at similar implementations
- Ask in GitHub Discussions
- Open an issue for questions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.