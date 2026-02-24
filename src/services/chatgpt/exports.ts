/**
 * ChatGPT Service Exports
 * Main entry point for the ChatGPT service adapter
 */

export { ChatGPTServiceAdapter } from './service-adapter';
export { ChatGPTConfigManager } from './config-manager';
export { ChatGPTErrorHandler, ChatGPTErrorCode } from './error-handler';

// Types
export type {
  ChatGPTConfig,
  ChatGPTMode,
  ChatGPTModel,
  ChatMessage,
  ChatCompletionRequest,
  ChatCompletionResponse,
  Conversation,
  AuthenticationResponse,
  UsageStats
} from './types';

// Service interfaces
export type {
  ServiceStatus,
  ServiceInfo
} from './service-adapter';

// Configuration interfaces
export type {
  ConfigValidationResult
} from './config-manager';

// Error handling interfaces
export type {
  ChatGPTError,
  RecoveryAction
} from './error-handler';

// Configuration wizard
export { ChatGPTConfigWizard, runConfigWizard } from './config-wizard';

/**
 * Create a new ChatGPT service adapter instance
 */
export function createChatGPTService(encryptionKey?: string): any {
  const { ChatGPTServiceAdapter } = require('./service-adapter');
  return new ChatGPTServiceAdapter(encryptionKey);
}

/**
 * Default configuration for ChatGPT service
 */
export const defaultChatGPTConfig = {
  mode: 'public' as const,
  enabled: true,
  base_url: 'https://api.openai.com/v1/',
  model: 'gpt-3.5-turbo' as const,
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

/**
 * Service information
 */
export const serviceInfo = {
  name: 'ChatGPT',
  version: '1.0.0',
  description: 'OpenAI ChatGPT service with public and authenticated modes',
  author: 'FreeAPI Team',
  repository: 'https://github.com/naturecode-official/freeapi',
  documentation: 'https://github.com/naturecode-official/freeapi/docs/chatgpt'
};

/**
 * Example usage:
 * 
 * ```typescript
 * import { createChatGPTService } from './services/chatgpt';
 * 
 * // Create service instance
 * const chatGPT = createChatGPTService();
 * 
 * // Initialize
 * await chatGPT.initialize();
 * 
 * // Send message
 * const response = await chatGPT.sendMessage('Hello, how are you?');
 * console.log(response.message.content);
 * 
 * // Get service status
 * const status = chatGPT.getStatus();
 * console.log(status);
 * 
 * // Clean up
 * chatGPT.destroy();
 * ```
 */