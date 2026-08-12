function PropertyCard({ property, onEdit, onDelete }) {
  return (
    <div className="property-card">
      <h2 className="property-name">{property.name}</h2>
      <p className="property-rent">家賃: {property.rent.toLocaleString()}円</p>
      <p className="property-area">エリア: {property.area}</p>
      <p className="property-layout">間取り: {property.layout}</p>
      <div className="property-card-actions">
        <button className="edit-button" onClick={onEdit}>
          編集
        </button>
        <button className="delete-button" onClick={onDelete}>
          削除
        </button>
      </div>
    </div>
  )
}

export default PropertyCard
