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
      {successMessage && (
        <div className="success-message">
          <span>{successMessage}</span>
          <button className="btn btn-primary" onClick={() => setSuccessMessage('')}>✕</button>
        </div>
      )}

      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: '#333', margin: 0 }}>� {currentCompanyName}</h2>
        {onLogout && (
          <button className="btn btn-danger" onClick={onLogout}>
            🚪 Change Company
          </button>
        )}
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredSnacks.length === 0 ? (
        <div className="empty-state">
          <h2>😢 No Items Found</h2>
          <p>{searchTerm ? 'Try searching for something else' : 'No items available yet'}</p>
        </div>
      ) : (
        <div className="snacks-grid">
          {filteredSnacks.map(snack => {
            const cartQuantity = cart[snack.id] || 0
            const isOutOfStock = snack.stock === 0
            const isLowStock = snack.stock > 0 && snack.stock <= 5

            return (
              <div key={snack.id} className="user-snack-card">
                <img src={snack.image} alt={snack.name} className="user-snack-image" />
                <div className="user-snack-info">
                  <h3 className="user-snack-name">{snack.name}</h3>
                  <p className="user-snack-price">${snack.price.toFixed(2)}</p>

                  <div className={`stock-status ${
                    isOutOfStock ? 'stock-out' : isLowStock ? 'stock-low' : 'stock-available'
                  }`}>
                    {isOutOfStock 
                      ? '❌ Out of Stock' 
                      : isLowStock 
                      ? `⚠️ Only ${snack.stock} left!` 
                      : `✅ ${snack.stock} Available`}
                  </div>

                  {snack.description && (
                    <p style={{ fontSize: '14px', color: '#888', marginBottom: '12px' }}>
                      {snack.description}
                    </p>
                  )}

                  <div className="quantity-selector">
                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(snack.id, cartQuantity - 1)}
                      disabled={isOutOfStock}
                    >
                      −
                    </button>
                    <input
                      type="number"
                      className="quantity-input"
                      value={cartQuantity}
                      onChange={(e) => handleQuantityChange(snack.id, e.target.value)}
                      min="0"
                      disabled={isOutOfStock}
                    />
                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(snack.id, cartQuantity + 1)}
                      disabled={isOutOfStock || cartQuantity >= snack.stock}
                    >
                      +
                    </button>
                  </div>

                  <button
                    className="buy-btn"
                    onClick={() => handleBuy(snack.id)}
                    disabled={isOutOfStock || cartQuantity === 0}
                  >
                    {isOutOfStock ? '❌ Out of Stock' : '🛒 Buy Now'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {cartItems.length > 0 && (
        <div className="cart-summary">
          <h3>🛒 Shopping Cart Summary</h3>
          {cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <span className="cart-item-name">{item.name}</span>
              <span className="cart-item-qty">
                {item.cartQuantity}x @ ${item.price.toFixed(2)} = ${(item.cartQuantity * item.price).toFixed(2)}
              </span>
            </div>
          ))}
          <div className="cart-total">
            <span>Total:</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
