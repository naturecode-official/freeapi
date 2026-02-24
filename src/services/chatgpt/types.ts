/**
 * ChatGPT API Types and Interfaces
 */

export enum ChatGPTMode {
  PUBLIC = 'public',
  AUTHENTICATED = 'authenticated'
}

export enum ChatGPTModel {
  GPT4 = 'gpt-4',
  GPT4_TURBO = 'gpt-4-turbo-preview',
  GPT35_TURBO = 'gpt-3.5-turbo',
  GPT35_TURBO_16K = 'gpt-3.5-turbo-16k'
}

export interface ChatGPTConfig {
  // Service configuration
  mode: ChatGPTMode;
  enabled: boolean;
  
  // API configuration
  base_url: string;
  api_key?: string;
  organization_id?: string;
  
  // Model configuration
  model: ChatGPTModel;
  max_tokens: number;
  temperature: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  
  // Session configuration
  timeout: number;
  max_retries: number;
  retry_delay: number;
  
  // Authentication (for authenticated mode)
  credentials?: {
    email: string;
    password: string;
    session_token?: string;
    access_token?: string;
    refresh_token?: string;
  };
  
  // Rate limiting
  requests_per_minute: number;
  tokens_per_minute: number;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;
}

export interface ChatCompletionRequest {
  model: ChatGPTModel;
  messages: ChatMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
  stop?: string | string[];
  user?: string;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface Conversation {
  id: string;
  title: string;
  created_at: number;
  updated_at: number;
  messages: ChatMessage[];
  model: ChatGPTModel;
  token_count: number;
}

export interface AuthenticationResponse {
  authenticated: boolean;
  user_id?: string;
  email?: string;
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  session_token?: string;
}

export interface UsageStats {
  total_tokens: number;
  prompt_tokens: number;
  completion_tokens: number;
  requests: number;
  rate_limited: boolean;
  last_reset: number;
}

export interface ErrorResponse {
  error: {
    message: string;
    type: string;
    param: string | null;
    code: string;
  };
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
}

export interface APIConfig {
  baseURL: string;
  timeout: number;
  headers: Record<string, string>;
  maxRedirects: number;
  maxContentLength: number;
  maxBodyLength: number;
}

export interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
  retry?: boolean;
  maxRetries?: number;
}