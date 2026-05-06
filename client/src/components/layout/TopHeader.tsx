
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';

const TopHeader = () => {
    const { userInfo } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const logoutHandler = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <div style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #e9ecef', padding: '0.5rem 0', fontSize: '0.9rem' }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1.5rem' }}>
                    {userInfo ? (
                        <>
                            <span style={{ color: '#333' }}>Hi, {userInfo.name}</span>
                            <Link to="/profile" style={{ color: '#333', textDecoration: 'none' }}>Account Settings</Link>
                            <span onClick={logoutHandler} style={{ color: '#333', cursor: 'pointer' }}>Logout</span>
                        </>
                    ) : (
                        <>
                            <Link to="/login" style={{ color: '#333', textDecoration: 'none' }}>Login</Link>
                            <Link to="/register" style={{ color: '#333', textDecoration: 'none' }}>Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TopHeader;
