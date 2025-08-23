import React from 'react';
import { motion } from 'framer-motion';
import classNames from 'classnames';
import styles from './MessageBubble.module.css';


const MessageBubble= ({
  type,
  children,
  timestamp,
  showTime = true,
  className,
}) => {
  const formatTime = ( => {
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      className={classNames(
        styles.container,
        styles[type],
        className
      )}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
      }}
      transition={{ 
        duration: 0.3, 
        ease: 'easeOut',
        type: 'spring',
        stiffness: 300,
        damping: 25
      }}
      layout
    >
      <motion.div 
        className={classNames(styles.bubble, styles[type])}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
      
      {showTime && (
        <motion.span
          className={styles.timestamp}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          {formatTime(timestamp)}
        </motion.span>
      )}
    </motion.div>
  );
};

export default MessageBubble;