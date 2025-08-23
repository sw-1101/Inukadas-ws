import React from 'react';
import { motion } from 'framer-motion';
import classNames from 'classnames';
import styles from './Header.module.css';


const Header= ({
  title,
  onSearchToggle,
  onThemeToggle,
  onSettingsClick,
  searchVisible = false,
  isDarkMode = false,
  className,
}) => {
  return (
    <motion.header
      className={classNames(styles.header, className)}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className={styles.container}>
        {/* タイトルエリア */}
        <div className={styles.titleArea}>
          <motion.h1 
            className={styles.title}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            {title}
          </motion.h1>
        </div>

        {/* アクションボタンエリア */}
        <div className={styles.actions}>
          {onSearchToggle && (
            <motion.button
              className={classNames(styles.actionButton, {
                [styles.active]: searchVisible,
              })}
              onClick={onSearchToggle}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="検索"
            >
              <SearchIcon />
            </motion.button>
          )}

          {onThemeToggle && (
            <motion.button
              className={classNames(styles.actionButton, {
                [styles.active]: isDarkMode,
              })}
              onClick={onThemeToggle}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={isDarkMode ? 'ライトモード' : 'ダークモード'}
            >
              {isDarkMode ? <SunIcon /> : <MoonIcon />}
            </motion.button>
          )}

          {onSettingsClick && (
            <motion.button
              className={styles.actionButton}
              onClick={onSettingsClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="設定"
            >
              <SettingsIcon />
            </motion.button>
          )}
        </div>
      </div>
    </motion.header>
  );
};

// アイコンコンポーネント（SVG）
const SearchIcon= () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="21 21l-4.35-4.35" />
  </svg>
);

const MoonIcon= () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);

const SunIcon= () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
  </svg>
);

const SettingsIcon= () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

export default Header;