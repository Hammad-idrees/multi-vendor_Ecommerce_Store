import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

const AdminRoute = () => {
    const { userInfo } = useSelector((state: RootState) => state.auth);
    return userInfo && userInfo.role === 'admin' ? <Outlet /> : <Navigate to="/" replace />;
};

export default AdminRoute;
