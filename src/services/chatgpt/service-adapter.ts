/**
 * ChatGPT Service Adapter
 * Main adapter that implements the FreeAPI service interface for ChatGPT
 */

import { ChatGPTService, ChatOptions, ChatResponse } from './index';
import { ChatGPTConfigManager } from './config-manager';
import { ChatGPTErrorHandler, ChatGPTError, RecoveryAction } from './error-handler';
import { ChatGPTConfig, ChatGPTMode, Conversation, AuthenticationResponse, UsageStats } from './types';
import { EventEmitter } from 'events';

export interface ServiceStatus {
  initialized: boolean;
  mode: ChatGPTMode;
  authenticated: boolean;
  hasActiveSession: boolean;
  totalConversations: number;
  totalTokens: number;
  rateLimited: boolean;
  errorCount: number;
  lastError?: ChatGPTError;
}

export interface ServiceInfo {
  name: string;
  version: string;
  description: string;
  capabilities: string[];
  limitations: string[];
  configuration: {
    base_url: string;
    mode: ChatGPTMode;
    model: string;
    max_tokens: number;
  };
}

export class ChatGPTServiceAdapter extends EventEmitter {
  private service: ChatGPTService;
  private configManager: ChatGPTConfigManager;
  private errorHandler: ChatGPTErrorHandler;
  private config: ChatGPTConfig;
  private isInitialized = false;
  private encryptionKey: string;

  constructor(encryptionKey?: string) {
    super();
    this.encryptionKey = encryptionKey || 'default-encryption-key-change-in-production';
    this.configManager = new ChatGPTConfigManager();
    this.errorHandler = new ChatGPTErrorHandler();
    
    // Load configuration
    this.config = this.configManager.getDefaultConfig();
    this.service = new ChatGPTService(this.config);

    // Set up event forwarding
    this.setupEventForwarding();
  }

  /**
   * Set up event forwarding
   */
  private setupEventForwarding(): void {
    // Forward service events
    this.service.on('service:initializing', () => this.emit('service:initializing'));
    this.service.on('service:initialized', () => this.emit('service:initialized'));
    this.service.on('service:init:error', (error) => this.emit('service:init:error', error));
    this.service.on('service:auth:attempt', (data) => this.emit('service:auth:attempt', data));
    this.service.on('service:auth:success', (data) => this.emit('service:auth:success', data));
    this.service.on('service:auth:failed', (data) => this.emit('service:auth:failed', data));
    this.service.on('service:auth:error', (data) => this.emit('service:auth:error', data));
    this.service.on('service:config:updated', (config) => this.emit('service:config:updated', config));
    this.service.on('service:destroyed', () => this.emit('service:destroyed'));

    // Forward chat events
    this.service.on('chat:start', (data) => this.emit('chat:start', data));
    this.service.on('chat:request', (data) => this.emit('chat:request', data));
    this.service.on('chat:success', (data) => this.emit('chat:success', data));
    this.service.on('chat:error', (data) => this.emit('chat:error', data));

    // Forward error handler events
    this.errorHandler.on('error', (error) => this.emit('error:handled', error));
    this.errorHandler.on('log', (logEntry) => this.emit('log', logEntry));
    this.errorHandler.on('history:cleared', () => this.emit('error:history:cleared'));
  }

  /**
   * Initialize the service adapter
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      this.emit('adapter:initializing');

      // Load configuration
      await this.loadConfiguration();

      // Initialize service
      await this.service.initialize();

      this.isInitialized = true;
      this.emit('adapter:initialized');
    } catch (error) {
      const chatGPTError = this.errorHandler.handleError(error, 'initialize');
      this.emit('adapter:init:error', chatGPTError);
      throw error;
    }
  }

  /**
   * Load configuration from file
   */
  private async loadConfiguration(): Promise<void> {
    try {
      const loadedConfig = await this.configManager.loadConfig();
      
      // Decrypt sensitive data if encrypted
      if (this.encryptionKey) {
        this.config = this.configManager.decryptSensitiveData(loadedConfig, this.encryptionKey);
      } else {
        this.config = loadedConfig;
      }

      // Update service with loaded configuration
      this.service.updateConfig(this.config);

      this.emit('config:loaded', this.config);
    } catch (error) {
      const chatGPTError = this.errorHandler.handleError(error, 'loadConfiguration');
      throw new Error(`Failed to load configuration: ${chatGPTError.message}`);
    }
  }

