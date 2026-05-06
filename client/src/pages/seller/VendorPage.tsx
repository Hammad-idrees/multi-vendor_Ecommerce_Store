import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiPackage, FiStar, FiCalendar, FiMapPin, FiInfo } from 'react-icons/fi';
import api from '../../services/api';
import ProductCard from '../../components/product/ProductCard';
import { Product } from '../../types';

interface Vendor {
    _id: string;
    name: string;
    shopName: string;
    shopDescription: string;
    avatar?: string;
    createdAt: string;
}

const VendorPage = () => {
    const { id } = useParams<{ id: string }>();
    const [vendor, setVendor] = useState<Vendor | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchVendorData = async () => {
            setLoading(true);
            try {
                // Fetch vendor profile
                const vendorRes = await api.get(`/auth/seller/${id}`);
                setVendor(vendorRes.data);

                // Fetch vendor's products
                const productsRes = await api.get(`/products?seller=${id}`);
                setProducts(productsRes.data.products);

                setLoading(false);
            } catch (err: any) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };

        fetchVendorData();
    }, [id]);

    if (loading) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Loading shop...</div>;
    if (error) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center', color: 'red' }}>Error: {error}</div>;
    if (!vendor) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Vendor not found</div>;

    return (
        <div className="container" style={{ paddingBottom: '4rem' }}>
            {/* Vendor Header */}
            <div className="card" style={{ padding: '2rem', marginBottom: '3rem', marginTop: '2rem', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)' }}>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <div style={{ width: '120px', height: '120px', borderRadius: '1rem', overflow: 'hidden', backgroundColor: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '3rem', fontWeight: 800 }}>
                        {vendor.avatar ? (
                            <img src={vendor.avatar} alt={vendor.shopName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            vendor.shopName.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--primary)' }}>{vendor.shopName}</h1>
                                <p style={{ fontSize: '1.1rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FiInfo /> {vendor.shopDescription || 'No description provided.'}
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                                    <FiCalendar /> Joined {new Date(vendor.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                </div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem' }}>
                                    <FiPackage /> {products.length} Products
                                </div>
                            </div>
                        </div>
                        <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                            <div className="dash-badge dash-badge-green">Verified Seller</div>
                            <div className="dash-badge dash-badge-blue">Top Rated</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vendor Products */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Shop Catalog</h2>
                <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                    Showing {products.length} products
                </div>
            </div>

            {products.length > 0 ? (
                <div className="grid grid-cols-2 lg:grid-cols-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2rem' }}>
                    {products.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '4rem', background: '#f9fafb', borderRadius: '1rem', border: '2px dashed #e5e7eb' }}>
                    <FiPackage size={48} color="#9ca3af" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ color: '#4b5563' }}>No products listed yet</h3>
                    <p style={{ color: '#9ca3af' }}>Check back later for new arrivals.</p>
                </div>
            )}
        </div>
    );
};

export default VendorPage;
