import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState, AppDispatch } from '../../store';
import { saveShippingAddress, fetchCart } from '../../store/slices/cartSlice';
import api from '../../services/api';
import { useToast } from '../../components/common/Toast';

const CheckoutPage = () => {
    const cart = useSelector((state: RootState) => state.cart);
    const { shippingAddress, cartItems } = cart;
    const { userInfo } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { showToast } = useToast();

    // Filter only selected items
    const selectedItems = cartItems.filter(item => item.selected);
    const selectedItemsLength = selectedItems.length;
    const [isOrderPlaced, setIsOrderPlaced] = useState(false);

    useEffect(() => {
        dispatch(fetchCart());
    }, [dispatch]);

    useEffect(() => {
        if (userInfo?.role === 'seller' || userInfo?.role === 'admin') {
            showToast('Vendors/Admin cannot checkout', 'error');
            navigate('/shop');
            return;
        }
        if (isOrderPlaced) return;

        // Wait for loading to be false before checking for items
        if (!cart.loading && selectedItemsLength === 0) {
            navigate('/cart');
            showToast('No items selected for checkout', 'info');
        }
    }, [selectedItemsLength, navigate, showToast, userInfo?.role, cart.loading, isOrderPlaced]);

    const [fullName, setFullName] = useState(userInfo?.name || '');
    
    // Safely fallback to an empty object if shippingAddress is null or undefined
    const safeAddress = shippingAddress || {};
    
    const [phone, setPhone] = useState(safeAddress.phone || '');
    const [address, setAddress] = useState(safeAddress.address || '');
    const [city, setCity] = useState(safeAddress.city || '');
    const [postalCode, setPostalCode] = useState(safeAddress.postalCode || '');
    const [country, setCountry] = useState(safeAddress.country || '');
    const [stateProvince, setStateProvince] = useState(safeAddress.stateProvince || '');

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Mock Payment State
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardHolder, setCardHolder] = useState('');
    const fillMockCard = () => {
        setCardHolder(userInfo?.name || 'Demo User');
        setCardNumber('4242 4242 4242 4242');
        setExpiry('12/28');
        setCvv('123');
    };

    // Coupon state
    const [couponCode, setCouponCode] = useState('');
    const [couponInput, setCouponInput] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponApplying, setCouponApplying] = useState(false);

    const itemsPrice = selectedItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const shippingPrice = itemsPrice > 100 ? 0 : 10;
    const taxPrice = Number((0.15 * itemsPrice).toFixed(2));
    const totalPrice = Math.max(0, itemsPrice + shippingPrice + taxPrice - couponDiscount);

    const applyCoupon = async () => {
        if (!couponInput.trim()) return;
        setCouponApplying(true);
        try {
            const { data } = await api.post('/coupons/validate', {
                code: couponInput.trim().toUpperCase(),
                orderAmount: itemsPrice,
            });
            setCouponDiscount(data.discount);
            setCouponCode(data.coupon.code);
            showToast(`Coupon applied! You saved $${data.discount.toFixed(2)}`, 'success');
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Invalid coupon', 'error');
            setCouponDiscount(0);
            setCouponCode('');
        } finally {
            setCouponApplying(false);
        }
    };

    const removeCoupon = () => {
        setCouponCode('');
        setCouponInput('');
        setCouponDiscount(0);
        showToast('Coupon removed', 'info');
    };

    const submitShippingHandler = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(saveShippingAddress({ address, city, postalCode, country, phone, stateProvince, fullName }));
        setStep(2);
    };

    const placeOrder = async () => {
        setLoading(true);
        try {
            const orderData = {
                orderItems: selectedItems.map(item => ({
                    product: item.product,
                    name: item.name,
                    image: item.image,
                    price: item.price,
                    quantity: item.qty
                })),
                shippingAddress: { address, city, postalCode, country, phone, stateProvince, fullName },
                paymentMethod: 'Credit Card (Mock)',
                itemsPrice,
                shippingPrice,
                taxPrice,
                totalPrice,
                ...(couponCode ? { couponCode } : {}),
            };

            setIsOrderPlaced(true);
            const { data } = await api.post('/orders', orderData);
            await dispatch(fetchCart());
            setLoading(false);
            
            // Show explicit alert as requested
            alert('Order placed successfully!');
            showToast('Order placed successfully!', 'success');
            navigate(`/order/${data._id}`);
        } catch (error: any) {
            setLoading(false);
            setIsOrderPlaced(false);
            showToast(error.response?.data?.message || 'Error placing order', 'error');
        }
    };

    const placeOrderHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        await placeOrder();
    };

    if (selectedItems.length === 0) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="container" style={{ maxWidth: '1000px', marginTop: '2rem', marginBottom: '4rem' }}>
            {/* Step Indicator */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{
                        width: '30px', height: '30px', borderRadius: '50%',
                        backgroundColor: step >= 1 ? '#007185' : '#ccc', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                    }}>1</div>
                    <span style={{ marginLeft: '0.5rem', fontWeight: step >= 1 ? 'bold' : 'normal' }}>Address</span>
                </div>
                <div style={{ width: '50px', height: '2px', backgroundColor: '#ccc', margin: '0 1rem', alignSelf: 'center' }}></div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{
                        width: '30px', height: '30px', borderRadius: '50%',
                        backgroundColor: step >= 2 ? '#007185' : '#ccc', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                    }}>2</div>
                    <span style={{ marginLeft: '0.5rem', fontWeight: step >= 2 ? 'bold' : 'normal' }}>Payment</span>
                </div>
            </div>

            <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '2rem' }}>
                <div>
                    {step === 1 ? (
                        <div className="card">
                            <h2 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Shipping Address</h2>
                            <form onSubmit={submitShippingHandler}>
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <input type="text" className="form-input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone Number</label>
                                    <input type="tel" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Address</label>
                                    <input type="text" className="form-input" value={address} onChange={(e) => setAddress(e.target.value)} required />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label className="form-label">City</label>
                                        <input type="text" className="form-input" value={city} onChange={(e) => setCity(e.target.value)} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">State / Province</label>
                                        <input type="text" className="form-input" value={stateProvince} onChange={(e) => setStateProvince(e.target.value)} required />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label className="form-label">Postal Code</label>
                                        <input type="text" className="form-input" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Country</label>
                                        <input type="text" className="form-input" value={country} onChange={(e) => setCountry(e.target.value)} required />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            // Auto-fill address if empty
                                            if (!fullName) setFullName(userInfo?.name || 'Buyer User');
                                            if (!phone) setPhone('0200123456');
                                            if (!address) setAddress('123 Dev Street');
                                            if (!city) setCity('Dev City');
                                            if (!postalCode) setPostalCode('10101');
                                            if (!country) setCountry('Dev Land');
                                            if (!stateProvince) setStateProvince('Dev State');

                                            setTimeout(() => {
                                                placeOrder();
                                            }, 50);
                                        }}
                                        className="btn"
                                        style={{
                                            padding: '0.8rem 1.5rem',
                                            backgroundColor: '#6c757d',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px'
                                        }}
                                    >
                                        Bypass Payment & Place Order (Dev)
                                    </button>
                                    <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem 2rem' }}>
                                        Continue to Payment
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                                <h2>Payment Details</h2>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <button
                                        type="button"
                                        onClick={fillMockCard}
                                        style={{
                                            padding: '0.4rem 0.8rem',
                                            backgroundColor: '#3498db',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: '600'
                                        }}
                                    >
                                        Auto-fill Card
                                    </button>
                                    <button
                                        type="button"
                                        onClick={async () => {
                                            fillMockCard();
                                            await placeOrder();
                                        }}
                                        style={{
                                            padding: '0.4rem 0.8rem',
                                            backgroundColor: '#2ecc71',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: '600'
                                        }}
                                    >
                                        Quick Pay (Mock)
                                    </button>
                                    <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#007185', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem' }}>Edit Shipping</button>
                                </div>
                            </div>

                            <form onSubmit={placeOrderHandler}>
                                <div className="form-group">
                                    <label className="form-label">Cardholder Name</label>
                                    <input type="text" className="form-input" value={cardHolder} onChange={(e) => setCardHolder(e.target.value)} required placeholder="Name on Card" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Card Number</label>
                                    <input type="text" className="form-input" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} required placeholder="0000 0000 0000 0000" maxLength={19} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label className="form-label">Expiry Date</label>
                                        <input type="text" className="form-input" value={expiry} onChange={(e) => setExpiry(e.target.value)} required placeholder="MM/YY" maxLength={5} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">CVV</label>
                                        <input type="text" className="form-input" value={cvv} onChange={(e) => setCvv(e.target.value)} required placeholder="123" maxLength={4} />
                                    </div>
                                </div>

                                <div style={{ marginTop: '2rem' }}>
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-block"
                                        style={{ padding: '1rem', fontSize: '1.1rem', borderRadius: '4px', backgroundColor: '#ffd814', color: '#111', border: '1px solid #fcd200' }}
                                        disabled={loading}
                                    >
                                        {loading ? 'Processing Payment...' : `Pay $${totalPrice.toFixed(2)}`}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* Right Column Summary */}
                <div>
                    <div className="card" style={{ position: 'sticky', top: '2rem' }}>
                        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Order Summary</h2>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span>Items ({selectedItems.reduce((acc, x) => acc + x.qty, 0)}):</span>
                            <span>${itemsPrice.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span>Shipping:</span>
                            <span>${shippingPrice.toFixed(2)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span>Tax:</span>
                            <span>${taxPrice.toFixed(2)}</span>
                        </div>

                        {/* Coupon Input */}
                        <div style={{ margin: '1rem 0', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>🏷️ Coupon Code</div>
                            {couponCode ? (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#8b5cf6', letterSpacing: '1px' }}>{couponCode}</span>
                                    <button onClick={removeCoupon} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Remove</button>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        type="text"
                                        value={couponInput}
                                        onChange={e => setCouponInput(e.target.value.toUpperCase())}
                                        placeholder="Enter code"
                                        onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                                        style={{
                                            flex: 1, padding: '0.5rem 0.7rem', border: '1.5px solid #e2e8f0',
                                            borderRadius: '6px', fontSize: '0.85rem', fontFamily: 'monospace',
                                            fontWeight: 700, letterSpacing: '1px', outline: 'none'
                                        }}
                                    />
                                    <button
                                        onClick={applyCoupon}
                                        disabled={couponApplying}
                                        style={{
                                            padding: '0.5rem 0.9rem', background: '#8b5cf6', color: 'white',
                                            border: 'none', borderRadius: '6px', fontWeight: 700, cursor: 'pointer',
                                            fontSize: '0.85rem', opacity: couponApplying ? 0.7 : 1
                                        }}
                                    >
                                        {couponApplying ? '...' : 'Apply'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {couponDiscount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#10b981', fontWeight: 600 }}>
                                <span>🎉 Discount:</span>
                                <span>-${couponDiscount.toFixed(2)}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontWeight: 'bold', borderTop: '1px solid #eee', paddingTop: '0.5rem', fontSize: '1.2rem', color: '#B12704' }}>
                            <span>Order Total:</span>
                            <span>${totalPrice.toFixed(2)}</span>
                        </div>

                        <div style={{ marginTop: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Items in Cart</h3>
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {selectedItems.map((item, index) => (
                                    <div key={index} style={{ display: 'flex', gap: '0.8rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                                        <img src={item.image} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'cover', flexShrink: 0 }} />
                                        <div>
                                            <div style={{ fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.name}</div>
                                            <div style={{ color: '#565959' }}>Qty: {item.qty}</div>
                                            <div style={{ fontWeight: 700 }}>${item.price}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
