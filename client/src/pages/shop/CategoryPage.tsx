import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowRight, FaTh, FaArrowLeft } from 'react-icons/fa';
import api from '../../services/api';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { addToCart } from '../../store/slices/cartSlice';
import { useToast } from '../../components/common/Toast';

interface CategoryData {
    _id: string;
    name: string;
    description?: string;
    image?: string;
    parent?: string | null;
}

const CategoryPage = () => {
    const { categoryId } = useParams<{ categoryId: string }>();
    const navigate = useNavigate();

    const [category, setCategory] = useState<CategoryData | null>(null);
    const [subcategories, setSubcategories] = useState<CategoryData[]>([]);
    const [parentCategory, setParentCategory] = useState<CategoryData | null>(null);
    const [isSubcategory, setIsSubcategory] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedSubcategory, setExpandedSubcategory] = useState<string | null>(null);

    useEffect(() => {
        if (!categoryId) return;

        const fetchCategoryData = async () => {
            setLoading(true);
            setError('');
            try {
                // Fetch the category itself
                const { data: cat } = await api.get(`/categories/${categoryId}`);
                setCategory(cat);

                if (cat.parent) {
                    // This is a subcategory — show its products directly
                    setIsSubcategory(true);
                    const { data: parent } = await api.get(`/categories/${cat.parent}`);
                    setParentCategory(parent);
                    setSubcategories([]);
                } else {
                    // This is a parent category — fetch its subcategories
                    setIsSubcategory(false);
                    setParentCategory(null);
                    const { data: subs } = await api.get(`/categories?parent=${categoryId}`);
                    setSubcategories(subs);
                }
            } catch (err: any) {
                setError('Category not found');
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryData();
    }, [categoryId]);

    if (loading) {
        return (
            <div className="category-page">
                <div className="category-header">
                    <p style={{ color: 'var(--text-light)' }}>Loading category...</p>
                </div>
            </div>
        );
    }

    if (error || !category) {
        return (
            <div className="category-page">
                <div className="category-header">
                    <h1 className="category-title">Category Not Found</h1>
                    <p style={{ color: 'var(--text-light)', marginTop: '0.5rem' }}>
                        <button className="btn btn-primary" onClick={() => navigate('/shop')}>Back to Shop</button>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="category-page">
            <header className="category-header">
                {parentCategory && (
                    <div style={{ marginBottom: '0.5rem' }}>
                        <Link
                            to={`/category/${parentCategory._id}`}
                            style={{ color: 'var(--text-light)', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                        >
                            <FaArrowLeft size={12} /> {parentCategory.name}
                        </Link>
                    </div>
                )}
                <h1 className="category-title">{category.name}</h1>
                {category.description && (
                    <p style={{ color: 'var(--text-light)', marginTop: '0.5rem' }}>{category.description}</p>
                )}
            </header>

            {isSubcategory ? (
                // Direct product view for a subcategory
                <SubcategoryProductsView categoryId={category._id} categoryName={category.name} />
            ) : (
                <>
                    {/* Subcategory Tabs */}
                    {subcategories.length > 0 && (
                        <nav className="subcategory-tabs">
                            {subcategories.map(sub => (
                                <button
                                    key={sub._id}
                                    onClick={() => {
                                        const el = document.getElementById(`sub-${sub._id}`);
                                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }}
                                    className="tab-btn"
                                >
                                    {sub.name}
                                </button>
                            ))}
                        </nav>
                    )}

                    {/* Subcategory Product Sections */}
                    <div className="subcategories-container">
                        {subcategories.map(sub => (
                            <SubcategorySection
                                key={sub._id}
                                subcategory={sub}
                                isExpanded={expandedSubcategory === sub._id}
                                onToggleExpand={() =>
                                    setExpandedSubcategory(expandedSubcategory === sub._id ? null : sub._id)
                                }
                            />
                        ))}
                        {subcategories.length === 0 && (
                            <p style={{ color: 'var(--text-light)', padding: '2rem' }}>No subcategories found.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

// === Full product grid for a subcategory page ===
const SubcategoryProductsView = ({ categoryId, categoryName }: { categoryId: string; categoryName: string }) => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch<AppDispatch>();
    const { showToast } = useToast();

    useEffect(() => {
        const fetch = async () => {
            try {
                const { data } = await api.get(`/products?category=${categoryId}&limit=24`);
                setProducts(data.products || []);
            } catch (err) {
                console.error('Failed to fetch products', err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [categoryId]);

    const addToCartHandler = (product: any) => {
        dispatch(addToCart({
            productId: product._id,
            qty: 1,
        }));
        showToast('Added to cart!', 'success');
    };

    if (loading) return <p style={{ padding: '2rem', color: 'var(--text-light)' }}>Loading products...</p>;

    if (products.length === 0) {
        return (
            <div className="subcategory-section">
                <p style={{ color: 'var(--text-light)', padding: '1rem' }}>No products in {categoryName} yet.</p>
            </div>
        );
    }

    return (
        <div className="subcategory-section">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                {products.map((product: any) => (
                    <ProductCardMin key={product._id} product={product} onAddToCart={() => addToCartHandler(product)} />
                ))}
            </div>
        </div>
    );
};

// === Subcategory row with horizontal scroll (for parent category page) ===
interface SubcategorySectionProps {
    subcategory: CategoryData;
    isExpanded: boolean;
    onToggleExpand: () => void;
}

const SubcategorySection: React.FC<SubcategorySectionProps> = ({ subcategory, isExpanded, onToggleExpand }) => {
    const [products, setProducts] = useState<any[]>([]);
    const [loaded, setLoaded] = useState(false);
    const dispatch = useDispatch<AppDispatch>();
    const { showToast } = useToast();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await api.get(`/products?category=${subcategory._id}&limit=12`);
                setProducts(data.products || []);
            } catch (error) {
                console.error('Failed to fetch products', error);
            } finally {
                setLoaded(true);
            }
        };
        fetchProducts();
    }, [subcategory._id]);

    const addToCartHandler = (product: any) => {
        dispatch(addToCart({
            productId: product._id,
            qty: 1,
        }));
        showToast('Added to cart!', 'success');
    };

    const visibleProducts = isExpanded ? products : products.slice(0, 8);

    return (
        <section id={`sub-${subcategory._id}`} className="subcategory-section">
            <div className="section-header">
                <h2 className="section-title">{subcategory.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {products.length > 0 && (
                        <button className="view-more-btn" onClick={onToggleExpand}>
                            {isExpanded ? 'Show Less' : 'View More'}
                            {!isExpanded && <FaArrowRight style={{ marginLeft: '0.25rem' }} />}
                        </button>
                    )}
                    <Link
                        to={`/category/${subcategory._id}`}
                        style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}
                    >
                        View All
                    </Link>
                </div>
            </div>

            {!loaded ? (
                <p style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>Loading...</p>
            ) : products.length === 0 ? (
                <p style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>No products yet.</p>
            ) : isExpanded ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    {visibleProducts.map((product: any) => (
                        <ProductCardMin key={product._id} product={product} onAddToCart={() => addToCartHandler(product)} />
                    ))}
                </div>
            ) : (
                <div className="product-scroll-container">
                    {visibleProducts.map((product: any) => (
                        <ProductCardMin key={product._id} product={product} onAddToCart={() => addToCartHandler(product)} />
                    ))}
                </div>
            )}
        </section>
    );
};

// === Minimal Product Card ===
const ProductCardMin = ({ product, onAddToCart }: { product: any; onAddToCart: () => void }) => {
    return (
        <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="product-card-min" onClick={(e) => e.stopPropagation()}>
                <div className="product-image-placeholder" style={{ overflow: 'hidden' }}>
                    {product.images?.length > 0 ? (
                        <img
                            src={product.images[0]}
                            alt={product.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${product._id}/200/150`;
                            }}
                        />
                    ) : (
                        <FaTh size={24} />
                    )}
                </div>
                <h4 style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.875rem', lineHeight: 1.3 }}>
                    {product.name}
                </h4>
                <p style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    ${product.price}
                    {product.comparePrice && (
                        <span style={{ color: 'var(--text-light)', fontWeight: 400, textDecoration: 'line-through', marginLeft: '0.4rem', fontSize: '0.8rem' }}>
                            ${product.comparePrice}
                        </span>
                    )}
                </p>
                <button
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '0.5rem', fontSize: '0.8rem', padding: '0.4rem' }}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onAddToCart();
                    }}
                >
                    Add to Cart
                </button>
            </div>
        </Link>
    );
};

export default CategoryPage;
