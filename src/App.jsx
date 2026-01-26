// Snack API utility functions
async function fetchSnacks(companyId) {
  const res = await fetch(`${API_BASE}/companies/${companyId}`);
  const company = await res.json();
  return company.snacks || [];
}

async function addSnackAPI(snack, companyId) {
  // Attach company reference
  const res = await fetch(`${API_BASE}/snacks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...snack, company: { id: companyId } })
  });
  return res.json();
}

async function updateSnackAPI(id, snack) {
  const res = await fetch(`${API_BASE}/snacks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(snack)
  });
  return res.json();
}

async function deleteSnackAPI(id) {
  await fetch(`${API_BASE}/snacks/${id}`, { method: 'DELETE' });
}
import { useState, useEffect } from 'react'

// API utility functions
const API_BASE = 'https://forkandflamesapi.onrender.com/api';

async function fetchCompanies() {
  const res = await fetch(`${API_BASE}/companies`);
  return res.json();
}

async function addCompanyAPI(company) {
  const res = await fetch(`${API_BASE}/companies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(company)
  });
  return res.json();
}

async function deleteCompanyAPI(id) {
  await fetch(`${API_BASE}/companies/${id}`, { method: 'DELETE' });
}
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
    // Fetch companies from backend
    fetchCompanies().then(setCompanies);

    // Check if admin is already logged in
    const adminToken = localStorage.getItem('adminToken');
    const savedAdminEmail = localStorage.getItem('adminEmail');
    if (adminToken === 'true' && savedAdminEmail) {
      setIsAdminLoggedIn(true);
      setAdminEmail(savedAdminEmail);
    } else {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminEmail');
      setIsAdminLoggedIn(false);
    }

    // Check if user is logged into a company
    const userCompanyId = localStorage.getItem('userCompanyId');
    const userEmail = localStorage.getItem('userEmail');
    if (userCompanyId && userEmail) {
      setIsUserLoggedIn(true);
      setUserCompanyId(parseInt(userCompanyId));
    } else {
      localStorage.removeItem('userCompanyId');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userCompanyName');
      setIsUserLoggedIn(false);
    }
  }, []);

  // Remove localStorage sync for companies

  const addSnack = async (snack) => {
    const newSnack = await addSnackAPI(snack, selectedCompanyId);
    setCompanies(companies.map(company =>
      company.id === selectedCompanyId
        ? { ...company, snacks: [...company.snacks, newSnack] }
        : company
    ));
  }

  const updateSnack = async (id, updatedSnack) => {
    const updated = await updateSnackAPI(id, updatedSnack);
    setCompanies(companies.map(company =>
      company.id === selectedCompanyId
        ? {
            ...company,
            snacks: company.snacks.map(snack =>
              snack.id === id ? updated : snack
            )
          }
        : company
    ));
  }

  const deleteSnack = async (id) => {
    await deleteSnackAPI(id);
    setCompanies(companies.map(company =>
      company.id === selectedCompanyId
        ? {
            ...company,
            snacks: company.snacks.filter(snack => snack.id !== id)
          }
        : company
    ));
  }

  const decreaseStock = async (id, quantity) => {
    const snack = companies
      .find(company => company.id === userCompanyId)
      ?.snacks.find(s => s.id === id);
    if (snack) {
      const updated = await updateSnackAPI(id, {
        ...snack,
        stock: Math.max(0, snack.stock - quantity)
      });
      setCompanies(companies.map(company =>
        company.id === userCompanyId
          ? {
              ...company,
              snacks: company.snacks.map(s => s.id === id ? updated : s)
            }
          : company
      ));
    }
  }

  const addCompany = async (company) => {
    const newCompany = await addCompanyAPI(company);
    setCompanies([...companies, newCompany]);
  }

  const deleteCompany = async (id) => {
    await deleteCompanyAPI(id);
    setCompanies(companies.filter(company => company.id !== id));
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

  const [snacksToShow, setSnacksToShow] = useState([]);

  useEffect(() => {
    const companyId = selectedCompanyId || userCompanyId;
    if (companyId) {
      fetchSnacks(companyId).then(setSnacksToShow);
    } else {
      setSnacksToShow([]);
    }
  }, [selectedCompanyId, userCompanyId, companies]);

  const currentCompany = companies.find(c => c.id === selectedCompanyId || c.id === userCompanyId);

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
          {(!isUserLoggedIn && !isAdminLoggedIn) && (
            <>
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
            </>
          )}
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
