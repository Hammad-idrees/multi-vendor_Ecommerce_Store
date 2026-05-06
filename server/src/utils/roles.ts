export const normalizeRole = (role?: string): 'admin' | 'seller' | 'buyer' => {
    const value = (role || '').toLowerCase();
    if (value === 'admin') return 'admin';
    if (value === 'seller' || value === 'vendor') return 'seller';
    return 'buyer';
};

export const isAdminRole = (role?: string): boolean => normalizeRole(role) === 'admin';
export const isSellerRole = (role?: string): boolean => normalizeRole(role) === 'seller';
export const isBuyerRole = (role?: string): boolean => normalizeRole(role) === 'buyer';
