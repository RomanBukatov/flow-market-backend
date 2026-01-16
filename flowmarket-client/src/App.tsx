import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { CatalogPage } from './pages/catalog/CatalogPage';
import { ProductPage } from './pages/catalog/ProductPage';
import { CheckoutPage } from './pages/checkout/CheckoutPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { ShopPage } from './pages/shop/ShopPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { RequireAuth } from './components/RequireAuth';
import { MainLayout } from './layout/MainLayout';
import { ScrollToTop } from './components/ScrollToTop';
import { LegalPageWrapper } from './pages/docs/LegalPage';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<MainLayout />}>
          {/* КАТАЛОГ И ТОВАР ДОЛЖНЫ БЫТЬ ОТКРЫТЫ ВСЕМ */}
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/shop/:id" element={<ShopPage />} />
          <Route path="/docs/:type" element={<LegalPageWrapper />} />

          {/* ТОЛЬКО ЭТИ СТРАНИЦЫ ПОД ЗАМКОМ */}
          <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="/checkout" element={<RequireAuth><CheckoutPage /></RequireAuth>} />
        </Route>

        {/* По умолчанию всегда ведем в КАТАЛОГ, а не на логин */}
        <Route path="/" element={<Navigate to="/catalog" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
