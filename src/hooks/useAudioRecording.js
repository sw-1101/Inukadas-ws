import { useState, useEffect, useCallback, useRef } from 'react';
// Types removed for JavaScript conversion
import { getAudioRecorder, audioUtils } from '../services/audio/recorder';
import { AUDIO_CONFIG } from '../constants/audioConfig';

/**
 * Audio recording hook interface
 */
export interface UseAudioRecordingResult {
  // State
  isRecording: boolean;
  isPaused: boolean;
  recordingState: RecordingState;
  duration: number;
  waveformData: Float32Array;
  error: string | null;
  isInitialized: boolean;
  
  // Recording data
  currentRecording: AudioRecording | null;
  currentSession: RecordingSession | null;
  
  // Actions
  startRecording: (maxDuration?: number) => Promise<string>;
  stopRecording: () => Promise<AudioRecording>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  clearError: () => void;
  cleanup: () => void;
  
  // Utilities
  formatDuration: (seconds: number) => string;
  getRecordingProgress: (maxDuration: number) => number;
}

/**
 * Audio recording configuration options
 */
export interface UseAudioRecordingOptions {
  maxDuration?: number;
  autoCleanup?: boolean;
  onRecordingComplete?: (recording: AudioRecording) => void;
  onError?: (error: AudioError) => void;
}

/**
 * Custom hook for audio recording functionality
 */
export const useAudioRecording = (
  options: UseAudioRecordingOptions = {}
): UseAudioRecordingResult => {
  const {
    maxDuration = AUDIO_CONFIG.MAX_DURATION,
    autoCleanup = true,
    onRecordingComplete,
    onError
  } = options;

  // State
  const [recordingState, setRecordingState] = useState('idle');
  const [duration, setDuration] = useState(0);
  const [waveformData, setWaveformData] = useState(new Float32Array());
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentRecording, setCurrentRecording] = useState(null);
  const [currentSession, setCurrentSession] = useState(null);

  // Refs
  const recorderRef = useRef(getAudioRecorder());
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Derived state
  const isRecording = recordingState === 'recording';
  const isPaused = recordingState === 'paused';

  /**
   * Initialize the audio recorder
   */
  const initialize = useCallback(async () => {
    if (isInitialized) return;

    try {
      await recorderRef.current.initialize(
        // onStateChange
        (state) => {
          if (mountedRef.current) {
            setRecordingState(state);
            if (state === 'error') {
              setError('Recording error occurred');
            }
          }
        },
        // onDataAvailable
        (data) => {
          if (mountedRef.current) {
            setWaveformData(data);
          }
        },
        // onError
        (audioError) => {
          if (mountedRef.current) {
            setError(audioError.message);
            onError?.(audioError);
          }
        },
        // onRecordingComplete
        (recording) => {
          if (mountedRef.current) {
            setCurrentRecording(recording);
            onRecordingComplete?.(recording);
          }
        }
      );
      
      setIsInitialized(true);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize recorder';
      setError(errorMessage);

    }
  }, [isInitialized, onError, onRecordingComplete]);

  /**
   * Start recording
   */
  const startRecording = useCallback(async (customMaxDuration?: number): Promise<string> => {
    if (!isInitialized) {
      await initialize();
    }

    try {
      const sessionId = await recorderRef.current.startRecording(
        customMaxDuration || maxDuration
      );
      
      setCurrentRecording(null);
      setError(null);
      
      // Start duration tracking
      durationIntervalRef.current = setInterval(() => {
        if (mountedRef.current) {
          const newDuration = recorderRef.current.getCurrentDuration();
          setDuration(newDuration);
          setCurrentSession(recorderRef.current.getCurrentSession());
        }
      }, 100);
      
      return sessionId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      setError(errorMessage);
      throw err;
    }
  }, [isInitialized, initialize, maxDuration]);

  /**
   * Stop recording
   */
  const stopRecording = useCallback(async (): Promise<AudioRecording> => {
    try {
      // Clear duration tracking
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      const recording = await recorderRef.current.stopRecording();
      
      if (mountedRef.current) {
        setCurrentRecording(recording);
        setCurrentSession(recorderRef.current.getCurrentSession());
      }
      
      return recording;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop recording';
      setError(errorMessage);
      throw err;
    }
  }, []);

  /**
   * Pause recording
   */
  const pauseRecording = useCallback(() => {
    try {
      recorderRef.current.pauseRecording();
      
      // Pause duration tracking
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to pause recording';
      setError(errorMessage);
    }
  }, []);

  /**
   * Resume recording
   */
  const resumeRecording = useCallback(() => {
    try {
      recorderRef.current.resumeRecording();
      
      // Resume duration tracking
      durationIntervalRef.current = setInterval(() => {
        if (mountedRef.current) {
          const newDuration = recorderRef.current.getCurrentDuration();
          setDuration(newDuration);
          setCurrentSession(recorderRef.current.getCurrentSession());
        }
      }, 100);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resume recording';
      setError(errorMessage);
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Clean up resources
   */
  const cleanup = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    
    recorderRef.current.cleanup();
    
    setRecordingState('idle');
    setDuration(0);
    setWaveformData(new Float32Array());
    setCurrentRecording(null);
    setCurrentSession(null);
    setIsInitialized(false);
  }, []);

  /**
   * Format duration string
   */
  const formatDuration = useCallback((seconds: number): string => {
    return audioUtils.formatDuration(seconds);
  }, []);

  /**
   * Get recording progress (0-100)
   */
  const getRecordingProgress = useCallback((maxDurationSeconds: number): number => {
    return Math.min((duration / maxDurationSeconds) * 100, 100);
  }, [duration]);

  // Initialize on mount
  useEffect(() => {
    initialize();
    
    return () => {
      mountedRef.current = false;
      if (autoCleanup) {
        cleanup();
      }
    };
  }, [initialize, cleanup, autoCleanup]);

  // Cleanup duration interval on unmount
  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  return {
    // State
    isRecording,
    isPaused,
    recordingState,
    duration,
    waveformData,
    error,
    isInitialized,
    
    // Recording data
    currentRecording,
    currentSession,
    
    // Actions
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearError,
    cleanup,
    
    // Utilities
    formatDuration,
    getRecordingProgress
  };
};

/**
 * Hook for checking audio recording compatibility
 */
export const useAudioCompatibility = () => {
  const [compatibility, setCompatibility] = useState(() => {
    // Only check compatibility on client side
    if (typeof window === 'undefined') {
      return {
        mediaRecorder: false,
        webAudioAPI: false,
        getUserMedia: false,
        supportedMimeTypes: [],
        recommendedMimeType: ''
      };
    }
    
    const { getCompatibility } = require('../services/audio/recorder');
    return getCompatibility();
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const { getCompatibility } = require('../services/audio/recorder');
      setCompatibility(getCompatibility());
    }
  }, []);

  return compatibility;
};