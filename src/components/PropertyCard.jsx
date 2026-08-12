function PropertyCard({ property }) {
  return (
    <div className="property-card">
      <h2 className="property-name">{property.name}</h2>
      <p className="property-rent">家賃: {property.rent.toLocaleString()}円</p>
      <p className="property-area">エリア: {property.area}</p>
    </div>
  )
}

export default PropertyCard
