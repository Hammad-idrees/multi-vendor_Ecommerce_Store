import { Link } from 'react-router-dom';
import { ReactTyped } from 'react-typed';

const typedLines = [
    'Verified sellers. Authentic products.',
    'Fashion, electronics, lifestyle and more.',
    'Trusted shopping from stores worldwide.',
];

const HeroTypedContent = () => {
    return (
        <div className="home-hero-text">
            <p className="home-hero-kicker">WELCOME TO MARTIFY</p>
            <h1 className="home-hero-title">Martify Marketplace</h1>
            <p className="home-hero-subtitle">
                <ReactTyped strings={typedLines} typeSpeed={45} backSpeed={24} backDelay={1400} loop />
            </p>
            <p className="home-hero-description">
                The ultimate destination for unique products from verified vendors worldwide.
            </p>
            <div className="home-hero-actions">
                <a href="#latest-products" className="btn btn-primary home-hero-btn">
                    Explore Products
                </a>
                <Link to="/register?role=seller" className="btn home-hero-btn home-hero-btn-outline">
                    Become a Seller
                </Link>
            </div>
        </div>
    );
};

export default HeroTypedContent;
