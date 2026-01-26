import { useState } from 'react'

export default function CompanyManagement({ companies, onAddCompany, onDeleteCompany, onSelectCompany }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    logo: ''
  })
  const [logoPreview, setLogoPreview] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          logo: reader.result
        }))
        setLogoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.name || !formData.email) {
      alert('Please fill in all required fields')
      return
    }

    onAddCompany({
      name: formData.name,
      email: formData.email,
      logo: formData.logo
    })

    setFormData({
      name: '',
      email: '',
      logo: ''
    })
    setLogoPreview('')

    setSuccessMessage('Company added successfully!')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this company and all its snacks?')) {
      onDeleteCompany(id)
      setSuccessMessage('Company deleted successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    }
  }

  return (
    <div className="company-management">
      {successMessage && (
        <div className="success-message">
          <span>{successMessage}</span>
          <button className="btn btn-primary" onClick={() => setSuccessMessage('')}>✕</button>
        </div>
      )}

      <div className="form-section">
        <h2>🏢 Add New Company</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Company Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Local Harvest Co."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Company Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="e.g., admin@localharvest.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="logo">Company Logo/Image</label>
            <input
              type="file"
              id="logo"
              name="logo"
              onChange={handleLogoChange}
              accept="image/*"
              className="file-input"
            />
          </div>

          {logoPreview && (
            <div className="image-preview">
              <p>Logo Preview:</p>
              <img src={logoPreview} alt="Preview" />
            </div>
          )}

          <button type="submit" className="btn btn-secondary" style={{ marginTop: '20px' }}>
            🏢 Add Company
          </button>
        </form>
      </div>

      <div className="form-section">
        <h2>📋 Companies List</h2>
        {companies.length === 0 ? (
          <div className="empty-state">
            <p>No companies added yet. Add one to get started!</p>
          </div>
        ) : (
          <div className="companies-grid">
            {companies.map(company => (
              <div key={company.id} className="company-card">
                {company.logo && (
                  <div className="company-logo-container">
                    <img src={company.logo} alt={company.name} className="company-logo" />
                  </div>
                )}
                <div className="company-info">
                  <h3 className="company-name">{company.name}</h3>
                  <p className="company-email">📧 {company.email}</p>
                  <p className="company-snacks">� {company.snacks ? company.snacks.length : 0} items</p>
                  <div className="company-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => onSelectCompany(company.id)}
                    >
                      ⚙️ Manage
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(company.id)}
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
