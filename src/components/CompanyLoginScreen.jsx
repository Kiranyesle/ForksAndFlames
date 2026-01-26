import { useState } from 'react'

export default function CompanyLoginScreen({ companies, onLoginSuccess }) {
  const [selectedCompanyId, setSelectedCompanyId] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const DEMO_CREDENTIALS = {
    email: 'admin@gathergraze.com',
    password: 'admin123'
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!selectedCompanyId) {
      setError('Please select a company')
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      if (email === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password) {
        // Store company selection in localStorage
        localStorage.setItem('userCompanyId', selectedCompanyId)
        localStorage.setItem('userEmail', email)
        const company = companies.find(c => c.id === parseInt(selectedCompanyId))
        localStorage.setItem('userCompanyName', company?.name || '')
        onLoginSuccess()
      } else {
        setError('Invalid email or password. Try admin@gathergraze.com / admin123')
      }
      setIsLoading(false)
    }, 500)
  }

  return (
    <div className="company-login-container">
      <div className="company-login-box">
        <div className="login-header">
          <h1>👤 Welcome to GATHER & GRAZE</h1>
          <p>Select a vendor and start gathering</p>
        </div>

        {companies.length === 0 ? (
          <div className="empty-state">
            <p>No companies available yet. Please ask the admin to add a company!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="login-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="company">Select Company *</label>
              <select
                id="company"
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                required
              >
                <option value="">-- Choose a company --</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gathergraze.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary login-button"
              disabled={isLoading}
            >
              {isLoading ? '🔄 Logging in...' : '🔓 Login'}
            </button>
          </form>
        )}

        <div className="login-footer">
          <p className="demo-credentials">
            <strong>Demo Credentials:</strong><br />
            Email: admin@gathergraze.com<br />
            Password: admin123
          </p>
        </div>
      </div>
    </div>
  )
}
