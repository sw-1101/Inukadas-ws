import React from 'react';
import classNames from 'classnames';
import styles from './MemoCard.module.css';
// Utility functions moved inline
const hasText = (memo) => memo?.type === 'text' || memo?.type === 'mixed';
const hasAudio = (memo) => memo?.type === 'audio' || memo?.type === 'mixed';

/**
 * メモカードコンポーネント
 * 
 * 設計原則:
 * - LINE風のチャット表示
 * - 音声・テキスト・混合メモ対応
 * - アクセシビリティ対応
 * - インタラクション豊富
 */


export const MemoCard= ({
  memo,
  isPlaying = false,
  currentTime = 0,
  actualDuration,
  onPlay,
  onPause,
  onDelete,
  onEdit,
  onShare
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const menuOpen = Boolean(anchorEl);
  const menuRef = React.useRef(null);

  // メニューの開閉
  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // ドキュメントクリックでメニューを閉じる
  React.useEffect(() => {
    if (!menuOpen) return;

    const handleDocumentClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        handleMenuClose();
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, [menuOpen]);

  // 時間フォーマット
  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const diffHours = diff / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return timestamp.toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return timestamp.toLocaleDateString('ja-JP', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // 再生時間フォーマット
  const formatDuration = (seconds) => {
    // NaN、Infinity、無効な値をチェック
    if (!seconds || isNaN(seconds) || !isFinite(seconds) || seconds <= 0) {
      return '0:00';
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60); // 整数に丸める
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 再生進捗
  const getPlayProgress = () => {
    if (!hasAudio(memo)) return 0;
    const duration = actualDuration || memo.duration;
    if (!duration || duration === 0 || !isFinite(duration)) return 0;
    if (!currentTime || !isFinite(currentTime)) return 0;
    return Math.min((currentTime / duration) * 100, 100);
  };

  // メモタイプアイコン
  const getTypeIcon = () => {
    switch (memo.type) {
      case 'audio':
        return <span className={styles.typeIcon}>🎤</span>;
      case 'text':
        return <span className={styles.typeIcon}>📝</span>;
      case 'mixed':
        return (
          <div className={styles.typeIconMixed}>
            <span className={styles.typeIcon}>🎤</span>
            <span className={styles.typeIcon}>📝</span>
          </div>
        );
      default:
        return null;
    }
  };

  // タイトル生成
  const getTitle = () => {
    if (memo.title) return memo.title;
    
    // 文字起こしまたはテキストから自動生成
    let content = '';
    if (hasText(memo) && memo.textContent) {
      content = memo.textContent;
    } else if (hasAudio(memo) && memo.transcription) {
      content = memo.transcription;
    }
    
    if (content) {
      return content.slice(0, 20) + (content.length > 20 ? '...' : '');
    }
    
    return `${memo.type === 'audio' ? '音声' : 'テキスト'}メモ`;
  };

  // 内容プレビュー
  const getContentPreview = () => {
    let content = '';
    
    // 混合モードの場合は両方を表示
    if (memo.type === 'mixed') {
      const textPart = memo.textContent || '';
      const transcriptionPart = memo.transcription || '';
      
      if (textPart && transcriptionPart) {
        content = `${textPart}\n\n[文字起こし]\n${transcriptionPart}`;
      } else if (textPart) {
        content = textPart;
      } else if (transcriptionPart) {
        content = `[文字起こし]\n${transcriptionPart}`;
      }
    } else if (hasText(memo) && memo.textContent) {
      content = memo.textContent;
    } else if (hasAudio(memo) && memo.transcription) {
      content = memo.transcription;
    }
    
    if (!content) return '内容なし';
    
    return content.length > 100 ? content.slice(0, 100) + '...' : content;
  };

  return (
    <article 
      className={classNames(
        styles.card,
        { [styles.cardPlaying]: isPlaying }
      )}
      role="article"
      aria-label={`メモ: ${getTitle()}`}
    >
      <div className={styles.cardContent}>
        {/* ヘッダー行 */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            {getTypeIcon()}
            <h3 className={styles.title}>
              {getTitle()}
            </h3>
          </div>
          
          <div className={styles.headerRight}>
            <span className={styles.timestamp}>
              {formatTime(
                memo.createdAt && typeof memo.createdAt.toDate === 'function'
                  ? memo.createdAt.toDate()
                  : memo.createdAt instanceof Date
                  ? memo.createdAt
                  : new Date()
              )}
            </span>
            
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button
                className={styles.menuButton}
                onClick={handleMenuOpen}
                aria-label="メニューを開く"
                aria-expanded={menuOpen}
                aria-haspopup="true"
                type="button"
              >
                ⋮
              </button>
              
              {/* メニュー */}
              {menuOpen && (
                  <div 
                    ref={menuRef}
                    className={styles.menu}
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: '0',
                      marginTop: '4px',
                      zIndex: 50
                    }}
                  >
                    {onEdit && (
                      <button 
                        className={styles.menuItem}
                        onClick={() => { onEdit(); handleMenuClose(); }}
                        type="button"
                      >
                        <span className={styles.menuItemIcon}>✏️</span>
                        編集
                      </button>
                    )}
                    
                    {onShare && (
                      <button 
                        className={styles.menuItem}
                        onClick={() => { onShare(); handleMenuClose(); }}
                        type="button"
                      >
                        <span className={styles.menuItemIcon}>📤</span>
                        共有
                      </button>
                    )}
                    
                    <button
                      className={classNames(styles.menuItem, styles.menuItemDanger)}
                      onClick={() => { onDelete(); handleMenuClose(); }}
                      type="button"
                    >
                      <span className={styles.menuItemIcon}>🗑</span>
                      削除
                    </button>
                  </div>
              )}
            </div>
          </div>
        </div>


        {/* 内容プレビュー */}
        <div 
          className={classNames(
            styles.contentPreview,
            memo.type === 'mixed' ? styles.contentPreviewMixed : styles.contentPreviewNormal
          )}
        >
          {getContentPreview()}
        </div>

        {/* 音声コントロール */}
        {hasAudio(memo) && (
          <div className={styles.audioControls}>
            {/* 再生プログレスバー */}
            <div className={styles.progressContainer}>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progressFill}
                  style={{ width: `${getPlayProgress()}%` }}
                />
              </div>
            </div>

            <div className={styles.audioControls}>
              <div className={styles.audioLeft}>
                <button
                  onClick={isPlaying ? onPause : onPlay}
                  className={classNames(
                    styles.playButton,
                    isPlaying ? styles.playButtonPause : styles.playButtonPlay
                  )}
                  aria-label={isPlaying ? '再生を停止' : '音声を再生'}
                  type="button"
                >
                  {isPlaying ? '⏸' : '▶'}
                </button>

                <span className={styles.duration}>
                  {formatDuration(currentTime)} / {formatDuration(actualDuration || memo.duration)}
                </span>
              </div>

              <div className={styles.audioRight}>
                {/* 文字起こし状態 */}
                {memo.transcriptionStatus && (
                  <span className={classNames(
                    styles.chip,
                    memo.transcriptionStatus === 'completed' ? styles.chipSuccess :
                    memo.transcriptionStatus === 'processing' ? styles.chipPrimary :
                    memo.transcriptionStatus === 'failed' ? styles.chipError :
                    styles.chipDefault
                  )}>
                    {
                      memo.transcriptionStatus === 'completed'
                        ? '文字起こし完了'
                        : memo.transcriptionStatus === 'processing'
                        ? '処理中'
                        : memo.transcriptionStatus === 'failed'
                        ? 'エラー'
                        : '音声メモ'
                    }
                  </span>
                )}

                {/* 音声アイコン */}
                <span className={styles.volumeIcon}>
                  {isPlaying ? '🔊' : '🔇'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* フッター情報 */}
        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            {/* ファイルサイズ */}
            {hasAudio(memo) && memo.fileSize && (
              <span className={classNames(styles.chip, styles.chipSmall, styles.chipDefault)}>
                {Math.round(memo.fileSize / 1024)}KB
              </span>
            )}

            {/* 文字数 */}
            {hasText(memo) && memo.textContent && (
              <span className={classNames(styles.chip, styles.chipSmall, styles.chipDefault)}>
                {memo.textContent.length}文字
              </span>
            )}
          </div>

          {/* 更新日時 */}
          {memo.updatedAt && memo.createdAt && (
            (() => {
              const updatedTime = memo.updatedAt && typeof memo.updatedAt.toMillis === 'function'
                ? memo.updatedAt.toMillis()
                : memo.updatedAt instanceof Date
                ? memo.updatedAt.getTime()
                : 0;
              const createdTime = memo.createdAt && typeof memo.createdAt.toMillis === 'function'
                ? memo.createdAt.toMillis()
                : memo.createdAt instanceof Date
                ? memo.createdAt.getTime()
                : 0;
              
              if (updatedTime !== createdTime && updatedTime > 0) {
                const updatedDate = memo.updatedAt && typeof memo.updatedAt.toDate === 'function'
                  ? memo.updatedAt.toDate()
                  : memo.updatedAt instanceof Date
                  ? memo.updatedAt
                  : new Date();
                
                return (
                  <div className={styles.footerRight}>
                    編集: {formatTime(updatedDate)}
                  </div>
                );
              }
              return null;
            })()
          )}
        </div>
      </div>
    </article>
  );
};

export default MemoCard;