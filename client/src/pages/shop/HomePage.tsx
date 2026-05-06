import { useEffect, useState } from 'react';
import api from '../../services/api';
import ProductCard from '../../components/product/ProductCard';
import { Product } from '../../types';
import { Link } from 'react-router-dom';
import { FiUsers, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import HomeHeroSection from '../../components/home/HomeHeroSection';

interface Vendor {
    _id: string;
    shopName: string;
    avatar?: string;
}

const HomePage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, vendorsRes] = await Promise.all([
                    api.get('/products?limit=8'),
                    api.get('/auth/sellers')
                ]);
                setProducts(productsRes.data.products);
                setVendors(vendorsRes.data.slice(0, 6)); // Show top 6 vendors
                setLoading(false);
            } catch (err: any) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="container" style={{ paddingBottom: '4rem' }}>
            {/* Hero Section */}
            <HomeHeroSection />

            {/* Featured Vendors Section */}
            <div style={{ marginBottom: '4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <FiUsers style={{ color: 'var(--accent)' }} /> Featured Vendors
                    </h2>
                    <Link to="/vendors" style={{ color: 'var(--accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        All Sellers <FiArrowRight />
                    </Link>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.5rem' }}>
                    {vendors.map((vendor) => (
                        <Link 
                            key={vendor._id} 
                            to={`/vendor/${vendor._id}`} 
                            style={{ textDecoration: 'none', textAlign: 'center', padding: '1.5rem', borderRadius: '1rem', background: '#fff', border: '1px solid #eee', transition: 'transform 0.2s, box-shadow 0.2s' }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; (e.currentTarget.style as any).shadow = '0 10px 25px rgba(0,0,0,0.05)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; (e.currentTarget.style as any).shadow = 'none'; }}
                        >
                            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, margin: '0 auto 1rem', overflow: 'hidden' }}>
                                {vendor.avatar ? (
                                    <img src={vendor.avatar} alt={vendor.shopName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    vendor.shopName.charAt(0).toUpperCase()
                                )}
                            </div>
                            <h4 style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.1rem' }}>{vendor.shopName}</h4>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>Verified Store</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Latest Arrivals Section */}
            <div id="latest-products" style={{ marginBottom: '4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <FiShoppingBag style={{ color: 'var(--accent)' }} /> Latest Arrivals
                    </h2>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>
                        <div className="dash-spinner" style={{ margin: '0 auto' }}></div>
                        <p style={{ marginTop: '1rem', color: '#64748b' }}>Discovering products...</p>
                    </div>
                ) : error ? (
                    <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2rem' }}>
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </div>

            {/* Call to Action */}
            <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '1.5rem', padding: '4rem 2rem', textAlign: 'center', color: 'white' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Start Selling on Martify</h2>
                <p style={{ fontSize: '1.1rem', opacity: 0.8, marginBottom: '2rem', maxWidth: '700px', margin: '0 auto 2rem' }}>
                    Join thousands of vendors and reach millions of customers worldwide with our easy-to-use platform and powerful analytics.
                </p>
                <Link to="/register?role=seller" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.2rem', fontWeight: 700 }}>
                    Create Your Shop Today
                </Link>
            </div>
        </div>
    );
};

export default HomePage;
