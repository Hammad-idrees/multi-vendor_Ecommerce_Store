import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useComparison } from '../../context/ComparisonContext';
import { useCurrency } from '../../context/CurrencyContext';
import { AppDispatch } from '../../store';
import { addToCart } from '../../store/slices/cartSlice';
import { FiTrash2 } from 'react-icons/fi';

const ComparisonPage = () => {
    const { compareList, removeFromCompare, clearCompare } = useComparison();
    const { convert } = useCurrency();
    const dispatch = useDispatch<AppDispatch>();

    const getProductImage = (imageList?: string[]) =>
        imageList && imageList.length > 0 ? imageList[0] : 'https://via.placeholder.com/300';

    const getCategoryName = (category: any) =>
        typeof category === 'string' ? category : category?.name || 'Uncategorized';

    const getSellerName = (seller: any) =>
        typeof seller === 'string' ? 'Vendor' : seller?.shopName || seller?.name || 'Vendor';

    if (compareList.length < 2) {
        return (
            <div className="container" style={{ padding: '2rem 0 4rem' }}>
                <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                    <h1 style={{ marginBottom: '0.75rem' }}>Compare Products</h1>
                    <p style={{ color: 'var(--text-light)', marginBottom: '1.25rem' }}>
                        Add at least 2 products to see a side-by-side comparison.
                    </p>
                    <Link to="/shop" className="btn btn-primary">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '2rem 0 4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ marginBottom: '0.4rem' }}>Product Comparison</h1>
                    <p style={{ color: 'var(--text-light)' }}>Comparing {compareList.length} products</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Link to="/shop" className="btn btn-primary">Add More Products</Link>
                    <button onClick={clearCompare} className="btn" style={{ background: '#ef4444', color: 'white' }}>
                        Clear All
                    </button>
                </div>
            </div>

            <div className="card" style={{ overflowX: 'auto' }}>
                <table style={{ minWidth: '900px', width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                            <th style={{ textAlign: 'left', padding: '1rem', width: '200px' }}>Feature</th>
                            {compareList.map((p) => (
                                <th key={p._id} style={{ textAlign: 'center', padding: '1rem', minWidth: '230px' }}>
                                    <img
                                        src={getProductImage(p.images)}
                                        alt={p.name}
                                        style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '0.5rem', marginBottom: '0.75rem' }}
                                    />
                                    <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{p.name}</div>
                                    <button
                                        onClick={() => removeFromCompare(p._id)}
                                        className="btn"
                                        style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.35rem 0.65rem' }}
                                    >
                                        <FiTrash2 /> Remove
                                    </button>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ fontWeight: 700, padding: '0.9rem 1rem' }}>Price</td>
                            {compareList.map((p) => <td key={p._id} style={{ textAlign: 'center', fontWeight: 800 }}>{convert(p.price)}</td>)}
                        </tr>
                        <tr>
                            <td style={{ fontWeight: 700, padding: '0.9rem 1rem' }}>Rating</td>
                            {compareList.map((p) => <td key={p._id} style={{ textAlign: 'center' }}>{(p.averageRating ?? 0).toFixed(1)} / 5 ({p.numReviews ?? 0} reviews)</td>)}
                        </tr>
                        <tr>
                            <td style={{ fontWeight: 700, padding: '0.9rem 1rem' }}>Seller</td>
                            {compareList.map((p) => <td key={p._id} style={{ textAlign: 'center' }}>{getSellerName(p.seller)}</td>)}
                        </tr>
                        <tr>
                            <td style={{ fontWeight: 700, padding: '0.9rem 1rem' }}>Category</td>
                            {compareList.map((p) => <td key={p._id} style={{ textAlign: 'center' }}>{getCategoryName(p.category)}</td>)}
                        </tr>
                        <tr>
                            <td style={{ fontWeight: 700, padding: '0.9rem 1rem' }}>Stock</td>
                            {compareList.map((p) => (
                                <td key={p._id} style={{ textAlign: 'center' }}>
                                    <span style={{ color: (p.stock || 0) > 0 ? '#16a34a' : '#dc2626', fontWeight: 700 }}>
                                        {(p.stock || 0) > 0 ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                </td>
                            ))}
                        </tr>
                        <tr>
                            <td style={{ fontWeight: 700, padding: '0.9rem 1rem' }}>Actions</td>
                            {compareList.map((p) => (
                                <td key={p._id} style={{ textAlign: 'center', padding: '0.9rem 1rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => dispatch(addToCart({ productId: p._id, qty: 1 }))}
                                        >
                                            Add to Cart
                                        </button>
                                        <Link to={`/product/${p._id}`} className="btn btn-accent">
                                            View
                                        </Link>
                                    </div>
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ComparisonPage;
