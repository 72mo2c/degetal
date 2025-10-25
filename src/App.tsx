import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Elements } from '@stripe/react-stripe-js'
import { stripePromise } from './lib/stripe'
import HomePage from './pages/HomePage'
import ProductsPage from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import AccountPage from './pages/AccountPage'
import OrdersPage from './pages/OrdersPage'
import LoginPage from './pages/LoginPage'
import AdminDashboard from './pages/AdminDashboard'
import NotFoundPage from './pages/NotFoundPage'
import Header from './components/Header'
import Footer from './components/Footer'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Elements stripe={stripePromise}>
        <div className="min-h-screen flex flex-col bg-[#FAFAFA]" dir="rtl">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Elements>
    </BrowserRouter>
  )
}

export default App