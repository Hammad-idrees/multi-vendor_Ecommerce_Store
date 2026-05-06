
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer style={{ backgroundColor: '#222', color: '#f1f1f1', marginTop: 'auto', paddingTop: '3rem', paddingBottom: '1rem', fontSize: '0.9rem' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>

                    {/* Column 1: About */}
                    <div>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#fff' }}>Martify</h3>
                        <p style={{ color: '#aaa', lineHeight: '1.6' }}>
                            We offer the best products at the most affordable prices. Quality and customer satisfaction is our top priority.
                        </p>
                    </div>

                    {/* Column 2: Customer Service */}
                    <div>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#fff' }}>Customer Service</h3>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ marginBottom: '0.5rem' }}><Link to="/help" style={{ color: '#aaa', textDecoration: 'none' }}>Help Center</Link></li>
                            <li style={{ marginBottom: '0.5rem' }}><Link to="/returns" style={{ color: '#aaa', textDecoration: 'none' }}>Returns & Refunds</Link></li>
                            <li style={{ marginBottom: '0.5rem' }}><Link to="/shipping" style={{ color: '#aaa', textDecoration: 'none' }}>Shipping Info</Link></li>
                            <li style={{ marginBottom: '0.5rem' }}><Link to="/contact" style={{ color: '#aaa', textDecoration: 'none' }}>Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Company */}
                    <div>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#fff' }}>Company</h3>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ marginBottom: '0.5rem' }}><Link to="/about" style={{ color: '#aaa', textDecoration: 'none' }}>About Us</Link></li>
                            <li style={{ marginBottom: '0.5rem' }}><Link to="/careers" style={{ color: '#aaa', textDecoration: 'none' }}>Careers</Link></li>
                            <li style={{ marginBottom: '0.5rem' }}><Link to="/blog" style={{ color: '#aaa', textDecoration: 'none' }}>Blog</Link></li>
                            <li style={{ marginBottom: '0.5rem' }}><Link to="/privacy" style={{ color: '#aaa', textDecoration: 'none' }}>Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Column 4: Newsletter */}
                    <div>
                        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#fff' }}>Stay Connected</h3>
                        <p style={{ color: '#aaa', marginBottom: '1rem' }}>Subscribe to our newsletter for latest updates.</p>
                        <div style={{ display: 'flex' }}>
                            <input type="email" placeholder="Enter email" style={{ padding: '0.5rem', flex: 1, border: 'none', borderRadius: '4px 0 0 4px' }} />
                            <button style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--primary-color)', border: 'none', color: 'white', borderRadius: '0 4px 4px 0', cursor: 'pointer' }}>Go</button>
                        </div>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid #444', paddingTop: '1rem', textAlign: 'center', color: '#666' }}>
                    <p>&copy; {new Date().getFullYear()} Martify. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
