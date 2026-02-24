/**
 * ChatGPT CLI Adapter
 * Integrates ChatGPT service with FreeAPI CLI framework
 */

import { ChatGPTServiceAdapter, createChatGPTService } from './exports';
import { BaseServiceAdapter } from '../base';
import { ServiceConfig, ServiceStatus, ChatRequest, ChatResponse } from '../base/types';

export class ChatGPTCliAdapter extends BaseServiceAdapter {
  private service: ChatGPTServiceAdapter;
  protected config: ServiceConfig;

  constructor(config: ServiceConfig) {
    super('chatgpt', config);
    this.config = config;
    
    // Create ChatGPT service instance
    const encryptionKey = process.env.FREEAPI_ENCRYPTION_KEY || 'default-key-change-me';
    this.service = createChatGPTService(encryptionKey);

    // Set up event forwarding
    this.setupEventForwarding();
  }

  /**
   * Set up event forwarding
   */
  private setupEventForwarding(): void {
    // Forward service events to base adapter
    this.service.on('service:initializing', () => this.emit('service:initializing', this.name));
    this.service.on('service:initialized', () => this.emit('service:initialized', this.name));
    this.service.on('service:init:error', (error) => this.emit('service:error', this.name, error));
    
    this.service.on('chat:start', (data) => this.emit('chat:start', this.name, data));
    this.service.on('chat:success', (data) => this.emit('chat:success', this.name, data));
    this.service.on('chat:error', (data) => this.emit('chat:error', this.name, data));
    
    this.service.on('config:loaded', (config) => this.emit('config:loaded', this.name, config));
    this.service.on('config:saved', (config) => this.emit('config:saved', this.name, config));
    this.service.on('config:updated', (config) => this.emit('config:updated', this.name, config));
    
    this.service.on('error:handled', (error) => this.emit('service:error', this.name, error));
    this.service.on('log', (logEntry) => this.emit('service:log', this.name, logEntry));
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    try {
      await this.service.initialize();
      this.status = 'ready';
      this.emit('service:ready', this.name);
    } catch (error) {
      this.status = 'error';
      this.emit('service:error', this.name, error);
      throw error;
    }
  }

  /**
   * Send a chat message
   */
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    if (this.status !== 'ready') {
      await this.initialize();
    }

