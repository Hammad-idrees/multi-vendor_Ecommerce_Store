import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import api from '../../services/api';
import { Product, Category } from '../../types';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiSearch, FiCheckCircle, FiXCircle, FiX, FiCheck, FiImage } from 'react-icons/fi';

const ProductManagementPage = () => {
    const navigate = useNavigate();
    const { userInfo } = useSelector((state: RootState) => state.auth);
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [saving, setSaving] = useState(false);

    // Edit form state
    const [editForm, setEditForm] = useState({
        name: '', description: '', price: 0, stock: 0, category: '', isApproved: false, isFeatured: false, images: ''
    });

    useEffect(() => {
        if (!userInfo || userInfo.role !== 'admin') navigate('/login');
        else {
            fetchProducts();
            fetchCategories();
        }
    }, [navigate, userInfo]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/products?limit=100'); // Fetch more for admin
            setProducts(data.products);
        } catch { toast.error('Failed to load products'); }
        finally { setLoading(false); }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories');
            setCategories(data);
        } catch { console.error('Failed to fetch categories'); }
    };

    const filteredProducts = useMemo(() => {
        if (!search.trim()) return products;
        const q = search.toLowerCase();
        return products.filter(p => p.name.toLowerCase().includes(q) || (typeof p.seller !== 'string' && p.seller?.shopName?.toLowerCase().includes(q)));
    }, [products, search]);

    const deleteHandler = async (id: string) => {
        if (!window.confirm('Permanently delete this product?')) return;
        try {
            await api.delete(`/products/${id}`);
            toast.success('Product deleted');
            await fetchProducts();
        } catch { toast.error('Failed to delete product'); }
    };

    const startEdit = (product: Product) => {
        setEditingProduct(product);
        setEditForm({
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            category: typeof product.category === 'object' ? product.category._id : product.category,
            isApproved: product.isApproved ?? false,
            isFeatured: product.isFeatured ?? false,
            images: product.images.join(', ')
        });
    };

    const handleUpdate = async (e: FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;
        setSaving(true);
        try {
            const payload = {
                ...editForm,
                images: editForm.images.split(',').map(i => i.trim()).filter(Boolean)
            };
            await api.put(`/products/${editingProduct._id}`, payload);
            toast.success('Product updated successfully');
            setEditingProduct(null);
            await fetchProducts();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update product');
        } finally {
            setSaving(false);
        }
    };

    const toggleApproval = async (product: Product) => {
        try {
            await api.put(`/products/${product._id}`, { isApproved: !product.isApproved });
            toast.success(`Product ${!product.isApproved ? 'approved' : 'unapproved'}`);
            await fetchProducts();
        } catch { toast.error('Failed to update status'); }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem', paddingBottom: '3rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, color: '#1e293b' }}>Product Moderation</h1>
                    <p style={{ margin: '0.25rem 0 0', color: '#64748b' }}>Manage, approve, and edit all products on the platform</p>
                </div>
                <div style={{ position: 'relative', width: '300px' }}>
                    <FiSearch style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text" placeholder="Search products or vendors..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.25rem', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
                    />
                </div>
            </div>

            {/* Products Table */}
            <div style={{ background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0', overflowX: 'auto', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                {loading ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading products...</div>
                ) : filteredProducts.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No products found</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                        <thead>
                            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                {['Product', 'Price / Stock', 'Vendor', 'Status', 'Actions'].map(h => (
                                    <th key={h} style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((product, i) => (
                                <tr key={product._id} style={{ borderBottom: i < filteredProducts.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                    <td style={{ padding: '0.9rem 1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '6px', background: '#f1f5f9', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                {product.images?.[0] ? <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <FiImage color="#94a3b8" />}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</div>
                                                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{typeof product.category === 'object' ? product.category.name : 'Unknown Category'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '0.9rem 1rem' }}>
                                        <div style={{ fontWeight: 700, color: '#1e293b' }}>${product.price.toFixed(2)}</div>
                                        <div style={{ fontSize: '0.78rem', color: product.stock > 0 ? '#10b981' : '#ef4444' }}>{product.stock} in stock</div>
                                    </td>
                                    <td style={{ padding: '0.9rem 1rem', fontSize: '0.85rem' }}>
                                        <div style={{ fontWeight: 600, color: '#3b82f6' }}>{typeof product.seller !== 'string' ? product.seller.shopName || product.seller.name : 'Unknown'}</div>
                                    </td>
                                    <td style={{ padding: '0.9rem 1rem' }}>
                                        <button onClick={() => toggleApproval(product)} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: product.isApproved ? '#f0fdf4' : '#fff7ed', color: product.isApproved ? '#10b981' : '#f59e0b', borderRadius: '20px', padding: '0.2rem 0.65rem', fontSize: '0.75rem', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                                            {product.isApproved ? <FiCheckCircle size={12} /> : <FiXCircle size={12} />}
                                            {product.isApproved ? 'Approved' : 'Pending'}
                                        </button>
                                        {product.isFeatured && <div style={{ marginTop: '0.2rem', fontSize: '0.7rem', color: '#8b5cf6', fontWeight: 700 }}>★ Featured</div>}
                                    </td>
                                    <td style={{ padding: '0.9rem 1rem' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => startEdit(product)} title="Edit Product" style={{ background: '#f1f5f9', border: 'none', borderRadius: '7px', padding: '0.4rem', cursor: 'pointer', color: '#475569' }}>
                                                <FiEdit2 size={15} />
                                            </button>
                                            <button onClick={() => deleteHandler(product._id)} title="Delete Product" style={{ background: '#fef2f2', border: 'none', borderRadius: '7px', padding: '0.4rem', cursor: 'pointer', color: '#ef4444' }}>
                                                <FiTrash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Edit Modal */}
            {editingProduct && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={() => setEditingProduct(null)}>
                    <div style={{ width: '100%', maxWidth: '600px', background: 'white', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>Edit Product</h2>
                            <button onClick={() => setEditingProduct(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><FiX size={20} /></button>
                        </div>
                        <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
                            <form id="edit-form" onSubmit={handleUpdate} style={{ display: 'grid', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>Product Name</label>
                                    <input className="form-input" value={editForm.name} onChange={e => setEditForm(s => ({ ...s, name: e.target.value }))} required />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>Price ($)</label>
                                        <input className="form-input" type="number" min="0" step="0.01" value={editForm.price} onChange={e => setEditForm(s => ({ ...s, price: Number(e.target.value) }))} required />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>Stock Quantity</label>
                                        <input className="form-input" type="number" min="0" value={editForm.stock} onChange={e => setEditForm(s => ({ ...s, stock: Number(e.target.value) }))} required />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>Category</label>
                                    <select className="form-input" value={editForm.category} onChange={e => setEditForm(s => ({ ...s, category: e.target.value }))} required>
                                        <option value="">Select Category</option>
                                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>Image URLs (comma separated)</label>
                                    <textarea className="form-input" value={editForm.images} onChange={e => setEditForm(s => ({ ...s, images: e.target.value }))} style={{ height: '60px', resize: 'vertical' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.3rem' }}>Description</label>
                                    <textarea className="form-input" value={editForm.description} onChange={e => setEditForm(s => ({ ...s, description: e.target.value }))} style={{ height: '80px', resize: 'vertical' }} required />
                                </div>
                                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>
                                        <input type="checkbox" checked={editForm.isApproved} onChange={e => setEditForm(s => ({ ...s, isApproved: e.target.checked }))} style={{ width: '16px', height: '16px', accentColor: '#10b981' }} />
                                        Approved for Marketplace
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>
                                        <input type="checkbox" checked={editForm.isFeatured} onChange={e => setEditForm(s => ({ ...s, isFeatured: e.target.checked }))} style={{ width: '16px', height: '16px', accentColor: '#8b5cf6' }} />
                                        Featured Product
                                    </label>
                                </div>
                            </form>
                        </div>
                        <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', background: '#f8fafc' }}>
                            <button type="button" onClick={() => setEditingProduct(null)} style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: 'white', fontWeight: 600, cursor: 'pointer', color: '#64748b' }}>Cancel</button>
                            <button type="submit" form="edit-form" disabled={saving} style={{ padding: '0.6rem 1.5rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: 'white', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', opacity: saving ? 0.7 : 1 }}>
                                {saving ? 'Saving...' : <><FiCheck /> Save Changes</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManagementPage;
