import React from 'react';
import logoImage from '../../assets/Inukadas-logo.png';
import styles from './InukadasLogo.module.css';

/**
 * Inukadas アプリのロゴコンポーネント
 * PNG画像を使用したロゴ
 */
export const InukadasLogo = ({ 
  size = 'medium', // 'small', 'medium', 'large'
  variant = 'primary', // 'primary', 'secondary', 'white'
  animated = false,
  className = ''
}) => {
  return (
    <div 
      className={`${styles.logoContainer} ${styles[size]} ${styles[variant]} ${animated ? styles.animated : ''} ${className}`}
    >
      <img 
        src={logoImage} 
        alt="Inukadas - Voice & Text" 
        className={styles.logoImage}
      />
    </div>
  );
};

export default InukadasLogo;