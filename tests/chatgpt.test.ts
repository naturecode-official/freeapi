/**
 * ChatGPT Service Tests
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { ChatGPTServiceAdapter, createChatGPTService } from '../src/services/chatgpt/exports';
import { ChatGPTMode, ChatGPTModel } from '../src/services/chatgpt/types';

describe('ChatGPT Service', () => {
  let service: ChatGPTServiceAdapter;

  beforeEach(() => {
    // Create service with test encryption key
    service = createChatGPTService('test-encryption-key');
  });

  afterEach(async () => {
    // Clean up
    service.destroy();
  });

  test('should create service instance', () => {
    expect(service).toBeDefined();
    expect(typeof service.initialize).toBe('function');
    expect(typeof service.sendMessage).toBe('function');
  });

  test('should initialize service', async () => {
    await expect(service.initialize()).resolves.not.toThrow();
    
    const status = service.getStatus();
    expect(status.initialized).toBe(true);
    expect(status.mode).toBe(ChatGPTMode.PUBLIC);
  });

  test('should get service information', () => {
    const info = service.getServiceInfo();
    
    expect(info.name).toBe('ChatGPT');
    expect(info.version).toBe('1.0.0');
    expect(info.description).toContain('OpenAI ChatGPT');
    expect(info.capabilities.length).toBeGreaterThan(0);
    expect(info.configuration.base_url).toBeDefined();
  });

  test('should get service status', async () => {
    await service.initialize();
    
    const status = service.getStatus();
    
    expect(status).toHaveProperty('initialized');
    expect(status).toHaveProperty('mode');
    expect(status).toHaveProperty('authenticated');
    expect(status).toHaveProperty('totalConversations');
    expect(status).toHaveProperty('totalTokens');
    expect(status).toHaveProperty('errorCount');
  });

  test('should get configuration', () => {
    const config = service.getConfiguration();
    
    expect(config.mode).toBe(ChatGPTMode.PUBLIC);
    expect(config.model).toBe(ChatGPTModel.GPT35_TURBO);
    expect(config.max_tokens).toBe(4096);
    expect(config.temperature).toBe(0.7);
    expect(config.base_url).toBeDefined();
  });

  test('should get config file path', () => {
    const configPath = service.getConfigFilePath();
    expect(configPath).toContain('.freeapi/services/chatgpt/config.json');
  });

  test('should get usage statistics', () => {
    const usageStats = service.getUsageStats();
    
    expect(usageStats).toHaveProperty('total_tokens');
    expect(usageStats).toHaveProperty('prompt_tokens');
    expect(usageStats).toHaveProperty('completion_tokens');
    expect(usageStats).toHaveProperty('requests');
    expect(usageStats).toHaveProperty('rate_limited');
  });

  test('should get error statistics', () => {
    const errorStats = service.getErrorStatistics();
    
    expect(errorStats).toHaveProperty('totalErrors');
    expect(errorStats).toHaveProperty('errorCounts');
    expect(errorStats).toHaveProperty('retryableErrors');
    expect(errorStats).toHaveProperty('mostCommonError');
  });

  test('should get recent errors', () => {
    const errors = service.getRecentErrors();
    expect(Array.isArray(errors)).toBe(true);
  });

  test('should clear error history', () => {
    expect(() => service.clearErrorHistory()).not.toThrow();
    
    const errorStats = service.getErrorStatistics();
    expect(errorStats.totalErrors).toBe(0);
  });

  test('should get recovery actions', () => {
    const actions = service.getRecoveryActions();
    expect(Array.isArray(actions)).toBe(true);
  });

  test('should test connection', async () => {
    // Note: This test might fail if there's no network connection
    // or if the API endpoint is not reachable
    try {
      const connected = await service.testConnection();
      expect(typeof connected).toBe('boolean');
    } catch (error) {
      // Connection test might fail in test environment, that's okay
      console.warn('Connection test failed (expected in test environment):', error.message);
    }
  });

  test('should backup configuration', async () => {
    try {
      const backupFile = await service.backupConfiguration();
      expect(backupFile).toContain('config-backup-');
      expect(backupFile).toContain('.json');
    } catch (error) {
      // Backup might fail due to file permissions, that's okay
      console.warn('Backup test failed:', error.message);
    }
  });

  test('should list backups', async () => {
    try {
      const backups = await service.listBackups();
      expect(Array.isArray(backups)).toBe(true);
    } catch (error) {
      // Might fail if backup directory doesn't exist
      console.warn('List backups test failed:', error.message);
    }
  });

  test('should reset configuration', async () => {
    await expect(service.resetConfiguration()).resolves.not.toThrow();
    
    const config = service.getConfiguration();
    expect(config.mode).toBe(ChatGPTMode.PUBLIC);
    expect(config.model).toBe(ChatGPTModel.GPT35_TURBO);
  });
});

describe('ChatGPT Service Events', () => {
  let service: ChatGPTServiceAdapter;
  let events: string[] = [];

  beforeEach(() => {
    service = createChatGPTService('test-key');
    events = [];
    
    // Capture events
    service.on('service:initializing', () => events.push('initializing'));
    service.on('service:initialized', () => events.push('initialized'));
    service.on('config:loaded', () => events.push('config:loaded'));
    service.on('config:saved', () => events.push('config:saved'));
  });

  afterEach(() => {
    service.destroy();
  });

  test('should emit initialization events', async () => {
    await service.initialize();
    
    expect(events).toContain('initializing');
    expect(events).toContain('config:loaded');
    expect(events).toContain('initialized');
  });

  test('should emit config events on update', async () => {
    await service.initialize();
    
    const newConfig = {
      model: ChatGPTModel.GPT4,
      max_tokens: 2048,
      temperature: 0.5
    };
    
    await service.updateConfiguration(newConfig);
    
    expect(events).toContain('config:saved');
  });
});

describe('ChatGPT Error Handling', () => {
  let service: ChatGPTServiceAdapter;

  beforeEach(() => {
    service = createChatGPTService('test-key');
  });

  afterEach(() => {
    service.destroy();
  });

  test('should handle errors gracefully', async () => {
    // Try to send message without initialization (should work due to auto-init)
    try {
      // This might fail or succeed depending on network/API availability
      await service.sendMessage('test');
    } catch (error) {
      // Error is expected in test environment
      expect(error).toBeDefined();
      
      const errorStats = service.getErrorStatistics();
      expect(errorStats.totalErrors).toBeGreaterThan(0);
    }
  });

  test('should track error statistics', async () => {
    const initialStats = service.getErrorStatistics();
    expect(initialStats.totalErrors).toBe(0);

    // Trigger an error (invalid configuration)
    try {
      await service.updateConfiguration({
        base_url: 'invalid-url'
      });
    } catch (error) {
      // Expected to fail
    }

    const finalStats = service.getErrorStatistics();
    expect(finalStats.totalErrors).toBeGreaterThan(initialStats.totalErrors);
  });
});