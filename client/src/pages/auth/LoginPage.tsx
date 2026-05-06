import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { login } from '../../store/slices/authSlice';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiShoppingCart, FiShield, FiPackage } from 'react-icons/fi';
import { useToast } from '../../components/common/Toast';
import './AuthPages.css';

type RoleHint = 'buyer' | 'admin' | 'seller';

const ROLE_CONFIGS: Record<RoleHint, { label: string; icon: React.ReactNode; color: string; hint: string; demo: { email: string; pass: string } }> = {
    buyer: {
        label: 'Customer',
        icon: <FiShoppingCart size={20} />,
        color: '#3b82f6',
        hint: 'Shop from thousands of products across all categories',
        demo: { email: 'buyer@martify.com', pass: '123456' },
    },
    seller: {
        label: 'Vendor',
        icon: <FiPackage size={20} />,
        color: '#8b5cf6',
        hint: 'List products, manage inventory, and track your sales',
        demo: { email: 'ali@martify.com', pass: '123456' },
    },
    admin: {
        label: 'Admin',
        icon: <FiShield size={20} />,
        color: '#f59e0b',
        hint: 'Full platform control, analytics, and user management',
        demo: { email: 'admin@martify.com', pass: '123456' },
    },
};

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [roleHint, setRoleHint] = useState<RoleHint>('buyer');

    const dispatch = useDispatch<AppDispatch>();
    const { userInfo, loading } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();
    const { showToast } = useToast();
    const location = useLocation();
    const redirect = new URLSearchParams(location.search).get('redirect') || null;

    useEffect(() => {
        if (userInfo) {
            if (userInfo.role === 'admin') navigate('/admin/dashboard');
            else if (userInfo.role === 'seller') navigate('/seller/dashboard');
            else navigate(redirect || '/shop');
        }
    }, [userInfo, navigate, redirect]);

    const fillDemo = () => {
        const { email: e, pass } = ROLE_CONFIGS[roleHint].demo;
        setEmail(e);
        setPassword(pass);
    };

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await dispatch(login({ email, password })).unwrap();
            showToast(`Welcome back, ${result.name}! 🎉`, 'success');
        } catch (err: any) {
            showToast(err || 'Login failed. Check your credentials.', 'error');
        }
    };

    const activeColor = ROLE_CONFIGS[roleHint].color;

    return (
        <div className="auth-page">
            {/* Left Panel — Branding */}
            <div className="auth-brand-panel" style={{ '--brand-color': activeColor } as React.CSSProperties}>
                <div className="auth-brand-content">
                    <div className="auth-brand-logo">M</div>
                    <h1 className="auth-brand-title">Martify</h1>
                    <p className="auth-brand-sub">Pakistan's Premier Multi-Vendor Marketplace</p>

                    <div className="auth-role-cards">
                        {(Object.entries(ROLE_CONFIGS) as [RoleHint, typeof ROLE_CONFIGS[RoleHint]][]).map(([key, cfg]) => (
                            <button
                                key={key}
                                className={`auth-role-card ${roleHint === key ? 'active' : ''}`}
                                onClick={() => setRoleHint(key)}
                                style={{ '--rc': cfg.color } as React.CSSProperties}
                            >
                                <span className="auth-role-icon" style={{ color: cfg.color }}>{cfg.icon}</span>
                                <div>
                                    <div className="auth-role-name">{cfg.label}</div>
                                    <div className="auth-role-desc">{cfg.hint}</div>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="auth-brand-footer">
                        Trusted by 10,000+ customers & 500+ vendors
                    </div>
                </div>
            </div>

            {/* Right Panel — Form */}
            <div className="auth-form-panel">
                <div className="auth-form-container">
                    <div className="auth-form-header">
                        <h2 className="auth-form-title">Sign In to Martify</h2>
                        <p className="auth-form-sub">
                            Logging in as <strong style={{ color: activeColor }}>{ROLE_CONFIGS[roleHint].label}</strong>
                        </p>
                    </div>

                    {/* Role Tabs */}
                    <div className="auth-tabs">
                        {(Object.entries(ROLE_CONFIGS) as [RoleHint, typeof ROLE_CONFIGS[RoleHint]][]).map(([key, cfg]) => (
                            <button
                                key={key}
                                className={`auth-tab ${roleHint === key ? 'active' : ''}`}
                                onClick={() => setRoleHint(key)}
                                style={roleHint === key ? { borderBottomColor: cfg.color, color: cfg.color } : {}}
                            >
                                {cfg.icon} {cfg.label}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={submitHandler} className="auth-form">
                        <div className="auth-field">
                            <label className="auth-label">Email Address</label>
                            <div className="auth-input-wrap">
                                <FiMail className="auth-input-icon" />
                                <input
                                    type="email"
                                    className="auth-input"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    required
                                    style={{ '--focus-color': activeColor } as React.CSSProperties}
                                />
                            </div>
                        </div>

                        <div className="auth-field">
                            <div className="auth-label-row">
                                <label className="auth-label">Password</label>
                                <Link to="/reset-password" className="auth-forgot">Forgot password?</Link>
                            </div>
                            <div className="auth-input-wrap">
                                <FiLock className="auth-input-icon" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="auth-input"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    style={{ '--focus-color': activeColor } as React.CSSProperties}
                                />
                                <button type="button" className="auth-eye" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <FiEyeOff /> : <FiEye />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="auth-submit-btn"
                            disabled={loading}
                            style={{ background: `linear-gradient(135deg, ${activeColor}, ${activeColor}cc)` }}
                        >
                            {loading ? (
                                <span className="auth-spinner" />
                            ) : (
                                <>Sign In <FiArrowRight /></>
                            )}
                        </button>
                    </form>

                    {/* Demo fill button */}
                    <button className="auth-demo-btn" onClick={fillDemo}>
                        Fill demo {ROLE_CONFIGS[roleHint].label} credentials
                    </button>

                    <div className="auth-divider"><span>New to Martify?</span></div>

                    <Link to="/register" className="auth-switch-btn">
                        Create a free account →
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
