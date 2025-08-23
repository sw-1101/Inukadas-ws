// Types removed for JavaScript conversion

/**
 * OpenAI Whisper API Service
 */
export class WhisperService {
  private config: TranscriptionConfig;
  private requestQueue: TranscriptionRequest[] = [];
  private isProcessing = false;

  constructor(config: TranscriptionConfig) {
    this.config = config;
  }

  /**
   * Transcribe audio file using OpenAI Whisper API
   */
  public async transcribeAudio(
    audioFile: Blob,
    options: Partial<WhisperTranscriptionRequest> = {}
  ): Promise<TranscriptionResult> {
    const requestId = this.generateRequestId();
    
    try {
      const formData = this.prepareFormData(audioFile, options);
      const response = await this.makeApiRequest(formData);
      
      if (!response.ok) {
        throw await this.handleApiError(response);
      }

      const result: WhisperTranscriptionResponse = await response.json();
      
      return {
        id: requestId,
        memoId: options.prompt || '', // Will be set by caller
        text: result.text.trim(),
        language: options.language,
        duration: 0, // Will be calculated separately
        processedAt: new Date(),
        processingTime: 0 // Will be calculated
      };
    } catch (error) {
      throw this.createTranscriptionError(
        requestId,
        '',
        error instanceof Error ? error.message : 'Unknown error',
        error
      );
    }
  }

  /**
   * Transcribe with detailed response (segments, timing)
   */
  public async transcribeAudioVerbose(
    audioFile: Blob,
    options: Partial<WhisperTranscriptionRequest> = {}
  ): Promise<TranscriptionResult> {
    const requestId = this.generateRequestId();
    const startTime = Date.now();
    
    try {
      const formData = this.prepareFormData(audioFile, {
        ...options,
        response_format: 'verbose_json'
      });
      
      const response = await this.makeApiRequest(formData);
      
      if (!response.ok) {
        throw await this.handleApiError(response);
      }

      const result: WhisperVerboseResponse = await response.json();
      const processingTime = Date.now() - startTime;
      
      return {
        id: requestId,
        memoId: options.prompt || '',
        text: result.text.trim(),
        language: result.language,
        duration: result.duration,
        segments: result.segments,
        processedAt: new Date(),
        processingTime
      };
    } catch (error) {
      throw this.createTranscriptionError(
        requestId,
        '',
        error instanceof Error ? error.message : 'Unknown error',
        error
      );
    }
  }

