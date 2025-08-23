// データアイテム操作用カスタムフック
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  getDataItems,
  createDataItem,
  updateDataItem,
  deleteDataItem,
  subscribeToDataItems,
} from '../services/dataService'

// Vue.js経験者向け解説:
// - カスタムフック: Vueのcomposablesと同様の再利用可能なロジック
// - useCallback: Vue 3のcomputedのようにメモ化して再計算を防ぐ
// - リアルタイム同期: VueのwebSocket監視のような機能

export const useDataItems = () => {
  const { state: authState } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // データ一覧を取得
  const fetchItems = useCallback(async () => {
    if (!authState.user) return

    setLoading(true)
    setError(null)
    try {
      const fetchedItems = await getDataItems(authState.user.uid)
      setItems(fetchedItems)
    } catch (err) {
      setError(err.message || 'データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [authState.user])

  // アイテムを作成
  const createItem = useCallback(async (itemData: CreateDataItem) => {
    if (!authState.user) {
      setError('ユーザーが認証されていません')
      return
    }

    try {
      setError(null)
      await createDataItem(authState.user.uid, itemData)
      // リアルタイム同期を使用している場合は自動更新される
      // そうでない場合は手動で再取得
      await fetchItems()
    } catch (err) {
      setError(err.message || 'データの作成に失敗しました')
      throw err
    }
  }, [authState.user, fetchItems])

  // アイテムを更新
  const updateItem = useCallback(async (itemId: string, updates: UpdateDataItem) => {
    try {
      setError(null)
      await updateDataItem(itemId, updates)
      await fetchItems()
    } catch (err) {
      setError(err.message || 'データの更新に失敗しました')
      throw err
    }
  }, [fetchItems])

  // アイテムを削除
  const deleteItem = useCallback(async (itemId: string) => {
    try {
      setError(null)
      await deleteDataItem(itemId)
      await fetchItems()
    } catch (err) {
      setError(err.message || 'データの削除に失敗しました')
      throw err
    }
  }, [fetchItems])

  // 初回データ取得
  useEffect(() => {
    if (authState.user && !authState.loading) {
      fetchItems()
    }
  }, [authState.user, authState.loading, fetchItems])

  // リアルタイム同期の設定（オプション）
  useEffect(() => {
    if (!authState.user) return

    const unsubscribe = subscribeToDataItems(authState.user.uid, (updatedItems) => {
      setItems(updatedItems)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [authState.user])

  return {
    items,
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
    refetch: fetchItems,
    clearError: () => setError(null),
  }
}