import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
// Types removed for JavaScript conversion
import { firestoreService } from '../services/firebase/firestore';
import { authService } from '../services/firebase/auth';

/**
 * メモデータ状態管理用Context
 * 
 * 設計原則:
 * - Firestore との連携
 * - リアルタイム更新対応
 * - ページング・検索機能
 * - エラーハンドリング
 */

// State interface

// Action types
// Initial state
const initialState = {
  memos: [],
  loading: false,
  refreshing: false,
  error: null,
  hasMore: true,
  isSearching: false,
  searchResults: [],
  filter: null,
  sort: { field: 'createdAt', direction: 'desc' }
};

// Reducer function
const memoReducer = (state, action) => {
  switch (action.type) {
    case 'MEMOS_LOADING':
      return { ...state, loading: true, error: null };
    
    case 'MEMOS_REFRESHING':
      return { ...state, refreshing: true, error: null };
    
    case 'MEMOS_LOADED':
      return {
        ...state,
        memos: action.payload.memos,
        hasMore: action.payload.hasMore,
        loading: false,
        refreshing: false,
        error: null
      };
    
    case 'MEMO_ADDED':
      return {
        ...state,
        memos: [action.payload, ...state.memos]
      };
    
    case 'MEMO_UPDATED':
      return {
        ...state,
        memos: state.memos.map(memo =>
          memo.id === action.payload.id ? action.payload : memo
        )
      };
    
    case 'MEMO_DELETED':
      return {
        ...state,
        memos: state.memos.filter(memo => memo.id !== action.payload)
      };
    
    case 'MEMOS_ERROR':
      return { ...state, loading: false, error: action.payload };
    
    case 'MEMOS_RESET':
      return { 
        ...initialState,
        filter: state.filter,
        sort: state.sort
      };
    
    case 'SEARCH_START':
      return { ...state, isSearching: true, error: null };
    
    case 'SEARCH_SUCCESS':
      return { 
        ...state, 
        isSearching: false, 
        searchResults: action.payload 
      };
    
    case 'SEARCH_ERROR':
      return { 
        ...state, 
        isSearching: false, 
        error: action.payload 
      };
    
    case 'SEARCH_CLEAR':
      return { ...state, searchResults: [], isSearching: false };
    
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
    
    case 'SET_SORT':
      return { ...state, sort: action.payload };
    
    default:
      return state;
  }
};

// Context interface

// Create context
const MemoContext = createContext(undefined);

// Provider component

