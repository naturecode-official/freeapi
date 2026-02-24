/**
 * ChatGPT Session Manager
 * Handles user authentication, session management, and token refresh
 */

import { ChatGPTConfig, ChatGPTMode, AuthenticationResponse, Conversation } from './types';
import { ChatGPTAPIClient } from './api-client';
import { EventEmitter } from 'events';
import * as crypto from 'crypto';

export interface SessionData {
  session_id: string;
  user_id?: string;
  email?: string;
  access_token?: string;
  refresh_token?: string;
  session_token?: string;
  expires_at: number;
  created_at: number;
  last_activity: number;
  conversations: Map<string, Conversation>;
  token_count: number;
}

export class ChatGPTSessionManager extends EventEmitter {
  private client: ChatGPTAPIClient;
  private config: ChatGPTConfig;
  private sessions: Map<string, SessionData> = new Map();
  private currentSessionId?: string;
  private refreshInterval?: NodeJS.Timeout;

  constructor(client: ChatGPTAPIClient, config: ChatGPTConfig) {
    super();
    this.client = client;
    this.config = config;

    // Set up event listeners
    this.setupEventListeners();

    // Start session refresh interval if in authenticated mode
    if (config.mode === ChatGPTMode.AUTHENTICATED) {
      this.startSessionRefresh();
    }
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    this.client.on('auth:invalid', () => {
      this.emit('session:expired');
      this.clearCurrentSession();
    });

    this.client.on('error', (error) => {
      this.emit('session:error', error);
    });
  }

  /**
   * Authenticate user (for authenticated mode)
   */
  async authenticate(email: string, password: string): Promise<AuthenticationResponse> {
    if (this.config.mode !== ChatGPTMode.AUTHENTICATED) {
      throw new Error('Authentication only available in authenticated mode');
    }

    try {
      this.emit('auth:start');

      // Use real ChatGPT authentication
      const authResponse: AuthenticationResponse = await this.authenticateWithChatGPT(email, password);

      if (authResponse.authenticated) {
        // Create new session
        const session = await this.createSession(authResponse);
        this.currentSessionId = session.session_id;
        
        // Update client configuration with tokens
        this.client.updateConfig({
          credentials: {
            email,
            password,
            access_token: authResponse.access_token,
            refresh_token: authResponse.refresh_token,
            session_token: authResponse.session_token
          }
        });

        this.emit('auth:success', authResponse);
        this.emit('session:created', session);
      } else {
        this.emit('auth:failed', { email, reason: 'Invalid credentials' });
      }

      return authResponse;
    } catch (error) {
      this.emit('auth:error', error);
      throw error;
    }
  }

  /**
   * Authenticate with ChatGPT API
   */
  private async authenticateWithChatGPT(email: string, _password: string): Promise<AuthenticationResponse> {
    try {
      // Note: ChatGPT web interface uses a different authentication flow than the API
      // For API access, users typically use API keys, not email/password
      // For web access, we would need to simulate browser login
      
      // For now, we'll support two modes:
      // 1. API Key mode (recommended) - uses OpenAI API key
      // 2. Web login mode (experimental) - would require browser automation
      
      if (this.config.api_key) {
        // API Key authentication
        return {
          authenticated: true,
          user_id: 'api_user',
          email,
          access_token: this.config.api_key,
          expires_in: 0 // API keys don't expire
        };
      } else {
        // Web login would require browser automation (puppeteer/playwright)
        // For now, we'll return an error
        throw new Error('Web login not yet implemented. Please use API key authentication.');
      }
    } catch (error) {
      this.emit('auth:error', error);
      throw error;
    }
  }

