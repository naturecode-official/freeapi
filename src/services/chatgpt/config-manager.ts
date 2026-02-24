/**
 * ChatGPT Configuration Manager
 * Handles configuration loading, validation, and persistence
 */

import { ChatGPTConfig, ChatGPTMode, ChatGPTModel } from './types';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class ChatGPTConfigManager {
  private defaultConfig: ChatGPTConfig = {
    mode: ChatGPTMode.PUBLIC,
    enabled: true,
    base_url: 'https://api.openai.com/v1/',
    model: ChatGPTModel.GPT35_TURBO,
    max_tokens: 4096,
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    timeout: 30000,
    max_retries: 3,
    retry_delay: 1000,
    requests_per_minute: 60,
    tokens_per_minute: 150000
  };

  private configDir: string;
  private configFile: string;

  constructor(configDir?: string) {
    this.configDir = configDir || path.join(os.homedir(), '.freeapi', 'services', 'chatgpt');
    this.configFile = path.join(this.configDir, 'config.json');
  }

  /**
   * Load configuration from file or create default
   */
  async loadConfig(): Promise<ChatGPTConfig> {
    try {
      await fs.ensureDir(this.configDir);

      if (await fs.pathExists(this.configFile)) {
        const configData = await fs.readJson(this.configFile);
        const mergedConfig = this.mergeWithDefaults(configData);
        
        const validation = this.validateConfig(mergedConfig);
        if (!validation.valid) {
          console.warn('Configuration validation warnings:', validation.warnings);
          if (validation.errors.length > 0) {
            throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
          }
        }

        return mergedConfig;
      } else {
        // Create default config file
        await this.saveConfig(this.defaultConfig);
        return { ...this.defaultConfig };
      }
    } catch (error) {
      console.error('Failed to load configuration:', error);
      return { ...this.defaultConfig };
    }
  }

  /**
   * Save configuration to file
   */
  async saveConfig(config: ChatGPTConfig): Promise<void> {
    try {
      await fs.ensureDir(this.configDir);
      
      // Validate before saving
      const validation = this.validateConfig(config);
      if (!validation.valid) {
        throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
      }

      // Remove sensitive data if not in authenticated mode
      const configToSave = { ...config };
      if (configToSave.mode !== ChatGPTMode.AUTHENTICATED) {
        delete configToSave.credentials;
      }

      await fs.writeJson(this.configFile, configToSave, { spaces: 2 });
    } catch (error) {
      console.error('Failed to save configuration:', error);
      throw error;
    }
  }

  /**
   * Merge user config with defaults
   */
  private mergeWithDefaults(userConfig: Partial<ChatGPTConfig>): ChatGPTConfig {
    const merged = { ...this.defaultConfig, ...userConfig };

    // Ensure mode-specific settings
    if (merged.mode === ChatGPTMode.PUBLIC) {
      // Public mode doesn't need credentials
      delete merged.credentials;
    } else if (merged.mode === ChatGPTMode.AUTHENTICATED) {
      // Authenticated mode needs proper base URL
      if (!merged.base_url || merged.base_url === this.defaultConfig.base_url) {
        merged.base_url = 'https://chat.openai.com/backend-api/';
      }
    }

    return merged;
  }

  /**
   * Validate configuration
   */
  validateConfig(config: ChatGPTConfig): ConfigValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate mode
    if (!Object.values(ChatGPTMode).includes(config.mode)) {
      errors.push(`Invalid mode: ${config.mode}. Must be one of: ${Object.values(ChatGPTMode).join(', ')}`);
    }

    // Validate base URL
    if (!config.base_url || !this.isValidUrl(config.base_url)) {
      errors.push('Invalid base URL');
    }

    // Validate model
    if (!Object.values(ChatGPTModel).includes(config.model)) {
      warnings.push(`Model ${config.model} may not be supported`);
    }

    // Validate numeric ranges
    if (config.max_tokens < 1 || config.max_tokens > 16384) {
      errors.push('max_tokens must be between 1 and 16384');
    }

    if (config.temperature < 0 || config.temperature > 2) {
      errors.push('temperature must be between 0 and 2');
    }

    if (config.top_p < 0 || config.top_p > 1) {
      errors.push('top_p must be between 0 and 1');
    }

    if (config.frequency_penalty < -2 || config.frequency_penalty > 2) {
      errors.push('frequency_penalty must be between -2 and 2');
    }

    if (config.presence_penalty < -2 || config.presence_penalty > 2) {
      errors.push('presence_penalty must be between -2 and 2');
    }

    // Validate timeout
    if (config.timeout < 1000 || config.timeout > 300000) {
      warnings.push('timeout should be between 1000 and 300000 ms');
    }

    // Validate authenticated mode requirements
    if (config.mode === ChatGPTMode.AUTHENTICATED) {
      if (!config.credentials?.email || !config.credentials?.password) {
        errors.push('Authenticated mode requires email and password');
      }
      
      if (config.base_url === this.defaultConfig.base_url) {
        warnings.push('Authenticated mode should use chat.openai.com backend URL');
      }
    }

    // Validate rate limits
    if (config.requests_per_minute < 1) {
      warnings.push('requests_per_minute should be at least 1');
    }

    if (config.tokens_per_minute < 1000) {
      warnings.push('tokens_per_minute should be at least 1000');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Check if string is a valid URL
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get configuration file path
   */
  getConfigFilePath(): string {
    return this.configFile;
  }

  /**
   * Get configuration directory
   */
  getConfigDir(): string {
    return this.configDir;
  }

  /**
   * Get default configuration
   */
  getDefaultConfig(): ChatGPTConfig {
    return { ...this.defaultConfig };
  }

  /**
   * Create configuration from user input
   */
  createConfigFromInput(input: {
    mode: ChatGPTMode;
    base_url?: string;
    api_key?: string;
    email?: string;
    password?: string;
    model?: ChatGPTModel;
    max_tokens?: number;
    temperature?: number;
  }): ChatGPTConfig {
    const config: ChatGPTConfig = {
      ...this.defaultConfig,
      mode: input.mode,
      model: input.model || this.defaultConfig.model,
      max_tokens: input.max_tokens || this.defaultConfig.max_tokens,
      temperature: input.temperature || this.defaultConfig.temperature
    };

    // Set base URL
    if (input.base_url) {
      config.base_url = input.base_url;
    } else if (input.mode === ChatGPTMode.AUTHENTICATED) {
      config.base_url = 'https://chat.openai.com/backend-api/';
    }

    // Set API key for public mode
    if (input.mode === ChatGPTMode.PUBLIC && input.api_key) {
      config.api_key = input.api_key;
    }

    // Set credentials for authenticated mode
    if (input.mode === ChatGPTMode.AUTHENTICATED && input.email && input.password) {
      config.credentials = {
        email: input.email,
        password: input.password
      };
    }

    return config;
  }

  /**
   * Encrypt sensitive data in configuration
   */
  encryptSensitiveData(config: ChatGPTConfig, encryptionKey: string): ChatGPTConfig {
    const encryptedConfig = { ...config };

    // Simple XOR encryption for demo (in production use proper encryption)
    if (encryptedConfig.api_key) {
      encryptedConfig.api_key = this.xorEncrypt(encryptedConfig.api_key, encryptionKey);
    }

    if (encryptedConfig.credentials?.password) {
      encryptedConfig.credentials.password = this.xorEncrypt(
        encryptedConfig.credentials.password,
        encryptionKey
      );
    }

    return encryptedConfig;
  }

  /**
   * Decrypt sensitive data in configuration
   */
  decryptSensitiveData(config: ChatGPTConfig, encryptionKey: string): ChatGPTConfig {
    const decryptedConfig = { ...config };

    if (decryptedConfig.api_key) {
      decryptedConfig.api_key = this.xorEncrypt(decryptedConfig.api_key, encryptionKey);
    }

    if (decryptedConfig.credentials?.password) {
      decryptedConfig.credentials.password = this.xorEncrypt(
        decryptedConfig.credentials.password,
        encryptionKey
      );
    }

    return decryptedConfig;
  }

  /**
   * Simple XOR encryption for demo purposes
   * In production, use proper encryption like AES
   */
  private xorEncrypt(text: string, key: string): string {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return Buffer.from(result).toString('base64');
  }

  /**
   * Backup configuration
   */
  async backupConfig(backupDir?: string): Promise<string> {
    const backupPath = backupDir || path.join(this.configDir, 'backups');
    await fs.ensureDir(backupPath);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupPath, `config-backup-${timestamp}.json`);

    if (await fs.pathExists(this.configFile)) {
      await fs.copy(this.configFile, backupFile);
    }

    return backupFile;
  }

  /**
   * Restore configuration from backup
   */
  async restoreConfig(backupFile: string): Promise<ChatGPTConfig> {
    if (!(await fs.pathExists(backupFile))) {
      throw new Error(`Backup file not found: ${backupFile}`);
    }

    const backupConfig = await fs.readJson(backupFile);
    const mergedConfig = this.mergeWithDefaults(backupConfig);
    
    const validation = this.validateConfig(mergedConfig);
    if (!validation.valid) {
      throw new Error(`Invalid backup configuration: ${validation.errors.join(', ')}`);
    }

    await this.saveConfig(mergedConfig);
    return mergedConfig;
  }

  /**
   * List available backups
   */
  async listBackups(backupDir?: string): Promise<string[]> {
    const backupPath = backupDir || path.join(this.configDir, 'backups');
    
    if (!(await fs.pathExists(backupPath))) {
      return [];
    }

    const files = await fs.readdir(backupPath);
    return files
      .filter(file => file.startsWith('config-backup-') && file.endsWith('.json'))
      .map(file => path.join(backupPath, file))
      .sort()
      .reverse(); // Most recent first
  }
}