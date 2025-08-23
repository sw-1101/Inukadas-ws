import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import classNames from 'classnames';
import styles from './Input.module.css';


const Input= ({
  value,
  onChange,
  placeholder = '',
  disabled = false,
  error,
  autoResize = false,
  maxRows = 5,
  className,
  onFocus,
  onBlur,
  onKeyDown,
  'aria-label': ariaLabel,
}) => {
  const textareaRef = useRef(null);
  const inputRef = useRef(null);

  // 自動リサイズ機能
  useEffect(() => {
    if (autoResize && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      
      // 最大高さを計算
      const lineHeight = 24; // 1行の高さ
      const maxHeight = lineHeight * maxRows;
      const newHeight = Math.min(textarea.scrollHeight, maxHeight);
      
      textarea.style.height = `${newHeight}px`;
    }
  }, [value, autoResize, maxRows]);

  const handleChange = ( => {
    onChange(e.target.value);
  };

  const inputClasses = classNames(
    styles.input,
    {
      [styles.error]: error,
      [styles.disabled]: disabled,
      [styles.autoResize]: autoResize,
    },
    className
  );

  return (
    <motion.div className={styles.container}>
      {autoResize ? (
        <textarea
          ref={textareaRef}
          className={inputClasses}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          aria-label={ariaLabel}
        />
      ) : (
        <input
          ref={inputRef}
          className={inputClasses}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          aria-label={ariaLabel}
        />
      )}
      
      {error && (
        <motion.div
          className={styles.errorMessage}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Input;