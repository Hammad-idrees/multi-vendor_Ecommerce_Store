import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
    FiShoppingBag, FiHeart, FiSettings, FiMapPin, 
    FiBell, FiChevronRight, FiClock, FiStar, FiPackage
} from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import axios from 'axios';
import { Link } from 'react-router-dom';

const UserDashboardPage = () => {
    const { userInfo } = useSelector((state: RootState) => state.auth);
    const [orders, setOrders] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                };
                const [ordersRes, wishlistRes] = await Promise.all([
                    axios.get('/api/orders/my', config),
                    axios.get('/api/wishlist', config)
                ]);
                setOrders(ordersRes.data);
                setWishlist(wishlistRes.data.products || []);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching user data', error);
                setLoading(false);
            }
        };
        fetchData();
    }, [userInfo]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    if (loading) return <div className="animate-pulse">Loading...</div>;

    return (
        <motion.div 
            className="container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Hello, {userInfo.name}! 👋</h1>
                <p style={{ color: 'var(--text-muted)' }}>Welcome to your personal dashboard. Manage your orders and preferences here.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                {/* Profile Card & Quick Links */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <motion.div variants={itemVariants} className="card">
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'hsl(var(--accent-h), var(--accent-s), var(--accent-l))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, margin: '0 auto 1rem' }}>
                                {userInfo.name.charAt(0)}
                            </div>
                            <h3 style={{ marginBottom: '0.25rem' }}>{userInfo.name}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{userInfo.email}</p>
                            <span className="badge" style={{ marginTop: '0.5rem', background: 'hsla(var(--accent-h), var(--accent-s), var(--accent-l), 0.1)', color: 'hsl(var(--accent-h), var(--accent-s), var(--accent-l))' }}>
                                {userInfo.role.toUpperCase()}
                            </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <Link to="/user-details" className="nav-link"><FiSettings /> Account Settings</Link>
                            <Link to="/orders" className="nav-link"><FiShoppingBag /> My Orders</Link>
                            <Link to="/wishlist" className="nav-link"><FiHeart /> Wishlist</Link>
                            <Link to="/addresses" className="nav-link"><FiMapPin /> Saved Addresses</Link>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="card">
                        <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FiBell /> Notifications
                        </h4>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>You're all caught up!</p>
                    </motion.div>
                </div>

                {/* Orders & Recommendations */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {/* Recent Orders */}
                    <motion.div variants={itemVariants} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3>Recent Orders</h3>
                            <Link to="/orders" className="view-more-btn">View All <FiChevronRight /></Link>
                        </div>
                        {orders.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {orders.slice(0, 3).map((order: any) => (
                                    <div key={order._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                            <div style={{ background: 'white', padding: '0.5rem', borderRadius: '4px' }}>
                                                <FiPackage size={24} color="var(--accent)" />
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 700 }}>Order {order.displayId || `#${order._id.toString().slice(-8).toUpperCase()}`}</div>
                                                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Placed on {new Date(order.createdAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 700 }}>${order.totalPrice.toFixed(2)}</div>
                                            <span className={`badge ${order.isDelivered ? 'badge-success' : 'badge-error'}`} style={{ fontSize: '0.65rem' }}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                <FiShoppingBag size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                                <p>You haven't placed any orders yet.</p>
                                <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Start Shopping</Link>
                            </div>
                        )}
                    </motion.div>

                    {/* Wishlist Snapshot */}
                    <motion.div variants={itemVariants} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3>Wishlist Snapshot</h3>
                            <Link to="/wishlist" className="view-more-btn">Manage <FiChevronRight /></Link>
                        </div>
                        {wishlist.length > 0 ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                                {wishlist.slice(0, 4).map((product: any) => (
                                    <Link to={`/product/${product._id}`} key={product._id} className="product-card-min" style={{ minWidth: 'auto', width: '100%' }}>
                                        <img src={product.images[0]} alt="" style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '4px', marginBottom: '0.5rem' }} />
                                        <div style={{ fontSize: '0.875rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</div>
                                        <div style={{ fontSize: '0.875rem', color: 'hsl(var(--accent-h), var(--accent-s), var(--accent-l))', fontWeight: 700 }}>${product.price}</div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>Your wishlist is empty.</p>
                        )}
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default UserDashboardPage;
