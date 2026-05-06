import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import {
    fetchCart,
    removeFromCart,
    updateCartItem,
    toggleItemSelection,
    selectAllItems
} from '../../store/slices/cartSlice';
import { useToast } from '../../components/common/Toast';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';

const CartPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { cartItems, loading } = useSelector((state: RootState) => state.cart);
    const { userInfo } = useSelector((state: RootState) => state.auth);
    const { showToast } = useToast();

    useEffect(() => {
        dispatch(fetchCart());
    }, [dispatch]);

    // Calculate totals based on selection
    const selectedItems = cartItems.filter(item => item.selected);
    const totalItems = selectedItems.reduce((acc, item) => acc + item.qty, 0);
    const totalPrice = selectedItems.reduce((acc, item) => acc + item.qty * item.price, 0);
    const allSelected = cartItems.length > 0 && cartItems.every(item => item.selected);

    const checkoutHandler = () => {
        if (!userInfo) {
            navigate('/login?redirect=checkout');
        } else if (userInfo.role === 'seller' || userInfo.role === 'admin') {
            showToast('Vendors/Admin cannot place orders', 'error');
        } else if (selectedItems.length === 0) {
            showToast('Please select items to checkout', 'info');
        } else {
            navigate('/checkout');
        }
    };

    const updateQty = async (item: any, qty: number) => {
        if (!item.id) return;
        if (qty < 1) return;
        if (qty > item.countInStock) {
            showToast(`Sorry, only ${item.countInStock} items in stock`, 'error');
            return;
        }
        try {
            await dispatch(updateCartItem({ itemId: item.id, quantity: qty })).unwrap();
            showToast('Cart updated successfully', 'success');
        } catch (error: any) {
            showToast(error || 'Failed to update cart', 'error');
        }
    };

    const handleRemove = async (itemId: string) => {
        try {
            await dispatch(removeFromCart(itemId)).unwrap();
            showToast('Item removed from cart', 'success');
        } catch (error: any) {
            showToast(error || 'Failed to remove item', 'error');
        }
    };

    if (loading && cartItems.length === 0) {
        return (
            <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
                <p>Loading your cart...</p>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
                <h1 style={{ marginBottom: '1rem' }}>Your Cart is Empty</h1>
                <p style={{ marginBottom: '2rem', color: '#666' }}>Looks like you haven't added anything to your cart yet.</p>
                <Link to="/" className="btn btn-primary">Start Shopping</Link>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
            <h1 style={{ marginBottom: '2rem', fontSize: '2rem', fontWeight: 700 }}>Shopping Cart</h1>

            <div className="cart-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 350px', gap: '2rem', alignItems: 'start' }}>
                {/* Cart Items List */}
                <div className="cart-list" style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
                        <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={(e) => dispatch(selectAllItems(e.target.checked))}
                            style={{ width: '18px', height: '18px', marginRight: '1rem', cursor: 'pointer' }}
                        />
                        <span style={{ fontWeight: 600 }}>Select All ({cartItems.length} items)</span>
                    </div>

                    {cartItems.map((item) => (
                        <div key={item.id || `${item.product}-${JSON.stringify(item.variant || {})}`} style={{ display: 'flex', gap: '1.5rem', paddingBottom: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #eee' }}>
                            <div style={{ alignSelf: 'center' }}>
                                <input
                                    type="checkbox"
                                    checked={item.selected || false}
                                    onChange={() => item.id && dispatch(toggleItemSelection({ itemId: item.id, selected: !item.selected }))}
                                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                    disabled={!item.id}
                                />
                            </div>

                            <div style={{ width: '120px', height: '120px', flexShrink: 0, backgroundColor: '#f9f9f9', borderRadius: '4px', overflow: 'hidden' }}>
                                <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>

                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div>
                                    <Link to={`/product/${item.product}`} style={{ fontSize: '1.1rem', fontWeight: 600, color: '#333', textDecoration: 'none', marginBottom: '0.5rem', display: 'block' }}>
                                        {item.name}
                                    </Link>
                                    <div style={{ fontSize: '0.9rem', color: '#007600', marginBottom: '0.5rem' }}>In Stock</div>
                                    <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>${item.price}</div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', marginTop: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '4px', marginRight: '1.5rem' }}>
                                        <button
                                            onClick={() => updateQty(item, item.qty - 1)}
                                            style={{ background: 'none', border: 'none', padding: '0.5rem 0.8rem', cursor: 'pointer', color: '#555' }}
                                            disabled={item.qty <= 1}
                                        >
                                            <FaMinus size={10} />
                                        </button>
                                        <span style={{ padding: '0 0.5rem', fontWeight: 600, minWidth: '30px', textAlign: 'center' }}>{item.qty}</span>
                                        <button
                                            onClick={() => updateQty(item, item.qty + 1)}
                                            style={{ background: 'none', border: 'none', padding: '0.5rem 0.8rem', cursor: 'pointer', color: '#555' }}
                                            disabled={item.qty >= item.countInStock}
                                        >
                                            <FaPlus size={10} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => item.id && handleRemove(item.id)}
                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '0.9rem' }}
                                        disabled={!item.id}
                                    >
                                        <FaTrash style={{ marginRight: '0.4rem' }} /> Remove
                                    </button>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right', fontWeight: 700, fontSize: '1.2rem' }}>
                                ${(item.price * item.qty).toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary Panel */}
                <div style={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', padding: '1.5rem', position: 'sticky', top: '2rem' }}>
                    <h2 style={{ fontSize: '1.3rem', borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1rem' }}>Order Summary</h2>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', fontSize: '1rem' }}>
                        <span>Selected Items:</span>
                        <span>{totalItems}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.4rem', fontWeight: 700 }}>
                        <span>Total:</span>
                        <span>${totalPrice.toFixed(2)}</span>
                    </div>

                    <button
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', borderRadius: '30px' }}
                        onClick={checkoutHandler}
                        disabled={selectedItems.length === 0}
                    >
                        Proceed to Checkout
                    </button>

                    {selectedItems.length === 0 && cartItems.length > 0 && (
                        <p style={{ marginTop: '1rem', color: '#ef4444', textAlign: 'center', fontSize: '0.9rem' }}>
                            Please select items to proceed
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CartPage;