  /**
   * Save configuration to file
   */
  async saveConfiguration(): Promise<void> {
    try {
      // Encrypt sensitive data before saving
      const configToSave = this.encryptionKey
        ? this.configManager.encryptSensitiveData(this.config, this.encryptionKey)
        : this.config;

      await this.configManager.saveConfig(configToSave);
      this.emit('config:saved', this.config);
    } catch (error) {
      const chatGPTError = this.errorHandler.handleError(error, 'saveConfiguration');
      throw new Error(`Failed to save configuration: ${chatGPTError.message}`);
    }
  }

  /**
   * Send a chat message
   */
  async sendMessage(message: string, options: ChatOptions = {}): Promise<ChatResponse> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const response = await this.service.chat(message, options);
      return response;
    } catch (error) {
      const chatGPTError = this.errorHandler.handleError(error, 'sendMessage');
      
      // Get recovery actions
      const recoveryActions = this.errorHandler.getRecoveryActions(chatGPTError);
      
      // Try automatic recovery if available
      if (this.errorHandler.shouldAutoRecover(chatGPTError)) {
        this.emit('recovery:attempt', { error: chatGPTError, actions: recoveryActions });
        
        // For now, just retry once for retryable errors
        if (chatGPTError.retryable) {
          await this.delay(1000); // Wait 1 second
          return this.sendMessage(message, options);
        }
      }

      throw new Error(this.errorHandler.getUserFriendlyMessage(chatGPTError));
    }
  }

  /**
   * Authenticate user
   */
  async authenticate(email: string, password: string): Promise<AuthenticationResponse> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const response = await this.service.authenticate(email, password);
      
      // Update configuration with new credentials
      this.config.mode = ChatGPTMode.AUTHENTICATED;
      this.config.credentials = {
        email,
        password,
        access_token: response.access_token,
        refresh_token: response.refresh_token,
        session_token: response.session_token
      };

      // Save updated configuration
      await this.saveConfiguration();

      return response;
    } catch (error) {
      const chatGPTError = this.errorHandler.handleError(error, 'authenticate');
      throw new Error(this.errorHandler.getUserFriendlyMessage(chatGPTError));
    }
  }

  /**
   * Update configuration
   */
  async updateConfiguration(newConfig: Partial<ChatGPTConfig>): Promise<void> {
    try {
      // Merge with current config
      this.config = { ...this.config, ...newConfig };
      
      // Update service
      this.service.updateConfig(this.config);
      
      // Save to file
      await this.saveConfiguration();

      this.emit('config:updated', this.config);
    } catch (error) {
      const chatGPTError = this.errorHandler.handleError(error, 'updateConfiguration');
      throw new Error(`Failed to update configuration: ${chatGPTError.message}`);
    }
  }

  /**
   * Get conversation by ID
   */
  getConversation(conversationId: string): Conversation | undefined {
    return this.service.getConversation(conversationId);
  }

  /**
   * Get all conversations
   */
  getAllConversations(): Conversation[] {
    return this.service.getAllConversations();
  }

  /**
   * Delete conversation
   */
  deleteConversation(conversationId: string): boolean {
    const success = this.service.deleteConversation(conversationId);
    if (success) {
      this.emit('conversation:deleted', conversationId);
    }
    return success;
  }

  /**
   * Get service status
   */
  getStatus(): ServiceStatus {
    const serviceStatus = this.service.getStatus();
    const errorStats = this.errorHandler.getErrorStatistics();
    const recentErrors = this.errorHandler.getRecentErrors(1);

    return {
      ...serviceStatus,
      errorCount: errorStats.totalErrors,
      lastError: recentErrors[0]
    };
  }

  /**
   * Get service information
   */
  getServiceInfo(): ServiceInfo {
    return {
      name: 'ChatGPT',
      version: '1.0.0',
      description: 'OpenAI ChatGPT service with public and authenticated modes',
      capabilities: [
        'Text generation',
        'Conversation management',
        'Multiple model support',
        'Session management',
        'Rate limiting',
        'Error recovery'
      ],
      limitations: [
        'Token limits apply',
        'Rate limits may restrict usage',
        'Some features require authentication'
      ],
      configuration: {
        base_url: this.config.base_url,
        mode: this.config.mode,
        model: this.config.model,
        max_tokens: this.config.max_tokens
      }
    };
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): UsageStats {
    return this.service.getUsageStats();
  }

  /**
   * Get error statistics
   */
  getErrorStatistics() {
    return this.errorHandler.getErrorStatistics();
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit = 10): ChatGPTError[] {
    return this.errorHandler.getRecentErrors(limit);
  }

  /**
   * Get recovery actions for last error
   */
  getRecoveryActions(): RecoveryAction[] {
    const recentErrors = this.getRecentErrors(1);
    if (recentErrors.length === 0) {
      return [];
    }
    return this.errorHandler.getRecoveryActions(recentErrors[0]);
  }

  /**
   * Clear error history
   */
  clearErrorHistory(): void {
    this.errorHandler.clearHistory();
  }

  /**
   * Get configuration
   */
  getConfiguration(): ChatGPTConfig {
    return { ...this.config };
  }

  /**
   * Get configuration file path
   */
  getConfigFilePath(): string {
    return this.configManager.getConfigFilePath();
  }

  /**
   * Backup configuration
   */
  async backupConfiguration(backupDir?: string): Promise<string> {
    try {
      const backupFile = await this.configManager.backupConfig(backupDir);
      this.emit('config:backup:created', backupFile);
      return backupFile;
    } catch (error) {
      const chatGPTError = this.errorHandler.handleError(error, 'backupConfiguration');
      throw new Error(`Failed to backup configuration: ${chatGPTError.message}`);
    }
  }

  /**
   * Restore configuration from backup
   */
  async restoreConfiguration(backupFile: string): Promise<void> {
    try {
      const restoredConfig = await this.configManager.restoreConfig(backupFile);
      
      // Decrypt if needed
      if (this.encryptionKey) {
        this.config = this.configManager.decryptSensitiveData(restoredConfig, this.encryptionKey);
      } else {
        this.config = restoredConfig;
      }

      // Update service
      this.service.updateConfig(this.config);
      
      this.emit('config:restored', this.config);
    } catch (error) {
      const chatGPTError = this.errorHandler.handleError(error, 'restoreConfiguration');
      throw new Error(`Failed to restore configuration: ${chatGPTError.message}`);
    }
  }

  /**
   * List available backups
   */
  async listBackups(backupDir?: string): Promise<string[]> {
    return this.configManager.listBackups(backupDir);
  }

  /**
   * Reset configuration to defaults
   */
  async resetConfiguration(): Promise<void> {
    try {
      this.config = this.configManager.getDefaultConfig();
      this.service.updateConfig(this.config);
      await this.saveConfiguration();
      
      this.emit('config:reset', this.config);
    } catch (error) {
      const chatGPTError = this.errorHandler.handleError(error, 'resetConfiguration');
      throw new Error(`Failed to reset configuration: ${chatGPTError.message}`);
    }
  }

  /**
   * Test service connection
   */
  async testConnection(): Promise<boolean> {
    try {
      this.emit('connection:test:start');
      
      // Check if we have API key for authenticated mode
      if (this.config.mode === 'authenticated' && !this.config.api_key) {
        this.emit('connection:test:failed', { 
          reason: 'API key required for authenticated mode' 
        });
        return false;
      }
      
      // For public mode without API key, just check basic connectivity
      if (this.config.mode === 'public' && !this.config.api_key) {
        // Just validate configuration without making API call
        const isValid = this.config.base_url && this.config.model;
        if (isValid) {
          this.emit('connection:test:success', { 
            mode: 'public', 
            message: 'Configuration valid (no API key for actual test)' 
          });
          return true;
        } else {
          this.emit('connection:test:failed', { 
            reason: 'Invalid configuration' 
          });
          return false;
        }
      }
      
      // For authenticated mode with API key, test actual API connection
      try {
        const response = await this.sendMessage('Hello', {
          maxTokens: 10,
          systemPrompt: 'You are a helpful assistant.'
        });

        const success = !!response && !!response.message.content;
        
        if (success) {
          this.emit('connection:test:success', response);
        } else {
          this.emit('connection:test:failed', { reason: 'Empty response' });
        }

        return success;
      } catch (apiError) {
        const chatGPTError = this.errorHandler.handleError(apiError, 'testConnection');
        this.emit('connection:test:failed', { error: chatGPTError });
        return false;
      }
    } catch (error) {
      const chatGPTError = this.errorHandler.handleError(error, 'testConnection');
      this.emit('connection:test:failed', { error: chatGPTError });
      return false;
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.service.destroy();
    this.errorHandler.removeAllListeners();
    this.removeAllListeners();
    this.emit('adapter:destroyed');
  }

  /**
   * Utility function for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}