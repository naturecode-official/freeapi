/**
 * ChatGPT API Client
 * Handles HTTP requests to ChatGPT API with authentication and rate limiting
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { 
  ChatGPTConfig, 
  APIConfig, 
  RequestOptions, 
  RateLimitInfo, 
  ErrorResponse,
  ChatCompletionRequest,
  ChatCompletionResponse
} from './types';
import { EventEmitter } from 'events';

export class ChatGPTAPIClient extends EventEmitter {
  private client: AxiosInstance;
  private config: ChatGPTConfig;
  private rateLimitInfo: RateLimitInfo;
  // private requestQueue: Array<() => Promise<any>> = [];
  // private isProcessingQueue = false;

  constructor(config: ChatGPTConfig) {
    super();
    this.config = config;
    this.rateLimitInfo = {
      limit: config.requests_per_minute,
      remaining: config.requests_per_minute,
      reset: Date.now() + 60000, // 1 minute from now
      used: 0
    };

    // Create axios instance with base configuration
    const apiConfig: APIConfig = {
      baseURL: config.base_url,
      timeout: config.timeout,
      headers: this.getDefaultHeaders(),
      maxRedirects: 5,
      maxContentLength: 50 * 1024 * 1024, // 50MB
      maxBodyLength: 50 * 1024 * 1024 // 50MB
    };

    this.client = axios.create(apiConfig);

    // Add request interceptor for authentication
    this.client.interceptors.request.use(
      (requestConfig) => {
        this.emit('request:start', requestConfig);
        const updatedConfig = this.addAuthHeaders(requestConfig);
        // Cast to any to avoid TypeScript issues with axios types
        return updatedConfig as any;
      },
      (error) => {
        this.emit('request:error', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for rate limiting and error handling
    this.client.interceptors.response.use(
      (response) => {
        this.emit('request:success', response);
        this.updateRateLimitInfo(response);
        return response;
      },
      (error: AxiosError) => {
        this.emit('request:error', error);
        return this.handleError(error);
      }
    );
  }

  /**
   * Get default headers for API requests
   */
  private getDefaultHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'FreeAPI/0.1.0',
      'Accept': 'application/json',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
    };

    // Add API key if provided
    if (this.config.api_key) {
      headers['Authorization'] = `Bearer ${this.config.api_key}`;
    }

    // Add organization ID if provided
    if (this.config.organization_id) {
      headers['OpenAI-Organization'] = this.config.organization_id;
    }

    return headers;
  }

  /**
   * Add authentication headers to request
   */
  private addAuthHeaders(config: AxiosRequestConfig): AxiosRequestConfig {
    if (!config.headers) {
      config.headers = {};
    }

    // Add session token for authenticated mode
    if (this.config.mode === 'authenticated' && this.config.credentials?.session_token) {
      config.headers['Cookie'] = `__Secure-next-auth.session-token=${this.config.credentials.session_token}`;
    }

    // Add access token if available
    if (this.config.credentials?.access_token) {
      config.headers['Authorization'] = `Bearer ${this.config.credentials.access_token}`;
    }

    return config;
  }

  /**
   * Update rate limit information from response headers
   */
  private updateRateLimitInfo(response: AxiosResponse): void {
    const headers = response.headers;

    if (headers['x-ratelimit-limit-requests']) {
      this.rateLimitInfo.limit = parseInt(headers['x-ratelimit-limit-requests'], 10);
    }

    if (headers['x-ratelimit-remaining-requests']) {
      this.rateLimitInfo.remaining = parseInt(headers['x-ratelimit-remaining-requests'], 10);
    }

    if (headers['x-ratelimit-reset-requests']) {
      this.rateLimitInfo.reset = parseInt(headers['x-ratelimit-reset-requests'], 10) * 1000;
    }

    this.rateLimitInfo.used = this.rateLimitInfo.limit - this.rateLimitInfo.remaining;
    
    this.emit('ratelimit:update', this.rateLimitInfo);
  }

  /**
   * Handle API errors with retry logic
   */
  private async handleError(error: AxiosError): Promise<any> {
    const errorResponse = error.response?.data as ErrorResponse;
    
    // Emit error event
    this.emit('error', {
      code: error.code,
      status: error.response?.status,
      message: errorResponse?.error?.message || error.message,
      type: errorResponse?.error?.type,
      config: error.config
    });

    // Handle specific error types
    if (error.response?.status === 429) {
      // Rate limit exceeded
      const retryAfter = error.response.headers['retry-after'];
      const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : 60000;
      
      this.emit('ratelimit:exceeded', {
        waitTime,
        limit: this.rateLimitInfo.limit,
        remaining: this.rateLimitInfo.remaining,
        reset: this.rateLimitInfo.reset
      });

      // Wait and retry if configured
      if (this.config.max_retries > 0) {
        await this.delay(waitTime);
        return this.request(error.config as RequestOptions);
      }
    } else if (error.response?.status === 401) {
      // Authentication error
      this.emit('auth:invalid');
      throw new Error('Authentication failed. Please check your credentials.');
    } else if (error.response?.status === 403) {
      // Forbidden
      this.emit('access:denied');
      throw new Error('Access denied. Check your API key or permissions.');
    } else if (error.response?.status && error.response.status >= 500) {
      // Server error - retry with exponential backoff
      if (this.config.max_retries > 0) {
        return this.retryWithBackoff(error.config as RequestOptions);
      }
    }

    // Re-throw the error if not handled
    throw error;
  }

  /**
   * Retry request with exponential backoff
   */
  private async retryWithBackoff(config: RequestOptions, attempt = 1): Promise<any> {
    if (attempt > this.config.max_retries) {
      throw new Error(`Max retries (${this.config.max_retries}) exceeded`);
    }

    // Calculate backoff delay
    const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
    await this.delay(delay + Math.random() * 1000); // Add jitter

    this.emit('retry:attempt', { attempt, delay, config });

    try {
      return await this.request(config);
    } catch (error: any) {
      if (error.response?.status && error.response.status >= 500) {
        return this.retryWithBackoff(config, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Make an API request with rate limiting
   */
  async request(options: RequestOptions): Promise<any> {
    // Check rate limits
    if (this.rateLimitInfo.remaining <= 0) {
      const waitTime = this.rateLimitInfo.reset - Date.now();
      if (waitTime > 0) {
        this.emit('ratelimit:waiting', waitTime);
        await this.delay(waitTime);
      }
      this.resetRateLimit();
    }

    // Prepare request config
    const config: AxiosRequestConfig = {
      method: options.method,
      url: options.url,
      data: options.data,
      params: options.params,
      headers: options.headers,
      timeout: options.timeout || this.config.timeout
    };

    try {
      const response = await this.client.request(config);
      return response.data;
    } catch (error) {
      // If retry is enabled and this is a retryable error
      const axiosError = error as AxiosError;
      if (options.retry !== false && this.isRetryableError(axiosError)) {
        return this.retryWithBackoff(options);
      }
      throw error;
    }
  }

  /**
   * Send a chat completion request
   */
  async chatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const response = await this.request({
      method: 'POST',
      url: '/v1/chat/completions',
      data: request,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response;
  }

  /**
   * List available models
   */
  async listModels(): Promise<any> {
    const response = await this.request({
      method: 'GET',
      url: '/v1/models'
    });
    return response;
  }

  /**
   * Get model information
   */
  async getModel(modelId: string): Promise<any> {
    const response = await this.request({
      method: 'GET',
      url: `/v1/models/${modelId}`
    });
    return response;
  }

  /**
   * Check API status
   */
  async checkStatus(): Promise<{ status: string; version?: string; error?: string }> {
    try {
      const response = await this.request({
        method: 'GET',
        url: '/v1/models',
        timeout: 5000
      });
      return { status: 'online', version: response?.version };
    } catch (error: any) {
      return { 
        status: 'offline', 
        error: error.message || 'Unknown error'
      };
    }
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: AxiosError): boolean {
    const status = error.response?.status;
    return (
      !status || // Network error
      status === 408 || // Request timeout
      status === 429 || // Too many requests
      status >= 500 // Server error
    );
  }

  /**
   * Reset rate limit information
   */
  private resetRateLimit(): void {
    this.rateLimitInfo = {
      limit: this.config.requests_per_minute,
      remaining: this.config.requests_per_minute,
      reset: Date.now() + 60000,
      used: 0
    };
    this.emit('ratelimit:reset', this.rateLimitInfo);
  }

  /**
   * Utility function for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current rate limit information
   */
  getRateLimitInfo(): RateLimitInfo {
    return { ...this.rateLimitInfo };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ChatGPTConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Update axios instance if base URL changed
    if (newConfig.base_url && newConfig.base_url !== this.client.defaults.baseURL) {
      this.client.defaults.baseURL = newConfig.base_url;
    }
    
    this.emit('config:updated', this.config);
  }

  /**
   * Get current configuration
   */
  getConfig(): ChatGPTConfig {
    return { ...this.config };
  }
}