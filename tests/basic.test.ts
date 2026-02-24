import { describe, test, expect } from '@jest/globals';

describe('FreeAPI Basic Tests', () => {
  test('package.json has correct name', () => {
    const packageJson = require('../package.json');
    expect(packageJson.name).toBe('freeapi');
  });

  test('package.json has required fields', () => {
    const packageJson = require('../package.json');
    expect(packageJson.version).toBeDefined();
    expect(packageJson.description).toBeDefined();
    expect(packageJson.main).toBeDefined();
    expect(packageJson.bin).toBeDefined();
    expect(packageJson.bin.freeapi).toBe('bin/freeapi');
  });

  test('TypeScript config exists', () => {
    const fs = require('fs');
    expect(fs.existsSync('tsconfig.json')).toBe(true);
  });

  test('Source directory exists', () => {
    const fs = require('fs');
    expect(fs.existsSync('src')).toBe(true);
    expect(fs.existsSync('src/cli')).toBe(true);
  });
});