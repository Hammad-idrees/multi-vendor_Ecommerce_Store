import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';

type Category = {
    _id: string;
    name: string;
    parent?: string | null;
};

const VendorProductsPage = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [step, setStep] = useState<1 | 2>(1);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        category: '',
        subcategory: '',
        name: '',
        description: '',
        imagesText: '',
        price: '',
        stock: '',
    });

    const topLevelCategories = useMemo(
        () => categories.filter((c) => !c.parent),
        [categories]
    );

    const loadData = async () => {
        setLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
            api.get('/seller/products'),
            api.get('/categories'),
        ]);
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
        setLoading(false);
    };

    useEffect(() => {
        loadData().catch(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!form.category) {
            setSubcategories([]);
            return;
        }
        setSubcategories(categories.filter((c) => c.parent === form.category));
    }, [form.category, categories]);

    const resetModal = () => {
        setForm({
            category: '',
            subcategory: '',
            name: '',
            description: '',
            imagesText: '',
            price: '',
            stock: '',
        });
        setStep(1);
        setError('');
    };

    const openModal = () => {
        resetModal();
        setShowModal(true);
    };

    const closeModal = () => {
        resetModal();
        setShowModal(false);
    };

    const images = form.imagesText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);

    const nextStep = () => {
        if (!form.category || !form.name.trim()) {
            setError('Category and product title are required.');
            return;
        }
        if (images.length > 5) {
            setError('You can add up to 5 images only.');
            return;
        }
        setError('');
        setStep(2);
    };

    const submitProduct = async () => {
        if (!form.price || !form.stock) {
            setError('Price and stock quantity are required.');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            await api.post('/seller/products', {
                category: form.category,
                subcategory: form.subcategory || undefined,
                name: form.name.trim(),
                description: form.description.trim(),
                images,
                price: Number(form.price),
                stock: Number(form.stock),
            });
            await loadData();
            closeModal();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to add product');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="container" style={{ padding: '2rem 0' }}>Loading products...</div>;
    }

    return (
        <div className="container" style={{ padding: '2rem 0 3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h1>My Products</h1>
                <button className="btn btn-primary" onClick={openModal}>Add Product</button>
            </div>

            <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 8, padding: '1rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                            <th style={{ padding: '0.75rem' }}>Product</th>
                            <th style={{ padding: '0.75rem' }}>Price</th>
                            <th style={{ padding: '0.75rem' }}>Stock</th>
                            <th style={{ padding: '0.75rem' }}>Category</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '0.75rem' }}>{product.name}</td>
                                <td style={{ padding: '0.75rem' }}>${product.price}</td>
                                <td style={{ padding: '0.75rem' }}>{product.stock}</td>
                                <td style={{ padding: '0.75rem' }}>{product.category?.name || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {products.length === 0 && <p style={{ padding: '1rem', color: '#64748b' }}>No products yet.</p>}
            </div>

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ width: '100%', maxWidth: 640, background: '#fff', borderRadius: 10, padding: '1.25rem' }}>
                        <h2 style={{ marginBottom: '0.75rem' }}>Add Product</h2>
                        {error && <p style={{ color: '#dc2626', marginBottom: '0.75rem' }}>{error}</p>}

                        {step === 1 ? (
                            <>
                                <label>Category</label>
                                <select className="form-input" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value, subcategory: '' }))}>
                                    <option value="">Select category</option>
                                    {topLevelCategories.map((category) => (
                                        <option key={category._id} value={category._id}>{category.name}</option>
                                    ))}
                                </select>

                                <label style={{ marginTop: '0.75rem', display: 'block' }}>Subcategory (optional)</label>
                                <select className="form-input" value={form.subcategory} onChange={(e) => setForm((f) => ({ ...f, subcategory: e.target.value }))}>
                                    <option value="">Select subcategory</option>
                                    {subcategories.map((category) => (
                                        <option key={category._id} value={category._id}>{category.name}</option>
                                    ))}
                                </select>

                                <label style={{ marginTop: '0.75rem', display: 'block' }}>Product Title</label>
                                <input className="form-input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />

                                <label style={{ marginTop: '0.75rem', display: 'block' }}>Description (optional)</label>
                                <textarea className="form-input" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />

                                <label style={{ marginTop: '0.75rem', display: 'block' }}>Image URLs (one per line, max 5)</label>
                                <textarea className="form-input" value={form.imagesText} onChange={(e) => setForm((f) => ({ ...f, imagesText: e.target.value }))} />
                                {images.length > 0 && (
                                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                                        {images.slice(0, 5).map((img) => (
                                            <img key={img} src={img} style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 6 }} />
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <label>Price</label>
                                <input type="number" min="0" className="form-input" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
                                <label style={{ marginTop: '0.75rem', display: 'block' }}>Stock quantity</label>
                                <input type="number" min="0" className="form-input" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} />
                            </>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                            <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                            {step === 1 ? (
                                <button className="btn btn-primary" onClick={nextStep}>Continue</button>
                            ) : (
                                <>
                                    <button className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
                                    <button className="btn btn-primary" onClick={submitProduct} disabled={submitting}>
                                        {submitting ? 'Saving...' : 'Confirm & Add'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VendorProductsPage;
