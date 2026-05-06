import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiTrash2, FiArrowLeft, FiStar } from 'react-icons/fi';
import { RootState, AppDispatch } from '../../store';
import { fetchWishlist, removeFromWishlist } from '../../store/slices/wishlistSlice';
import { addToCart } from '../../store/slices/cartSlice';

const WishlistPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { userInfo } = useSelector((state: RootState) => state.auth);
    const { items, loading } = useSelector((state: RootState) => state.wishlist);

    useEffect(() => {
        if (!userInfo) {
            navigate('/login?redirect=/wishlist');
            return;
        }
        dispatch(fetchWishlist());
    }, [dispatch, userInfo, navigate]);

    const handleRemove = (productId: string) => {
        dispatch(removeFromWishlist(productId));
    };

    const handleAddToCart = async (productId: string) => {
        if (!userInfo) {
            navigate('/login?redirect=/wishlist');
            return;
        }
        await dispatch(addToCart({ productId, quantity: 1 }));
        navigate('/cart');
    };

    return (
        <div className="container" style={{ padding: '2rem 0', minHeight: '80vh' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate(-1)}
                    className="btn btn-ghost"
                    style={{ padding: '0.5rem', borderRadius: '50%' }}
                >
                    <FiArrowLeft size={20} />
                </button>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <FiHeart style={{ color: '#ef4444' }} />
                        My Wishlist
                    </h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>
                        {items.length} {items.length === 1 ? 'item' : 'items'} saved
                    </p>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="card" style={{ height: '340px', background: 'var(--surface-hover)', animation: 'pulse 1.5s infinite' }} />
                    ))}
                </div>
            ) : items.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        textAlign: 'center',
                        padding: '5rem 2rem',
                        background: 'var(--surface)',
                        borderRadius: 'var(--radius-xl)',
                        border: '2px dashed var(--border)',
                    }}
                >
                    <div style={{
                        width: '100px', height: '100px', borderRadius: '50%',
                        background: 'hsla(0, 80%, 60%, 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                    }}>
                        <FiHeart size={48} style={{ color: '#ef4444', opacity: 0.5 }} />
                    </div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Your wishlist is empty</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                        Tap the ❤️ on any product to save it here for later.
                    </p>
                    <Link to="/shop" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
                        Start Shopping
                    </Link>
                </motion.div>
            ) : (
                <AnimatePresence>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                        gap: '1.5rem',
                    }}>
                        {items.map((product: any) => (
                            <motion.div
                                key={product._id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                className="card"
                                style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}
                            >
                                {/* Product Image */}
                                <Link to={`/product/${product._id}`} style={{ display: 'block', position: 'relative' }}>
                                    <img
                                        src={product.images?.[0] || 'https://via.placeholder.com/300'}
                                        alt={product.name}
                                        style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${product._id}/300/200`;
                                        }}
                                    />
                                    {/* Remove Button */}
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleRemove(product._id);
                                        }}
                                        title="Remove from wishlist"
                                        style={{
                                            position: 'absolute', top: '0.75rem', right: '0.75rem',
                                            background: 'white', border: 'none', borderRadius: '50%',
                                            width: '36px', height: '36px', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                            color: '#ef4444', transition: 'transform 0.2s',
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')}
                                        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                                    >
                                        <FiTrash2 size={16} />
                                    </button>

                                    {/* Out of stock badge */}
                                    {product.stock === 0 && (
                                        <div style={{
                                            position: 'absolute', bottom: '0.75rem', left: '0.75rem',
                                            background: 'rgba(0,0,0,0.7)', color: 'white',
                                            padding: '0.25rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                                        }}>
                                            Out of Stock
                                        </div>
                                    )}
                                </Link>

                                {/* Product Info */}
                                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.5rem' }}>
                                    <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <h3 style={{
                                            fontSize: '0.95rem', fontWeight: 700, lineHeight: 1.4,
                                            display: '-webkit-box', WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical', overflow: 'hidden',
                                        }}>
                                            {product.name}
                                        </h3>
                                    </Link>

                                    {/* Rating */}
                                    {product.averageRating > 0 && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            <FiStar style={{ color: '#f59e0b', fill: '#f59e0b' }} size={13} />
                                            <span>{product.averageRating.toFixed(1)}</span>
                                            <span>({product.numReviews} reviews)</span>
                                        </div>
                                    )}

                                    {/* Price */}
                                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'hsl(var(--accent-h), var(--accent-s), var(--accent-l))' }}>
                                        ${product.price}
                                    </div>

                                    {/* Add to Cart Button */}
                                    <button
                                        className="btn btn-primary"
                                        disabled={product.stock === 0}
                                        onClick={() => handleAddToCart(product._id)}
                                        style={{
                                            marginTop: 'auto',
                                            display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', gap: '0.5rem',
                                            opacity: product.stock === 0 ? 0.5 : 1,
                                        }}
                                    >
                                        <FiShoppingCart size={16} />
                                        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </AnimatePresence>
            )}
        </div>
    );
};

export default WishlistPage;
