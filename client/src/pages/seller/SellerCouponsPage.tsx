import React, { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiTag, FiPercent, FiDollarSign, FiCalendar, FiUsers, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';

interface Coupon {
    _id: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minOrderAmount: number;
    maxUses: number;
    usedCount: number;
    expiresAt: string;
    isActive: boolean;
    createdAt: string;
}

const SellerCouponsPage = () => {
    const { showToast } = useToast();
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [code, setCode] = useState('');
    const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
    const [discountValue, setDiscountValue] = useState('');
    const [minOrderAmount, setMinOrderAmount] = useState('0');
    const [maxUses, setMaxUses] = useState('100');
    const [expiresAt, setExpiresAt] = useState('');

    const fetchCoupons = async () => {
        try {
            const { data } = await api.get('/coupons');
            setCoupons(data);
        } catch {
            showToast('Failed to load coupons', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCoupons(); }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code || !discountValue || !expiresAt) {
            showToast('Please fill all required fields', 'error');
            return;
        }
        setSubmitting(true);
        try {
            const { data } = await api.post('/coupons', {
                code: code.toUpperCase(),
                discountType,
                discountValue: Number(discountValue),
                minOrderAmount: Number(minOrderAmount),
                maxUses: Number(maxUses),
                expiresAt,
            });
            setCoupons(prev => [data, ...prev]);
            showToast(`Coupon "${data.code}" created!`, 'success');
            setShowForm(false);
            setCode(''); setDiscountValue(''); setMinOrderAmount('0'); setMaxUses('100'); setExpiresAt('');
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Failed to create coupon', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggle = async (coupon: Coupon) => {
        try {
            const { data } = await api.put(`/coupons/${coupon._id}`, { isActive: !coupon.isActive });
            setCoupons(prev => prev.map(c => c._id === coupon._id ? data : c));
            showToast(`Coupon ${data.isActive ? 'activated' : 'deactivated'}`, 'success');
        } catch {
            showToast('Failed to update coupon', 'error');
        }
    };

    const handleDelete = async (id: string, code: string) => {
        if (!window.confirm(`Delete coupon "${code}"?`)) return;
        try {
            await api.delete(`/coupons/${id}`);
            setCoupons(prev => prev.filter(c => c._id !== id));
            showToast('Coupon deleted', 'success');
        } catch {
            showToast('Failed to delete coupon', 'error');
        }
    };

    const isExpired = (date: string) => new Date(date) < new Date();

    return (
        <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiTag style={{ color: '#8b5cf6' }} /> My Coupons
                    </h1>
                    <p style={{ margin: '0.25rem 0 0', color: '#64748b' }}>Create and manage discount codes for your customers</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                        color: 'white', border: 'none', borderRadius: '10px',
                        padding: '0.7rem 1.3rem', fontWeight: 700, cursor: 'pointer',
                        fontSize: '0.9rem', boxShadow: '0 4px 15px rgba(139,92,246,0.3)',
                        transition: 'opacity 0.2s'
                    }}
                >
                    <FiPlus /> {showForm ? 'Cancel' : 'New Coupon'}
                </button>
            </div>

            {/* Create Form */}
            {showForm && (
                <div style={{
                    background: 'white', borderRadius: '16px', padding: '1.5rem',
                    marginBottom: '2rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid #e2e8f0'
                }}>
                    <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>Create New Coupon</h2>
                    <form onSubmit={handleCreate}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>
                                    Coupon Code *
                                </label>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={e => setCode(e.target.value.toUpperCase())}
                                    placeholder="e.g. SAVE20"
                                    required
                                    style={{
                                        width: '100%', padding: '0.65rem 0.9rem',
                                        border: '1.5px solid #e2e8f0', borderRadius: '8px',
                                        fontSize: '0.95rem', fontWeight: 700, letterSpacing: '1px',
                                        boxSizing: 'border-box', outline: 'none', fontFamily: 'monospace'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>
                                    Discount Type *
                                </label>
                                <select
                                    value={discountType}
                                    onChange={e => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                                    style={{
                                        width: '100%', padding: '0.65rem 0.9rem',
                                        border: '1.5px solid #e2e8f0', borderRadius: '8px',
                                        fontSize: '0.95rem', boxSizing: 'border-box', background: 'white'
                                    }}
                                >
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount ($)</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>
                                    Discount Value * {discountType === 'percentage' ? '(%)' : '($)'}
                                </label>
                                <input
                                    type="number" min="1" max={discountType === 'percentage' ? '100' : undefined}
                                    value={discountValue}
                                    onChange={e => setDiscountValue(e.target.value)}
                                    placeholder={discountType === 'percentage' ? '20' : '10'}
                                    required
                                    style={{
                                        width: '100%', padding: '0.65rem 0.9rem',
                                        border: '1.5px solid #e2e8f0', borderRadius: '8px',
                                        fontSize: '0.95rem', boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>
                                    Min Order Amount ($)
                                </label>
                                <input
                                    type="number" min="0"
                                    value={minOrderAmount}
                                    onChange={e => setMinOrderAmount(e.target.value)}
                                    style={{
                                        width: '100%', padding: '0.65rem 0.9rem',
                                        border: '1.5px solid #e2e8f0', borderRadius: '8px',
                                        fontSize: '0.95rem', boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>
                                    Max Uses
                                </label>
                                <input
                                    type="number" min="1"
                                    value={maxUses}
                                    onChange={e => setMaxUses(e.target.value)}
                                    style={{
                                        width: '100%', padding: '0.65rem 0.9rem',
                                        border: '1.5px solid #e2e8f0', borderRadius: '8px',
                                        fontSize: '0.95rem', boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.85rem', color: '#475569' }}>
                                    Expiry Date *
                                </label>
                                <input
                                    type="date"
                                    value={expiresAt}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={e => setExpiresAt(e.target.value)}
                                    required
                                    style={{
                                        width: '100%', padding: '0.65rem 0.9rem',
                                        border: '1.5px solid #e2e8f0', borderRadius: '8px',
                                        fontSize: '0.95rem', boxSizing: 'border-box'
                                    }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                            <button type="button" onClick={() => setShowForm(false)}
                                style={{ padding: '0.65rem 1.3rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: 'white', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}
                            >Cancel</button>
                            <button type="submit" disabled={submitting}
                                style={{
                                    padding: '0.65rem 1.5rem', borderRadius: '8px', border: 'none',
                                    background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                                    color: 'white', fontWeight: 700, cursor: 'pointer', opacity: submitting ? 0.7 : 1
                                }}
                            >
                                {submitting ? 'Creating...' : 'Create Coupon'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Coupons List */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading coupons...</div>
            ) : coupons.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                    <FiTag size={40} style={{ opacity: 0.3, marginBottom: '1rem', display: 'block', margin: '0 auto 1rem' }} />
                    <p style={{ fontSize: '1rem' }}>No coupons yet. Create your first one!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {coupons.map(coupon => {
                        const expired = isExpired(coupon.expiresAt);
                        const statusColor = !coupon.isActive ? '#94a3b8' : expired ? '#ef4444' : '#10b981';
                        const statusLabel = !coupon.isActive ? 'Inactive' : expired ? 'Expired' : 'Active';

                        return (
                            <div key={coupon._id} style={{
                                background: 'white', borderRadius: '14px', padding: '1.25rem 1.5rem',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9',
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
                                opacity: (!coupon.isActive || expired) ? 0.7 : 1
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1 }}>
                                    {/* Code badge */}
                                    <div style={{
                                        background: 'linear-gradient(135deg, #f3e8ff, #ede9fe)',
                                        border: '2px dashed #8b5cf6', borderRadius: '8px',
                                        padding: '0.6rem 1rem', fontFamily: 'monospace',
                                        fontWeight: 800, fontSize: '1rem', color: '#6d28d9',
                                        letterSpacing: '2px', flexShrink: 0
                                    }}>
                                        {coupon.code}
                                    </div>

                                    {/* Details */}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>
                                                {coupon.discountType === 'percentage' ? <FiPercent size={14} /> : <FiDollarSign size={14} />}
                                                {coupon.discountType === 'percentage' ? `${coupon.discountValue}% Off` : `$${coupon.discountValue} Off`}
                                            </span>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: statusColor + '15', color: statusColor, borderRadius: '20px', padding: '0.15rem 0.6rem', fontSize: '0.75rem', fontWeight: 700 }}>
                                                {statusLabel === 'Active' ? <FiCheckCircle size={11} /> : <FiXCircle size={11} />} {statusLabel}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: '#64748b', flexWrap: 'wrap' }}>
                                            {coupon.minOrderAmount > 0 && (
                                                <span><FiDollarSign size={11} /> Min: ${coupon.minOrderAmount}</span>
                                            )}
                                            <span><FiUsers size={11} /> {coupon.usedCount}/{coupon.maxUses} uses</span>
                                            <span><FiCalendar size={11} /> Expires: {new Date(coupon.expiresAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                                    {/* Toggle active */}
                                    <button
                                        onClick={() => handleToggle(coupon)}
                                        title={coupon.isActive ? 'Deactivate' : 'Activate'}
                                        style={{
                                            padding: '0.45rem 0.9rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.8rem',
                                            border: `1.5px solid ${coupon.isActive ? '#e2e8f0' : '#10b981'}`,
                                            background: coupon.isActive ? '#f8fafc' : '#f0fdf4',
                                            color: coupon.isActive ? '#64748b' : '#10b981', cursor: 'pointer'
                                        }}
                                    >
                                        {coupon.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(coupon._id, coupon.code)}
                                        title="Delete coupon"
                                        style={{
                                            background: '#fef2f2', border: '1.5px solid #fecaca', color: '#ef4444',
                                            borderRadius: '8px', padding: '0.45rem 0.65rem', cursor: 'pointer',
                                            display: 'flex', alignItems: 'center'
                                        }}
                                    >
                                        <FiTrash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SellerCouponsPage;
