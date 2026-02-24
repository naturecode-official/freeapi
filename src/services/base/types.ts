/**
 * Base Service Types
 * Common types used by all AI service adapters
 */

export interface ServiceConfig {
  name: string;
  enabled: boolean;
  type: 'chatgpt' | 'deepseek' | 'wenxin' | 'qwen' | 'custom';
  version: string;
  description?: string;
  
  // Connection settings
  settings: {
    base_url: string;
    timeout: number;
    max_retries: number;
    retry_delay: number;
    
    // Model settings
    model: string;
    max_tokens: number;
    temperature: number;
    top_p: number;
    frequency_penalty: number;
    presence_penalty: number;
    
    // Rate limiting
    requests_per_minute: number;
    tokens_per_minute: number;
  };
  
  // Authentication (if applicable)
  credentials?: {
    username: string;
    password: string;
    api_key?: string;
    access_token?: string;
    refresh_token?: string;
  };
  
  // Metadata
  metadata?: {
    created_at: number;
    updated_at: number;
    last_used: number;
    tags: string[];
  };
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  model?: string;
}

export interface ChatResponse {
  id: string;
  message: string;
  conversationId: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  finishReason: string;
  timestamp: number;
}

export interface ServiceStatus {
  name: string;
  status: 'initializing' | 'ready' | 'error' | 'stopped';
  enabled: boolean;
  mode: 'public' | 'authenticated';
  authenticated: boolean;
  hasActiveSession: boolean;
  totalConversations: number;
  totalTokens: number;
  rateLimited: boolean;
  errorCount: number;
  lastError?: string;
  usage: {
    totalTokens: number;
    promptTokens: number;
    completionTokens: number;
    requests: number;
  };
}

export interface ErrorInfo {
  code: string;
  message: string;
  timestamp: number;
  retryable: boolean;
  details?: any;
}

export interface RecoveryAction {
  id: string;
  name: string;
  description: string;
  action: () => Promise<boolean>;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface BackupInfo {
  filename: string;
  size: number;
  created_at: number;
  service_name: string;
  service_version: string;
}

export interface UsageStats {
  tokens: {
    total: number;
    prompt: number;
    completion: number;
  };
  requests: number;
  rate_limited: boolean;
  errors: {
    total: number;
    retryable: number;
    last_error: number;
  };
}