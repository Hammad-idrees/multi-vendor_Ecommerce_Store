import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SearchBar.module.css';

const SearchBar: React.FC = () => {
    const [keyword, setKeyword] = useState('');
    const navigate = useNavigate();

    const submitHandler = (e: React.FormEvent) => {
        e.preventDefault();
        if (keyword.trim()) {
            navigate(`/?keyword=${keyword}`);
        } else {
            navigate('/');
        }
    };

    return (
        <form onSubmit={submitHandler} className={styles.form}>
            <input
                type="text"
                name="q"
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search..."
                className={styles.input}
            />
            <button type="submit" className={styles.button}>
                Search
            </button>
        </form>
    );
};

export default SearchBar;
