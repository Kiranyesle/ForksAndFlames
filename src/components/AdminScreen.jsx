import { useState } from 'react'

export default function AdminScreen({ snacks, onAddSnack, onUpdateSnack, onDeleteSnack, selectedCompanyId, onBack, companies }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    image: '',
    description: ''
  })
  const [imagePreview, setImagePreview] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const selectedCompany = companies.find(c => c.id === selectedCompanyId)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          image: reader.result
        }))
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.price || !formData.stock || !formData.image) {
      alert('Please fill all fields including an image')
      return
    }

    onAddSnack({
      name: formData.name,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      image: formData.image,
      description: formData.description
    })

    setFormData({
      name: '',
      price: '',
      stock: '',
      image: '',
      description: ''
    })
    setImagePreview('')
    
    setSuccessMessage('Snack added successfully!')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this snack?')) {
      onDeleteSnack(id)
      setSuccessMessage('Snack deleted successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    }
  }

  return (
    <div className="admin-screen">
      {successMessage && (
        <div className="success-message">
          <span>{successMessage}</span>
          <button className="btn btn-primary" onClick={() => setSuccessMessage('')}>✕</button>
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <button className="btn btn-primary" onClick={onBack}>
          ← Back to Companies
        </button>
        <h2 style={{ marginTop: '15px', color: '#333' }}>🏢 {selectedCompany?.name} - Item Management</h2>
      </div>

      <div className="form-section">
        <h2>➕ Add New Item</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Item Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Organic Almonds"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">Price ($) *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="e.g., 2.99"
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="stock">Stock Quantity *</label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={handleInputChange}
              placeholder="e.g., 50"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the item..."
              rows="4"
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">Product Image *</label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleImageChange}
              accept="image/*"
              className="file-input"
              required
            />
          </div>

          {imagePreview && (
            <div className="image-preview">
              <p>Image Preview:</p>
              <img src={imagePreview} alt="Preview" />
            </div>
          )}

          <button type="submit" className="btn btn-secondary" style={{ marginTop: '20px' }}>
            ➕ Add Item
          </button>
        </form>
      </div>

      <div className="form-section">
        <h2>📊 Current Items</h2>
        {snacks.length === 0 ? (
          <div className="empty-state">
            <p>No items added yet. Add one to get started!</p>
          </div>
        ) : (
          <div className="snacks-grid">
            {snacks.map(snack => (
              <div key={snack.id} className="snack-card">
                <img src={snack.image} alt={snack.name} className="snack-image" />
                <div className="snack-info">
                  <h3 className="snack-name">{snack.name}</h3>
                  <p className="snack-price">${snack.price.toFixed(2)}</p>
                  <p className="snack-stock">Stock: <strong>{snack.stock}</strong></p>
                  {snack.description && (
                    <p style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>
                      {snack.description}
                    </p>
                  )}
                  <div className="snack-actions">
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleDelete(snack.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
