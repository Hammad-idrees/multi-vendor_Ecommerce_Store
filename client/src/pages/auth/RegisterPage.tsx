import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { register } from '../../store/slices/authSlice';
import { FiUser, FiMail, FiLock, FiPhone, FiShoppingCart, FiPackage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './AuthPages.css';

type RoleOption = 'buyer' | 'seller';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [role, setRole] = useState<RoleOption>('buyer');
    const [shopName, setShopName] = useState('');

    const dispatch = useDispatch<AppDispatch>();
    const { userInfo, loading } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();
    const location = useLocation();
    const redirect = new URLSearchParams(location.search).get('redirect') || null;

    useEffect(() => {
        if (userInfo) {
            if (userInfo.role === 'seller') navigate('/seller/dashboard');
            else navigate(redirect || '/shop');
        }
    }, [userInfo, navigate, redirect]);

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) { toast.error('Passwords do not match'); return; }
        if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        try {
            const result = await dispatch(register({ name, email, password, role, phone, shopName })).unwrap();
            toast.success(`Welcome to Martify, ${result.name}! 🎉`);
        } catch (err: any) {
            toast.error(err || 'Registration failed. Please try again.');
        }
    };

    const isSeller = role === 'seller';
    const accentColor = isSeller ? '#8b5cf6' : '#3b82f6';

    return (
        <div className="auth-page">
            {/* Left Panel */}
            <div className="auth-brand-panel" style={{ '--brand-color': accentColor } as React.CSSProperties}>
                <div className="auth-brand-content">
                    <div className="auth-brand-logo">M</div>
                    <h1 className="auth-brand-title">Join Martify</h1>
                    <p className="auth-brand-sub">Start your journey as a customer or a vendor today</p>

                    <div className="auth-role-cards" style={{ marginTop: '2.5rem' }}>
                        <button
                            className={`auth-role-card ${role === 'buyer' ? 'active' : ''}`}
                            onClick={() => setRole('buyer')}
                            style={{ '--rc': '#3b82f6' } as React.CSSProperties}
                        >
                            <span className="auth-role-icon" style={{ color: '#3b82f6' }}><FiShoppingCart size={20} /></span>
                            <div>
                                <div className="auth-role-name">Customer</div>
                                <div className="auth-role-desc">Shop from thousands of verified sellers</div>
                            </div>
                        </button>
                        <button
                            className={`auth-role-card ${role === 'seller' ? 'active' : ''}`}
                            onClick={() => setRole('seller')}
                            style={{ '--rc': '#8b5cf6' } as React.CSSProperties}
                        >
                            <span className="auth-role-icon" style={{ color: '#8b5cf6' }}><FiPackage size={20} /></span>
                            <div>
                                <div className="auth-role-name">Vendor</div>
                                <div className="auth-role-desc">Sell your products to thousands of buyers</div>
                            </div>
                        </button>
                    </div>

                    <div className="auth-brand-stats">
                        <div className="auth-stat"><span className="auth-stat-val">10K+</span><span className="auth-stat-lbl">Customers</span></div>
                        <div className="auth-stat"><span className="auth-stat-val">500+</span><span className="auth-stat-lbl">Vendors</span></div>
                        <div className="auth-stat"><span className="auth-stat-val">50K+</span><span className="auth-stat-lbl">Products</span></div>
                    </div>
                </div>
            </div>

            {/* Right Panel — Form */}
            <div className="auth-form-panel">
                <div className="auth-form-container">
                    <div className="auth-form-header">
                        <h2 className="auth-form-title">Create Account</h2>
                        <p className="auth-form-sub">
                            Registering as a <strong style={{ color: accentColor }}>{isSeller ? 'Vendor' : 'Customer'}</strong>
                        </p>
                    </div>

                    <form onSubmit={submitHandler} className="auth-form">
                        <div className="auth-field">
                            <label className="auth-label">Full Name</label>
                            <div className="auth-input-wrap">
                                <FiUser className="auth-input-icon" />
                                <input type="text" className="auth-input" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" required />
                            </div>
                        </div>

                        <div className="auth-field">
                            <label className="auth-label">Email Address</label>
                            <div className="auth-input-wrap">
                                <FiMail className="auth-input-icon" />
                                <input type="email" className="auth-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" required />
                            </div>
                        </div>

                        <div className="auth-field">
                            <label className="auth-label">Phone (Optional)</label>
                            <div className="auth-input-wrap">
                                <FiPhone className="auth-input-icon" />
                                <input type="text" className="auth-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+92 300 1234567" />
                            </div>
                        </div>

                        {isSeller && (
                            <div className="auth-field">
                                <label className="auth-label">Shop Name</label>
                                <div className="auth-input-wrap">
                                    <FiPackage className="auth-input-icon" />
                                    <input type="text" className="auth-input" value={shopName} onChange={e => setShopName(e.target.value)} placeholder="Your shop name" />
                                </div>
                            </div>
                        )}

                        <div className="auth-row-2">
                            <div className="auth-field">
                                <label className="auth-label">Password</label>
                                <div className="auth-input-wrap">
                                    <FiLock className="auth-input-icon" />
                                    <input type="password" className="auth-input" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 chars" required />
                                </div>
                            </div>
                            <div className="auth-field">
                                <label className="auth-label">Confirm</label>
                                <div className="auth-input-wrap">
                                    <FiLock className="auth-input-icon" />
                                    <input type="password" className="auth-input" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat password" required />
                                </div>
                            </div>
                        </div>

                        {/* Role Toggle */}
                        <div className="auth-role-toggle">
                            <button
                                type="button"
                                className={`auth-toggle-btn ${role === 'buyer' ? 'active' : ''}`}
                                onClick={() => setRole('buyer')}
                                style={role === 'buyer' ? { background: '#3b82f6', color: 'white' } : {}}
                            >
                                <FiShoppingCart /> Customer
                            </button>
                            <button
                                type="button"
                                className={`auth-toggle-btn ${role === 'seller' ? 'active' : ''}`}
                                onClick={() => setRole('seller')}
                                style={role === 'seller' ? { background: '#8b5cf6', color: 'white' } : {}}
                            >
                                <FiPackage /> Vendor
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="auth-submit-btn"
                            disabled={loading}
                            style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)` }}
                        >
                            {loading ? <span className="auth-spinner" /> : 'Create Account →'}
                        </button>
                    </form>

                    <div className="auth-divider"><span>Already have an account?</span></div>
                    <Link to="/login" className="auth-switch-btn">Sign in instead →</Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
