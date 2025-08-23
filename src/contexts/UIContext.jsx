import React, { createContext, useContext, useReducer, useCallback } from 'react';
// Types removed for JavaScript conversion

/**
 * UI状態管理用Context
 * 
 * 設計原則:
 * - モーダル状態の管理
 * - 音声プレイヤー状態の管理
 * - 通知システムの管理
 * - ローディング・エラー状態の管理
 */

// Combined UI State

// Action types
// Initial state
const initialState: UIState = {
  modals: {
    recordingModalOpen: false,
    transcribingModalOpen: false,
    confirmDeleteModalOpen: false,
    settingsModalOpen: false
  },
  recordingModal: {
    isOpen: false,
    isRecording: false,
    duration: 0,
    maxDuration: 60,
    waveformData),
    error: undefined
  },
  transcribingModal: {
    isOpen: false,
    progress: 0,
    message: '音声を解析しています...',
    stage: 'processing'
  },
  audioPlayer: {
    currentlyPlaying: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false
  },
  timeline: {
    viewMode: 'timeline',
    sortOrder: 'newest',
    filterOptions: {
      type: 'all',
      hasTranscription: undefined,
      searchQuery: undefined
    }
  },
  search: {
    query: '',
    isSearching: false,
    results: [],
    suggestions: [],
    recentSearches: []
  },
  toasts: [],
  loading: {
    memos: false,
    recording: false,
    transcribing: false,
    uploading: false,
    deleting: false,
    searching: false
  },
  errors: {},
  theme: 'light'
};

