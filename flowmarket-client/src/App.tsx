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
import { LegalPage } from './pages/docs/LegalPage';

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
          <Route path="/docs/agency-agreement" element={
            <LegalPage
              title="Оферта (Агентский договор)"
              content={`
1. ОБЩИЕ ПОЛОЖЕНИЯ
1.1. Настоящий документ является официальным предложением (публичной офертой) Платформы «MarioFlowers» (далее — Агент) заключить Агентский договор на указанных ниже условиях.
1.2. Продавец (Принципал) — юридическое лицо, ИП или самозанятый, размещающий свои Товары на Платформе.

2. ПРЕДМЕТ ДОГОВОРА
2.1. Агент обязуется за вознаграждение совершать по поручению Принципала юридические и иные действия, связанные с реализацией Товаров Принципала через сайт marioflowers.ru.
2.2. Платформа является витриной (Маркетплейсом). Сделка купли-продажи заключается непосредственно между Покупателем и Продавцом.

3. ФИНАНСОВЫЕ УСЛОВИЯ
3.1. Агентское вознаграждение (Комиссия) составляет 20% от стоимости реализованного Товара.
3.2. Денежные средства поступают на номинальный счет Агента и перечисляются Продавцу (за вычетом комиссии) автоматически после успешного выполнения заказа.
3.3. В случае возврата Товара по вине Продавца, комиссия Агента не возвращается.

4. ОТВЕТСТВЕННОСТЬ СТОРОН
4.1. Продавец несет полную ответственность за качество Товара, соответствие фотографий реальности и своевременную доставку.
4.2. Агент не несет ответственности за убытки Покупателя, возникшие в результате использования Товара.
    `}
            />
          } />
          <Route path="/docs/loyalty-terms" element={
            <LegalPage
              title="Правила Программы лояльности"
              content={`
1. ТЕРМИНЫ И ОПРЕДЕЛЕНИЯ
1.1. Бонус — виртуальная условная единица, начисляемая Покупателю за покупки. 1 Бонус = 1 Рубль РФ.
1.2. Участник — любой зарегистрированный пользователь Платформы.

2. НАЧИСЛЕНИЕ БОНУСОВ
2.1. Базовое начисление: 5% от стоимости фактически оплаченных товаров.
2.2. Бонусы активируются автоматически в момент смены статуса заказа на "Выполнен" (Completed).
2.3. При отмене заказа начисленные за него бонусы аннулируются.

3. СПИСАНИЕ БОНУСОВ
3.1. Участник вправе использовать Бонусы для оплаты части стоимости Заказа.
3.2. Максимальный размер списания — 50% от стоимости товаров в корзине.
3.3. Бонусы нельзя обменять на наличные денежные средства.
3.4. Оплата доставки бонусами не производится (только рубли).

4. СРОК ДЕЙСТВИЯ
4.1. Срок действия бонусов не ограничен (в рамках действия данной редакции Правил).
    `}
            />
          } />

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
