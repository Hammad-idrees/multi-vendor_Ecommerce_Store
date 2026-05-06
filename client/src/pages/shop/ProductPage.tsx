
import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { addToCart } from '../../store/slices/cartSlice';
import { addToWishlist, removeFromWishlist, fetchWishlist } from '../../store/slices/wishlistSlice';
import api from '../../services/api';
import { Product } from '../../types';
import { FaTrash, FaMinus, FaPlus, FaHeart, FaRegHeart } from 'react-icons/fa';
import RatingStars from '../../components/common/RatingStars';
import ReviewList from '../../components/product/ReviewList';
import ReviewForm from '../../components/product/ReviewForm';
import ProductCard from '../../components/product/ProductCard';

const ProductPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [qty, setQty] = useState(1);
    const [activeImage, setActiveImage] = useState('');
    const [refreshReviews, setRefreshReviews] = useState(0);

    const { userInfo } = useSelector((state: RootState) => state.auth);
    const { items: wishlistItems } = useSelector((state: RootState) => state.wishlist);
    const isWishlisted = wishlistItems.some((item: any) => item._id === id);

    useEffect(() => {
        if (userInfo) {
            dispatch(fetchWishlist());
        }
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const { data } = await api.get(`/products/${id}`);
                setProduct(data);
                // Set initial active image
                if (data.images && data.images.length > 0) {
                    setActiveImage(data.images[0]);
                } else {
                    setActiveImage('https://via.placeholder.com/600');
                }

                // Fetch related products
                if (data.category && (data.category._id || typeof data.category === 'string')) {
                    const catId = typeof data.category === 'object' ? (data.category as any)._id : data.category;
                    const relatedRes = await api.get(`/products?category=${catId}`);
                    // Filter out current product
                    setRelatedProducts(relatedRes.data.products.filter((p: Product) => p._id !== data._id).slice(0, 4));
                }

                setLoading(false);
            } catch (err: any) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id, refreshReviews]);

    const addToCartHandler = async () => {
        if (userInfo) {
            try {
                await dispatch(addToCart({ productId: id!, quantity: qty })).unwrap();
                navigate('/cart');
            } catch (err: any) {
                alert('Failed to add to cart: ' + (err.message || 'Unknown error'));
            }
        } else {
            navigate(`/login?redirect=/product/${id}`);
        }
    };

    const toggleWishlistHandler = () => {
        if (!userInfo) {
            navigate(`/login?redirect=/product/${id}`);
            return;
        }
        if (isWishlisted) {
            dispatch(removeFromWishlist(id!));
        } else {
            dispatch(addToWishlist(id!));
        }
    };

    if (loading) return <div className="container" style={{ marginTop: '2rem' }}>Loading...</div>;
    if (error) return <div className="container" style={{ marginTop: '2rem' }}>Error: {error}</div>;
    if (!product) return <div className="container" style={{ marginTop: '2rem' }}>Product not found</div>;

    const countInStock = (product.variants && product.variants.length > 0)
        ? product.variants.reduce((acc: number, item: any) => acc + (item.stock || 0), 0)
        : (product.stock || 0);
    const allImages = product.images && product.images.length > 0 ? product.images : ['https://via.placeholder.com/600'];

    return (
        <div className="container">
            <Link to="/" className="btn btn-primary" style={{ marginBottom: '1rem', marginTop: '1rem', display: 'inline-block' }}>
                Go Back
            </Link>

            {/* Top Section: Images and Details */}
            <div className="grid grid-cols-2" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '3rem', marginBottom: '4rem' }}>

                {/* Image Gallery */}
                <div>
                    <div style={{ marginBottom: '1rem', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #eee' }}>
                        <img
                            src={activeImage}
                            alt={product.name}
                            style={{ width: '100%', height: '500px', objectFit: 'contain' }}
                        />
                    </div>
                    {/* Thumbnails */}
                    {allImages.length > 1 && (
                        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                            {allImages.map((img, index) => (
                                <img
                                    key={index}
                                    src={img}
                                    alt={`Product view ${index + 1}`}
                                    onClick={() => setActiveImage(img)}
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        objectFit: 'cover',
                                        borderRadius: '0.25rem',
                                        cursor: 'pointer',
                                        border: activeImage === img ? '2px solid var(--primary-color)' : '1px solid #ddd'
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: 700, flex: 1 }}>{product.name}</h2>
                        <button 
                            onClick={toggleWishlistHandler}
                            style={{ 
                                background: 'none', 
                                border: 'none', 
                                cursor: 'pointer', 
                                padding: '0.5rem',
                                color: isWishlisted ? '#ef4444' : '#ccc',
                                transition: 'transform 0.2s ease',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                        >
                            {isWishlisted ? <FaHeart size={28} /> : <FaRegHeart size={28} />}
                        </button>
                    </div>
                    <div style={{ marginBottom: '1.5rem', color: '#666' }}>
                        <RatingStars value={product.rating} text={`${product.numReviews} reviews`} />
                    </div>
                    <h3 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: '#333' }}>${product.price}</h3>

                    <div style={{ marginBottom: '2rem', lineHeight: '1.6', color: '#555' }}>
                        {product.description.substring(0, 150)}...
                        <a href="#description" style={{ color: 'var(--primary-color)', marginLeft: '0.5rem' }}>Read more</a>
                    </div>

                    {/* Vendor Info Section */}
                    {product.seller && (
                        <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #eef2f6', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 700 }}>
                                {(product.seller as any).shopName?.charAt(0) || (product.seller as any).name?.charAt(0) || 'V'}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Seller Information</div>
                                <Link 
                                    to={`/vendor/${(product.seller as any)._id || product.seller}`} 
                                    style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}
                                >
                                    {(product.seller as any).shopName || (product.seller as any).name}
                                </Link>
                            </div>
                            <Link to={`/vendor/${(product.seller as any)._id || product.seller}`} className="btn btn-ghost" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                                Visit Shop
                            </Link>
                        </div>
                    )}

                    <div className="card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <span style={{ fontWeight: 600 }}>Status:</span>
                            <span style={{ color: countInStock > 0 ? 'green' : 'red' }}>
                                {countInStock > 0 ? 'In Stock' : 'Out Of Stock'}
                            </span>
                        </div>

                        {countInStock > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
                                <span style={{ fontWeight: 600 }}>Quantity:</span>
                                <select
                                    value={qty}
                                    onChange={(e) => setQty(Number(e.target.value))}
                                    style={{ padding: '0.5rem', borderRadius: '0.25rem', border: '1px solid #ddd', minWidth: '80px' }}
                                >
                                    {[...Array(countInStock > 10 ? 10 : countInStock).keys()].map((x) => (
                                        <option key={x + 1} value={x + 1}>
                                            {x + 1}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button
                            className="btn btn-accent btn-block"
                            disabled={countInStock === 0}
                            onClick={addToCartHandler}
                            style={{ padding: '1rem', fontSize: '1.1rem' }}
                        >
                            {countInStock === 0 ? 'Out of Stock' : 'Add To Cart'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Description & Reviews Section */}
            <div style={{ marginBottom: '4rem' }}>
                <div style={{ borderBottom: '1px solid #ddd', marginBottom: '2rem', display: 'flex', gap: '2rem' }}>
                    <h3 style={{ paddingBottom: '0.5rem', borderBottom: '3px solid var(--primary-color)', cursor: 'default' }}>
                        Description
                    </h3>
                    <h3 style={{ paddingBottom: '0.5rem', color: '#888', cursor: 'default' }}>
                        Reviews ({product.numReviews})
                    </h3>
                </div>

                <div id="description" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
                    <div>
                        <h4 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Product Description</h4>
                        <p style={{ lineHeight: '1.8', color: '#444' }}>{product.description}</p>
                    </div>
                    <div>
                        <ReviewList productId={id!} refreshTrigger={refreshReviews} />
                        <ReviewForm productId={id!} onReviewAdded={() => setRefreshReviews(prev => prev + 1)} />
                    </div>
                </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <div style={{ marginTop: '4rem', marginBottom: '2rem' }}>
                    <h3 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Related Products</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
                        {relatedProducts.map(p => (
                            <ProductCard key={p._id} product={p} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductPage;