// Reducer function
const uiReducer = (state, action) => {
  switch (action.type) {
    // Modal actions
    case 'OPEN_RECORDING_MODAL':
      return {
        ...state,
        modals: { ...state.modals, recordingModalOpen: true },
        recordingModal: { ...state.recordingModal, isOpen: true }
      };
    
    case 'CLOSE_RECORDING_MODAL':
      return {
        ...state,
        modals: { ...state.modals, recordingModalOpen: false },
        recordingModal: { ...initialState.recordingModal }
      };
    
    case 'UPDATE_RECORDING_MODAL':
      return {
        ...state,
        recordingModal: { ...state.recordingModal, ...action.payload }
      };
    
    case 'OPEN_TRANSCRIBING_MODAL':
      return {
        ...state,
        modals: { ...state.modals, transcribingModalOpen: true },
        transcribingModal: {
          ...state.transcribingModal,
          isOpen: true,
          message: action.payload?.message || '音声を解析しています...',
          progress: 0,
          stage: 'processing'
        }
      };
    
    case 'CLOSE_TRANSCRIBING_MODAL':
      return {
        ...state,
        modals: { ...state.modals, transcribingModalOpen: false },
        transcribingModal: { ...initialState.transcribingModal }
      };
    
    case 'UPDATE_TRANSCRIBING_MODAL':
      return {
        ...state,
        transcribingModal: { ...state.transcribingModal, ...action.payload }
      };
    
    case 'OPEN_CONFIRM_DELETE_MODAL':
      return {
        ...state,
        modals: { ...state.modals, confirmDeleteModalOpen: true }
      };
    
    case 'CLOSE_CONFIRM_DELETE_MODAL':
      return {
        ...state,
        modals: { ...state.modals, confirmDeleteModalOpen: false }
      };
    
    case 'OPEN_SETTINGS_MODAL':
      return {
        ...state,
        modals: { ...state.modals, settingsModalOpen: true }
      };
    
    case 'CLOSE_SETTINGS_MODAL':
      return {
        ...state,
        modals: { ...state.modals, settingsModalOpen: false }
      };

    // Audio player actions
    case 'SET_CURRENTLY_PLAYING':
      return {
        ...state,
        audioPlayer: {
          ...state.audioPlayer,
          currentlyPlaying: action.payload,
          isPlaying: action.payload !== null
        }
      };
    
    case 'SET_AUDIO_PLAYING':
      return {
        ...state,
        audioPlayer: { ...state.audioPlayer, isPlaying: action.payload }
      };
    
    case 'UPDATE_AUDIO_TIME':
      return {
        ...state,
        audioPlayer: {
          ...state.audioPlayer,
          currentTime: action.payload.currentTime,
          ...(
        }
      };
    
    case 'SET_AUDIO_VOLUME':
      return {
        ...state,
        audioPlayer: { ...state.audioPlayer, volume: action.payload }
      };
    
    case 'SET_AUDIO_MUTED':
      return {
        ...state,
        audioPlayer: { ...state.audioPlayer, isMuted: action.payload }
      };

    // Timeline view actions
    case 'SET_VIEW_MODE':
      return {
        ...state,
        timeline: { ...state.timeline, viewMode: action.payload }
      };
    
    case 'SET_SORT_ORDER':
      return {
        ...state,
        timeline: { ...state.timeline, sortOrder: action.payload }
      };
    
    case 'SET_TIMELINE_FILTER':
      return {
        ...state,
        timeline: {
          ...state.timeline,
          filterOptions: { ...state.timeline.filterOptions, ...action.payload }
        }
      };
    
    case 'SET_SELECTED_DATE':
      return {
        ...state,
        timeline: { ...state.timeline, selectedDate: action.payload }
      };

    // Search actions
    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        search: { ...state.search, query: action.payload }
      };
    
    case 'SET_SEARCH_LOADING':
      return {
        ...state,
        search: { ...state.search, isSearching: action.payload }
      };
    
    case 'SET_SEARCH_RESULTS':
      return {
        ...state,
        search: { ...state.search, results: action.payload, isSearching: false }
      };
    
    case 'ADD_RECENT_SEARCH':
      const newRecentSearches = [
        action.payload,
        ...state.search.recentSearches.filter(s => s !== action.payload)
      ].slice(0, 10); // Keep only last 10
      
      return {
        ...state,
        search: { ...state.search, recentSearches: newRecentSearches }
      };
    
    case 'CLEAR_SEARCH':
      return {
        ...state,
        search: {
          ...initialState.search,
          recentSearches: state.search.recentSearches
        }
      };

    // Toast actions
    case 'ADD_TOAST':
      const newToast: ToastNotification = {
        ...action.payload,
        id)}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt)
      };
      
      return {
        ...state,
        toasts: [...state.toasts, newToast]
      };
    
    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts)
      };
    
    case 'CLEAR_ALL_TOASTS':
      return {
        ...state,
        toasts: []
      };

    // Loading actions
    case 'SET_LOADING':
      return {
        ...state,
        loading: { ...state.loading, [action.payload.key]: action.payload.value }
      };

    // Error actions
    case 'SET_ERROR':
      return {
        ...state,
        errors: { ...state.errors, [action.payload.key]: action.payload.value }
      };
    
    case 'CLEAR_ERROR':
      const { [action.payload]: _, ...remainingErrors } = state.errors;
      return {
        ...state,
        errors: remainingErrors
      };
    
    case 'CLEAR_ALL_ERRORS':
      return {
        ...state,
        errors: {}
      };

    // Theme actions
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload
      };
    
    case 'TOGGLE_THEME':
      return {
        ...state,
        theme: state.theme === 'light' ? 'dark' : 'light'
      };

    default:
      return state;
  }
};

// Context interface

// Create context
const UIContext = createContext<UIContextType | undefined>(undefined);

// Provider component

