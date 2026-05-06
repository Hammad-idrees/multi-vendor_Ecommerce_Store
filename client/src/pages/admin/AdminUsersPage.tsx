import { FormEvent, useEffect, useMemo, useState } from 'react';
import { FiUsers, FiShoppingBag, FiSearch, FiTrash2, FiLock, FiUnlock, FiEye, FiX, FiPlus, FiUserPlus } from 'react-icons/fi';
import api from '../../services/api';
import { User } from '../../types';
import toast from 'react-hot-toast';

const ROLE_LABEL: Record<string, string> = { seller: 'Vendor', buyer: 'Customer', admin: 'Admin' };
const ROLE_COLOR: Record<string, string> = { seller: '#8b5cf6', buyer: '#3b82f6', admin: '#f59e0b' };

const AdminUsersPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedRole, setSelectedRole] = useState('');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [activityPanel, setActivityPanel] = useState<{ user: User; data: any; type: string } | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'buyer' });
    const [inactiveDays, setInactiveDays] = useState(180);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const currentUserId = useMemo(() => {
        try { return JSON.parse(localStorage.getItem('userInfo') || '{}')._id || ''; } catch { return ''; }
    }, []);

    const fetchUsers = async (role = selectedRole) => {
        setLoading(true);
        try {
            const query = role ? `?role=${role}` : '';
            const { data } = await api.get(`/admin/users${query}`);
            setUsers(data);
        } catch { toast.error('Failed to load users'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchUsers(); }, []);

    const filteredUsers = useMemo(() => {
        if (!search.trim()) return users;
        const q = search.toLowerCase();
        return users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }, [users, search]);

    const createUser = async (e: FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/admin/users', newUser);
            toast.success('User created successfully');
            setNewUser({ name: '', email: '', password: '', role: 'buyer' });
            setShowAddForm(false);
            await fetchUsers();
        } catch (err: any) { toast.error(err.response?.data?.message || 'Failed to create user'); }
    };

    const loadActivity = async (user: User) => {
        try {
            const endpoint = user.role === 'seller'
                ? `/admin/vendors/${user._id}/activity`
                : `/admin/customers/${user._id}/activity`;
            const { data } = await api.get(endpoint);
            setActivityPanel({ user, data, type: user.role === 'seller' ? 'vendor' : 'customer' });
        } catch { toast.error('Failed to load activity'); }
    };

    const toggleBlock = async (user: User) => {
        setActionLoading(`block-${user._id}`);
        try {
            await api.put(`/admin/users/${user._id}/block`);
            toast.success(`${user.name} has been ${user.isBlocked ? 'unblocked' : 'blocked'}`);
            await fetchUsers();
        } catch { toast.error('Action failed'); }
        finally { setActionLoading(null); }
    };

    const removeUser = async (user: User) => {
        if (!window.confirm(`Permanently delete "${user.name}"? This cannot be undone.`)) return;
        setActionLoading(`delete-${user._id}`);
        try {
            await api.delete(`/admin/users/${user._id}`);
            toast.success('User deleted');
            await fetchUsers();
        } catch { toast.error('Failed to delete user'); }
        finally { setActionLoading(null); }
    };

    const removeInactiveUsers = async () => {
        if (!window.confirm(`Remove all inactive accounts older than ${inactiveDays} days?`)) return;
        setActionLoading('remove-inactive');
        try {
            await api.delete(`/admin/users/inactive?days=${inactiveDays}`);
            toast.success('Inactive accounts removed');
            await fetchUsers();
        } catch { toast.error('Failed to remove inactive accounts'); }
        finally { setActionLoading(null); }
    };

    const formatDate = (value?: string) =>
        value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A';

    const stats = useMemo(() => ({
        total: users.length,
        buyers: users.filter(u => u.role === 'buyer').length,
        sellers: users.filter(u => u.role === 'seller').length,
        blocked: users.filter(u => u.isBlocked).length,
    }), [users]);

    return (
        <div style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1rem', paddingBottom: '3rem' }}>
            {/* Page Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FiUsers style={{ color: '#3b82f6' }} /> User Management
                    </h1>
                    <p style={{ margin: '0.25rem 0 0', color: '#64748b' }}>Manage all buyers and sellers on the platform</p>
                </div>
                <button
                    onClick={() => setShowAddForm(v => !v)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', border: 'none', borderRadius: '10px', padding: '0.7rem 1.3rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 4px 15px rgba(59,130,246,0.3)' }}
                >
                    <FiUserPlus /> {showAddForm ? 'Cancel' : 'Add User'}
                </button>
            </div>

            {/* Stats Strip */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Users', value: stats.total, color: '#3b82f6', bg: '#eff6ff' },
                    { label: 'Customers', value: stats.buyers, color: '#10b981', bg: '#f0fdf4' },
                    { label: 'Vendors', value: stats.sellers, color: '#8b5cf6', bg: '#f5f3ff' },
                    { label: 'Blocked', value: stats.blocked, color: '#ef4444', bg: '#fef2f2' },
                ].map(s => (
                    <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}20`, borderRadius: '12px', padding: '1rem 1.25rem' }}>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: s.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '1.75rem', fontWeight: 800, color: s.color }}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Add User Form */}
            {showAddForm && (
                <div style={{ background: 'white', borderRadius: '14px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ margin: '0 0 1rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FiPlus /> New User</h3>
                    <form onSubmit={createUser}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>Full Name</label>
                                <input className="form-input" placeholder="John Doe" value={newUser.name} onChange={e => setNewUser(s => ({ ...s, name: e.target.value }))} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>Email</label>
                                <input className="form-input" type="email" placeholder="email@example.com" value={newUser.email} onChange={e => setNewUser(s => ({ ...s, email: e.target.value }))} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>Role</label>
                                <select className="form-input" value={newUser.role} onChange={e => setNewUser(s => ({ ...s, role: e.target.value }))}>
                                    <option value="buyer">Customer</option>
                                    <option value="seller">Vendor</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>Password</label>
                                <input className="form-input" type="password" placeholder="Min 6 characters" value={newUser.password} onChange={e => setNewUser(s => ({ ...s, password: e.target.value }))} required />
                            </div>
                        </div>
                        <button type="submit" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', border: 'none', borderRadius: '8px', padding: '0.6rem 1.4rem', fontWeight: 700, cursor: 'pointer' }}>
                            Create User
                        </button>
                    </form>
                </div>
            )}

            {/* Filters */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                    <FiSearch style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text" placeholder="Search by name or email..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.25rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
                    />
                </div>
                {['', 'buyer', 'seller'].map(role => (
                    <button key={role} onClick={() => { setSelectedRole(role); fetchUsers(role); }}
                        style={{ padding: '0.5rem 1.1rem', borderRadius: '8px', border: '1.5px solid', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.15s', borderColor: selectedRole === role ? '#3b82f6' : '#e2e8f0', background: selectedRole === role ? '#3b82f6' : 'white', color: selectedRole === role ? 'white' : '#64748b' }}
                    >
                        {role === '' ? 'All' : role === 'buyer' ? 'Customers' : 'Vendors'}
                    </button>
                ))}
            </div>

            {/* Inactive Accounts Tool */}
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '0.85rem 1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, color: '#92400e', fontSize: '0.85rem' }}>🧹 Remove Inactive Accounts</span>
                <input type="number" min={30} step={30} value={inactiveDays} onChange={e => setInactiveDays(Number(e.target.value) || 180)}
                    style={{ width: '80px', padding: '0.35rem 0.5rem', border: '1px solid #fcd34d', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }} />
                <span style={{ color: '#78350f', fontSize: '0.85rem' }}>days inactive</span>
                <button onClick={removeInactiveUsers} disabled={actionLoading === 'remove-inactive'}
                    style={{ background: '#f59e0b', color: 'white', border: 'none', borderRadius: '7px', padding: '0.4rem 1rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.83rem' }}>
                    {actionLoading === 'remove-inactive' ? 'Removing...' : 'Remove'}
                </button>
            </div>

            {/* Users Table */}
            <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading users...</div>
                ) : filteredUsers.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No users found</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                {['User', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user, i) => (
                                <tr key={user._id} style={{ borderBottom: i < filteredUsers.length - 1 ? '1px solid #f1f5f9' : 'none', background: user.isBlocked ? '#fef2f2' : 'white', transition: 'background 0.15s' }}>
                                    <td style={{ padding: '0.9rem 1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: ROLE_COLOR[user.role] + '20', color: ROLE_COLOR[user.role], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', flexShrink: 0 }}>
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>{user.name}</div>
                                                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '0.9rem 1rem' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: ROLE_COLOR[user.role] + '15', color: ROLE_COLOR[user.role], borderRadius: '20px', padding: '0.2rem 0.65rem', fontSize: '0.75rem', fontWeight: 700 }}>
                                            {user.role === 'seller' ? <FiShoppingBag size={11} /> : <FiUsers size={11} />}
                                            {ROLE_LABEL[user.role]}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.9rem 1rem' }}>
                                        <span style={{ display: 'inline-block', background: user.isBlocked ? '#fef2f2' : '#f0fdf4', color: user.isBlocked ? '#ef4444' : '#10b981', borderRadius: '20px', padding: '0.2rem 0.65rem', fontSize: '0.75rem', fontWeight: 700 }}>
                                            {user.isBlocked ? '🚫 Blocked' : '✓ Active'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.9rem 1rem', fontSize: '0.82rem', color: '#64748b' }}>
                                        {formatDate((user as any).createdAt)}
                                    </td>
                                    <td style={{ padding: '0.9rem 1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                            {(user.role === 'seller' || user.role === 'buyer') && (
                                                <>
                                                    <button onClick={() => loadActivity(user)} title="View Activity"
                                                        style={{ background: '#f1f5f9', border: 'none', borderRadius: '7px', padding: '0.4rem 0.65rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 600, color: '#475569' }}>
                                                        <FiEye size={13} /> Activity
                                                    </button>
                                                    <button onClick={() => toggleBlock(user)} disabled={actionLoading === `block-${user._id}`} title={user.isBlocked ? 'Unblock' : 'Block'}
                                                        style={{ background: user.isBlocked ? '#f0fdf4' : '#fff7ed', border: 'none', borderRadius: '7px', padding: '0.4rem 0.65rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 600, color: user.isBlocked ? '#10b981' : '#f59e0b' }}>
                                                        {user.isBlocked ? <FiUnlock size={13} /> : <FiLock size={13} />}
                                                        {actionLoading === `block-${user._id}` ? '...' : user.isBlocked ? 'Unblock' : 'Block'}
                                                    </button>
                                                    <button onClick={() => removeUser(user)} disabled={actionLoading === `delete-${user._id}` || user._id === currentUserId} title="Delete Account"
                                                        style={{ background: '#fef2f2', border: 'none', borderRadius: '7px', padding: '0.4rem 0.65rem', cursor: user._id === currentUserId ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', color: '#ef4444', opacity: user._id === currentUserId ? 0.4 : 1 }}>
                                                        <FiTrash2 size={14} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Activity Side Panel */}
            {activityPanel && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }} onClick={() => setActivityPanel(null)}>
                    <div style={{ width: '360px', height: '100%', background: 'white', boxShadow: '-4px 0 30px rgba(0,0,0,0.15)', padding: '2rem', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h3 style={{ margin: 0, fontWeight: 800, color: '#1e293b' }}>
                                    {activityPanel.type === 'vendor' ? 'Vendor Activity' : 'Customer Activity'}
                                </h3>
                                <p style={{ margin: '0.2rem 0 0', color: '#64748b', fontSize: '0.85rem' }}>{activityPanel.user.name}</p>
                            </div>
                            <button onClick={() => setActivityPanel(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', color: '#64748b' }}>
                                <FiX size={18} />
                            </button>
                        </div>

                        {activityPanel.type === 'vendor' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {[
                                    { label: 'Total Products', value: activityPanel.data.totalProducts ?? 0 },
                                    { label: 'Low Stock Products', value: activityPanel.data.lowStockCount ?? 0 },
                                    { label: 'Total Revenue', value: `$${(activityPanel.data.totalRevenue ?? 0).toFixed(2)}` },
                                    { label: 'Total Orders', value: activityPanel.data.totalOrders ?? 0 },
                                ].map(item => (
                                    <div key={item.label} style={{ background: '#f8fafc', borderRadius: '10px', padding: '1rem' }}>
                                        <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</p>
                                        <p style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {[
                                    { label: 'Cart Items', value: activityPanel.data.cart?.items?.length ?? 0 },
                                    { label: 'Total Orders', value: activityPanel.data.orders?.length ?? 0 },
                                    { label: 'Total Spent', value: `$${(activityPanel.data.totalSpent ?? 0).toFixed(2)}` },
                                ].map(item => (
                                    <div key={item.label} style={{ background: '#f8fafc', borderRadius: '10px', padding: '1rem' }}>
                                        <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</p>
                                        <p style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>{item.value}</p>
                                    </div>
                                ))}
                                {activityPanel.data.orders?.length > 0 && (
                                    <div>
                                        <p style={{ fontWeight: 700, fontSize: '0.85rem', color: '#475569', marginBottom: '0.5rem' }}>Recent Orders</p>
                                        {activityPanel.data.orders.slice(0, 5).map((order: any) => (
                                            <div key={order._id} style={{ background: '#f8fafc', borderRadius: '8px', padding: '0.65rem 0.875rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                                                <span style={{ fontFamily: 'monospace', color: '#64748b' }}>{order.displayId || order._id.slice(-8)}</span>
                                                <span style={{ fontWeight: 700, color: '#1e293b' }}>${order.totalPrice?.toFixed(2)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsersPage;