    try {
      const options = {
        conversationId: request.conversationId,
        stream: request.stream,
        temperature: request.temperature,
        maxTokens: request.maxTokens,
        systemPrompt: request.systemPrompt
      };

      const response = await this.service.sendMessage(request.message, options);

      return {
        id: response.conversationId,
        message: response.message.content,
        conversationId: response.conversationId,
        usage: response.usage,
        finishReason: response.finish_reason,
        timestamp: Date.now()
      };
    } catch (error) {
      this.emit('service:error', this.name, error);
      throw error;
    }
  }

  /**
   * Get service status
   */
  async getStatus(): Promise<ServiceStatus> {
    const serviceStatus = this.service.getStatus();
    const usageStats = this.service.getUsageStats();

    return {
      name: this.name,
      status: this.status,
      enabled: this.config.enabled,
      mode: serviceStatus.mode,
      authenticated: serviceStatus.authenticated,
      hasActiveSession: serviceStatus.hasActiveSession,
      totalConversations: serviceStatus.totalConversations,
      totalTokens: serviceStatus.totalTokens,
      rateLimited: serviceStatus.rateLimited,
      errorCount: 0, // TODO: Get from error handler
      lastError: undefined,
      usage: {
        totalTokens: usageStats.total_tokens,
        promptTokens: usageStats.prompt_tokens,
        completionTokens: usageStats.completion_tokens,
        requests: usageStats.requests
      }
    };
  }

  /**
   * Get service information
   */
  async getInfo(): Promise<any> {
    const config = this.service.getConfiguration();

    return {
      name: 'ChatGPT',
      version: '1.0.0',
      description: 'OpenAI ChatGPT service with public and authenticated modes',
      capabilities: ['chat', 'conversation_history', 'authentication'],
      limitations: ['rate_limited', 'requires_api_key'],
      config: {
        base_url: config.base_url,
        mode: config.mode,
        model: config.model,
        max_tokens: config.max_tokens,
        temperature: config.temperature,
        timeout: config.timeout
      }
    };
  }

  /**
   * Update configuration
   */
  async updateConfig(newConfig: Partial<ServiceConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    
    // Convert to ChatGPT config format
    const chatGPTConfig = this.convertToChatGPTConfig(newConfig);
    this.service.updateConfiguration(chatGPTConfig);
    
    this.emit('config:updated', this.name, this.config);
  }

  /**
   * Convert FreeAPI service config to ChatGPT config
   */
  private convertToChatGPTConfig(serviceConfig: Partial<ServiceConfig>): any {
    const config: any = {};

    if (serviceConfig.settings) {
      if (serviceConfig.settings.base_url) config.base_url = serviceConfig.settings.base_url;
      if (serviceConfig.settings.model) config.model = serviceConfig.settings.model;
      if (serviceConfig.settings.max_tokens) config.max_tokens = serviceConfig.settings.max_tokens;
      if (serviceConfig.settings.temperature) config.temperature = serviceConfig.settings.temperature;
      if (serviceConfig.settings.timeout) config.timeout = serviceConfig.settings.timeout;
    }

    if (serviceConfig.credentials) {
      config.mode = 'authenticated';
      config.credentials = {
        email: serviceConfig.credentials.username,
        password: serviceConfig.credentials.password
      };
    }

    return config;
  }

  /**
   * Authenticate user
   */
  async authenticate(credentials: { username: string; password: string }): Promise<boolean> {
    try {
      const response = await this.service.authenticate(credentials.username, credentials.password);
      return response.authenticated;
    } catch (error) {
      this.emit('service:error', this.name, error);
      return false;
    }
  }

  /**
   * Test service connection
   */
  async testConnection(): Promise<boolean> {
    return this.service.testConnection();
  }

  /**
   * Get conversations
   */
  async getConversations(): Promise<any[]> {
    const conversations = this.service.getAllConversations();
    return conversations.map(conv => ({
      id: conv.id,
      title: conv.title,
      created_at: conv.created_at,
      updated_at: conv.updated_at,
      message_count: conv.messages.length,
      token_count: conv.token_count,
      model: conv.model
    }));
  }

  /**
   * Get conversation by ID
   */
  async getConversation(conversationId: string): Promise<any> {
    const conversation = this.service.getConversation(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    return {
      id: conversation.id,
      title: conversation.title,
      created_at: conversation.created_at,
      updated_at: conversation.updated_at,
      messages: conversation.messages,
      token_count: conversation.token_count,
      model: conversation.model
    };
  }

  /**
   * Delete conversation
   */
  async deleteConversation(conversationId: string): Promise<boolean> {
    return this.service.deleteConversation(conversationId);
  }

  /**
   * Get usage statistics
   */
  async getUsage(): Promise<any> {
    const usageStats = this.service.getUsageStats();

    return {
      tokens: {
        total: usageStats.total_tokens,
        prompt: usageStats.prompt_tokens,
        completion: usageStats.completion_tokens
      },
      requests: usageStats.requests,
      rate_limited: usageStats.rate_limited,
      errors: {
        total: 0,
        retryable: 0,
        last_error: 0
      }
    };
  }

  /**
   * Get error information
   */
  async getErrors(_limit = 10): Promise<any[]> {
    // TODO: Implement error retrieval
    return [];
  }

  /**
   * Get recovery actions
   */
  async getRecoveryActions(): Promise<any[]> {
    // TODO: Implement recovery actions
    return [];
  }

  /**
   * Clear error history
   */
  async clearErrorHistory(): Promise<void> {
    // TODO: Implement error history clearing
  }

  /**
   * Backup configuration
   */
  async backupConfig(backupDir?: string): Promise<string> {
    return this.service.backupConfiguration(backupDir);
  }

  /**
   * Restore configuration from backup
   */
  async restoreConfig(backupFile: string): Promise<void> {
    await this.service.restoreConfiguration(backupFile);
  }

  /**
   * List available backups
   */
  async listBackups(backupDir?: string): Promise<string[]> {
    return this.service.listBackups(backupDir);
  }

  /**
   * Reset configuration to defaults
   */
  async resetConfig(): Promise<void> {
    await this.service.resetConfiguration();
  }

  /**
   * Clean up resources
   */
  async destroy(): Promise<void> {
    this.service.destroy();
    this.status = 'stopped';
    this.emit('service:stopped', this.name);
  }
}

/**
 * Create ChatGPT CLI adapter factory function
 */
export function createChatGPTCliAdapter(config: ServiceConfig): ChatGPTCliAdapter {
  return new ChatGPTCliAdapter(config);
}

/**
 * Register ChatGPT service with FreeAPI
 */
export function registerChatGPTService(): void {
  // This would be called by the main FreeAPI service registry
  console.log('ChatGPT service registered');
}

export default ChatGPTCliAdapter;