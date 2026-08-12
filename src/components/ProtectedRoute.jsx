import { Navigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'

// 未ログインの場合はログイン画面にリダイレクトする
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <p className="loading-message">読み込み中...</p>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
