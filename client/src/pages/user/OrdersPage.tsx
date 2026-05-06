import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const OrdersPage = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/orders/my')
            .then(({ data }) => setOrders(data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="container" style={{ padding: '2rem 0' }}>Loading orders...</div>;

    return (
        <div className="container" style={{ padding: '2rem 0 3rem' }}>
            <h1 style={{ marginBottom: '1rem' }}>My Orders</h1>
            <div className="card" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                            <th style={{ padding: '0.75rem' }}>Order ID</th>
                            <th style={{ padding: '0.75rem' }}>Date</th>
                            <th style={{ padding: '0.75rem' }}>Total</th>
                            <th style={{ padding: '0.75rem' }}>Status</th>
                            <th style={{ padding: '0.75rem' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '0.75rem', fontWeight: 700 }}>{order.displayId || order._id}</td>
                                <td style={{ padding: '0.75rem' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td style={{ padding: '0.75rem' }}>${order.totalPrice?.toFixed(2)}</td>
                                <td style={{ padding: '0.75rem' }}>{order.status}</td>
                                <td style={{ padding: '0.75rem' }}>
                                    <Link to={`/order/${order._id}`}>View</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!orders.length && <p style={{ padding: '1rem', color: '#64748b' }}>No orders yet.</p>}
            </div>
        </div>
    );
};

export default OrdersPage;
