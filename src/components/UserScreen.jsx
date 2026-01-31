import './UserScreenModal.css';
import { useState, useRef } from 'react'

export default function UserScreen({ snacks, onDecreaseStock, currentCompanyName, onLogout, setLoader }) {
  const [cart, setCart] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showToast, setShowToast] = useState(false)
  const toastTimeout = useRef(null)

  // Send cart data to backend API
  const handleCheckout = async (cartItemsArg) => {
    if (cartItemsArg.length === 0) return;
    const userId = parseInt(localStorage.getItem('userId')) || 1;
    const companyId = parseInt(localStorage.getItem('userCompanyId')) || 1;
    const payload = cartItemsArg.map(item => ({
      userId,
      snackId: item.id,
      companyId,
      quantity: item.cartQuantity,
      totalPrice: item.price * item.cartQuantity
    }));
    try {
      if (setLoader) setLoader(true);
      const response = await fetch('https://forkandflamesapi.onrender.com/api/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.status === 200) {
        setSuccessMessage('Successfully purchased!');
        setShowModal(false);
        setShowToast(true);
        if (toastTimeout.current) clearTimeout(toastTimeout.current);
        toastTimeout.current = setTimeout(() => setShowToast(false), 2500);
        cartItemsArg.forEach(item => handleBuy(item.id));
      } else {
        const errorText = await response.text();
        setSuccessMessage('Purchase failed: ' + errorText);
      }
    } catch (err) {
      setSuccessMessage('Purchase failed: ' + err.message);
    } finally {
      if (setLoader) setLoader(false);
    }
    // Message will be shown to user, do not clear immediately
  }


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
      {showModal && (
        <div className="usm-modal-overlay">
          <div className="usm-modal-box">
            <h3 className="usm-modal-title">Confirm Purchase</h3>
            {cartItems.length === 0 ? (
              <div className="usm-modal-text">No items in cart.</div>
            ) : (
              <ul className="usm-modal-list">
                {cartItems.map(item => (
                  <li key={item.id} className="usm-modal-item">{item.cartQuantity}x {item.name} (${item.price * item.cartQuantity})</li>
                ))}
              </ul>
            )}
            <div className="usm-modal-total">Total: ${calculateTotal()}</div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button
                className="buy-btn"
                disabled={cartItems.length === 0}
                onClick={async () => {
                  await handleCheckout(cartItems);
                }}
              >Confirm Buy</button>
            </div>
          </div>
        </div>
      )}
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ color: '#fff', margin: 0 }}>👤 {currentCompanyName}</h2>
      </div>
      <input
        type="text"
        placeholder="Search snacks..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        style={{ marginBottom: '20px', width: '100%', padding: '8px' }}
      />
      {/* Toast popup for success message */}
      {showToast && successMessage.startsWith('Successfully purchased') && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: '#38a169',
          color: '#fff',
          padding: '18px 36px',
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(56,161,105,0.18)',
          zIndex: 9999,
          fontWeight: 600,
          fontSize: 18,
          textAlign: 'center',
          minWidth: 220
        }}>
          {successMessage}
        </div>
      )}
      <div className="snacks-grid">
        {filteredSnacks.length === 0 ? (
          <div style={{ color: '#fff' }}>No snacks available.</div>
        ) : (
          filteredSnacks.map(snack => (
            <div key={snack.id} className="user-snack-card">
              <div className="user-snack-info">
                <h3 className="user-snack-name">{snack.name}</h3>
                <div className="user-snack-price">${snack.price}</div>
                <div className="quantity-selector">
                  <button
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(snack.id, (cart[snack.id] || 0) - 1)}
                    disabled={!cart[snack.id]}
                  >-</button>
                  <input
                    className="quantity-input"
                    type="number"
                    min="0"
                    max={snack.stock}
                    value={cart[snack.id] || ''}
                    onChange={e => handleQuantityChange(snack.id, e.target.value)}
                    placeholder="Qty"
                  />
                  <button
                    className="quantity-btn"
                    onClick={() => handleQuantityChange(snack.id, (cart[snack.id] || 0) + 1)}
                    disabled={cart[snack.id] >= snack.stock}
                  >+</button>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    onClick={() => handleAddToCart(snack.id)}
                    disabled={snack.stock === 0}
                    className="btn btn-secondary"
                  >Add to Cart</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="cart-summary" style={{ marginTop: '20px', color: '#fff' }}>
        <h4 style={{ color: '#000' }}>Cart Summary</h4>
        {cartItems.length === 0 ? (
          <div style={{ color: '#000' }}>No items in cart.</div>
        ) : (
          <ul style={{ color: '#000' }}>
            {cartItems.map(item => (
              <li key={item.id} style={{ color: '#000' }}>{item.cartQuantity}x {item.name} (${item.price * item.cartQuantity})</li>
            ))}
          </ul>
        )}
        <div style={{ color: '#000' }}>Total: ${calculateTotal()}</div>
        <button
          className="buy-btn"
          style={{ marginTop: '16px', fontSize: '18px', width: '100%' }}
          disabled={cartItems.length === 0}
          onClick={() => setShowModal(true)}
        >Buy</button>
      </div>
    </div>
  )
}
