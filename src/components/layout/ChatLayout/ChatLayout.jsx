import React from 'react';
import { motion } from 'framer-motion';
import classNames from 'classnames';
import styles from './ChatLayout.module.css';


const ChatLayout= ({
  children,
  header,
  inputArea,
  floatingButton,
  className,
}) => {
  return (
    <div className={classNames(styles.layout, className)}>
      {/* ヘッダー */}
      {header && (
        <div className={styles.headerContainer}>
          {header}
        </div>
      )}

      {/* メインコンテンツエリア */}
      <motion.main
        className={styles.content}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <div className={styles.contentContainer}>
          {children}
        </div>
      </motion.main>

      {/* 入力エリア */}
      {inputArea && (
        <motion.div
          className={styles.inputContainer}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          {inputArea}
        </motion.div>
      )}

      {/* フローティングボタン */}
      {floatingButton && (
        <motion.div
          className={styles.floatingButtonContainer}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            duration: 0.3, 
            delay: 0.4,
            type: 'spring',
            stiffness: 260,
            damping: 20
          }}
        >
          {floatingButton}
        </motion.div>
      )}
    </div>
  );
};

export default ChatLayout;