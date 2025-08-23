import React from 'react';
import { motion } from 'framer-motion';
import classNames from 'classnames';
import styles from './Button.module.css';


const Button= ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  className,
  onClick,
  type = 'button',
  'aria-label': ariaLabel,
}) => {
  const buttonClasses = classNames(
    styles.button,
    styles[variant],
    styles[size],
    {
      [styles.disabled]: disabled || loading,
      [styles.loading]: loading,
      [styles.fullWidth]: fullWidth,
    },
    className
  );

  return (
    <motion.button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={ariaLabel}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      transition={{ duration: 0.15 }}
    >
      {loading && (
        <motion.div
          className={styles.spinner}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <div className={styles.spinnerCircle} />
        </motion.div>
      )}
      <span className={classNames(}>
        {children}
      </span>
    </motion.button>
  );
};

export default Button;