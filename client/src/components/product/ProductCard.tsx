import { Link } from 'react-router-dom';
import RatingStars from '../common/RatingStars';
import { Product } from '../../types';
import { useComparison } from '../../context/ComparisonContext';
import { useCurrency } from '../../context/CurrencyContext';
import { FiColumns } from 'react-icons/fi';
import './ProductCard.css';

interface ProductCardProps {
    product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
    const { addToCompare } = useComparison();
    const { convert } = useCurrency();
    const sellerId = (product.seller as any)?._id || product.seller;
    const sellerName = (product.seller as any)?.shopName || (product.seller as any)?.name || 'Vendor';
    const ratingValue = product.averageRating ?? 0;
    const reviewCount = product.numReviews ?? 0;

    return (
        <article className="product-card">
            <Link to={`/product/${product._id}`} className="product-card__image-link">
                <img
                    src={(product.images && product.images.length > 0) ? product.images[0] : 'https://via.placeholder.com/300'}
                    alt={product.name}
                    className="product-card__image"
                />
            </Link>

            <div className="product-card__content">
                <Link to={`/product/${product._id}`} className="product-card__title-link">
                    <h3 className="product-card__title">{product.name}</h3>
                </Link>

                {product.seller && (
                    <Link to={`/vendor/${sellerId}`} className="product-card__seller">
                        Sold by: <span>{sellerName}</span>
                    </Link>
                )}

                <div className="product-card__rating">
                    <RatingStars value={ratingValue} text={`${reviewCount} reviews`} />
                </div>

                <div className="product-card__footer">
                    <div className="product-card__price-wrap">
                        {!!product.comparePrice && product.comparePrice > product.price && (
                            <span className="product-card__compare-price">{convert(product.comparePrice)}</span>
                        )}
                        <h2 className="product-card__price">
                        {convert(product.price)}
                        </h2>
                    </div>

                    <button
                        onClick={() => addToCompare(product)}
                        className="product-card__compare-btn"
                        title="Add to compare"
                    >
                        <FiColumns />
                    </button>
                </div>
            </div>
        </article>
    );
};

export default ProductCard;
