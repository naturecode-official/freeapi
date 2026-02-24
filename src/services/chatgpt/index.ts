/**
 * ChatGPT Service Adapter
 * Main service class that integrates API client, session management, and chat functionality
 */

import { ChatGPTConfig, ChatGPTMode, ChatMessage, ChatCompletionRequest, ChatCompletionResponse, Conversation, AuthenticationResponse, UsageStats } from './types';
import { ChatGPTAPIClient } from './api-client';
import { ChatGPTSessionManager, SessionData } from './session-manager';
import { EventEmitter } from 'events';
import * as crypto from 'crypto';

export interface ChatOptions {
  conversationId?: string;
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

export interface ChatResponse {
  conversationId: string;
  message: ChatMessage;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  finish_reason: string;
}

export class ChatGPTService extends EventEmitter {
  private client: ChatGPTAPIClient;
  private sessionManager: ChatGPTSessionManager;
  private config: ChatGPTConfig;
  private usageStats: UsageStats;
  private isInitialized = false;

  constructor(config: ChatGPTConfig) {
    super();
    this.config = config;
    this.usageStats = {
      total_tokens: 0,
      prompt_tokens: 0,
      completion_tokens: 0,
      requests: 0,
      rate_limited: false,
      last_reset: Date.now()
    };

    // Initialize API client
    this.client = new ChatGPTAPIClient(config);
    
    // Initialize session manager
    this.sessionManager = new ChatGPTSessionManager(this.client, config);

    // Set up event forwarding
    this.setupEventForwarding();
  }

  /**
   * Set up event forwarding from child components
   */
  private setupEventForwarding(): void {
    // Forward client events
    this.client.on('request:start', (data) => this.emit('request:start', data));
    this.client.on('request:success', (data) => this.emit('request:success', data));
    this.client.on('request:error', (data) => this.emit('request:error', data));
    this.client.on('ratelimit:update', (data) => this.emit('ratelimit:update', data));
    this.client.on('ratelimit:exceeded', (data) => this.emit('ratelimit:exceeded', data));
    this.client.on('ratelimit:waiting', (data) => this.emit('ratelimit:waiting', data));
    this.client.on('ratelimit:reset', (data) => this.emit('ratelimit:reset', data));
    this.client.on('error', (data) => this.emit('client:error', data));
    this.client.on('config:updated', (data) => this.emit('config:updated', data));

    // Forward session manager events
    this.sessionManager.on('auth:start', () => this.emit('auth:start'));
    this.sessionManager.on('auth:success', (data) => this.emit('auth:success', data));
    this.sessionManager.on('auth:failed', (data) => this.emit('auth:failed', data));
    this.sessionManager.on('auth:error', (data) => this.emit('auth:error', data));
    this.sessionManager.on('session:created', (data) => this.emit('session:created', data));
    this.sessionManager.on('session:expired', () => this.emit('session:expired'));
    this.sessionManager.on('session:refreshed', (data) => this.emit('session:refreshed', data));
    this.sessionManager.on('session:switched', (data) => this.emit('session:switched', data));
    this.sessionManager.on('session:cleared', (data) => this.emit('session:cleared', data));
    this.sessionManager.on('session:error', (data) => this.emit('session:error', data));
    this.sessionManager.on('conversation:added', (data) => this.emit('conversation:added', data));
    this.sessionManager.on('conversation:updated', (data) => this.emit('conversation:updated', data));
    this.sessionManager.on('conversation:deleted', (data) => this.emit('conversation:deleted', data));
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      this.emit('service:initializing');

      // For authenticated mode, check if we have credentials
      if (this.config.mode === ChatGPTMode.AUTHENTICATED && this.config.credentials) {
        const { email, password } = this.config.credentials;
        if (email && password) {
          await this.authenticate(email, password);
        }
      }

      // Clean up expired sessions
      this.sessionManager.cleanupExpiredSessions();

      this.isInitialized = true;
      this.emit('service:initialized');
    } catch (error) {
      this.emit('service:init:error', error);
      throw error;
    }
  }

  /**
   * Authenticate user
   */
  async authenticate(email: string, password: string): Promise<AuthenticationResponse> {
    this.emit('service:auth:attempt', { email });
    
    try {
      const response = await this.sessionManager.authenticate(email, password);
      
      if (response.authenticated) {
        // Update configuration with new credentials
        this.config.credentials = {
          email,
          password,
          access_token: response.access_token,
          refresh_token: response.refresh_token,
          session_token: response.session_token
        };
        
        this.client.updateConfig({
          credentials: this.config.credentials
        });

        this.emit('service:auth:success', response);
      } else {
        this.emit('service:auth:failed', { email, reason: 'Invalid credentials' });
      }

      return response;
    } catch (error) {
      this.emit('service:auth:error', { email, error });
      throw error;
    }
  }

  /**
   * Send a chat message
   */
  async chat(message: string, options: ChatOptions = {}): Promise<ChatResponse> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    this.emit('chat:start', { message, options });

