import React from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

interface RatingProps {
    value: number;
    text?: string;
    color?: string;
}

const RatingStars: React.FC<RatingProps> = ({ value, text, color = '#f8e825' }) => {
    return (
        <div className="rating" style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <span style={{ color }}>
                {value >= 1 ? <FaStar /> : value >= 0.5 ? <FaStarHalfAlt /> : <FaRegStar />}
            </span>
            <span style={{ color }}>
                {value >= 2 ? <FaStar /> : value >= 1.5 ? <FaStarHalfAlt /> : <FaRegStar />}
            </span>
            <span style={{ color }}>
                {value >= 3 ? <FaStar /> : value >= 2.5 ? <FaStarHalfAlt /> : <FaRegStar />}
            </span>
            <span style={{ color }}>
                {value >= 4 ? <FaStar /> : value >= 3.5 ? <FaStarHalfAlt /> : <FaRegStar />}
            </span>
            <span style={{ color }}>
                {value >= 5 ? <FaStar /> : value >= 4.5 ? <FaStarHalfAlt /> : <FaRegStar />}
            </span>
            {text && <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem', color: '#666' }}>{text}</span>}
        </div>
    );
};

export default RatingStars;