  /**
   * Create a new session
   */
  private async createSession(authResponse: AuthenticationResponse): Promise<SessionData> {
    const sessionId = this.generateSessionId();
    const now = Date.now();
    const expiresAt = now + (authResponse.expires_in || 3600) * 1000;

    const session: SessionData = {
      session_id: sessionId,
      user_id: authResponse.user_id,
      email: authResponse.email,
      access_token: authResponse.access_token,
      refresh_token: authResponse.refresh_token,
      session_token: authResponse.session_token,
      expires_at: expiresAt,
      created_at: now,
      last_activity: now,
      conversations: new Map(),
      token_count: 0
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  /**
   * Refresh session token
   */
  async refreshSession(): Promise<boolean> {
    const session = this.getCurrentSession();
    if (!session) {
      return false;
    }

    try {
      this.emit('session:refresh:start');

      // For API key authentication, there's no refresh needed
      // API keys don't expire, just update last activity
      if (session.access_token && session.access_token.startsWith('sk-')) {
        session.last_activity = Date.now();
        this.sessions.set(session.session_id, session);
        this.emit('session:refreshed', session);
        return true;
      }

      // For web login, we would need to refresh the session
      // This is not implemented yet
      this.emit('session:refresh:error', new Error('Session refresh not supported for web login'));
      return false;
    } catch (error) {
      this.emit('session:refresh:error', error);
      return false;
    }
  }

  /**
   * Start automatic session refresh
   */
  private startSessionRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    // Refresh 5 minutes before expiration
    this.refreshInterval = setInterval(async () => {
      const session = this.getCurrentSession();
      if (session && session.expires_at) {
        const timeUntilExpiry = session.expires_at - Date.now();
        if (timeUntilExpiry < 5 * 60 * 1000) { // 5 minutes
          await this.refreshSession();
        }
      }
    }, 60 * 1000); // Check every minute
  }

  /**
   * Get current session
   */
  getCurrentSession(): SessionData | undefined {
    if (!this.currentSessionId) {
      return undefined;
    }
    return this.sessions.get(this.currentSessionId);
  }

  /**
   * Switch to a different session
   */
  switchSession(sessionId: string): boolean {
    if (!this.sessions.has(sessionId)) {
      return false;
    }

    const oldSessionId = this.currentSessionId;
    this.currentSessionId = sessionId;
    
    const session = this.sessions.get(sessionId)!;
    
    // Update client with session tokens
    this.client.updateConfig({
      credentials: {
        email: session.email || '',
        password: '', // Password is not stored for security
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        session_token: session.session_token || ''
      }
    });

    this.emit('session:switched', {
      from: oldSessionId,
      to: sessionId,
      session
    });

    return true;
  }

  /**
   * Clear current session
   */
  clearCurrentSession(): void {
    if (this.currentSessionId) {
      const session = this.sessions.get(this.currentSessionId);
      this.sessions.delete(this.currentSessionId);
      this.currentSessionId = undefined;
      
      // Clear client credentials
      this.client.updateConfig({
        credentials: undefined
      });

      this.emit('session:cleared', session);
    }
  }

  /**
   * Get all sessions
   */
  getAllSessions(): SessionData[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Add conversation to current session
   */
  addConversation(conversation: Conversation): void {
    const session = this.getCurrentSession();
    if (session) {
      session.conversations.set(conversation.id, conversation);
      session.last_activity = Date.now();
      session.token_count += conversation.token_count;
      this.emit('conversation:added', { sessionId: session.session_id, conversation });
    }
  }

  /**
   * Get conversation by ID
   */
  getConversation(conversationId: string): Conversation | undefined {
    const session = this.getCurrentSession();
    if (session) {
      return session.conversations.get(conversationId);
    }
    return undefined;
  }

  /**
   * Get all conversations in current session
   */
  getAllConversations(): Conversation[] {
    const session = this.getCurrentSession();
    if (session) {
      return Array.from(session.conversations.values());
    }
    return [];
  }

  /**
   * Delete conversation
   */
  deleteConversation(conversationId: string): boolean {
    const session = this.getCurrentSession();
    if (session) {
      const conversation = session.conversations.get(conversationId);
      if (conversation) {
        session.conversations.delete(conversationId);
        session.token_count -= conversation.token_count;
        session.last_activity = Date.now();
        this.emit('conversation:deleted', { sessionId: session.session_id, conversationId });
        return true;
      }
    }
    return false;
  }

  /**
   * Update conversation
   */
  updateConversation(conversation: Conversation): boolean {
    const session = this.getCurrentSession();
    if (session) {
      const oldConversation = session.conversations.get(conversation.id);
      if (oldConversation) {
        session.token_count -= oldConversation.token_count;
        session.token_count += conversation.token_count;
      }
      session.conversations.set(conversation.id, conversation);
      session.last_activity = Date.now();
      this.emit('conversation:updated', { sessionId: session.session_id, conversation });
      return true;
    }
    return false;
  }

  /**
   * Get session statistics
   */
  getSessionStats(): {
    total_sessions: number;
    active_session?: string;
    total_conversations: number;
    total_tokens: number;
  } {
    let totalConversations = 0;
    let totalTokens = 0;

    this.sessions.forEach(session => {
      totalConversations += session.conversations.size;
      totalTokens += session.token_count;
    });

    return {
      total_sessions: this.sessions.size,
      active_session: this.currentSessionId,
      total_conversations: totalConversations,
      total_tokens: totalTokens
    };
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions(): number {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expires_at < now) {
        this.sessions.delete(sessionId);
        if (this.currentSessionId === sessionId) {
          this.currentSessionId = undefined;
        }
        cleanedCount++;
        this.emit('session:expired:cleanup', session);
      }
    }

    return cleanedCount;
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `sess_${crypto.randomBytes(12).toString('hex')}`;
  }

  /**
   * Utility function for delays
   */
  // private delay(ms: number): Promise<void> {
  //   return new Promise(resolve => setTimeout(resolve, ms));
  // }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    this.sessions.clear();
    this.removeAllListeners();
    this.emit('manager:destroyed');
  }
}