import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import HomePage from './components/HomePage';
import { ProductsPage, ProductDetail } from './components/Products';
import ContactPage from './components/Contact';
import { RegisterPage, LoginPage } from './components/Auth';
import VendorRoute from './components/Auth/VendorRoute';
import AccessDenied from './components/Auth/AccessDenied';
import MisProductos from './components/Products/MisProductos';
import { Carrito } from './components/Carrito';
import UserDashboard from './components/UserDashboard';

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<HomePage />} />
            <Route path="/productos" element={<ProductsPage />} />
            <Route path="/productos/:id" element={<ProductDetail />} />
            <Route path="/contacto" element={<ContactPage />} />
            <Route path="/registro" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/carrito" element={<Carrito />} />
            <Route path="/perfil" element={<UserDashboard />} />
            <Route path="/acceso-denegado" element={<AccessDenied />} />
            
            {/* Rutas protegidas para vendedores */}
            <Route element={<VendorRoute />}>
              <Route path="/mis-productos" element={<MisProductos />} />
            </Route>
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
