import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import RatingStars from '../common/RatingStars';

interface Review {
    _id: string;
    user: {
        _id: string;
        name: string;
    } | null;
    rating: number;
    comment: string;
    createdAt: string;
}

interface ReviewListProps {
    productId: string;
    refreshTrigger: number;
}

const ReviewList: React.FC<ReviewListProps> = ({ productId, refreshTrigger }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const { data } = await api.get(`/reviews/${productId}`);
                setReviews(data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchReviews();
    }, [productId, refreshTrigger]);

    if (loading) return <div>Loading reviews...</div>;

    return (
        <div style={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Reviews</h2>
            {reviews.length === 0 && (
                <div style={{ padding: '1rem', background: '#e0f2fe', color: '#0369a1', borderRadius: '0.5rem' }}>
                    No Reviews Yet
                </div>
            )}
            <ul style={{ listStyle: 'none' }}>
                {reviews.map((review) => (
                    <li key={review._id} style={{ borderBottom: '1px solid #e2e8f0', padding: '1rem 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <strong style={{ fontSize: '1.1rem' }}>{review.user ? review.user.name : 'Anonymous'}</strong>
                            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <RatingStars value={review.rating} />
                        <p style={{ marginTop: '0.5rem', lineHeight: '1.6' }}>{review.comment}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ReviewList;
