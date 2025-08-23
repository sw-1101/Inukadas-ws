/**
 * Audio recording configuration constants
 */
export const AUDIO_CONFIG = {
  // Recording settings
  DEFAULT_DURATION: 30, // seconds
  MAX_DURATION: 60, // seconds
  MIN_DURATION: 1, // seconds
  
  // Audio quality settings
  SAMPLE_RATE: 44100,
  CHANNELS: 1, // mono
  BIT_DEPTH: 16,
  
  // File settings
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_FORMATS: ['audio/webm', 'audio/mp4', 'audio/wav'],
  
  // Microphone settings
  ECHO_CANCELLATION: true,
  NOISE_SUPPRESSION: true,
  AUTO_GAIN_CONTROL: true,
  
  // Waveform visualization
  WAVEFORM_BARS: 32,
  UPDATE_INTERVAL: 100, // ms
  
  // Retry settings
  DEFAULT_RETRY_COUNT: 2,
  MAX_RETRY_COUNT: 5,
} as const;

export const AUDIO_CONSTRAINTS: MediaStreamConstraints = {
  audio: {
    echoCancellation: AUDIO_CONFIG.ECHO_CANCELLATION,
    noiseSuppression: AUDIO_CONFIG.NOISE_SUPPRESSION,
    autoGainControl: AUDIO_CONFIG.AUTO_GAIN_CONTROL,
    sampleRate: AUDIO_CONFIG.SAMPLE_RATE,
    channelCount: AUDIO_CONFIG.CHANNELS,
  },
  video: false,
};

export const RECORDER_OPTIONS: MediaRecorderOptions = {
  mimeType: 'audio/webm;codecs=opus',
  audioBitsPerSecond: 128000,
};