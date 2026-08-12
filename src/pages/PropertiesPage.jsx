import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import PropertyCard from '../components/PropertyCard'
import { dummyProperties } from '../dummyProperties'

function PropertiesPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

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

      <div className="property-list">
        {dummyProperties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  )
}

export default PropertiesPage
