import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, Link } from 'react-router-dom';
import { RootState, AppDispatch } from '../../store';
import { listProducts } from '../../store/slices/productSlice';
import ProductCard from '../../components/product/ProductCard';

const ProductListPage = () => {
    const dispatch = useDispatch<AppDispatch>();
    const [searchParams] = useSearchParams();

    const keyword = searchParams.get('keyword') || '';
    const pageNumber = searchParams.get('page') || 1;
    const category = searchParams.get('category') || '';

    const productList = useSelector((state: RootState) => state.product);
    const { products, loading, error, page, pages } = productList;

    useEffect(() => {
        dispatch(listProducts({ keyword, pageNumber, category }));
    }, [dispatch, keyword, pageNumber, category]);

    return (
        <div className="container">
            <h1 style={{ marginBottom: '2rem' }}>
                {keyword ? `Search Results for "${keyword}"` : 'Latest Products'}
            </h1>

            {loading ? (
                <div>Loading products...</div>
            ) : error ? (
                <div style={{ color: 'red' }}>{error}</div>
            ) : (
                <>
                    <div className="grid grid-cols-4" style={{ gap: '2rem' }}>
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>

                    {products.length === 0 && (
                        <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                            <h3>No products found</h3>
                            <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Go Back Home</Link>
                        </div>
                    )}

                    {pages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem', gap: '0.5rem' }}>
                            {[...Array(pages).keys()].map((x) => (
                                <Link
                                    key={x + 1}
                                    to={`/?keyword=${keyword}&page=${x + 1}`}
                                    className={`btn ${x + 1 === page ? 'btn-primary' : 'btn-accent'}`}
                                    style={{ background: x + 1 === page ? 'var(--primary)' : 'var(--border)', color: x + 1 === page ? 'white' : 'black' }}
                                >
                                    {x + 1}
                                </Link>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ProductListPage;
