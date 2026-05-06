import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import { RootState, AppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { fetchWishlist } from '../../store/slices/wishlistSlice';
import { useCurrency, SUPPORTED_CURRENCIES, CURRENCY_SYMBOLS } from '../../context/CurrencyContext';
import styles from './Header.module.css';
import SearchBar from '../common/SearchBar';
import NotificationDropdown from './NotificationDropdown';

const Header = () => {
    const { userInfo } = useSelector((state: RootState) => state.auth);
    const { cartItems } = useSelector((state: RootState) => state.cart);
    const { items: wishlistItems } = useSelector((state: RootState) => state.wishlist);
    const { currency, setCurrency } = useCurrency();
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    // Keep wishlist count in sync whenever user is logged in
    useEffect(() => {
        if (userInfo) {
            dispatch(fetchWishlist());
        }
    }, [userInfo, dispatch]);

    const logoutHandler = () => {
        dispatch(logout());
        navigate('/login');
    };

    const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
    const wishlistCount = wishlistItems.length;
    const canUseCart = userInfo?.role !== 'seller' && userInfo?.role !== 'admin';
    const canUseWishlist = userInfo?.role === 'buyer';

    return (
        <header className={styles.header}>
            <div className={`container ${styles.navbar}`}>
                <Link 
                    to={userInfo?.role === 'admin' ? '/admin/dashboard' : userInfo?.role === 'seller' ? '/seller/dashboard' : '/shop'} 
                    className={styles.logo}
                >
                    <span className={styles.logoMark}>M</span>
                    <span className={styles.logoText}>Martify</span>
                </Link>

                <div className={styles.searchWrap}>
                    <SearchBar />
                </div>

                {/* Currency Selector */}
                <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    title="Select currency"
                    className={styles.currencySelect}
                >
                    {SUPPORTED_CURRENCIES.map((code) => (
                        <option key={code} value={code}>
                            {CURRENCY_SYMBOLS[code]} {code}
                        </option>
                    ))}
                </select>

                <nav className={styles.nav}>

                    {/* Notifications (Show for logged-in users) */}
                    {userInfo && <NotificationDropdown />}

                    {/* Wishlist Icon — only for buyers */}
                    {canUseWishlist && (
                        <Link
                            to="/wishlist"
                            title="My Wishlist"
                            className={styles.iconLink}
                        >
                            <FiHeart size={20} style={{ strokeWidth: 2 }} />
                            {wishlistCount > 0 && (
                                <span className={styles.iconBadge}>
                                    {wishlistCount > 99 ? '99+' : wishlistCount}
                                </span>
                            )}
                        </Link>
                    )}

                    {/* Cart Icon */}
                    {canUseCart && (
                        <Link
                            to="/cart"
                            title="My Cart"
                            className={`${styles.navLink} ${styles.cartLink}`}
                        >
                            <FiShoppingCart size={20} style={{ strokeWidth: 2 }} />
                            Cart
                            {cartCount > 0 && (
                                <span className={styles.iconBadge}>
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    )}

                    {userInfo ? (
                        <div className={styles.userControls}>
                            <span className={styles.greeting}>Hi, {userInfo.role === 'seller' ? (userInfo.shopName || userInfo.name) : userInfo.name}</span>
                            {userInfo.role === 'admin' && (
                                <>
                                    <Link to="/admin/dashboard" className={styles.navLink}>Admin Panel</Link>
                                    <Link to="/admin/users" className={styles.navLink}>Users</Link>
                                </>
                            )}
                            {userInfo.role === 'seller' && (
                                <>
                                    <Link to="/seller/dashboard" className={styles.navLink}>Vendor Hub</Link>
                                    <Link to="/seller/products" className={styles.navLink}>My Products</Link>
                                    <Link to="/seller/coupons" className={styles.navLink}>Coupons</Link>
                                </>
                            )}
                            {userInfo.role === 'buyer' && (
                                <Link to="/dashboard" className={styles.navLink}>My Account</Link>
                            )}
                            <button
                                onClick={logoutHandler}
                                className={styles.logoutBtn}
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className={styles.authControls}>
                            <Link to="/login" className={styles.navLink}>Sign In</Link>
                            <Link to="/register" className={styles.registerBtn}>Register</Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;

