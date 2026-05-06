export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'buyer' | 'seller';
    token?: string;
    avatar?: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    shopName?: string;
    shopDescription?: string;
    isBlocked?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    comparePrice?: number;
    stock: number;
    category: { _id: string; name: string } | string;
    images: string[];
    variants: Array<{ size: string; color: string; stock: number }>;
    averageRating: number;
    numReviews: number;
    seller: { _id: string; name: string; shopName?: string; avatar?: string } | string;
    isApproved?: boolean;
    isFeatured?: boolean;
    tags?: string[];
    createdAt?: string;
}

export interface CartItem {
    product: Product | string;
    variant?: { size: string; color: string };
    quantity: number;
    _id?: string;
}

export interface Order {
    _id: string;
    user: { _id: string; name: string; email: string } | string;
    items: Array<{
        product: string;
        seller?: string;
        name: string;
        price: number;
        quantity: number;
        image: string;
        variant?: { size: string; color: string };
    }>;
    shippingAddress: {
        address: string;
        city: string;
        postalCode: string;
        country: string;
    };
    paymentMethod: string;
    totalPrice: number;
    isPaid: boolean;
    paidAt?: string;
    isDelivered: boolean;
    deliveredAt?: string;
    status: string;
    couponCode?: string;
    discountAmount?: number;
    createdAt: string;
}

export interface Category {
    _id: string;
    name: string;
    description?: string;
    image?: string;
    parent?: string | null;
}

export interface Review {
    _id: string;
    user: { _id: string; name: string };
    product: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export interface Coupon {
    _id: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minOrderAmount: number;
    maxUses: number;
    usedCount: number;
    expiresAt: string;
    isActive: boolean;
}

export interface Notification {
    _id: string;
    title: string;
    message: string;
    type: 'order' | 'system' | 'promotion' | 'review';
    isRead: boolean;
    link?: string;
    createdAt: string;
}

export interface WishlistItem {
    _id: string;
    name: string;
    price: number;
    images: string[];
    averageRating: number;
    stock: number;
}
