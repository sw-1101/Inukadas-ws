import React, { useCallback, useMemo, useRef } from 'react';
import classNames from 'classnames';

import { FixedSizeList as VirtualList } from 'react-window';
// @ts-ignore
import InfiniteLoader from 'react-window-infinite-loader';
import { MemoCard } from './MemoCard';
import styles from './MemoTimeline.module.css';

/**
 * メモタイムラインコンポーネント
 * 
 * 設計原則:
 * - 仮想スクロール対応（パフォーマンス最適化）
 * - 無限スクロール
 * - 日付グループ化
 * - ローディング・エラー状態
 */


// 日付グループ化されたアイテムの型

export const MemoTimeline= ({
  memos,
  loading,
  error,
  hasMore,
  currentlyPlaying,
  currentPlayTime,
  currentAudioDuration,
  onLoadMore,
  onPlayAudio,
  onPauseAudio,
  onDeleteMemo,
  onEditMemo,
  onShareMemo,
  onRefresh,
  useVirtualScroll = true,
  height = 600
}) => {
  const infiniteLoaderRef = useRef(null);

  // 日付フォーマット
  const formatDateHeader = useCallback((date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const targetDate = new Date(date);
    
    if (targetDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (targetDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return targetDate.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  }, []);

  // メモを日付でグループ化してタイムラインアイテムに変換
  const timelineItems = useMemo(() => {
    const items = [];
    const groupedMemos = {};

    // 日付でグループ化
    memos.forEach(memo => {
      // createdAtがFirestoreのTimestampオブジェクトの場合はtoDate()を呼び、既にDateの場合はそのまま使う
      const createdAtDate = memo.createdAt && typeof memo.createdAt.toDate === 'function' 
        ? memo.createdAt.toDate() 
        : memo.createdAt instanceof Date 
        ? memo.createdAt 
        : new Date();
      const dateKey = createdAtDate.toDateString();
      if (!groupedMemos[dateKey]) {
        groupedMemos[dateKey] = [];
      }
      groupedMemos[dateKey].push(memo);
    });

    // タイムラインアイテムを構築
    Object.entries(groupedMemos)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime()) // 新しい日付順
      .forEach(([dateString, dayMemos]) => {
        // 日付ヘッダーを追加
        items.push({
          type: 'header',
          id: `header-${dateString}`,
          date: formatDateHeader(dateString)
        });

        // その日のメモを追加
        dayMemos
          .sort((a, b) => {
            const aTime = a.createdAt && typeof a.createdAt.toMillis === 'function' 
              ? a.createdAt.toMillis()
              : a.createdAt instanceof Date 
              ? a.createdAt.getTime()
              : 0;
            const bTime = b.createdAt && typeof b.createdAt.toMillis === 'function'
              ? b.createdAt.toMillis()
              : b.createdAt instanceof Date
              ? b.createdAt.getTime()
              : 0;
            return bTime - aTime;
          }) // 新しい時間順
          .forEach(memo => {
            items.push({
              type: 'memo',
              id: memo.id,
              data: memo
            });
          });
      });

    // ローディング中の場合はローディングアイテムを追加
    if (loading && hasMore) {
      items.push({
        type: 'loading',
        id: 'loading'
      });
    }

    return items;
  }, [memos, loading, hasMore, formatDateHeader]);

  // アイテムがロード済みかチェック
  const isItemLoaded = useCallback(() => {
    return !!timelineItems[index];
  }, [timelineItems]);

  // 仮想スクロール用のアイテムレンダラー
  const VirtualItem = useCallback(() => {
    const item = timelineItems[index];

    if (!item) {
      return (
        <div style={style}>
          <div className={classNames(styles.skeleton, styles.skeletonLarge)} />
        </div>
      );
    }

    return (
      <div style={style}>
        {item.type === 'header' && (
          <div className={styles.listItemHeader}>
            <h3 className={styles.dateHeader}>
              {item.date}
            </h3>
          </div>
        )}

        {item.type === 'memo' && item.data && (
          <div className={styles.listItemMemo}>
            <MemoCard
              memo={item.data}
              isPlaying={currentlyPlaying === item.data.id}
              currentTime={currentlyPlaying === item.data.id ? currentPlayTime : 0}
              actualDuration={currentlyPlaying === item.data.id ? currentAudioDuration : undefined}
              onPlay={() => {
                if (item.data && 'audioUrl' in item.data) {
                  onPlayAudio(item.data.id, item.data.audioUrl);
                }
              }}
              onPause={onPauseAudio}
              onDelete={() => onDeleteMemo(item.data.id)}
              onEdit={onEditMemo ? () => onEditMemo(item.data.id) : undefined}
              onShare={onShareMemo ? () => onShareMemo(item.data.id) : undefined}
            />
          </div>
        )}

        {item.type === 'loading' && (
          <div className={styles.listItemLoading}>
            <div className={classNames(styles.skeleton, styles.skeletonSmall)} />
          </div>
        )}
      </div>
    );
  }, [timelineItems, currentlyPlaying, currentPlayTime, currentAudioDuration, onPlayAudio, onPauseAudio, onDeleteMemo, onEditMemo, onShareMemo]);

  // 通常スクロール用のレンダリング
  const renderNormalScroll = () => (
    <div className={styles.list}>
      {timelineItems.map((item, index) => (
        <React.Fragment key={item.id}>
          {item.type === 'header' && (
            <div className={styles.listItemHeader}>
              <h3 className={styles.dateHeader}>
                {item.date}
              </h3>
            </div>
          )}

          {item.type === 'memo' && item.data && (
            <div className={styles.listItemMemo}>
              <MemoCard
                memo={item.data}
                isPlaying={currentlyPlaying === item.data.id}
                currentTime={currentlyPlaying === item.data.id ? currentPlayTime : 0}
                actualDuration={currentlyPlaying === item.data.id ? currentAudioDuration : undefined}
                onPlay={() => {
                  if (item.data && 'audioUrl' in item.data) {
                    onPlayAudio(item.data.id, item.data.audioUrl);
                  }
                }}
                onPause={onPauseAudio}
                onDelete={() => onDeleteMemo(item.data.id)}
                onEdit={onEditMemo ? () => onEditMemo(item.data.id) : undefined}
                onShare={onShareMemo ? () => onShareMemo(item.data.id) : undefined}
              />
            </div>
          )}

          {item.type === 'loading' && (
            <div className={styles.listItem}>
              <div className={classNames(styles.skeleton, styles.skeletonSmall)} />
            </div>
          )}

          {index < timelineItems.length - 1 && timelineItems[index + 1].type === 'header' && (
            <hr className={styles.divider} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  // エラー状態の表示
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorAlert}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⚠️</span>
            <div className={styles.errorText}>{error}</div>
          </div>
          {onRefresh && (
            <button
              className={styles.errorButton}
              onClick={onRefresh}
              type="button"
            >
              <span>🔄</span>
              再読み込み
            </button>
          )}
        </div>
      </div>
    );
  }

  // 空状態の表示
  if (!loading && memos.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <h2 className={styles.emptyTitle}>
          📝 メモがありません
        </h2>
        <p className={styles.emptyDescription}>
          🎤ボタンを押して最初のメモを作成しましょう
        </p>
      </div>
    );
  }

  // 仮想スクロールの場合
  if (useVirtualScroll && timelineItems.length > 20) {
    return (
      <div 
        className={styles.containerVirtual}
        style={{ '--timeline-height': `${height}px` }}
      >
        <InfiniteLoader
          ref={infiniteLoaderRef}
          isItemLoaded={isItemLoaded}
          itemCount={hasMore ? timelineItems.length + 1 : timelineItems.length}
          loadMoreItems={onLoadMore}
        >
          {({ ref, onItemsRendered }) => (
            <VirtualList
              ref={ref}
              height={height}
              width="100%"
              itemCount={timelineItems.length}
              itemSize={140}
              onItemsRendered={onItemsRendered}
              overscanCount={5}
            >
              {VirtualItem}
            </VirtualList>
          )}
        </InfiniteLoader>
      </div>
    );
  }

  // 通常スクロールの場合
  return (
    <div 
      className={classNames(
        styles.container,
        { [styles.containerVirtual]: useVirtualScroll }
      )}
      style={{ 
        height: useVirtualScroll ? height : 'auto',
        overflowY: useVirtualScroll ? 'hidden' : 'auto'
      }}
    >
      {renderNormalScroll()}
      
      {/* 追加読み込みボタン */}
      {hasMore && !loading && (
        <div className={styles.loadMoreContainer}>
          <button 
            className={styles.loadMoreButton}
            onClick={onLoadMore}
            type="button"
          >
            さらに読み込む
          </button>
        </div>
      )}
      
      {/* ローディング表示 */}
      {loading && (
        <div className={styles.loadingContainer}>
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className={classNames(styles.skeleton, styles.skeletonLarge)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MemoTimeline;