export const MemoProvider= ({ children }) => {
  const [state, dispatch] = useReducer(memoReducer, initialState);
  
  // Track pagination
  const lastDocRef = React.useRef(null);
  const unsubscribeRef = React.useRef(null);

  /**
   * Load initial memos
   */
  const loadMemos = useCallback(async () => {
    const userId = authService.getCurrentUserId();
    if (!userId) return;

    dispatch({ type: "PLACEHOLDER" });

    try {
      const result = await firestoreService.getMemos(
        userId,
        state.filter || undefined,
        state.sort,
        { limit: 50, hasMore: true }
      );

      dispatch({ 
        type: 'MEMOS_LOADED', 
        payload: { 
          memos: result.memos, 
          hasMore: result.hasMore 
        } 
      });

      lastDocRef.current = result.lastDoc;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load memos';
      dispatch({ type: "PLACEHOLDER" });
    }
  }, [state.filter, state.sort]);

  /**
   * Load more memos (pagination)
   */
  const loadMoreMemos = useCallback(async () => {
    const userId = authService.getCurrentUserId();
    if (!userId || !state.hasMore || state.loading) return;

    dispatch({ type: "PLACEHOLDER" });

    try {
      const result = await firestoreService.getMemos(
        userId,
        state.filter || undefined,
        state.sort,
        { 
          limit: 50, 
          hasMore: true,
          lastDoc: lastDocRef.current 
        }
      );

      const updatedMemos = [...state.memos, ...result.memos];
      
      dispatch({ 
        type: 'MEMOS_LOADED', 
        payload: { 
          memos: updatedMemos, 
          hasMore: result.hasMore 
        } 
      });

      lastDocRef.current = result.lastDoc;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load more memos';
      dispatch({ type: "PLACEHOLDER" });
    }
  }, [state.filter, state.sort, state.hasMore, state.loading, state.memos]);

  /**
   * Create new memo
   */
  const createMemo = useCallback(async (memoData) => {
    try {
      const memoId = await firestoreService.createMemo(memoData);
      
      // 作成したメモを取得して即座に表示
      const newMemo = await firestoreService.getMemo(memoId);
      if (newMemo) {
        dispatch({ type: "PLACEHOLDER" });
      }
      
      return memoId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create memo';
      dispatch({ type: "PLACEHOLDER" });
      throw error;
    }
  }, []);

  /**
   * Update existing memo
   */
  const updateMemo = useCallback(async (memoId, updateData) => {
    try {
      await firestoreService.updateMemo(memoId, updateData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update memo';
      dispatch({ type: "PLACEHOLDER" });
      throw error;
    }
  }, []);

  /**
   * Delete memo
   */
  const deleteMemo = useCallback(async (memoId) => {
    try {
      await firestoreService.deleteMemo(memoId);
      dispatch({ type: "PLACEHOLDER" });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete memo';
      dispatch({ type: "PLACEHOLDER" });
      throw error;
    }
  }, []);

  /**
   * Search memos
   */
  const searchMemos = useCallback(async (query) => {
    const userId = authService.getCurrentUserId();
    if (!userId || !query.trim()) return;

    dispatch({ type: "PLACEHOLDER" });

    try {
      const results = await firestoreService.searchMemos(userId, query);
      dispatch({ type: "PLACEHOLDER" });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      dispatch({ type: "PLACEHOLDER" });
    }
  }, []);

  /**
   * Clear search results
   */
  const clearSearch = useCallback(() => {
    dispatch({ type: "PLACEHOLDER" });
  }, []);

  /**
   * Set memo filter
   */
  const setFilter = useCallback(() => {
    dispatch({ type: "PLACEHOLDER" });
    lastDocRef.current = null; // Reset pagination
  }, []);

  /**
   * Set memo sort
   */
  const setSort = useCallback(() => {
    dispatch({ type: "PLACEHOLDER" });
    lastDocRef.current = null; // Reset pagination
  }, []);

  /**
   * Refresh memos (reload from server)
   */
  const refreshMemos = useCallback(async () => {
    dispatch({ type: 'MEMOS_REFRESHING' });
    lastDocRef.current = null;
    
    // 3秒間スピナー表示（テスト用）
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    await loadMemos();
    
    // リロード完了後にスムーズなトランジション付きでスクロールを一番上に戻す
    const smoothScrollToTop = () => {
      const currentPosition = window.scrollY;
      const targetPosition = 0;
      const distance = currentPosition - targetPosition;
      const duration = 800; // 0.8秒
      let start = null;

      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const progressPercentage = Math.min(progress / duration, 1);
        
        // イージング関数（ease-out）
        const easeOut = 1 - Math.pow(1 - progressPercentage, 3);
        
        window.scrollTo(0, currentPosition - (distance * easeOut));
        
        if (progress < duration) {
          window.requestAnimationFrame(step);
        }
      };
      
      window.requestAnimationFrame(step);
    };
    
    smoothScrollToTop();
  }, [loadMemos]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    dispatch({ type: "PLACEHOLDER" });
  }, []);

  /**
   * Setup real-time listener when user is authenticated
   */
  useEffect(() => {
    const userId = authService.getCurrentUserId();
    if (!userId) {
      // Cleanup if user logs out
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      dispatch({ type: "PLACEHOLDER" });
      return;
    }

    // Setup real-time listener
    try {
      const unsubscribe = firestoreService.subscribeToMemos(
        userId,
        (memos) => {
          dispatch({ 
            type: 'MEMOS_LOADED', 
            payload: { 
              memos, 
              hasMore: memos.length >= 50 
            } 
          });
        },
        state.filter || undefined,
        state.sort,
        50
      );

      unsubscribeRef.current = unsubscribe;
    } catch (error) {

      // Fallback to manual loading
      loadMemos();
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [state.filter, state.sort, loadMemos]);

  /**
   * Reload memos when filter or sort changes
   */
  useEffect(() => {
    const userId = authService.getCurrentUserId();
    if (userId) {
      refreshMemos();
    }
  }, [state.filter, state.sort, refreshMemos]);

  const contextValue = {
    state,
    loadMemos,
    loadMoreMemos,
    createMemo,
    updateMemo,
    deleteMemo,
    searchMemos,
    clearSearch,
    setFilter,
    setSort,
    refreshMemos,
    clearError
  };

  return (
    <MemoContext.Provider value={contextValue}>
      {children}
    </MemoContext.Provider>
  );
};

// Custom hook for using memo context
export const useMemos = () => {
  const context = useContext(MemoContext);
  if (context === undefined) {
    throw new Error('useMemos must be used within a MemoProvider');
  }
  return context;
};