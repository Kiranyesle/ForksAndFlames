import { useState } from 'react'

export default function UserScreen({ snacks, onDecreaseStock, currentCompanyName, onLogout }) {
  const [cart, setCart] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const filteredSnacks = snacks.filter(snack =>
    snack.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddToCart = (snackId) => {
    setCart(prev => ({
      ...prev,
      [snackId]: (prev[snackId] || 0) + 1
    }))
  }

  const handleQuantityChange = (snackId, quantity) => {
    const numQuantity = Math.max(0, parseInt(quantity) || 0)
    const snack = snacks.find(s => s.id === snackId)
    
    if (numQuantity > snack.stock) {
      alert(`Only ${snack.stock} items available`)
      return
    }

    if (numQuantity === 0) {
      setCart(prev => {
        const newCart = { ...prev }
        delete newCart[snackId]
        return newCart
      })
    } else {
      setCart(prev => ({
        ...prev,
        [snackId]: numQuantity
      }))
    }
  }

  const handleBuy = (snackId) => {
    const quantity = cart[snackId]
    if (!quantity || quantity <= 0) {
      alert('Please select a quantity first')
      return
    }

    const snack = snacks.find(s => s.id === snackId)
    if (quantity > snack.stock) {
      alert(`Only ${snack.stock} items available`)
      return
    }

    onDecreaseStock(snackId, quantity)
    
    setCart(prev => {
      const newCart = { ...prev }
      delete newCart[snackId]
      return newCart
    })

    setSuccessMessage(`Successfully purchased ${quantity}x ${snack.name}!`)
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const calculateTotal = () => {
    return Object.entries(cart).reduce((total, [snackId, quantity]) => {
      const snack = snacks.find(s => s.id === parseInt(snackId))
      return total + (snack ? snack.price * quantity : 0)
    }, 0)
  }

  const cartItems = Object.entries(cart)
    .filter(([snackId]) => snacks.find(s => s.id === parseInt(snackId)))
    .map(([snackId, quantity]) => ({
      ...snacks.find(s => s.id === parseInt(snackId)),
      cartQuantity: quantity
    }))

  return (
    <div className="user-screen">
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: '#fff', margin: 0 }}>👤</h2>
        {onLogout && (
          <button className="btn btn-danger" onClick={onLogout}>
            🚪 Logout
          </button>
        )}
      </div>
    </div>
  )
}
