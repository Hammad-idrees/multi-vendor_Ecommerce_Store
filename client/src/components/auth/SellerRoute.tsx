import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const SellerRoute = () => {
    const { userInfo } = useSelector((state: RootState) => state.auth);
    return userInfo && (userInfo.role === 'seller' || userInfo.role === 'admin') ? (
        <Outlet />
    ) : (
        <Navigate to="/login" replace />
    );
};

export default SellerRoute;
