import React, { useState, useCallback } from 'react'
import classNames from 'classnames'
import styles from './SearchBox.module.css'



const SearchBox= ({
  placeholder = '検索...',
  options = [],
  value = '',
  multiple = false,
  multipleValue = [],
  // width = '100%', // 一時的に未使用
  // size = 'medium', // 一時的に未使用
  disabled = false,
  showFilter = false,
  // loading = false, // 一時的に未使用
  fullWidth = false,
  onSearch,
  onChange,
  onMultipleChange,
  onClear,
  onFilterClick,
}) => {
  const [inputValue, setInputValue] = useState(value)

  const handleInputChange = useCallback((newValue) => {
    setInputValue(newValue)
    onChange?.(newValue)
  }, [onChange])

  const handleSearch = useCallback(() => {
    onSearch?.(inputValue)
  }, [onSearch, inputValue])

  const handleKeyPress = useCallback((event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleSearch()
    }
  }, [handleSearch])

  const handleClear = useCallback(() => {
    setInputValue('')
    onChange?.('')
    onClear?.()
  }, [onChange, onClear])

  // 単一選択の場合
  if (!multiple) {
    return (
      <div className={classNames(
        styles.container,
        fullWidth ? styles.containerFullWidth : styles.containerFixedWidth
      )}>
        <div className={styles.inputContainer}>
          <div className={styles.iconContainer}>
            🔍
          </div>
          
          <input
            type="text"
            className={classNames(
              styles.input,
              styles.inputWithIcon,
              { 
                [styles.inputWithAction]: inputValue || showFilter,
                [styles.error]: false, // エラー状態は未実装
              }
            )}
            placeholder={placeholder}
            value={inputValue}
            disabled={disabled}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          
          <div className={styles.actionContainer}>
            {inputValue && (
              <button
                type="button"
                className={classNames(styles.iconButton, styles.clearButton)}
                onClick={handleClear}
                disabled={disabled}
                aria-label="クリア"
              >
                ✕
              </button>
            )}
            
            {showFilter && (
              <button
                type="button"
                className={classNames(
                  styles.iconButton, 
                  styles.filterButton,
                  { [styles.filterButtonActive]: false } // アクティブ状態は未実装
                )}
                onClick={onFilterClick}
                disabled={disabled}
                aria-label="フィルター"
              >
                🔽
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // 複数選択の場合（簡略化版）
  const selectedOptions = options.filter(option => 
    multipleValue.includes(option.value)
  )
  
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <div className={classNames(
      styles.container,
      fullWidth ? styles.containerFullWidth : styles.containerFixedWidth
    )}>
      {/* 選択されたアイテムの表示 */}
      {selectedOptions.length > 0 && (
        <div className={styles.filtersContainer}>
          {selectedOptions.map(option => (
            <div key={option.value} className={styles.filterChip}>
              {option.label}
              <span 
                className={styles.filterChipRemove}
                onClick={() => {
                  const newValues = multipleValue.filter(v => v !== option.value)
                  onMultipleChange?.(newValues)
                }}
              >
                ×
              </span>
            </div>
          ))}
        </div>
      )}
      
      <div className={styles.inputContainer}>
        <div className={styles.iconContainer}>
          🔍
        </div>
        
        <input
          type="text"
          className={classNames(
            styles.input,
            styles.inputWithIcon,
            { [styles.inputWithAction]: selectedOptions.length > 0 || showFilter }
          )}
          placeholder={selectedOptions.length === 0 ? placeholder : ''}
          value={inputValue}
          disabled={disabled}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
        />
        
        <div className={styles.actionContainer}>
          {selectedOptions.length > 0 && (
            <button
              type="button"
              className={classNames(styles.iconButton, styles.clearButton)}
              onClick={() => {
                onMultipleChange?.([])
                onClear?.()
              }}
              disabled={disabled}
              aria-label="すべてクリア"
            >
              ✕
            </button>
          )}
          
          {showFilter && (
            <button
              type="button"
              className={classNames(styles.iconButton, styles.filterButton)}
              onClick={onFilterClick}
              disabled={disabled}
              aria-label="フィルター"
            >
              🔽
            </button>
          )}
        </div>
      </div>
      
      {/* ドロップダウン */}
      {showDropdown && options.length > 0 && (
        <div className={styles.dropdown}>
          {options
            .filter(option => !inputValue || option.label.toLowerCase().includes(inputValue.toLowerCase()))
            .map(option => (
              <div
                key={option.value}
                className={styles.dropdownItem}
                onClick={() => {
                  if (!multipleValue.includes(option.value)) {
                    onMultipleChange?.([...multipleValue, option.value])
                  }
                  setShowDropdown(false)
                }}
              >
                <div style={{ fontWeight: '500' }}>{option.label}</div>
                {option.category && (
                  <div className={styles.dropdownItemCategory}>
                    {option.category}
                  </div>
                )}
              </div>
            ))
          }
        </div>
      )}
    </div>
  )
}

export default SearchBox