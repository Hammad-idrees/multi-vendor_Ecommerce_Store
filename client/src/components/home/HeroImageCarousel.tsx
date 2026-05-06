import { useEffect, useState } from 'react';

const carouselImages = [
    'https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=1800&q=80',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1800&q=80',
    'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1800&q=80',
    'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1800&q=80',
];

const HeroImageCarousel = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const timer = window.setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % carouselImages.length);
        }, 3800);

        return () => window.clearInterval(timer);
    }, []);

    return (
        <div className="home-hero-carousel">
            {carouselImages.map((image, index) => (
                <img
                    key={image}
                    src={image}
                    alt="Martify featured products"
                    className={`home-hero-image ${index === activeIndex ? 'is-active' : ''}`}
                />
            ))}
            <div className="home-hero-overlay" />
            <div className="home-hero-dots">
                {carouselImages.map((_, index) => (
                    <button
                        key={index}
                        type="button"
                        className={`home-hero-dot ${index === activeIndex ? 'is-active' : ''}`}
                        onClick={() => setActiveIndex(index)}
                        aria-label={`Show slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroImageCarousel;
