import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { supabase } from '../supabaseClient'
import PropertyCard from '../components/PropertyCard'
import PropertyForm from '../components/PropertyForm'

function PropertiesPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchProperties()
  }, [])

  // 物件一覧を取得する（RLSにより自分が登録した物件のみ返る）
  async function fetchProperties() {
    setLoading(true)
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setErrorMessage('物件情報の取得に失敗しました。')
    } else {
      setProperties(data)
      setErrorMessage('')
    }
    setLoading(false)
  }

  // 物件を新規登録する
  async function handleCreate(values) {
    const { error } = await supabase.from('properties').insert({ ...values, user_id: user.id })

    if (error) {
      setErrorMessage('物件の登録に失敗しました。')
      return
    }

    setIsCreating(false)
    await fetchProperties()
  }

  // 物件を更新する
  async function handleUpdate(id, values) {
    const { error } = await supabase.from('properties').update(values).eq('id', id)

    if (error) {
      setErrorMessage('物件の更新に失敗しました。')
      return
    }

    setEditingId(null)
    await fetchProperties()
  }

  // 物件を削除する
  async function handleDelete(id) {
    const confirmed = window.confirm('この物件を削除しますか？')
    if (!confirmed) return

    const { error } = await supabase.from('properties').delete().eq('id', id)

    if (error) {
      setErrorMessage('物件の削除に失敗しました。')
      return
    }

    await fetchProperties()
  }

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="properties-page">
      <header className="properties-header">
        <div>
          <h1>物件一覧</h1>
          <p className="logged-in-user">{user?.email} でログイン中</p>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          ログアウト
        </button>
      </header>

      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {isCreating ? (
        <PropertyForm
          submitLabel="登録する"
          onSubmit={handleCreate}
          onCancel={() => setIsCreating(false)}
        />
      ) : (
        <button className="new-property-button" onClick={() => setIsCreating(true)}>
          物件を新規登録
        </button>
      )}

      {loading ? (
        <p className="loading-message">読み込み中...</p>
      ) : (
        <div className="property-list">
          {properties.map((property) =>
            editingId === property.id ? (
              <PropertyForm
                key={property.id}
                initialValues={property}
                submitLabel="更新する"
                onSubmit={(values) => handleUpdate(property.id, values)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <PropertyCard
                key={property.id}
                property={property}
                onEdit={() => setEditingId(property.id)}
                onDelete={() => handleDelete(property.id)}
              />
            ),
          )}
        </div>
      )}
    </div>
  )
}

export default PropertiesPage
