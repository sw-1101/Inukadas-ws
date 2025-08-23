import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import styles from './Modal.module.css';


const Modal= ({
  isOpen,
  onClose,
  children,
  fullScreen = false,
  backdrop = 'blur',
  className,
  preventClose = false,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
}) => {
  // Escapeキーでモーダルを閉じる
  useEffect(() => {
    if (!isOpen || preventClose) return;
    
    const handleEscape = ( => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, preventClose]);

  // スクロール無効化
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleBackdropClick = ( => {
    if (e.target === e.currentTarget && !preventClose) {
      onClose();
    }
  };

  const backdropClasses = classNames(
    styles.backdrop,
    styles[backdrop],
    {
      [styles.fullScreen]: fullScreen,
    }
  );

  const contentClasses = classNames(
    styles.content,
    {
      [styles.fullScreenContent]: fullScreen,
    },
    className
  );

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={backdropClasses}
          onClick={handleBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
        >
          <motion.div
            className={contentClasses}
            initial={
              fullScreen
                ? { scale: 0.9, opacity: 0 }
                : { scale: 0.95, opacity: 0, y: 20 }
            }
            animate={
              fullScreen
                ? { scale: 1, opacity: 1 }
                : { scale: 1, opacity: 1, y: 0 }
            }
            exit={
              fullScreen
                ? { scale: 0.9, opacity: 0 }
                : { scale: 0.95, opacity: 0, y: 20 }
            }
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;