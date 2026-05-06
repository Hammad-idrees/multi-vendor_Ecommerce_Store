import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/shop/HomePage';
import ProductPage from './pages/shop/ProductPage';
import ProductListPage from './pages/shop/ProductListPage';
import CartPage from './pages/shop/CartPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import CheckoutPage from './pages/shop/CheckoutPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';
import SellerRoute from './components/auth/SellerRoute';
import ProductManagementPage from './pages/admin/ProductManagementPage';
import SellerDashboardPage from './pages/seller/SellerDashboardPage';
import UserDashboardPage from './pages/user/UserDashboardPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import CategoryPage from './pages/shop/CategoryPage';
import Sidebar from './components/layout/Sidebar';
import AIAssistant from './components/common/AIAssistant';
import NotificationListener from './components/layout/NotificationListener';
import ComparisonBar from './components/layout/ComparisonBar';
import UserDetailsPage from './pages/user/UserDetailsPage';
import OrderDetailsPage from './pages/user/OrderDetailsPage';
import OrdersPage from './pages/user/OrdersPage';
import VendorPage from './pages/seller/VendorPage';
import VendorProductsPage from './pages/seller/VendorProductsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import WishlistPage from './pages/user/WishlistPage';
import SellerOrdersPage from './pages/seller/SellerOrdersPage';
import SellerCouponsPage from './pages/seller/SellerCouponsPage';
import ComparisonPage from './pages/shop/ComparisonPage';

function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
                {/* ─── STANDALONE AUTH ROUTES (no header/sidebar/footer) ─── */}
                <Route path="/" element={<LoginPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* ─── MAIN SHOP ROUTES (with header/sidebar/footer) ─── */}
                <Route path="/*" element={<ShopLayout />} />
            </Routes>
        </Router>
    );
}

/** Full shop layout with header, sidebar, footer */
function ShopLayout() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <NotificationListener />
            <ComparisonBar />
            <div className="app-body">
                <Sidebar />
                <main className="main-content">
                    <Routes>
                        <Route path="/shop" element={<HomePage />} />
                        <Route path="/search" element={<ProductListPage />} />
                        <Route path="/category/:categoryId" element={<CategoryPage />} />
                        <Route path="/vendor/:id" element={<VendorPage />} />
                        <Route path="/product/:id" element={<ProductPage />} />
                        <Route path="/compare" element={<ComparisonPage />} />
                        <Route path="/cart/:id?" element={<CartPage />} />
                        <Route path="/user-details" element={<UserDetailsPage />} />

                        {/* Protected Routes */}
                        <Route element={<ProtectedRoute />}>
                            <Route path="/dashboard" element={<UserDashboardPage />} />
                            <Route path="/wishlist" element={<WishlistPage />} />
                            <Route path="/checkout" element={<CheckoutPage />} />
                            <Route path="/orders" element={<OrdersPage />} />
                            <Route path="/order/:id" element={<OrderDetailsPage />} />
                        </Route>

                        {/* Admin Routes */}
                        <Route element={<AdminRoute />}>
                            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                            <Route path="/admin/products" element={<ProductManagementPage />} />
                            <Route path="/admin/users" element={<AdminUsersPage />} />
                        </Route>

                        {/* Seller Routes */}
                        <Route element={<SellerRoute />}>
                            <Route path="/seller/dashboard" element={<SellerDashboardPage />} />
                            <Route path="/seller/products" element={<VendorProductsPage />} />
                            <Route path="/seller/orders" element={<SellerOrdersPage />} />
                            <Route path="/seller/coupons" element={<SellerCouponsPage />} />
                        </Route>
                    </Routes>
                </main>
            </div>
            <AIAssistant />
            <Footer />
        </div>
    );
}

export default App;
