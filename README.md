# Snack App - React Vite Application

A mobile-friendly snack shop application with admin and user interfaces built with React and Vite.

## Features

### 👤 User Screen
- Browse all available snacks with search functionality
- View snack prices and remaining stock
- Add snacks to cart with quantity selector
- Track cart items and total price
- Buy snacks and automatically decrease stock
- Mobile responsive design
- Real-time stock status (Available, Low Stock, Out of Stock)

### ⚙️ Admin Screen
- Add new snacks with image upload
- Set snack name, price, and stock quantity
- Add description for each snack
- View all snacks with image previews
- Delete snacks from inventory
- All data persists using browser localStorage

## Project Structure

```
snack-app/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── styles.css
    └── components/
        ├── AdminScreen.jsx
        └── UserScreen.jsx
```

## Installation & Setup

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   The app will automatically open at `http://localhost:5173`

## How to Use

### Admin Panel
1. Click the **⚙️ Admin** button in the header
2. Fill in the snack details:
   - Name of the snack
   - Price (in dollars)
   - Stock quantity
   - Description (optional)
   - Upload product image
3. Click **➕ Add Snack** to add it to inventory
4. View all added snacks below the form
5. Click **🗑️ Delete** to remove a snack

### User Panel
1. Click the **👤 User** button in the header (default view)
2. Browse available snacks
3. Use the search bar to find specific snacks
4. Select quantity using the +/- buttons or input field
5. Click **🛒 Buy Now** to purchase
6. View your cart summary at the bottom
7. Stock automatically decreases after purchase

## Key Features

✨ **Mobile Responsive** - Works seamlessly on desktop, tablet, and mobile devices

💾 **Data Persistence** - All snack data is saved in browser localStorage

🖼️ **Image Upload** - Add product images directly from your device

🔍 **Search** - Quickly find snacks by name

📊 **Stock Management** - Real-time inventory tracking with visual status indicators

🛒 **Shopping Cart** - View items and total price before checkout

## Technology Stack

- **React 18.2** - UI library
- **Vite 5** - Build tool and dev server
- **CSS3** - Styling with responsive design

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` folder.

## Preview Production Build

```bash
npm run preview
```

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Notes

- All data is stored locally in your browser. Clearing browser data will reset the app.
- Images are stored as base64 data URLs in localStorage.
- The app works offline once loaded.

## Future Enhancements

- Add user authentication
- Implement backend API integration
- Add payment processing
- Order history tracking
- Admin analytics dashboard
- Product categories
- User reviews and ratings
