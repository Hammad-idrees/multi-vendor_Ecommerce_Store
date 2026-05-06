
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

const UserDetailsPage = () => {
    const { user, login } = useContext(AuthContext)!;
    const navigate = useNavigate();

    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else {
            // Pre-fill if already exists (unlikely on fresh signup, but good practice)
            if (user.phone) setPhone(user.phone);
            if (user.address) setAddress(user.address);
        }
    }, [navigate, user]);

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data } = await api.put('/auth/profile', {
                phone,
                address,
                city,
                postalCode,
                country
            });
            // Update context with new user data
            login(data);
            navigate('/');
        } catch (err: any) {
            setMessage(err.response?.data?.message || err.message);
        }
    };

    return (
        <div className="auth-layout">
            <div className="auth-box">
                <h1 className="auth-title">Complete Your Profile</h1>
                <p style={{ textAlign: 'center', marginBottom: '1rem', color: '#666' }}>Please tell us a bit more about yourself to speed up checkout.</p>
                {message && <div style={{ color: 'var(--error)', marginBottom: '1rem', textAlign: 'center' }}>{message}</div>}

                <form onSubmit={submitHandler}>
                    <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <input
                            type="text"
                            className="form-input"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+1 234 567 8900"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Address</label>
                        <input
                            type="text"
                            className="form-input"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="123 Main St"
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label">City</label>
                            <input
                                type="text"
                                className="form-input"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                                placeholder="New York"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Postal Code</label>
                            <input
                                type="text"
                                className="form-input"
                                value={postalCode}
                                onChange={(e) => setPostalCode(e.target.value)}
                                placeholder="10001"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Country</label>
                        <input
                            type="text"
                            className="form-input"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            placeholder="United States"
                        />
                    </div>

                    <button type="submit" className="btn btn-auth">
                        Save & Continue
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        style={{ background: 'transparent', color: '#666', marginTop: '1rem', width: '100%', border: 'none', cursor: 'pointer' }}
                    >
                        Skip for now
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UserDetailsPage;
