/**
 * ChatGPT Error Handler
 * Centralized error handling and recovery mechanisms
 */

import { AxiosError } from 'axios';
import { EventEmitter } from 'events';

export enum ChatGPTErrorCode {
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  
  // API errors
  API_ERROR = 'API_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  INVALID_REQUEST = 'INVALID_REQUEST',
  
  // Authentication errors
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  ACCESS_DENIED = 'ACCESS_DENIED',
  
  // Configuration errors
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  INVALID_CONFIG = 'INVALID_CONFIG',
  
  // Service errors
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  MAINTENANCE_MODE = 'MAINTENANCE_MODE',
  
  // Content errors
  CONTENT_FILTER = 'CONTENT_FILTER',
  POLICY_VIOLATION = 'POLICY_VIOLATION',
  
  // Unknown errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface ChatGPTError {
  code: ChatGPTErrorCode;
  message: string;
  details?: any;
  retryable: boolean;
  timestamp: number;
  stack?: string;
}

export interface RecoveryAction {
  action: string;
  description: string;
  automatic: boolean;
  priority: number;
}

export class ChatGPTErrorHandler extends EventEmitter {
  private errorHistory: ChatGPTError[] = [];
  private maxHistorySize = 100;

  /**
   * Handle an error
   */
  handleError(error: any, context?: string): ChatGPTError {
    const chatGPTError = this.normalizeError(error, context);
    
    // Add to history
    this.errorHistory.push(chatGPTError);
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.shift();
    }

    // Emit error event
    this.emit('error', chatGPTError);

    // Log error
    this.logError(chatGPTError);