export const UIProvider= ({ children }) => {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  // Modal actions
  const openRecordingModal = useCallback(() => {
    dispatch(;
  }, []);

  const closeRecordingModal = useCallback(() => {
    dispatch(;
  }, []);

  const updateRecordingModal = useCallback(() => {
    dispatch(;
  }, []);

  const openTranscribingModal = useCallback(() => {
    dispatch(;
  }, []);

  const closeTranscribingModal = useCallback(() => {
    dispatch(;
  }, []);

  const updateTranscribingModal = useCallback(() => {
    dispatch(;
  }, []);

  const openConfirmDeleteModal = useCallback(() => {
    dispatch(;
  }, []);

  const closeConfirmDeleteModal = useCallback(() => {
    dispatch(;
  }, []);

  const openSettingsModal = useCallback(() => {
    dispatch(;
  }, []);

  const closeSettingsModal = useCallback(() => {
    dispatch(;
  }, []);

  // Audio player actions
  const setCurrentlyPlaying = useCallback(() => {
    dispatch(;
  }, []);

  const setAudioPlaying = useCallback(() => {
    dispatch(;
  }, []);

  const updateAudioTime = useCallback(() => {
    dispatch(;
  }, []);

  const setAudioVolume = useCallback(() => {
    dispatch(;
  }, []);

  const setAudioMuted = useCallback(() => {
    dispatch(;
  }, []);

  // Timeline view actions
  const setViewMode = useCallback(() => {
    dispatch(;
  }, []);

  const setSortOrder = useCallback(() => {
    dispatch(;
  }, []);

  const setTimelineFilter = useCallback(() => {
    dispatch(;
  }, []);

  const setSelectedDate = useCallback(() => {
    dispatch(;
  }, []);

  // Search actions
  const setSearchQuery = useCallback(() => {
    dispatch(;
  }, []);

  const setSearchLoading = useCallback(() => {
    dispatch(;
  }, []);

  const setSearchResults = useCallback(() => {
    dispatch(;
  }, []);

  const addRecentSearch = useCallback(() => {
    if (query.trim()) {
      dispatch( });
    }
  }, []);

  const clearSearch = useCallback(() => {
    dispatch(;
  }, []);

  // Toast actions
  const showToast = useCallback((
    type: ToastType, 
    title: string, 
    message?: string, 
    duration?: number
  ) => {
    dispatch({ 
      type: 'ADD_TOAST', 
      payload: { type, title, message, duration } 
    });
  }, []);

  const showSuccessToast = useCallback(() => {
    showToast('success', title, message, 3000);
  }, [showToast]);

  const showErrorToast = useCallback(() => {
    showToast('error', title, message, 5000);
  }, [showToast]);

  const showWarningToast = useCallback(() => {
    showToast('warning', title, message, 4000);
  }, [showToast]);

  const showInfoToast = useCallback(() => {
    showToast('info', title, message, 3000);
  }, [showToast]);

  const removeToast = useCallback(() => {
    dispatch(;
  }, []);

  const clearAllToasts = useCallback(() => {
    dispatch(;
  }, []);

  // Loading actions
  const setLoading = useCallback(() => {
    dispatch(;
  }, []);

  // Error actions
  const setError = useCallback(() => {
    dispatch(;
  }, []);

  const clearError = useCallback(() => {
    dispatch(;
  }, []);

  const clearAllErrors = useCallback(() => {
    dispatch(;
  }, []);

  // Theme actions
  const setTheme = useCallback(() => {
    dispatch(;
  }, []);

  const toggleTheme = useCallback(() => {
    dispatch(;
  }, []);

  const contextValue: UIContextType = {
    state,
    
    // Modal actions
    openRecordingModal,
    closeRecordingModal,
    updateRecordingModal,
    openTranscribingModal,
    closeTranscribingModal,
    updateTranscribingModal,
    openConfirmDeleteModal,
    closeConfirmDeleteModal,
    openSettingsModal,
    closeSettingsModal,
    
    // Audio player actions
    setCurrentlyPlaying,
    setAudioPlaying,
    updateAudioTime,
    setAudioVolume,
    setAudioMuted,
    
    // Timeline view actions
    setViewMode,
    setSortOrder,
    setTimelineFilter,
    setSelectedDate,
    
    // Search actions
    setSearchQuery,
    setSearchLoading,
    setSearchResults,
    addRecentSearch,
    clearSearch,
    
    // Toast actions
    showToast,
    showSuccessToast,
    showErrorToast,
    showWarningToast,
    showInfoToast,
    removeToast,
    clearAllToasts,
    
    // Loading actions
    setLoading,
    
    // Error actions
    setError,
    clearError,
    clearAllErrors,
    
    // Theme actions
    setTheme,
    toggleTheme
  };

  return (
    <UIContext.Provider value={contextValue}>
      {children}
    </UIContext.Provider>
  );
};

// Custom hook for using UI context
export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};