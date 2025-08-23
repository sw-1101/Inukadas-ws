import React, { useState, useEffect, useCallback, useRef } from 'react';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import { MemoProvider, useMemos } from '../contexts/MemoContext';
import { MemoTimeline } from '../components/memo/MemoTimeline';
import { MemoInput } from '../components/memo/MemoInput';
import SearchBox from '../components/forms/SearchBox/SearchBox';
import { useAuth } from '../contexts/AuthContext';
import { useAuthActions } from '../hooks/useAuthActions';
import styles from './MemoListPage.module.css';

/**
 * メモ一覧ページ
 * 
 * 設計原則:
 * - モバイルファーストデザイン
 * - LINE風のチャット表示
 * - 無限スクロール対応
 * - リアルタイム更新
 * - オフライン対応
 */

// レスポンシブフック
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return isMobile;
};

// メイン画面コンポーネント
const MemoListPageContent = () => {
  const { 
    state: { memos, loading, error, hasMore, isSearching, searchResults },
    loadMemos,
    loadMoreMemos,
    searchMemos,
    clearSearch,
    deleteMemo,
    refreshMemos
  } = useMemos();
  
  const { state: { user } } = useAuth();
  const { logout } = useAuthActions();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // UI状態
  const [showInput, setShowInput] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [currentPlayTime, setCurrentPlayTime] = useState(0);
  const [currentAudioDuration, setCurrentAudioDuration] = useState(0); // 実際の音声時間
  const [searchQuery, setSearchQuery] = useState('');
  
  // Audio管理
  const audioRef = useRef(null);
  const audioUpdateTimerRef = useRef(null);

  // 初期ロード
  useEffect(() => {
    if (user) {
      loadMemos();
    }
  }, [user, loadMemos]);

  // Audio時間更新
  useEffect(() => {
    if (currentlyPlaying && audioRef.current) {
      audioUpdateTimerRef.current = setInterval(() => {
        if (audioRef.current) {
          // 小数点第1位まで丸める
          setCurrentPlayTime(Math.round(audioRef.current.currentTime * 10) / 10);
        }
      }, 500); // 100ms → 500msに変更（更新頻度を下げる）
    } else {
      if (audioUpdateTimerRef.current) {
        clearInterval(audioUpdateTimerRef.current);
      }
    }

    return () => {
      if (audioUpdateTimerRef.current) {
        clearInterval(audioUpdateTimerRef.current);
      }
    };
  }, [currentlyPlaying]);

  // 音声再生開始
  const handlePlayAudio = useCallback((memoId, audioUrl) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    const audio = new Audio(audioUrl);
    audio.onloadedmetadata = () => {
      setCurrentlyPlaying(memoId);
      
      // 実際の音声時間を設定
      const actualDuration = audio.duration;
      if (actualDuration && !isNaN(actualDuration) && isFinite(actualDuration)) {
        setCurrentAudioDuration(actualDuration);
        console.log('実際の音声時間:', actualDuration);
      } else {
        console.warn('Invalid audio duration:', actualDuration);
        setCurrentAudioDuration(0);
      }
      
      audio.play();
    };
    
    audio.onended = () => {
      setCurrentlyPlaying(null);
      setCurrentPlayTime(0);
      setCurrentAudioDuration(0);
    };
    
    audio.onerror = (error) => {
      console.error('Audio playback error:', error);
      setCurrentlyPlaying(null);
      setCurrentPlayTime(0);
      setCurrentAudioDuration(0);
    };
    
    audioRef.current = audio;
  }, []);

  // 音声再生停止
  const handlePauseAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setCurrentlyPlaying(null);
    setCurrentPlayTime(0);
    setCurrentAudioDuration(0);
  }, []);

  // メモ削除
  const handleDeleteMemo = useCallback(async (memoId) => {
    try {
      await deleteMemo(memoId);
      
      // 再生中のメモが削除された場合は停止
      if (currentlyPlaying === memoId) {
        handlePauseAudio();
      }
    } catch (error) {
      console.error('Failed to delete memo:', error);
    }
  }, [deleteMemo, currentlyPlaying, handlePauseAudio]);

  // 検索処理
  const handleSearch = useCallback(async (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      await searchMemos(query);
    } else {
      clearSearch();
    }
  }, [searchMemos, clearSearch]);

  // 検索クリア
  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    clearSearch();
  }, [clearSearch]);

  // メモ入力成功時
  const handleMemoSubmitSuccess = useCallback((_memoId) => {
    setShowInput(false);
    // 新しいメモが追加されたのでリフレッシュ
    refreshMemos();
  }, [refreshMemos]);

  // ログアウト処理
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [logout, navigate]);

  // メニューを閉じる（アニメーション付き）
  const handleMenuClose = useCallback(() => {
    setMenuClosing(true);
    setTimeout(() => {
      setShowMenu(false);
      setMenuClosing(false);
    }, 300); // アニメーション時間と同じ
  }, []);

  // メニューを開く
  const handleMenuOpen = useCallback(() => {
    setShowMenu(true);
    setMenuClosing(false);
  }, []);

  // 表示するメモ一覧
  const displayMemos = isSearching || searchResults.length > 0 ? searchResults : memos;

  return (
    <div className={styles.container}>
      {/* ヘッダー */}
      <header className={styles.header}>
        <div className={styles.headerToolbar}>
          {/* ハンバーガーメニューボタン */}
          <button
            className={styles.hamburgerButton}
            onClick={() => showMenu ? handleMenuClose() : handleMenuOpen()}
            aria-label="メニュー"
            type="button"
          >
            ☰
          </button>
          
          <h1 className={styles.headerTitle}>
            📝 音声メモ
          </h1>
          
          <div className={styles.headerActions}>
            {/* 検索ボタン */}
            <button
              className={styles.headerButton}
              onClick={() => setShowSearch(!showSearch)}
              aria-label="検索"
              type="button"
            >
              🔍
            </button>
            
            {/* リフレッシュボタン */}
            <button
              className={styles.headerButton}
              onClick={refreshMemos}
              disabled={loading}
              aria-label="更新"
              type="button"
            >
              🔄
            </button>
          </div>
        </div>
        
        {/* 検索バー */}
        {showSearch && (
          <div className={styles.searchContainer}>
            <SearchBox
              value={searchQuery}
              onChange={handleSearch}
              onClear={handleClearSearch}
              placeholder="メモを検索..."
              loading={isSearching}
              fullWidth
            />
          </div>
        )}
      </header>

      {/* メイン内容 */}
      <main className={styles.mainContent}>
        <div className={styles.contentContainer}>
          {/* メモタイムライン */}
          <div className={styles.timelineContainer}>
            <MemoTimeline
              memos={displayMemos}
              loading={loading}
              error={error}
              hasMore={hasMore && !isSearching}
              currentlyPlaying={currentlyPlaying}
              currentPlayTime={currentPlayTime}
              currentAudioDuration={currentAudioDuration}
              onLoadMore={loadMoreMemos}
              onPlayAudio={handlePlayAudio}
              onPauseAudio={handlePauseAudio}
              onDeleteMemo={handleDeleteMemo}
              onRefresh={refreshMemos}
              useVirtualScroll={false} // 仮想スクロールを無効化
              height={window.innerHeight - 200}
            />
          </div>
        </div>

        {/* 新規作成ボタン */}
        <button
          className={styles.fab}
          aria-label="新しいメモを作成"
          onClick={() => setShowInput(true)}
          type="button"
        >
          +
        </button>
      </main>

      {/* メモ入力モーダル */}
      {showInput && (
        <div className={styles.modalOverlay} onClick={() => setShowInput(false)}>
          <div 
            className={classNames(
              styles.modalContent,
              { [styles.modalContentMobile]: isMobile }
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* モーダルヘッダー */}
            <div className={classNames(
              styles.modalHeader,
              { [styles.modalHeaderMobile]: isMobile }
            )}>
              {isMobile && (
                <button
                  className={styles.modalCloseButton}
                  onClick={() => setShowInput(false)}
                  aria-label="閉じる"
                  type="button"
                >
                  ←
                </button>
              )}
              <h2 className={styles.modalTitle}>
                新しいメモ
              </h2>
              {!isMobile && (
                <button
                  className={styles.modalCloseButton}
                  onClick={() => setShowInput(false)}
                  aria-label="閉じる"
                  type="button"
                >
                  ✕
                </button>
              )}
            </div>
            
            {/* メモ入力フォーム */}
            <div className={styles.modalBody}>
              <MemoInput
                onSubmitSuccess={handleMemoSubmitSuccess}
                onSubmitError={(error) => {
                  console.error('Memo submission error:', error);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* スライドアウトメニュー */}
      {showMenu && (
        <>
          {/* オーバーレイ */}
          <div 
            className={`${styles.menuOverlay} ${menuClosing ? styles.menuOverlayClosing : ''}`}
            onClick={handleMenuClose}
          />
          
          {/* メニューパネル */}
          <div className={`${styles.menuPanel} ${menuClosing ? styles.menuPanelClosing : ''}`}>
            <div className={styles.menuHeader}>
              <div className={styles.menuUserInfo}>
                <div className={styles.menuUserIcon}>👤</div>
                <div className={styles.menuUserDetails}>
                  <div className={styles.menuUserName}>
                    {user?.displayName || user?.email || 'ユーザー'}
                  </div>
                  <div className={styles.menuUserEmail}>
                    {user?.email}
                  </div>
                </div>
              </div>
            </div>
            
            <nav className={styles.menuNav}>
              <button
                className={styles.menuItem}
                onClick={() => {
                  navigate('/profile');
                  handleMenuClose();
                }}
              >
                <span className={styles.menuItemIcon}>👤</span>
                プロフィール
              </button>
              
              <button
                className={styles.menuItem}
                onClick={() => {
                  handleLogout();
                  handleMenuClose();
                }}
              >
                <span className={styles.menuItemIcon}>🚪</span>
                ログアウト
              </button>
            </nav>
          </div>
        </>
      )}

      {/* 隠しオーディオ要素 */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
};

// メインページコンポーネント（Context Provider付き）
const MemoListPage = () => {
  return (
    <MemoProvider>
      <MemoListPageContent />
    </MemoProvider>
  );
};

export default MemoListPage;