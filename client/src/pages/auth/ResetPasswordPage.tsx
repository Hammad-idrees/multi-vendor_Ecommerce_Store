import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import './AuthPages.css';

const ResetPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const submitHandler = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <div className="auth-page" style={{ justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
            <div style={{ width: '100%', maxWidth: '420px', background: 'white', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
                {!submitted ? (
                    <>
                        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                            <div style={{ width: 52, height: 52, background: '#eff6ff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: '#3b82f6', fontSize: '1.5rem' }}>
                                <FiMail />
                            </div>
                            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem', letterSpacing: '-0.03em' }}>Reset Password</h1>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>
                                Enter your email address and we'll send you a reset link.
                            </p>
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
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@company.com"
                                        required
                                    />
                                </div>
                            </div>
                            <button type="submit" className="auth-submit-btn" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                                Send Reset Link
                            </button>
                        </form>
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                        <div style={{ color: '#10b981', fontSize: '3rem', marginBottom: '1rem' }}><FiCheckCircle /></div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>Check your inbox</h2>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                            If an account exists for <strong>{email}</strong>, you'll receive a password reset link shortly.
                        </p>
                        <button
                            className="auth-demo-btn"
                            onClick={() => { setSubmitted(false); setEmail(''); }}
                        >
                            Try a different email
                        </button>
                    </div>
                )}

                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem', color: '#64748b', fontWeight: 600, textDecoration: 'none' }}>
                        <FiArrowLeft /> Back to Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;
