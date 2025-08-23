import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useAuthActions } from '../../../hooks/useAuthActions';
import styles from './SideMenu.module.css';

const SideMenu = ({ 
  isOpen, 
  onClose, 
  menuItems = [], 
  showDefaultItems = true,
  className = '' 
}) => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const { logout } = useAuthActions();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      onClose();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // デフォルトのメニュー項目
  const defaultMenuItems = [
    {
      id: 'memos',
      label: 'メモ一覧',
      icon: '📝',
      onClick: () => {
        navigate('/memos');
        onClose();
      }
    },
    {
      id: 'profile',
      label: 'プロフィール',
      icon: '👤',
      onClick: () => {
        navigate('/profile');
        onClose();
      }
    },
    {
      id: 'logout',
      label: 'ログアウト',
      icon: '🚪',
      onClick: handleLogout
    }
  ];

  const allMenuItems = showDefaultItems ? [...menuItems, ...defaultMenuItems] : menuItems;

  if (!isOpen) return null;

  return (
    <>
      {/* オーバーレイ */}
      <div 
        className={styles.menuOverlay}
        onClick={onClose}
      />
      
      {/* メニューパネル */}
      <div className={`${styles.menuPanel} ${className}`}>
        <div className={styles.menuHeader}>
          <div className={styles.menuUserInfo}>
            <div className={styles.menuUserIcon}>👤</div>
            <div className={styles.menuUserDetails}>
              <div className={styles.menuUserName}>
                {state.user?.displayName || state.user?.email || 'ユーザー'}
              </div>
              <div className={styles.menuUserEmail}>
                {state.user?.email}
              </div>
            </div>
          </div>
        </div>
        
        <nav className={styles.menuNav}>
          {allMenuItems.map((item) => (
            <button
              key={item.id}
              className={styles.menuItem}
              onClick={item.onClick}
            >
              <span className={styles.menuItemIcon}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
};

export default SideMenu;