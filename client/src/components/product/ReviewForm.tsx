import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { RootState } from '../../store';

interface ReviewFormProps {
    productId: string;
    onReviewAdded: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onReviewAdded }) => {
    const [rating, setRating] = useState<number>(5);
    const [comment, setComment] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const { userInfo } = useSelector((state: RootState) => state.auth);

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post(`/reviews/${productId}`, { rating, comment });
            setLoading(false);
            setRating(5);
            setComment('');
            onReviewAdded();
        } catch (err: any) {
            setLoading(false);
            setError(err.response?.data?.message || err.message);
        }
    };

    return (
        <div className="card" style={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Write a Customer Review</h2>
            {error && <div style={{ color: 'red', marginBottom: '1rem', padding: '0.5rem', background: '#fee2e2', borderRadius: '0.25rem' }}>{error}</div>}

            {userInfo ? (
                <form onSubmit={submitHandler}>
                    <div className="form-group">
                        <label className="form-label">Rating</label>
                        <select
                            value={rating}
                            onChange={(e) => setRating(Number(e.target.value))}
                            className="form-input"
                            style={{ maxWidth: '200px' }}
                        >
                            <option value="1">1 - Poor</option>
                            <option value="2">2 - Fair</option>
                            <option value="3">3 - Good</option>
                            <option value="4">4 - Very Good</option>
                            <option value="5">5 - Excellent</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Comment</label>
                        <textarea
                            rows={3}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="form-input"
                            placeholder="Share your thoughts..."
                        />
                    </div>
                    <button type="submit" disabled={loading} className="btn btn-primary">
                        {loading ? 'Submitting...' : 'Submit Review'}
                    </button>
                </form>
            ) : (
                <p>
                    Please <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>sign in</Link> to write a review
                </p>
            )}
        </div>
    );
};

export default ReviewForm;
