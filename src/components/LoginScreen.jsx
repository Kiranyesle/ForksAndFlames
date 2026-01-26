import { useState } from 'react'

export default function LoginScreen({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Demo credentials - in production, this should be sent to a backend
  const DEMO_ADMIN = {
    email: 'admin@gathergraze.com',
    password: 'admin123'
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Simulate API call delay
    setTimeout(() => {
      if (email === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
        // Store admin token in localStorage with proper format
        localStorage.setItem('adminToken', 'true')
        localStorage.setItem('adminEmail', email)
        onLoginSuccess()
      } else {
        setError('Invalid email or password. Try admin@gathergraze.com / admin123')
      }
      setIsLoading(false)
    }, 500)
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>🔐 Admin Login</h1>
          <p>GATHER & GRAZE Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error">{error}</div>}

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

        <div className="login-footer">
          <p className="demo-credentials">
            <strong>Demo Credentials:</strong><br/>
            Email: admin@gathergraze.com<br/>
            Password: admin123
          </p>
        </div>
      </div>
    </div>
  )
}
