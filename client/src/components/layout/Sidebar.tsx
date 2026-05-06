import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import api from '../../services/api';

interface Category {
    _id: string;
    name: string;
    parent: string | null;
}

const Sidebar = () => {
    const { userInfo } = useSelector((state: RootState) => state.auth);
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Record<string, Category[]>>({});
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Hide sidebar for vendors and admins
    if (userInfo?.role === 'seller' || userInfo?.role === 'admin') {
        return null;
    }

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Fetch top-level (parent) categories
                const { data } = await api.get('/categories?topLevel=true');
                setCategories(data);

                // Fetch all subcategories for all parents at once
                const allSubs = await api.get('/categories');
                const subsMap: Record<string, Category[]> = {};
                allSubs.data.forEach((cat: Category) => {
                    if (cat.parent) {
                        if (!subsMap[cat.parent]) subsMap[cat.parent] = [];
                        subsMap[cat.parent].push(cat);
                    }
                });
                setSubcategories(subsMap);
            } catch (err) {
                console.error('Failed to fetch categories', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const toggleCategory = (categoryId: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
    };

    const handleCategoryClick = (categoryId: string) => {
        navigate(`/category/${categoryId}`);
        setExpandedCategory(categoryId);
    };

    return (
        <aside className="sidebar">
            <nav className="sidebar-nav">
                <NavLink
                    to="/shop"
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                    style={{ marginBottom: '1rem', fontWeight: 700, display: 'block', padding: '0.5rem 1rem' }}
                >
                    🛍️ Browse Shop
                </NavLink>
                <div style={{ height: '1px', background: 'var(--border)', margin: '0 1rem 1.5rem' }}></div>
                <h3 className="sidebar-title" style={{ marginTop: 0 }}>Categories</h3>

                {loading ? (
                    <p style={{ padding: '0.5rem', color: 'var(--text-light)', fontSize: '0.875rem' }}>Loading...</p>
                ) : (
                    categories.map((category) => (
                        <div key={category._id} className="sidebar-item">
                            <div className={`sidebar-header ${expandedCategory === category._id ? 'active' : ''}`}>
                                <div
                                    className="sidebar-link"
                                    onClick={() => handleCategoryClick(category._id)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    {category.name}
                                </div>
                                {subcategories[category._id]?.length > 0 && (
                                    <button
                                        className="sidebar-expand-btn"
                                        onClick={(e) => toggleCategory(category._id, e)}
                                    >
                                        {expandedCategory === category._id ? <FaChevronDown /> : <FaChevronRight />}
                                    </button>
                                )}
                            </div>

                            <div className={`sidebar-submenu ${expandedCategory === category._id ? 'open' : ''}`}>
                                {(subcategories[category._id] || []).map((sub) => (
                                    <NavLink
                                        key={sub._id}
                                        to={`/category/${sub._id}`}
                                        className={({ isActive }) => `sidebar-sublink ${isActive ? 'active' : ''}`}
                                    >
                                        {sub.name}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </nav>
        </aside>
    );
};

export default Sidebar;
