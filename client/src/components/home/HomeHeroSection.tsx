import HeroImageCarousel from './HeroImageCarousel';
import HeroTypedContent from './HeroTypedContent';
import './HomeHeroSection.css';

const HomeHeroSection = () => {
    return (
        <section className="home-hero-shell">
            <HeroImageCarousel />
            <div className="home-hero-content-wrap">
                <HeroTypedContent />
            </div>
        </section>
    );
};

export default HomeHeroSection;
