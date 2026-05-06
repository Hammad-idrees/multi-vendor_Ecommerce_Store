import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useComparison } from '../../context/ComparisonContext';
import { FiX, FiColumns, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ComparisonBar = () => {
    const { compareList, removeFromCompare, clearCompare } = useComparison();
    const navigate = useNavigate();

    const getProductImage = (imageList?: string[]) =>
        imageList && imageList.length > 0 ? imageList[0] : 'https://via.placeholder.com/300';

    if (compareList.length === 0) return null;

    return (
        <div style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', zIndex: 900 }}>
            <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="card glass"
                style={{ 
                    padding: '1rem 1.5rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '2rem',
                    boxShadow: 'var(--shadow-xl)',
                    borderRadius: 'var(--radius-lg)'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FiColumns color="hsl(var(--accent-h), var(--accent-s), var(--accent-l))" />
                    <span style={{ fontWeight: 700 }}>Compare ({compareList.length}/4)</span>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    {compareList.map((product) => (
                        <div key={product._id} style={{ position: 'relative' }}>
                            <img
                                src={getProductImage(product.images)}
                                alt={product.name}
                                style={{ width: '50px', height: '50px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                            />
                            <div 
                                onClick={() => removeFromCompare(product._id)}
                                style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--error)', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            >
                                <FiX />
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={clearCompare} className="btn btn-ghost" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Clear</button>
                    <button
                        onClick={() => {
                            if (compareList.length < 2) {
                                toast.error('Add at least 2 products to compare');
                                return;
                            }
                            navigate('/compare');
                        }}
                        className="btn btn-primary"
                        style={{ padding: '0.5rem 1.5rem', fontSize: '0.875rem' }}
                    >
                        Compare Now <FiArrowRight />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default ComparisonBar;
