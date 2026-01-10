import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { CatalogPage } from './pages/catalog/CatalogPage';
import { ProductPage } from './pages/catalog/ProductPage';
import { CheckoutPage } from './pages/checkout/CheckoutPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { ShopPage } from './pages/shop/ShopPage';
import { RequireAuth } from './components/RequireAuth';
import { MainLayout } from './layout/MainLayout';
import { ScrollToTop } from './components/ScrollToTop';

function App() {
  const token = localStorage.getItem('token');

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Все эти страницы будут внутри MainLayout */}
        <Route element={<MainLayout />}>
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/shop/:id" element={<ShopPage />} />
        </Route>

        {/* Если есть токен - идем в каталог, иначе на вход */}
        <Route path="/" element={token ? <Navigate to="/catalog" /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
