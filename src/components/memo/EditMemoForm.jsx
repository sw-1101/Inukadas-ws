import React, { useState, useEffect } from 'react';
import classNames from 'classnames';
import styles from './EditMemoForm.module.css';

/**
 * メモ編集フォームコンポーネント
 */
export const EditMemoForm = ({ memo, onSave, onCancel }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // メモの内容を初期化
  useEffect(() => {
    if (memo) {
      setContent(memo.content || memo.transcription || '');
    }
  }, [memo]);

  // 保存処理
  const handleSave = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(memo.id, content.trim());
    } catch (error) {
      console.error('Failed to save memo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // キーボードショートカット
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onCancel();
    } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave(e);
    }
  };

  return (
    <form onSubmit={handleSave} className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="memoContent" className={styles.label}>
          メモ内容
        </label>
        <textarea
          id="memoContent"
          className={styles.textarea}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="メモの内容を入力してください..."
          rows={8}
          autoFocus
        />
        <div className={styles.hint}>
          {content.length} 文字
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={classNames(styles.button, styles.buttonSecondary)}
          onClick={onCancel}
          disabled={isSubmitting}
        >
          キャンセル
        </button>
        <button
          type="submit"
          className={classNames(styles.button, styles.buttonPrimary)}
          disabled={!content.trim() || isSubmitting}
        >
          {isSubmitting ? '保存中...' : '保存'}
        </button>
      </div>
    </form>
  );
};

export default EditMemoForm;