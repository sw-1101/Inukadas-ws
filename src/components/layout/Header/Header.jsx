import React from 'react';
import { motion } from 'framer-motion';
import classNames from 'classnames';
import searchIcon from '../../../assets/search-icon.svg';
import reloadIcon from '../../../assets/reload-icon.svg';
import logoText from '../../../assets/Inukadas-logo-text.svg';
import styles from './Header.module.css';


const Header = React.forwardRef(({
  title,
  onSearchToggle,
  onThemeToggle,
  onSettingsClick,
  onMenuClick,
  onRefresh,
  onBackClick,
  searchVisible = false,
  searchClosing = false,
  refreshing = false,
  isDarkMode = false,
  className,
  showMenuButton = false,
  showRefreshButton = false,
  showBackButton = false,
  searchComponent = null,
}, ref) => {
  return (
    <motion.header
      className={classNames(styles.header, className)}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div className={styles.container}>
        {/* 左エリア - 戻るボタン/メニューボタンとタイトル */}
        <div className={styles.leftArea}>
          {showBackButton && onBackClick && (
            <motion.button
              className={styles.menuButton}
              onClick={onBackClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="戻る"
            >
              <BackIcon />
            </motion.button>
          )}
          {showMenuButton && onMenuClick && (
            <motion.button
              className={styles.menuButton}
              onClick={onMenuClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="メニュー"
            >
              <MenuIcon />
            </motion.button>
          )}
          <motion.h1 
            className={styles.title}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            {title}
          </motion.h1>
        </div>

        {/* 中央エリア - ロゴ */}
        <div className={styles.centerArea}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <img 
              src={logoText} 
              alt="Inukadas" 
              className={styles.logoText}
            />
          </motion.div>
        </div>

        {/* 右エリア - アクションボタン */}
        <div className={styles.rightArea}>
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
              <img src={searchIcon} alt="検索" width="24" height="24" />
            </motion.button>
          )}

          {showRefreshButton && onRefresh && (
            <motion.button
              className={classNames(styles.actionButton, {
                [styles.refreshing]: refreshing
              })}
              onClick={onRefresh}
              disabled={refreshing}
              whileHover={{ scale: refreshing ? 1 : 1.05 }}
              whileTap={{ scale: refreshing ? 1 : 0.95 }}
              aria-label="更新"
            >
              <img src={reloadIcon} alt="更新" width="24" height="24" />
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

      {/* 検索バー */}
      {searchVisible && searchComponent && (
        <div 
          className={classNames(styles.searchContainer, {
            [styles.closing]: searchClosing
          })} 
          ref={ref}
        >
          {searchComponent}
        </div>
      )}
    </motion.header>
  );
});

Header.displayName = 'Header';

// アイコンコンポーネント（SVG）

const MenuIcon= () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const BackIcon= () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5" />
    <path d="M12 19l-7-7 7-7" />
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