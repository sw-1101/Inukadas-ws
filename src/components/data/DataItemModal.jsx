// データアイテム作成・編集モーダルコンポーネント
import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Box,
  Alert,
} from '@mui/material'

// Vue.js経験者向け解説:
// - Dialog: Vuetifyのv-dialogと同様のモーダル機能
// - formDataの管理: VueのrefやreactiveでフォームState管理と同様
// - バリデーション: VueでいうVeeValidateのような機能を自作


const DataItemModal= ({
  open,
  onClose,
  onSave,
  editItem,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    priority: 'medium',
    completed: false,
  })
  const [error, setError] = useState(null)

  // 編集モードの場合、既存データをフォームに設定
  useEffect(() => {
    if (editItem) {
      setFormData({
        title: editItem.title,
        description: editItem.description,
        category: editItem.category,
        priority: editItem.priority,
        completed: editItem.completed,
      })
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'other',
        priority: 'medium',
        completed: false,
      })
    }
    setError(null)
  }, [editItem, open])

  const handleChange = ( => (
    event: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }))
  }

  const handleCheckboxChange = ( => {
    setFormData(prev => ({
      ...prev,
      completed: event.target.checked,
    }))
  }

  const handleSubmit = async ( => {
    e.preventDefault()
    setError(null)

    // バリデーション
    if (!formData.title.trim()) {
      setError('タイトルは必須です')
      return
    }

    if (!formData.description.trim()) {
      setError('説明は必須です')
      return
    }

    try {
      await onSave(formData)
      onClose()
    } catch ( {
      setError(err.message || '保存に失敗しました')
    }
  }

  const handleClose = () => {
    setError(null)
    onClose()
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      fullScreen={false}
      sx={{
        '& .MuiDialog-paper': {
          margin: { xs: 2, sm: 4 },
          width)', sm: 'auto' },
        },
      }}
    >
      <DialogTitle sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
        {editItem ? 'データアイテムを編集' : '新規データアイテム'}
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            fullWidth
            label="タイトル"
            value={formData.title}
            onChange={handleChange('title')}
            margin="normal"
            required
            autoFocus
          />

          <TextField
            fullWidth
            label="説明"
            value={formData.description}
            onChange={handleChange('description')}
            margin="normal"
            required
            multiline
            rows={3}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>カテゴリ</InputLabel>
            <Select
              value={formData.category}
              onChange={handleChange('category')}
              label="カテゴリ"
            >
              <MenuItem value="work">仕事</MenuItem>
              <MenuItem value="personal">個人</MenuItem>
              <MenuItem value="study">勉強</MenuItem>
              <MenuItem value="other">その他</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal">
            <InputLabel>優先度</InputLabel>
            <Select
              value={formData.priority}
              onChange={handleChange('priority')}
              label="優先度"
            >
              <MenuItem value="high">高</MenuItem>
              <MenuItem value="medium">中</MenuItem>
              <MenuItem value="low">低</MenuItem>
            </Select>
          </FormControl>

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.completed}
                onChange={handleCheckboxChange}
              />
            }
            label="完了済み"
            sx={{ mt: 1 }}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          キャンセル
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
        >
          {loading ? '保存中...' : '保存'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DataItemModal