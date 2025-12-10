# Printing Etc - Professional Printing Services Website

A modern, full-featured e-commerce website for a printing shop built with React and Vite. Customers can browse products, customize print options, add items to cart, and complete orders with credit card payment.

## Features

### 🛍️ Product Catalog

- Browse printing products (business cards, flyers, brochures, posters, etc.)
- View detailed product information
- Customize options (paper type, quantity, turnaround time)
- Real-time price calculation

### 🛒 Shopping Cart

- Add items to cart with customized options
- View cart summary
- Update or remove items
- Persistent cart storage (localStorage)

### 💳 Checkout & Payment

- Secure checkout process
- Credit card form validation
- Support for Visa, Mastercard, Amex, Discover
- Real-time card number formatting
- Billing address collection

### 👤 User Authentication

- User registration and login
- Protected routes for authenticated users
- JWT token-based authentication
- Profile page with order history

### 🎨 Design

- BEM (Block Element Modifier) methodology for CSS
- Responsive design for mobile and desktop
- Modern, professional UI
- Smooth transitions and hover effects

## Project Structure

```
printing_etc/
├── src/
│   ├── components/
│   │   ├── App/                  # Main app component
│   │   ├── Header/               # Navigation header
│   │   ├── Footer/               # Site footer
│   │   ├── Main/                 # Homepage
│   │   ├── ProductGallery/       # Product grid
│   │   ├── ProductCard/          # Individual product card
│   │   ├── ProductDetail/        # Product detail page
│   │   ├── Cart/                 # Shopping cart
│   │   ├── Checkout/             # Checkout with payment
│   │   ├── Profile/              # User profile & orders
│   │   ├── LoginModal/           # Login form
│   │   ├── RegisterModal/        # Registration form
│   │   ├── ModalWithForm/        # Reusable modal component
│   │   └── ProtectedRoute/       # Auth route wrapper
│   ├── contexts/
│   │   ├── CurrentUserContext.jsx   # User state
│   │   └── CartContext.jsx          # Cart state
│   ├── utils/
│   │   ├── api.js                # API calls
│   │   ├── auth.js               # Authentication
│   │   └── constants.js          # App constants
│   ├── vendor/
│   │   ├── normalize.css         # CSS reset
│   │   └── fonts.css             # Font imports
│   ├── index.css                 # Global styles
│   └── main.jsx                  # App entry point
├── db.json                       # Mock database
├── package.json
├── vite.config.js
└── index.html
```

## Installation

1. **Install dependencies:**

   ```bash
   cd printing_etc
   npm install
   ```

2. **Start the development server:**

   ```bash
   npm run dev
   ```

3. **Start the mock backend (in a separate terminal):**

   ```bash
   npx json-server --watch db.json --port 3001
   ```

4. **Open your browser:**
   Navigate to `http://localhost:5173`

## Usage

### Browse Products

- View all available printing products on the homepage
- Click on any product card to see details

### Customize & Order

1. Select paper type, quantity, and turnaround time
2. See real-time price updates
3. Click "Add to Cart"

### Checkout

1. Review items in cart
2. Click "Proceed to Checkout" (requires login)
3. Enter credit card information:
   - Card number (auto-formatted)
   - Cardholder name
   - Expiry date (MM/YY)
   - CVV
4. Enter billing address
5. Click "Place Order"

### User Account

- Register for an account or log in
- View order history in profile
- Track order status

## Credit Card Testing

Use these test card numbers (they pass validation but won't charge):

- Visa: `4111 1111 1111 1111`
- Mastercard: `5500 0000 0000 0004`
- Amex: `3400 0000 0000 009`
- Discover: `6011 0000 0000 0004`

Use any future expiry date and any 3-4 digit CVV.

## BEM Methodology

This project follows BEM (Block Element Modifier) naming convention:

```css
/* Block */
.product-card {
}

/* Element */
.product-card__title {
}
.product-card__image {
}

/* Modifier */
.product-card_featured {
}
.product-card__button_disabled {
}
```

## Technologies Used

- **React 18** - UI library
- **React Router 6** - Client-side routing
- **Vite** - Build tool and dev server
- **CSS3** - Styling with BEM methodology
- **JSON Server** - Mock REST API

## API Endpoints

The mock backend (`db.json`) provides these endpoints:

- `GET /products` - Get all products
- `GET /products/:id` - Get single product
- `POST /signup` - Register user
- `POST /signin` - Login user
- `GET /users/me` - Get current user
- `POST /orders` - Create order
- `GET /orders` - Get user orders

## Future Enhancements

- File upload for custom designs
- Real payment processing integration (Stripe)
- Order tracking with email notifications
- Admin dashboard for order management
- Product reviews and ratings
- Discount codes and promotions
- Multiple shipping addresses
- Saved payment methods

## License

This project is for educational purposes.

## Credits

Created following the structure and patterns from the se_project_react template.
