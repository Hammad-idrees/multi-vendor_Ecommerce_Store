
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';

const OrderDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await api.get(`/orders/${id}`);
                setOrder(data);
                setLoading(false);
            } catch (err: any) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };

        if (id) fetchOrder();
    }, [id]);

    if (loading) return <div className="container" style={{ marginTop: '2rem' }}>Loading...</div>;
    if (error) return <div className="container" style={{ marginTop: '2rem', color: 'red' }}>Error: {error}</div>;
    if (!order) return <div className="container" style={{ marginTop: '2rem' }}>Order not found</div>;

    const { shippingAddress, items, user, paymentMethod, isPaid, paidAt, isDelivered, deliveredAt, totalPrice } = order;
    const itemsPrice = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    const shippingPrice = Math.max(0, Number(totalPrice) - itemsPrice - Number((0.15 * itemsPrice).toFixed(2)));
    const taxPrice = Number((0.15 * itemsPrice).toFixed(2));

    return (
        <div className="container" style={{ marginTop: '2rem' }}>
            <h1 style={{ marginBottom: '1.5rem' }}>Order {order.displayId || order._id}</h1>
            <div className="grid grid-cols-2" style={{ gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                <div>
                    <div className="card" style={{ marginBottom: '1.5rem' }}>
                        <h2>Shipping</h2>
                        <p>
                            <strong>Name: </strong> {user.name} <a href={`mailto:${user.email}`}>{user.email}</a>
                        </p>
                        <p>
                            <strong>Address: </strong>
                            {shippingAddress.address}, {shippingAddress.city}, {shippingAddress.postalCode}, {shippingAddress.country}
                        </p>
                        {isDelivered ? (
                            <div className="alert alert-success">Delivered on {new Date(deliveredAt).toLocaleDateString()}</div>
                        ) : (
                            <div className="alert alert-danger">Not Delivered</div>
                        )}
                    </div>

                    <div className="card" style={{ marginBottom: '1.5rem' }}>
                        <h2>Payment Method</h2>
                        <p>
                            <strong>Method: </strong> {paymentMethod}
                        </p>
                        {isPaid ? (
                            <div className="alert alert-success">Paid on {new Date(paidAt).toLocaleDateString()}</div>
                        ) : (
                            <div className="alert alert-danger">Not Paid</div>
                        )}
                    </div>

                    <div className="card">
                        <h2>Order Items</h2>
                        {items.length === 0 ? <p>Order is empty</p> : (
                            <div>
                                {items.map((item: any, index: number) => (
                                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', padding: '0.5rem 0' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <img src={item.image || 'https://via.placeholder.com/50'} alt={item.name} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                                            <Link to={`/product/${item.product}`}>{item.name}</Link>
                                        </div>
                                        <div>
                                            {item.quantity} x ${item.price} = ${(item.quantity * item.price).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <div className="card">
                        <h2>Order Summary</h2>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span>Items</span>
                            <span>${itemsPrice.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span>Shipping</span>
                            <span>${shippingPrice.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span>Tax</span>
                            <span>${taxPrice.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontWeight: 'bold', borderTop: '1px solid #eee', paddingTop: '0.5rem' }}>
                            <span>Total</span>
                            <span>${totalPrice.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsPage;
