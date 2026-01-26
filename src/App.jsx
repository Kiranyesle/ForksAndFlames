import { useState, useEffect } from 'react'
import './styles.css'
import AdminScreen from './components/AdminScreen'
import UserScreen from './components/UserScreen'
import LoginScreen from './components/LoginScreen'
import CompanyManagement from './components/CompanyManagement'
import CompanyLoginScreen from './components/CompanyLoginScreen'

function App() {
  const [currentScreen, setCurrentScreen] = useState('user')
  const [companies, setCompanies] = useState([])
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [selectedCompanyId, setSelectedCompanyId] = useState(null)
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)
  const [userCompanyId, setUserCompanyId] = useState(null)

  // Load companies from localStorage on mount
  useEffect(() => {
    // Clear old single-company snacks data (migration from old system)
    localStorage.removeItem('snacks')

    const savedCompanies = localStorage.getItem('companies')
    if (savedCompanies) {
      try {
        setCompanies(JSON.parse(savedCompanies))
      } catch (e) {
        setCompanies([])
      }
    } else {
      // Initialize with empty company structure
      setCompanies([])
    }

    // Check if admin is already logged in
    const adminToken = localStorage.getItem('adminToken')
    const savedAdminEmail = localStorage.getItem('adminEmail')
    if (adminToken === 'true' && savedAdminEmail) {
      setIsAdminLoggedIn(true)
      setAdminEmail(savedAdminEmail)
    } else {
      // Clear invalid tokens
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminEmail')
      setIsAdminLoggedIn(false)
    }

    // Check if user is logged into a company
    const userCompanyId = localStorage.getItem('userCompanyId')
    const userEmail = localStorage.getItem('userEmail')
    if (userCompanyId && userEmail) {
      setIsUserLoggedIn(true)
      setUserCompanyId(parseInt(userCompanyId))
    } else {
      // Clear invalid user login data
      localStorage.removeItem('userCompanyId')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('userCompanyName')
      setIsUserLoggedIn(false)
    }
  }, [])

  // Save companies to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('companies', JSON.stringify(companies))
  }, [companies])

  const addSnack = (snack) => {
    setCompanies(companies.map(company => 
      company.id === selectedCompanyId
        ? {
            ...company,
            snacks: [
              ...company.snacks,
              {
                id: Date.now(),
                ...snack,
                stock: parseInt(snack.stock) || 0
              }
            ]
          }
        : company
    ))
  }

  const updateSnack = (id, updatedSnack) => {
    setCompanies(companies.map(company =>
      company.id === selectedCompanyId
        ? {
            ...company,
            snacks: company.snacks.map(snack =>
              snack.id === id ? { ...snack, ...updatedSnack } : snack
            )
          }
        : company
    ))
  }

  const deleteSnack = (id) => {
    setCompanies(companies.map(company =>
      company.id === selectedCompanyId
        ? {
            ...company,
            snacks: company.snacks.filter(snack => snack.id !== id)
          }
        : company
    ))
  }

  const decreaseStock = (id, quantity) => {
    setCompanies(companies.map(company =>
      company.id === userCompanyId
        ? {
            ...company,
            snacks: company.snacks.map(snack =>
              snack.id === id
                ? { ...snack, stock: Math.max(0, snack.stock - quantity) }
                : snack
            )
          }
        : company
    ))
  }

  const addCompany = (company) => {
    const newCompany = {
      id: Date.now(),
      ...company,
      snacks: []
    }
    setCompanies([...companies, newCompany])
  }

  const deleteCompany = (id) => {
    setCompanies(companies.filter(company => company.id !== id))
  }

  const handleSelectCompany = (companyId) => {
    setSelectedCompanyId(companyId)
  }

  const handleBackToCompanies = () => {
    setSelectedCompanyId(null)
  }

  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminEmail')
    setIsAdminLoggedIn(false)
    setAdminEmail('')
    setSelectedCompanyId(null)
    setCurrentScreen('user')
  }

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true)
    const email = localStorage.getItem('adminEmail')
    setAdminEmail(email || '')
    setCurrentScreen('admin')
  }

  const handleUserLogout = () => {
    localStorage.removeItem('userCompanyId')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userCompanyName')
    setIsUserLoggedIn(false)
    setUserCompanyId(null)
  }

  const handleUserLoginSuccess = () => {
    setIsUserLoggedIn(true)
    const companyId = localStorage.getItem('userCompanyId')
    setUserCompanyId(parseInt(companyId))
  }

  const currentCompany = companies.find(c => c.id === selectedCompanyId || c.id === userCompanyId)
  const snacksToShow = currentCompany?.snacks || []

  // Determine what content to show
  let contentToShow

  if (currentScreen === 'admin') {
    if (!isAdminLoggedIn) {
      contentToShow = <LoginScreen onLoginSuccess={handleAdminLoginSuccess} />
    } else if (selectedCompanyId) {
      contentToShow = (
        <AdminScreen 
          snacks={snacksToShow}
          onAddSnack={addSnack}
          onUpdateSnack={updateSnack}
          onDeleteSnack={deleteSnack}
          selectedCompanyId={selectedCompanyId}
          onBack={handleBackToCompanies}
          companies={companies}
        />
      )
    } else {
      contentToShow = (
        <CompanyManagement
          companies={companies}
          onAddCompany={addCompany}
          onDeleteCompany={deleteCompany}
          onSelectCompany={handleSelectCompany}
        />
      )
    }
  } else {
    // User screen
    if (!isUserLoggedIn) {
      contentToShow = <CompanyLoginScreen companies={companies} onLoginSuccess={handleUserLoginSuccess} />
    } else {
      contentToShow = (
        <UserScreen 
          snacks={snacksToShow}
          onDecreaseStock={decreaseStock}
          currentCompanyName={currentCompany?.name || 'Snack Shop'}
          onLogout={isUserLoggedIn ? handleUserLogout : undefined}
        />
      )
    }
  }

  return (
    <div className="app">
      <header className="header" style={{ fontFamily: 'Playfair Display, serif' }}>
        <div className="header-left">
          <img src="/logo.jpg" alt="GATHER & GRAZE Logo" className="logo" />
          <h1>GATHER & GRAZE</h1>
        </div>
        <div className="nav-buttons">
          <button 
            className={`btn ${currentScreen === 'user' ? 'btn-secondary' : 'btn-primary'}`}
            onClick={() => {
              setCurrentScreen('user')
              setSelectedCompanyId(null)
              // Clear user login data to show login screen
              localStorage.removeItem('userCompanyId')
              localStorage.removeItem('userEmail')
              localStorage.removeItem('userCompanyName')
              setIsUserLoggedIn(false)
              setUserCompanyId(null)
            }}
          >
            👤 User
          </button>
          <button 
            className={`btn ${currentScreen === 'admin' ? 'btn-secondary' : 'btn-primary'}`}
            onClick={() => {
              setCurrentScreen('admin')
              setSelectedCompanyId(null)
            }}
          >
            ⚙️ Admin
          </button>
          {isAdminLoggedIn && (
            <div className="admin-status">
              <span className="admin-email">👤 {adminEmail}</span>
              <button 
                className="btn btn-danger"
                onClick={handleAdminLogout}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="container">
        {contentToShow}
      </div>
    </div>
  )
}

export default App
