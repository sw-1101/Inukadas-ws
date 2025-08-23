// Types removed for JavaScript conversion
import { AUDIO_CONFIG, AUDIO_CONSTRAINTS, RECORDER_OPTIONS } from '../../constants/audioConfig';

/**
 * Audio recording service using MediaRecorder API
 */
export class AudioRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private mediaStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private audioChunks: Blob[] = [];
  
  private currentSession: RecordingSession | null = null;
  private recordingStartTime: Date | null = null;
  private animationFrameId: number | null = null;
  
  // Event callbacks
  private onStateChange?: (state: RecordingState) => void;
  private onDataAvailable?: (waveformData: Float32Array) => void;
  private onError?: (error: AudioError) => void;
  private onRecordingComplete?: (recording: AudioRecording) => void;

  constructor() {
    this.checkCompatibility();
  }

  /**
   * Check browser compatibility for audio recording
   */
  public static getCompatibility(): AudioCompatibility {
    const mediaRecorder = 'MediaRecorder' in window;
    const webAudioAPI = 'AudioContext' in window || 'webkitAudioContext' in window;
    const getUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    
    const supportedMimeTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/ogg;codecs=opus',
      'audio/wav'
    ].filter(type => MediaRecorder.isTypeSupported(type));

    const recommendedMimeType = supportedMimeTypes[0] || 'audio/webm';

    return {
      mediaRecorder,
      webAudioAPI,
      getUserMedia,
      supportedMimeTypes,
      recommendedMimeType
    };
  }

  /**
   * Initialize audio recording
   */
  public async initialize(
    onStateChange?: (state: RecordingState) => void,
    onDataAvailable?: (waveformData: Float32Array) => void,
    onError?: (error: AudioError) => void,
    onRecordingComplete?: (recording: AudioRecording) => void
  ): Promise<void> {
    this.onStateChange = onStateChange;
    this.onDataAvailable = onDataAvailable;
    this.onError = onError;
    this.onRecordingComplete = onRecordingComplete;

    this.updateState('initializing');

    try {
      // Request microphone permission
      this.mediaStream = await navigator.mediaDevices.getUserMedia(AUDIO_CONSTRAINTS);
      
      // Setup audio context for waveform analysis
      this.setupAudioContext();
      
      // Setup media recorder
      this.setupMediaRecorder();
      
      this.updateState('idle');
    } catch (error) {
      const audioError = this.createAudioError(
        'permission_denied',
        'Microphone access denied',
        error
      );
      this.handleError(audioError);
    }
  }

  /**
   * Start recording
   */
  public async startRecording(maxDuration: number = AUDIO_CONFIG.MAX_DURATION): Promise<string> {
    if (!this.mediaRecorder || this.currentSession?.state === 'recording') {
      throw new Error('Recording already in progress or not initialized');
    }

    const sessionId = this.generateSessionId();
    this.recordingStartTime = new Date();
    
    this.currentSession = {
      id: sessionId,
      startTime: this.recordingStartTime,
      duration: 0,
      state: 'recording'
    };

    this.audioChunks = [];
    this.updateState('recording');

    try {
      this.mediaRecorder.start(100); // Collect data every 100ms
      this.startWaveformAnalysis();
      
      // Auto-stop after max duration
      setTimeout(() => {
        if (this.currentSession?.state === 'recording') {
          this.stopRecording();
        }
      }, maxDuration * 1000);

      return sessionId;
    } catch (error) {
      const audioError = this.createAudioError(
        'processing_failed',
        'Failed to start recording',
        error
      );
      this.handleError(audioError);
      throw error;
    }
  }

  /**
   * Stop recording
   */
  public async stopRecording(): Promise<AudioRecording> {
    if (!this.mediaRecorder || !this.currentSession) {
      throw new Error('No active recording session');
    }

    this.updateState('stopping');
    
    return new Promise((resolve, _reject) => {
      const handleStop = () => {
        this.stopWaveformAnalysis();
        
        const blob = new Blob(this.audioChunks, { type: this.getRecordingMimeType() });
        const duration = this.getCurrentDuration();
        
        const recording: AudioRecording = {
          blob,
          duration,
          size: blob.size,
          mimeType: blob.type,
          url: URL.createObjectURL(blob)
        };

        if (this.currentSession) {
          this.currentSession.endTime = new Date();
          this.currentSession.duration = duration;
          this.currentSession.audioData = recording;
          this.currentSession.state = 'completed';
        }

        this.updateState('completed');
        this.onRecordingComplete?.(recording);
        resolve(recording);
      };

      this.mediaRecorder!.addEventListener('stop', handleStop, { once: true });
      this.mediaRecorder!.stop();
    });
  }

  /**
   * Pause recording (if supported)
   */
  public pauseRecording(): void {
    if (this.mediaRecorder?.state === 'recording') {
      this.mediaRecorder.pause();
      this.updateState('paused');
      this.stopWaveformAnalysis();
    }
  }

  /**
   * Resume recording (if supported)
   */
  public resumeRecording(): void {
    if (this.mediaRecorder?.state === 'paused') {
      this.mediaRecorder.resume();
      this.updateState('recording');
      this.startWaveformAnalysis();
    }
  }

  /**
   * Get current recording duration
   */
  public getCurrentDuration(): number {
    if (!this.recordingStartTime) return 0;
    return Math.floor((Date.now() - this.recordingStartTime.getTime()) / 1000);
  }

  /**
   * Get current session info
   */
  public getCurrentSession(): RecordingSession | null {
    return this.currentSession;
  }

  /**
   * Clean up resources
   */
  public cleanup(): void {
    this.stopWaveformAnalysis();
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.mediaRecorder = null;
    this.analyserNode = null;
    this.currentSession = null;
    this.recordingStartTime = null;
  }

  /**
   * Setup audio context for waveform analysis
   */
  private setupAudioContext(): void {
    if (!this.mediaStream || !window.AudioContext) return;

    try {
      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.analyserNode = this.audioContext.createAnalyser();
      
      this.analyserNode.fftSize = 256;
      this.analyserNode.smoothingTimeConstant = 0.8;
      
      source.connect(this.analyserNode);
    } catch (error) {
    // エラーハンドリング
  }
  }

  /**
   * Setup media recorder
   */
  private setupMediaRecorder(): void {
    if (!this.mediaStream) return;

    const options = this.getRecorderOptions();
    this.mediaRecorder = new MediaRecorder(this.mediaStream, options);

    this.mediaRecorder.addEventListener('dataavailable', (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    });

    this.mediaRecorder.addEventListener('error', (event) => {
      const audioError = this.createAudioError(
        'processing_failed',
        'MediaRecorder error',
        event
      );
      this.handleError(audioError);
    });
  }

  /**
   * Start waveform analysis animation
   */
  private startWaveformAnalysis(): void {
    if (!this.analyserNode) return;

    const bufferLength = this.analyserNode.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);

    const analyze = () => {
      if (this.currentSession?.state !== 'recording') return;

      this.analyserNode!.getFloatFrequencyData(dataArray);
      this.onDataAvailable?.(dataArray);
      
      this.animationFrameId = requestAnimationFrame(analyze);
    };

    analyze();
  }

  /**
   * Stop waveform analysis animation
   */
  private stopWaveformAnalysis(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Get recorder options based on browser support
   */
  private getRecorderOptions(): MediaRecorderOptions {
    const compatibility = AudioRecorderService.getCompatibility();
    
    return {
      mimeType: compatibility.recommendedMimeType,
      audioBitsPerSecond: RECORDER_OPTIONS.audioBitsPerSecond
    };
  }

  /**
   * Get recording MIME type
   */
  private getRecordingMimeType(): string {
    return this.mediaRecorder?.mimeType || 'audio/webm';
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update recording state
   */
  private updateState(state: RecordingState): void {
    if (this.currentSession) {
      this.currentSession.state = state;
    }
    this.onStateChange?.(state);
  }

  /**
   * Create standardized audio error
   */
  private createAudioError(
    type: AudioErrorType,
    message: string,
    details?: any
  ): AudioError {
    return {
      type,
      message,
      details,
      timestamp: new Date()
    };
  }

  /**
   * Handle audio errors
   */
  private handleError(error: AudioError): void {
    this.updateState('error');
    if (this.currentSession) {
      this.currentSession.error = error.message;
    }
    this.onError?.(error);
  }

  /**
   * Check browser compatibility on initialization
   */
  private checkCompatibility(): void {
    const compatibility = AudioRecorderService.getCompatibility();
    
    if (!compatibility.getUserMedia) {
      throw new Error('getUserMedia not supported');
    }
    
    if (!compatibility.mediaRecorder) {
      throw new Error('MediaRecorder not supported');
    }
    
    if (compatibility.supportedMimeTypes.length === 0) {

    }
  }
}

/**
 * Singleton instance
 */
let audioRecorderInstance: AudioRecorderService | null = null;

/**
 * Get singleton audio recorder instance
 */
export const getAudioRecorder = (): AudioRecorderService => {
  if (!audioRecorderInstance) {
    audioRecorderInstance = new AudioRecorderService();
  }
  return audioRecorderInstance;
};

/**
 * Utility functions
 */
export const audioUtils = {
  /**
   * Convert audio blob to base64
   */
  blobToBase64: (blob: Blob): Promise<string> => {
    return new Promise((resolve, _reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = _reject;
      reader.readAsDataURL(blob);
    });
  },

  /**
   * Get audio duration from blob
   */
  getAudioDuration: (blob: Blob): Promise<number> => {
    return new Promise((resolve, _reject) => {
      const audio = new Audio();
      const url = URL.createObjectURL(blob);
      
      audio.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(url);
        resolve(audio.duration);
      });
      
      audio.addEventListener('error', () => {
        URL.revokeObjectURL(url);
        _reject(new Error('Failed to load audio'));
      });
      
      audio.src = url;
    });
  },

  /**
   * Format duration in MM:SS format
   */
  formatDuration: (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  },

  /**
   * Check if audio format is supported
   */
  isFormatSupported: (mimeType: string): boolean => {
    return MediaRecorder.isTypeSupported(mimeType);
  }
};