/**
 * Base Service Adapter Interface
 * Defines the common interface for all AI service adapters
 */

import { EventEmitter } from 'events';
import { ServiceConfig, ServiceStatus, ChatRequest, ChatResponse } from './types';

export abstract class BaseServiceAdapter extends EventEmitter {
  protected name: string;
  protected config: ServiceConfig;
  protected status: 'initializing' | 'ready' | 'error' | 'stopped' = 'initializing';

  constructor(name: string, config: ServiceConfig) {
    super();
    this.name = name;
    this.config = config;
  }

  /**
   * Initialize the service
   */
  abstract initialize(): Promise<void>;

  /**
   * Send a chat message
   */
  abstract sendMessage(request: ChatRequest): Promise<ChatResponse>;

  /**
   * Get service status
   */
  abstract getStatus(): Promise<ServiceStatus>;

  /**
   * Get service information
   */
  abstract getInfo(): Promise<any>;

  /**
   * Update configuration
   */
  abstract updateConfig(newConfig: Partial<ServiceConfig>): Promise<void>;

  /**
   * Authenticate user (if applicable)
   */
  abstract authenticate(credentials: { username: string; password: string }): Promise<boolean>;

  /**
   * Test service connection
   */
  abstract testConnection(): Promise<boolean>;

  /**
   * Get conversations
   */
  abstract getConversations(): Promise<any[]>;

  /**
   * Get conversation by ID
   */
  abstract getConversation(conversationId: string): Promise<any>;

  /**
   * Delete conversation
   */
  abstract deleteConversation(conversationId: string): Promise<boolean>;

  /**
   * Get usage statistics
   */
  abstract getUsage(): Promise<any>;

  /**
   * Get error information
   */
  abstract getErrors(limit?: number): Promise<any[]>;

  /**
   * Get recovery actions
   */
  abstract getRecoveryActions(): Promise<any[]>;

  /**
   * Clear error history
   */
  abstract clearErrorHistory(): Promise<void>;

  /**
   * Backup configuration
   */
  abstract backupConfig(backupDir?: string): Promise<string>;

  /**
   * Restore configuration from backup
   */
  abstract restoreConfig(backupFile: string): Promise<void>;

  /**
   * List available backups
   */
  abstract listBackups(backupDir?: string): Promise<string[]>;

  /**
   * Reset configuration to defaults
   */
  abstract resetConfig(): Promise<void>;

  /**
   * Clean up resources
   */
  abstract destroy(): Promise<void>;

  /**
   * Get service name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Get current status
   */
  getCurrentStatus(): string {
    return this.status;
  }

  /**
   * Get configuration
   */
  getConfig(): ServiceConfig {
    return { ...this.config };
  }

  /**
   * Check if service is enabled
   */
  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Enable/disable service
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    this.emit('service:enabled', this.name, enabled);
  }
}