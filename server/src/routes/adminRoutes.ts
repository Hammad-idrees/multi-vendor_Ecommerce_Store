import express from 'express';
import {
    getDashboardStats,
    getAllUsers,
    createUserByAdmin,
    updateUserRole,
    toggleBlockUser,
    deleteUser,
    deleteInactiveUsers,
    getAllOrders,
    updateOrderStatus,
    getPendingProducts,
    approveProduct,
    getVendorActivity,
    getCustomerActivity,
} from '../controllers/adminController';
import { protect, admin } from '../middleware/auth';

const router = express.Router();

router.use(protect);
router.use(admin);

router.get('/stats', getDashboardStats);

router.get('/users', getAllUsers);
router.post('/users', createUserByAdmin);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/block', toggleBlockUser);
router.delete('/users/inactive', deleteInactiveUsers);
router.delete('/users/:id', deleteUser);
router.get('/vendors/:id/activity', getVendorActivity);
router.get('/customers/:id/activity', getCustomerActivity);

router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

router.get('/products/pending', getPendingProducts);
router.put('/products/:id/approve', approveProduct);

export default router;