  /**
   * Add transcription request to queue
   */
  public async queueTranscription(request: TranscriptionRequest): Promise<void> {
    this.requestQueue.push(request);
    
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  /**
   * Process transcription queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift()!;
      
      try {
        await this.transcribeAudio(request.audioFile, request.options);
      } catch (error) {

        // Retry logic
        if (request.retryCount < this.config.maxRetries) {
          request.retryCount++;
          this.requestQueue.push(request);
          
          // Add delay before retry
          await this.delay(this.config.retryDelay);
        }
      }
    }

    this.isProcessing = false;
  }

  /**
   * Batch transcription processing
   */
  public async transcribeBatch(
    batchRequest: BatchTranscriptionRequest
  ): Promise<BatchTranscriptionResult> {
    const startTime = Date.now();
    const results: (TranscriptionResult | TranscriptionError)[] = [];
    let successCount = 0;
    let errorCount = 0;

    for (const request of batchRequest.requests) {
      try {
        const result = await this.transcribeAudio(request.audioFile, request.options);
        results.push(result);
        successCount++;
      } catch (error) {
        const transcriptionError = error as TranscriptionError;
        results.push(transcriptionError);
        errorCount++;
      }
    }

    const totalProcessingTime = Date.now() - startTime;

    return {
      batchId: batchRequest.batchId,
      results,
      completedAt: new Date(),
      totalProcessingTime,
      successCount,
      errorCount
    };
  }

  /**
   * Check service status
   */
  public async checkServiceStatus(): Promise<TranscriptionServiceStatus> {
    const startTime = Date.now();
    
    try {
      // Make a simple request to check API status
      const testBlob = new Blob([''], { type: 'audio/wav' });
      const formData = new FormData();
      formData.append('file', testBlob);
      formData.append('model', this.config.model);
      
      const response = await fetch(`${this.config.baseUrl || 'https://api.openai.com/v1'}/audio/transcriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: formData
      });

      const responseTime = Date.now() - startTime;
      const isOnline = response.status !== 503; // Service unavailable

      return {
        isOnline,
        responseTime,
        lastChecked: new Date(),
        errorRate: 0 // Would be calculated based on historical data
      };
    } catch (error) {
      return {
        isOnline: false,
        responseTime: Date.now() - startTime,
        lastChecked: new Date(),
        errorRate: 1
      };
    }
  }

  /**
   * Prepare FormData for API request
   */
  private prepareFormData(
    audioFile: Blob,
    options: Partial<WhisperTranscriptionRequest>
  ): FormData {
    const formData = new FormData();
    
    // Convert Blob to File if needed
    const file = audioFile instanceof File 
      ? audioFile 
      : new File([audioFile], 'audio.webm', { type: audioFile.type });
    
    formData.append('file', file);
    formData.append('model', options.model || this.config.model);
    
    if (options.prompt) {
      formData.append('prompt', options.prompt);
    }
    
    if (options.response_format) {
      formData.append('response_format', options.response_format);
    }
    
    if (options.temperature !== undefined) {
      formData.append('temperature', options.temperature.toString());
    }
    
    if (options.language) {
      formData.append('language', options.language);
    }

    return formData;
  }

  /**
   * Make API request to OpenAI
   */
  private async makeApiRequest(formData: FormData): Promise<Response> {
    const baseUrl = this.config.baseUrl || 'https://api.openai.com/v1';
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(`${baseUrl}/audio/transcriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Handle API errors
   */
  private async handleApiError(response: Response): Promise<Error> {
    const errorType = this.getErrorType(response.status);
    let errorMessage = `API request failed with status ${response.status}`;
    
    try {
      const errorBody = await response.json();
      if (errorBody.error?.message) {
        errorMessage = errorBody.error.message;
      }
    } catch {
      // Failed to parse error response
    }

    return new Error(`${errorType}: ${errorMessage}`);
  }

  /**
   * Determine error type based on HTTP status
   */
  private getErrorType(status: number): TranscriptionErrorType {
    switch (status) {
      case 401:
        return 'authentication_failed';
      case 413:
        return 'file_too_large';
      case 415:
        return 'invalid_format';
      case 429:
        return 'quota_exceeded';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'api_error';
      default:
        return 'unknown_error';
    }
  }

  /**
   * Create standardized transcription error
   */
  private createTranscriptionError(
    id: string,
    memoId: string,
    message: string,
    details?: any
  ): TranscriptionError {
    const errorType = this.determineErrorType(message, details);
    
    return {
      id,
      memoId,
      type: errorType,
      message,
      details,
      occurredAt: new Date(),
      isRetryable: this.isRetryableError(errorType)
    };
  }

  /**
   * Determine error type from error message/details
   */
  private determineErrorType(message: string, _details?: any): TranscriptionErrorType {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
      return 'network_error';
    }
    if (lowerMessage.includes('timeout')) {
      return 'processing_timeout';
    }
    if (lowerMessage.includes('auth')) {
      return 'authentication_failed';
    }
    if (lowerMessage.includes('quota') || lowerMessage.includes('limit')) {
      return 'quota_exceeded';
    }
    if (lowerMessage.includes('format') || lowerMessage.includes('type')) {
      return 'invalid_format';
    }
    if (lowerMessage.includes('size') || lowerMessage.includes('large')) {
      return 'file_too_large';
    }
    
    return 'unknown_error';
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(errorType: TranscriptionErrorType): boolean {
    const retryableErrors: TranscriptionErrorType[] = [
      'network_error',
      'api_error',
      'processing_timeout'
    ];
    
    return retryableErrors.includes(errorType);
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `transcription_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Delay utility for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<TranscriptionConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  public getConfig(): TranscriptionConfig {
    return { ...this.config };
  }
}

/**
 * Default Whisper service configuration
 */
export const DEFAULT_WHISPER_CONFIG: TranscriptionConfig = {
  apiKey: '', // Must be set by environment variable
  baseUrl: 'https://api.openai.com/v1',
  model: 'whisper-1',
  language: 'ja', // Japanese by default
  temperature: 0,
  maxRetries: 2,
  retryDelay: 1000, // 1 second
  timeout: 30000 // 30 seconds
};

/**
 * Create Whisper service instance with environment configuration
 */
export const createWhisperService = (apiKey: string): WhisperService => {
  const config: TranscriptionConfig = {
    ...DEFAULT_WHISPER_CONFIG,
    apiKey
  };
  
  return new WhisperService(config);
};

/**
 * Singleton Whisper service instance
 */
let whisperServiceInstance: WhisperService | null = null;

/**
 * Get singleton Whisper service instance
 */
export const getWhisperService = (apiKey?: string): WhisperService => {
  if (!whisperServiceInstance) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required to initialize Whisper service');
    }
    whisperServiceInstance = createWhisperService(apiKey);
  }
  
  return whisperServiceInstance;
};

/**
 * Utility functions for audio transcription
 */
export const whisperUtils = {
  /**
   * Validate audio file for transcription
   */
  validateAudioFile: (file: Blob): { isValid: boolean; error?: string } => {
    const maxSize = 25 * 1024 * 1024; // 25MB limit for OpenAI
    const supportedTypes = [
      'audio/wav',
      'audio/webm',
      'audio/mp4',
      'audio/mpeg',
      'audio/ogg',
      'audio/flac'
    ];
    
    if (file.size > maxSize) {
      return { isValid: false, error: 'File size exceeds 25MB limit' };
    }
    
    if (!supportedTypes.includes(file.type)) {
      return { isValid: false, error: 'Unsupported audio format' };
    }
    
    return { isValid: true };
  },

  /**
   * Estimate transcription cost (approximate)
   */
  estimateTranscriptionCost: (durationSeconds: number): number => {
    // OpenAI pricing: $0.006 per minute
    const minutes = Math.ceil(durationSeconds / 60);
    return minutes * 0.006;
  },

  /**
   * Get supported languages
   */
  getSupportedLanguages: (): Record<string, string> => {
    return {
      'en': 'English',
      'ja': 'Japanese',
      'zh': 'Chinese',
      'ko': 'Korean',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian'
      // Add more as needed
    };
  }
};