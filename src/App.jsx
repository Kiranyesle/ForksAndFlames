// Snack API utility functions
async function fetchSnacks(companyId) {
  console.log('Calling snack API for companyId:', companyId);
  const res = await fetch(`${API_BASE}/snacks?companyId=${companyId}`);
  const snacks = await res.json();
  console.log('Snack API response:', snacks);
  return snacks || [];
}

async function addSnackAPI(snack, companyId) {
  // Send companyId as query parameter
  const res = await fetch(`${API_BASE}/snacks?companyId=${companyId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(snack)
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
import PurchaseDataScreen from './components/PurchaseDataScreen'
import UserScreen from './components/UserScreen'
import LoginScreen from './components/LoginScreen'
import CompanyManagement from './components/CompanyManagement'
import CompanyLoginScreen from './components/CompanyLoginScreen'

function App() {
  const [currentScreen, setCurrentScreen] = useState('user')
  const [adminTab, setAdminTab] = useState('manage');
  const [companies, setCompanies] = useState([])
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [selectedCompanyId, setSelectedCompanyId] = useState(null)
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)
  const [userCompanyId, setUserCompanyId] = useState(null)
  const [loader, setLoader] = useState(false);

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
      // Restore selectedCompanyId for admin
      const savedCompanyId = localStorage.getItem('selectedCompanyId');
      if (savedCompanyId) {
        setSelectedCompanyId(parseInt(savedCompanyId));
      }
    } else {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminEmail');
      setIsAdminLoggedIn(false);
      setSelectedCompanyId(null);
      localStorage.removeItem('selectedCompanyId');
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
    const companyIdToUse = snack.companyId || selectedCompanyId;
    console.log('Adding snack with payload:', snack, 'companyId:', companyIdToUse);
    const newSnack = await addSnackAPI(snack, companyIdToUse);
    console.log('New snack returned from API:', newSnack);
    setCompanies(companies.map(company => {
      if (company.id === companyIdToUse) {
        // If API returns an array, use it; if object, append
        let snacksArray = Array.isArray(newSnack) ? newSnack : [...(company.snacks || []), newSnack];
        return { ...company, snacks: snacksArray };
      }
      return company;
    }));
    // Refresh snack and company list after adding
    if (companyIdToUse) {
      fetchSnacks(companyIdToUse).then(snacks => {
        console.log('Fetched snacks after add:', snacks);
        setSnacksToShow(snacks);
      });
      fetchCompanies().then(companies => {
        console.log('Fetched companies after add:', companies);
        setCompanies(companies);
      });
    }
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
    const company = companies.find(company => company.id === userCompanyId);
    if (!company || !Array.isArray(company.snacks)) return;
    const snack = company.snacks.find(s => s.id === id);
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
    localStorage.setItem('selectedCompanyId', companyId)
  }

  const handleBackToCompanies = () => {
    setSelectedCompanyId(null)
    localStorage.removeItem('selectedCompanyId')
  }

  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminEmail')
    localStorage.removeItem('selectedCompanyId')
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
    console.log('useEffect triggered. selectedCompanyId:', selectedCompanyId, 'userCompanyId:', userCompanyId);
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
    } else if (isAdminLoggedIn) {
      contentToShow = (
        <>
          <div style={{ display: 'flex', gap: 0, margin: '24px 0 16px 0', borderBottom: '2px solid #1976d2', maxWidth: 700, marginLeft: 'auto', marginRight: 'auto' }}>
            <button
              className={adminTab === 'manage' ? 'btn btn-secondary' : 'btn btn-primary'}
              style={{ borderRadius: '12px 12px 0 0', borderBottom: adminTab === 'manage' ? '2px solid #fff' : '2px solid #1976d2', fontWeight: 600, fontSize: '1.1rem', padding: '10px 32px', background: adminTab === 'manage' ? '#1976d2' : '#fff', color: adminTab === 'manage' ? '#fff' : '#1976d2', borderRight: '1px solid #1976d2', borderLeft: '1px solid #1976d2', borderTop: '1px solid #1976d2', outline: 'none', cursor: 'pointer' }}
              onClick={() => setAdminTab('manage')}
            >
              🏢 Manage Company
            </button>
            <button
              className={adminTab === 'purchase' ? 'btn btn-secondary' : 'btn btn-primary'}
              style={{ borderRadius: '12px 12px 0 0', borderBottom: adminTab === 'purchase' ? '2px solid #fff' : '2px solid #1976d2', fontWeight: 600, fontSize: '1.1rem', padding: '10px 32px', background: adminTab === 'purchase' ? '#1976d2' : '#fff', color: adminTab === 'purchase' ? '#fff' : '#1976d2', borderRight: '1px solid #1976d2', borderTop: '1px solid #1976d2', outline: 'none', cursor: 'pointer' }}
              onClick={() => setAdminTab('purchase')}
            >
              📊 Purchase Data
            </button>
          </div>
          {adminTab === 'purchase' ? (
            <PurchaseDataScreen />
          ) : (
            selectedCompanyId ? (
              <AdminScreen
                snacks={snacksToShow}
                onAddSnack={addSnack}
                onUpdateSnack={updateSnack}
                onDeleteSnack={deleteSnack}
                selectedCompanyId={selectedCompanyId}
                onBack={handleBackToCompanies}
                companies={companies}
              />
            ) : (
              <CompanyManagement
                companies={companies}
                onAddCompany={addCompany}
                onDeleteCompany={deleteCompany}
                onSelectCompany={handleSelectCompany}
              />
            )
          )}
        </>
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
  } else if (!isAdminLoggedIn) {
    // Only show user login/user screen if NOT in admin context
    if (!isUserLoggedIn) {
      contentToShow = <CompanyLoginScreen companies={companies} onLoginSuccess={handleUserLoginSuccess} />
    } else {
      contentToShow = (
        <UserScreen 
          snacks={snacksToShow}
          onDecreaseStock={decreaseStock}
          currentCompanyName={currentCompany?.name || 'Snack Shop'}
          onLogout={isUserLoggedIn ? handleUserLogout : undefined}
          setLoader={setLoader}
        />
      )
    }
  }

  return (
    <div className="app">
      {loader && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.25)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            padding: '32px 48px',
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontSize: 22,
            fontWeight: 600
          }}>
            <span className="loader-spinner" style={{
              width: 40,
              height: 40,
              border: '5px solid #1976d2',
              borderTop: '5px solid #fff',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: 16
            }}></span>
            Loading...
          </div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg);} 100% { transform: rotate(360deg);} }`}</style>
        </div>
      )}
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
          {isUserLoggedIn && !isAdminLoggedIn && (
            <div className="admin-status">
              <button 
                className="btn btn-danger"
                onClick={handleUserLogout}
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