    try {
      // Get or create conversation
      let conversation: Conversation;
      if (options.conversationId) {
        const existing = this.sessionManager.getConversation(options.conversationId);
        if (!existing) {
          throw new Error(`Conversation ${options.conversationId} not found`);
        }
        conversation = existing;
      } else {
        conversation = this.createNewConversation(options.systemPrompt);
      }

      // Prepare messages
      const messages: ChatMessage[] = [...conversation.messages];
      if (options.systemPrompt && conversation.messages.length === 0) {
        messages.unshift({
          role: 'system',
          content: options.systemPrompt
        });
      }
      messages.push({
        role: 'user',
        content: message
      });

      // Prepare API request
      const request: ChatCompletionRequest = {
        model: this.config.model,
        messages,
        max_tokens: options.maxTokens || this.config.max_tokens,
        temperature: options.temperature || this.config.temperature,
        top_p: this.config.top_p,
        frequency_penalty: this.config.frequency_penalty,
        presence_penalty: this.config.presence_penalty,
        stream: options.stream || false,
        user: this.sessionManager.getCurrentSession()?.user_id
      };

      // Make API call
      this.emit('chat:request', { conversationId: conversation.id, request });
      const response = await this.makeChatRequest(request);

      // Update conversation
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.choices[0].message.content
      };

      conversation.messages.push(
        { role: 'user', content: message },
        assistantMessage
      );
      conversation.updated_at = Date.now();
      conversation.token_count += response.usage.total_tokens;

      this.sessionManager.updateConversation(conversation);

      // Update usage statistics
      this.updateUsageStats(response.usage);

      const chatResponse: ChatResponse = {
        conversationId: conversation.id,
        message: assistantMessage,
        usage: response.usage,
        finish_reason: response.choices[0].finish_reason
      };

      this.emit('chat:success', chatResponse);
      return chatResponse;
    } catch (error) {
      this.emit('chat:error', { message, options, error });
      throw error;
    }
  }

  /**
   * Make chat completion request to API
   */
  private async makeChatRequest(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    this.usageStats.requests++;

    try {
      const response = await this.client.chatCompletion(request);
      return response;
    } catch (error: any) {
      if (error.response?.status === 429) {
        this.usageStats.rate_limited = true;
      }
      throw error;
    }
  }

  /**
   * Create new conversation
   */
  private createNewConversation(systemPrompt?: string): Conversation {
    const conversationId = `conv_${crypto.randomBytes(8).toString('hex')}`;
    const now = Date.now();

    const conversation: Conversation = {
      id: conversationId,
      title: 'New Conversation',
      created_at: now,
      updated_at: now,
      messages: systemPrompt ? [
        {
          role: 'system',
          content: systemPrompt
        }
      ] : [],
      model: this.config.model,
      token_count: 0
    };

    this.sessionManager.addConversation(conversation);
    return conversation;
  }

  /**
   * Update usage statistics
   */
  private updateUsageStats(usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number }): void {
    this.usageStats.total_tokens += usage.total_tokens;
    this.usageStats.prompt_tokens += usage.prompt_tokens;
    this.usageStats.completion_tokens += usage.completion_tokens;

    // Reset daily if needed
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    if (now - this.usageStats.last_reset > oneDay) {
      this.resetUsageStats();
    }
  }

  /**
   * Reset usage statistics
   */
  resetUsageStats(): void {
    this.usageStats = {
      total_tokens: 0,
      prompt_tokens: 0,
      completion_tokens: 0,
      requests: 0,
      rate_limited: false,
      last_reset: Date.now()
    };
    this.emit('usage:reset', this.usageStats);
  }

  /**
   * Get conversation by ID
   */
  getConversation(conversationId: string): Conversation | undefined {
    return this.sessionManager.getConversation(conversationId);
  }

  /**
   * Get all conversations
   */
  getAllConversations(): Conversation[] {
    return this.sessionManager.getAllConversations();
  }

  /**
   * Delete conversation
   */
  deleteConversation(conversationId: string): boolean {
    return this.sessionManager.deleteConversation(conversationId);
  }

  /**
   * Get current session
   */
  getCurrentSession(): SessionData | undefined {
    return this.sessionManager.getCurrentSession();
  }

  /**
   * Get all sessions
   */
  getAllSessions(): SessionData[] {
    return this.sessionManager.getAllSessions();
  }

  /**
   * Switch session
   */
  switchSession(sessionId: string): boolean {
    return this.sessionManager.switchSession(sessionId);
  }

  /**
   * Clear current session
   */
  clearCurrentSession(): void {
    this.sessionManager.clearCurrentSession();
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): UsageStats {
    return { ...this.usageStats };
  }

  /**
   * Get rate limit information
   */
  getRateLimitInfo() {
    return this.client.getRateLimitInfo();
  }

  /**
   * Get service configuration
   */
  getConfig(): ChatGPTConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ChatGPTConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.client.updateConfig(newConfig);
    
    if (newConfig.mode === ChatGPTMode.AUTHENTICATED && newConfig.credentials) {
      this.sessionManager.cleanupExpiredSessions();
    }
    
    this.emit('service:config:updated', this.config);
  }

  /**
   * Get service status
   */
  getStatus(): {
    initialized: boolean;
    mode: ChatGPTMode;
    authenticated: boolean;
    hasActiveSession: boolean;
    totalConversations: number;
    totalTokens: number;
    rateLimited: boolean;
  } {
    const session = this.getCurrentSession();
    const conversations = this.getAllConversations();
    const totalTokens = conversations.reduce((sum, conv) => sum + conv.token_count, 0);

    return {
      initialized: this.isInitialized,
      mode: this.config.mode,
      authenticated: !!session,
      hasActiveSession: !!session,
      totalConversations: conversations.length,
      totalTokens,
      rateLimited: this.usageStats.rate_limited
    };
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.sessionManager.destroy();
    this.removeAllListeners();
    this.emit('service:destroyed');
  }
}