import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    FiPackage, FiSearch, FiRefreshCw, FiCheck, FiTruck, FiXCircle, FiClock, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import api from '../../services/api';

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: JSX.Element }> = {
    Processing: { color: '#f59e0b', bg: '#fffbeb', icon: <FiClock /> },
    Shipped:    { color: '#3b82f6', bg: '#eff6ff', icon: <FiTruck /> },
    Delivered:  { color: '#10b981', bg: '#f0fdf4', icon: <FiCheck /> },
    Cancelled:  { color: '#ef4444', bg: '#fef2f2', icon: <FiXCircle /> },
};

const NEXT_STATUSES: Record<string, string[]> = {
    Processing: ['Shipped', 'Cancelled'],
    Shipped:    ['Delivered'],
    Delivered:  [],
    Cancelled:  [],
};

const SellerOrdersPage = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [updating, setUpdating] = useState<string | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

    const fetchOrders = async (p = page, sf = statusFilter) => {
        setLoading(true);
        try {
            const params: any = { page: p, limit: 15 };
            if (sf !== 'all') params.status = sf;
            const { data } = await api.get('/seller/orders', { params });
            if (Array.isArray(data)) {
                // Fallback if backend is still serving the old unpaginated format
                let filteredData = data;
                if (sf !== 'all') {
                    filteredData = data.filter(o => o.status === sf);
                }
                setOrders(filteredData);
                setTotal(filteredData.length);
                setPages(1);
            } else {
                setOrders(data.orders || []);
                setTotal(data.total || 0);
                setPages(data.pages || 1);
            }
        } catch {
            showToast('Failed to load orders', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(1, statusFilter);
        setPage(1);
    }, [statusFilter]);

    const showToast = (msg: string, type: 'success' | 'error') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const handleStatusUpdate = async (orderId: string, newStatus: string) => {
        setUpdating(orderId);
        try {
            const { data } = await api.put(`/seller/orders/${orderId}/status`, { status: newStatus });
            setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: data.status, isDelivered: data.isDelivered } : o)));
            showToast(`Order marked as ${newStatus}`, 'success');
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Failed to update status', 'error');
        } finally {
            setUpdating(null);
        }
    };

    const filtered = orders.filter((o) => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (
            (o.displayId || '').toLowerCase().includes(s) ||
            (o.user?.name || '').toLowerCase().includes(s) ||
            (o.user?.email || '').toLowerCase().includes(s)
        );
    });

    return (
        <div className="dash-page">
            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999,
                    background: toast.type === 'success' ? '#10b981' : '#ef4444',
                    color: 'white', padding: '0.75rem 1.25rem', borderRadius: '10px',
                    fontWeight: 600, fontSize: '0.9rem', boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                }}>
                    {toast.type === 'success' ? <FiCheck /> : <FiXCircle />}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="dash-header">
                <div>
                    <h1 className="dash-title" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <FiPackage /> Orders Management
                    </h1>
                    <p className="dash-subtitle">{total} total orders · Update statuses and track deliveries</p>
                </div>
                <button
                    className="dash-btn dash-btn-outline"
                    onClick={() => fetchOrders(page, statusFilter)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                    <FiRefreshCw size={14} /> Refresh
                </button>
            </motion.div>

            {/* Filters */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.1 } }}
                style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Status tabs */}
                {['all', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((s) => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        style={{
                            padding: '0.4rem 1rem', borderRadius: '20px', border: 'none', cursor: 'pointer',
                            fontWeight: 600, fontSize: '0.8rem', transition: 'all 0.2s',
                            background: statusFilter === s ? 'var(--primary, #8b5cf6)' : 'var(--surface-hover, #f1f5f9)',
                            color: statusFilter === s ? 'white' : 'var(--text-muted, #64748b)',
                        }}
                    >
                        {s === 'all' ? 'All Orders' : s}
                    </button>
                ))}

                {/* Search */}
                <div style={{ marginLeft: 'auto', position: 'relative' }}>
                    <FiSearch style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        placeholder="Search order ID or customer…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{
                            paddingLeft: '2.25rem', paddingRight: '1rem', paddingTop: '0.45rem', paddingBottom: '0.45rem',
                            border: '1.5px solid var(--border, #e2e8f0)', borderRadius: '10px',
                            fontSize: '0.85rem', outline: 'none', width: '240px',
                            background: 'var(--surface, white)',
                        }}
                    />
                </div>
            </motion.div>

            {/* Table */}
            <motion.div className="dash-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.15 } }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                        <div className="dash-spinner" style={{ margin: '0 auto 1rem' }} />
                        Loading orders…
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
                        <FiPackage size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                        <p style={{ fontWeight: 600 }}>No orders found</p>
                        <p style={{ fontSize: '0.875rem' }}>Orders from buyers will appear here</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="dash-table" style={{ minWidth: '900px' }}>
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Items</th>
                                    <th>Total</th>
                                    <th>Shipping Address</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((order) => {
                                    const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG['Processing'];
                                    const nextStatuses = NEXT_STATUSES[order.status] || [];
                                    return (
                                        <tr key={order._id}>
                                            <td>
                                                <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#8b5cf6', fontFamily: 'monospace' }}>
                                                    {order.displayId || `#${order._id.slice(-8).toUpperCase()}`}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{order.user?.name || '—'}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{order.user?.email}</div>
                                            </td>
                                            <td style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                                                {new Date(order.createdAt).toLocaleDateString()}<br />
                                                <span style={{ fontSize: '0.7rem' }}>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                                    {order.items.slice(0, 2).map((item: any, i: number) => (
                                                        <div key={i} style={{ fontSize: '0.75rem', color: '#374151' }}>
                                                            {item.name} × {item.quantity}
                                                        </div>
                                                    ))}
                                                    {order.items.length > 2 && (
                                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>+{order.items.length - 2} more</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: 700, color: '#111827' }}>${order.totalPrice?.toFixed(2)}</td>
                                            <td>
                                                <div style={{ fontSize: '0.75rem', color: '#374151', maxWidth: '180px' }}>
                                                    {order.shippingAddress?.address}, {order.shippingAddress?.city}<br />
                                                    <span style={{ color: '#64748b' }}>{order.shippingAddress?.country} {order.shippingAddress?.postalCode}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                                    padding: '0.3rem 0.7rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                                                    background: cfg.bg, color: cfg.color,
                                                }}>
                                                    {cfg.icon} {order.status}
                                                </span>
                                            </td>
                                            <td>
                                                {nextStatuses.length > 0 ? (
                                                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                                        {nextStatuses.map((ns) => {
                                                            const nCfg = STATUS_CONFIG[ns];
                                                            return (
                                                                <button
                                                                    key={ns}
                                                                    disabled={updating === order._id}
                                                                    onClick={() => handleStatusUpdate(order._id, ns)}
                                                                    style={{
                                                                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                                                                        padding: '0.3rem 0.7rem', borderRadius: '8px', border: 'none',
                                                                        fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
                                                                        background: nCfg.bg, color: nCfg.color,
                                                                        opacity: updating === order._id ? 0.6 : 1,
                                                                        transition: 'opacity 0.2s',
                                                                    }}
                                                                >
                                                                    {updating === order._id ? '…' : <>{nCfg.icon} Mark {ns}</>}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>No actions</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {pages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                        <button
                            disabled={page === 1}
                            onClick={() => { const p = page - 1; setPage(p); fetchOrders(p); }}
                            style={{ background: 'none', border: '1.5px solid var(--border)', borderRadius: '8px', padding: '0.4rem 0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', opacity: page === 1 ? 0.4 : 1 }}
                        >
                            <FiChevronLeft /> Prev
                        </button>
                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Page {page} of {pages}</span>
                        <button
                            disabled={page === pages}
                            onClick={() => { const p = page + 1; setPage(p); fetchOrders(p); }}
                            style={{ background: 'none', border: '1.5px solid var(--border)', borderRadius: '8px', padding: '0.4rem 0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', opacity: page === pages ? 0.4 : 1 }}
                        >
                            Next <FiChevronRight />
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default SellerOrdersPage;