    return chatGPTError;
  }

  /**
   * Normalize different error types to ChatGPTError
   */
  private normalizeError(error: any, context?: string): ChatGPTError {
    const timestamp = Date.now();
    let normalizedError: ChatGPTError;

    if (error instanceof AxiosError) {
      normalizedError = this.handleAxiosError(error, context);
    } else if (error instanceof Error) {
      normalizedError = this.handleGenericError(error, context);
    } else {
      normalizedError = {
        code: ChatGPTErrorCode.UNKNOWN_ERROR,
        message: `Unknown error: ${String(error)}`,
        details: error,
        retryable: false,
        timestamp
      };
    }

    // Add stack trace if available
    if (error.stack) {
      normalizedError.stack = error.stack;
    }

    return normalizedError;
  }

  /**
   * Handle Axios errors
   */
  private handleAxiosError(error: AxiosError, context?: string): ChatGPTError {
    const status = error.response?.status;
    const data = error.response?.data as any;
    const message = data?.error?.message || error.message;

    let code: ChatGPTErrorCode;
    let retryable = false;

    switch (status) {
      case 400:
        code = ChatGPTErrorCode.INVALID_REQUEST;
        break;
      case 401:
        code = ChatGPTErrorCode.AUTHENTICATION_ERROR;
        break;
      case 403:
        code = ChatGPTErrorCode.ACCESS_DENIED;
        break;
      case 404:
        code = ChatGPTErrorCode.INVALID_REQUEST;
        break;
      case 429:
        code = ChatGPTErrorCode.RATE_LIMIT_EXCEEDED;
        retryable = true;
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        code = ChatGPTErrorCode.SERVICE_UNAVAILABLE;
        retryable = true;
        break;
      default:
        if (error.code === 'ECONNABORTED') {
          code = ChatGPTErrorCode.TIMEOUT_ERROR;
          retryable = true;
        } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
          code = ChatGPTErrorCode.CONNECTION_ERROR;
          retryable = true;
        } else {
          code = ChatGPTErrorCode.API_ERROR;
        }
    }

    return {
      code,
      message: context ? `[${context}] ${message}` : message,
      details: {
        status,
        data: error.response?.data,
        config: error.config,
        url: error.config?.url,
        method: error.config?.method
      },
      retryable,
      timestamp: Date.now()
    };
  }

  /**
   * Handle generic errors
   */
  private handleGenericError(error: Error, context?: string): ChatGPTError {
    let code: ChatGPTErrorCode;
    let retryable = false;

    const message = error.message.toLowerCase();

    if (message.includes('network') || message.includes('connection')) {
      code = ChatGPTErrorCode.NETWORK_ERROR;
      retryable = true;
    } else if (message.includes('timeout')) {
      code = ChatGPTErrorCode.TIMEOUT_ERROR;
      retryable = true;
    } else if (message.includes('auth') || message.includes('login') || message.includes('credential')) {
      code = ChatGPTErrorCode.AUTHENTICATION_ERROR;
    } else if (message.includes('config') || message.includes('setting')) {
      code = ChatGPTErrorCode.CONFIGURATION_ERROR;
    } else if (message.includes('rate limit') || message.includes('too many requests')) {
      code = ChatGPTErrorCode.RATE_LIMIT_EXCEEDED;
      retryable = true;
    } else if (message.includes('quota') || message.includes('limit')) {
      code = ChatGPTErrorCode.QUOTA_EXCEEDED;
    } else if (message.includes('content') || message.includes('filter')) {
      code = ChatGPTErrorCode.CONTENT_FILTER;
    } else {
      code = ChatGPTErrorCode.UNKNOWN_ERROR;
    }

    return {
      code,
      message: context ? `[${context}] ${error.message}` : error.message,
      details: { originalError: error },
      retryable,
      timestamp: Date.now()
    };
  }

  /**
   * Get recovery actions for an error
   */
  getRecoveryActions(error: ChatGPTError): RecoveryAction[] {
    const actions: RecoveryAction[] = [];

    switch (error.code) {
      case ChatGPTErrorCode.NETWORK_ERROR:
      case ChatGPTErrorCode.CONNECTION_ERROR:
        actions.push(
          {
            action: 'check_network',
            description: 'Check internet connection',
            automatic: false,
            priority: 1
          },
          {
            action: 'retry',
            description: 'Retry the request',
            automatic: true,
            priority: 2
          }
        );
        break;

      case ChatGPTErrorCode.TIMEOUT_ERROR:
        actions.push(
          {
            action: 'increase_timeout',
            description: 'Increase request timeout',
            automatic: true,
            priority: 1
          },
          {
            action: 'retry',
            description: 'Retry with exponential backoff',
            automatic: true,
            priority: 2
          }
        );
        break;

      case ChatGPTErrorCode.RATE_LIMIT_EXCEEDED:
        actions.push(
          {
            action: 'wait',
            description: 'Wait for rate limit reset',
            automatic: true,
            priority: 1
          },
          {
            action: 'reduce_frequency',
            description: 'Reduce request frequency',
            automatic: true,
            priority: 2
          }
        );
        break;

      case ChatGPTErrorCode.AUTHENTICATION_ERROR:
      case ChatGPTErrorCode.INVALID_CREDENTIALS:
        actions.push(
          {
            action: 'reauthenticate',
            description: 'Re-authenticate with valid credentials',
            automatic: false,
            priority: 1
          },
          {
            action: 'check_credentials',
            description: 'Verify credentials are correct',
            automatic: false,
            priority: 2
          }
        );
        break;

      case ChatGPTErrorCode.SESSION_EXPIRED:
        actions.push(
          {
            action: 'refresh_session',
            description: 'Refresh session token',
            automatic: true,
            priority: 1
          },
          {
            action: 'reauthenticate',
            description: 'Re-authenticate user',
            automatic: false,
            priority: 2
          }
        );
        break;

      case ChatGPTErrorCode.CONFIGURATION_ERROR:
        actions.push(
          {
            action: 'validate_config',
            description: 'Validate configuration settings',
            automatic: true,
            priority: 1
          },
          {
            action: 'reset_config',
            description: 'Reset to default configuration',
            automatic: false,
            priority: 2
          }
        );
        break;

      case ChatGPTErrorCode.SERVICE_UNAVAILABLE:
        actions.push(
          {
            action: 'retry',
            description: 'Retry after delay',
            automatic: true,
            priority: 1
          },
          {
            action: 'check_status',
            description: 'Check service status',
            automatic: false,
            priority: 2
          }
        );
        break;

      case ChatGPTErrorCode.CONTENT_FILTER:
        actions.push(
          {
            action: 'modify_content',
            description: 'Modify message content',
            automatic: false,
            priority: 1
          },
          {
            action: 'disable_filter',
            description: 'Disable content filter (if available)',
            automatic: false,
            priority: 2
          }
        );
        break;

      default:
        actions.push(
          {
            action: 'retry',
            description: 'Retry the request',
            automatic: true,
            priority: 1
          },
          {
            action: 'report',
            description: 'Report error for investigation',
            automatic: false,
            priority: 2
          }
        );
    }

    return actions.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Check if error should trigger automatic recovery
   */
  shouldAutoRecover(error: ChatGPTError): boolean {
    const recoveryActions = this.getRecoveryActions(error);
    return recoveryActions.some(action => action.automatic);
  }

  /**
   * Get error statistics
   */
  getErrorStatistics(): {
    totalErrors: number;
    errorCounts: Record<ChatGPTErrorCode, number>;
    retryableErrors: number;
    lastErrorTime?: number;
    mostCommonError?: ChatGPTErrorCode;
  } {
    const errorCounts: Record<ChatGPTErrorCode, number> = {} as any;
    let retryableErrors = 0;
    let mostCommonError: ChatGPTErrorCode | undefined;
    let maxCount = 0;

    // Initialize all error codes to 0
    Object.values(ChatGPTErrorCode).forEach(code => {
      errorCounts[code] = 0;
    });

    // Count errors
    this.errorHistory.forEach(error => {
      errorCounts[error.code]++;
      if (error.retryable) {
        retryableErrors++;
      }

      if (errorCounts[error.code] > maxCount) {
        maxCount = errorCounts[error.code];
        mostCommonError = error.code;
      }
    });

    const lastError = this.errorHistory[this.errorHistory.length - 1];

    return {
      totalErrors: this.errorHistory.length,
      errorCounts,
      retryableErrors,
      lastErrorTime: lastError?.timestamp,
      mostCommonError
    };
  }

  /**
   * Clear error history
   */
  clearHistory(): void {
    this.errorHistory = [];
    this.emit('history:cleared');
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit = 10): ChatGPTError[] {
    return this.errorHistory.slice(-limit).reverse();
  }

  /**
   * Log error (in production, this would integrate with a logging system)
   */
  private logError(error: ChatGPTError): void {
    const logEntry = {
      timestamp: new Date(error.timestamp).toISOString(),
      code: error.code,
      message: error.message,
      retryable: error.retryable,
      details: error.details
    };

    // In production, this would send to a logging service
    console.error('ChatGPT Error:', logEntry);

    // Emit log event for external handlers
    this.emit('log', logEntry);
  }

  /**
   * Create a user-friendly error message
   */
  getUserFriendlyMessage(error: ChatGPTError): string {
    const baseMessages: Record<ChatGPTErrorCode, string> = {
      [ChatGPTErrorCode.NETWORK_ERROR]: 'Network connection issue. Please check your internet connection.',
      [ChatGPTErrorCode.TIMEOUT_ERROR]: 'Request timed out. The server is taking too long to respond.',
      [ChatGPTErrorCode.CONNECTION_ERROR]: 'Cannot connect to the server. Please try again later.',
      [ChatGPTErrorCode.API_ERROR]: 'API request failed. Please try again.',
      [ChatGPTErrorCode.RATE_LIMIT_EXCEEDED]: 'Rate limit exceeded. Please wait before making more requests.',
      [ChatGPTErrorCode.QUOTA_EXCEEDED]: 'Usage quota exceeded. Please check your account limits.',
      [ChatGPTErrorCode.INVALID_REQUEST]: 'Invalid request. Please check your input.',
      [ChatGPTErrorCode.AUTHENTICATION_ERROR]: 'Authentication failed. Please check your credentials.',
      [ChatGPTErrorCode.INVALID_CREDENTIALS]: 'Invalid credentials. Please verify your login information.',
      [ChatGPTErrorCode.SESSION_EXPIRED]: 'Session expired. Please log in again.',
      [ChatGPTErrorCode.ACCESS_DENIED]: 'Access denied. You do not have permission to perform this action.',
      [ChatGPTErrorCode.CONFIGURATION_ERROR]: 'Configuration error. Please check your settings.',
      [ChatGPTErrorCode.INVALID_CONFIG]: 'Invalid configuration. Please update your settings.',
      [ChatGPTErrorCode.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable. Please try again later.',
      [ChatGPTErrorCode.MAINTENANCE_MODE]: 'Service is under maintenance. Please try again later.',
      [ChatGPTErrorCode.CONTENT_FILTER]: 'Content filtered. Your message may violate content policies.',
      [ChatGPTErrorCode.POLICY_VIOLATION]: 'Policy violation detected. Please review the terms of service.',
      [ChatGPTErrorCode.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.'
    };

    return baseMessages[error.code] || baseMessages[ChatGPTErrorCode.UNKNOWN_ERROR];
  }
}