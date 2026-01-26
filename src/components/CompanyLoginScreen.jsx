import { useState } from 'react'

export default function CompanyLoginScreen({ companies, onLoginSuccess }) {
  const [selectedCompanyId, setSelectedCompanyId] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // ...existing code...

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedCompanyId) {
      setError('Please select a company');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('https://forkandflamesapi.onrender.com/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const user = await res.json();
        if (user.companyId === parseInt(selectedCompanyId)) {
          localStorage.setItem('userCompanyId', selectedCompanyId);
          localStorage.setItem('userEmail', email);
          const company = companies.find(c => c.id === parseInt(selectedCompanyId));
          localStorage.setItem('userCompanyName', company?.name || '');
          onLoginSuccess();
        } else {
          setError('User does not belong to selected company');
        }
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
    setIsLoading(false);
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

        {/* Demo credentials removed */}
      </div>
    </div>
  )
}
