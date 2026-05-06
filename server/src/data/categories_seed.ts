
export interface Subcategory {
    id: string;
    name: string;
}

export interface Category {
    id: string;
    name: string;
    subcategories: Subcategory[];
}

export const CATEGORIES: Category[] = [
    {
        id: 'electronics',
        name: 'Electronics',
        subcategories: [
            { id: 'mobile-phones', name: 'Mobile Phones' },
            { id: 'laptops-computers', name: 'Laptops & Computers' },
            { id: 'tablets', name: 'Tablets' },
            { id: 'audio-wearables', name: 'Audio & Wearables' },
            { id: 'gaming', name: 'Gaming' },
            { id: 'cameras', name: 'Cameras' },
            { id: 'networking-accessories', name: 'Networking & Accessories' },
        ],
    },
    {
        id: 'fashion-apparel',
        name: 'Fashion & Apparel',
        subcategories: [
            { id: 'men', name: 'Men' },
            { id: 'women', name: 'Women' },
            { id: 'kids', name: 'Kids' },
            { id: 'footwear', name: 'Footwear' },
            { id: 'accessories', name: 'Accessories' },
            { id: 'traditional-wear', name: 'Traditional Wear' },
        ],
    },
    {
        id: 'home-living',
        name: 'Home & Living',
        subcategories: [
            { id: 'furniture', name: 'Furniture' },
            { id: 'home-decor', name: 'Home Decor' },
            { id: 'kitchen-dining', name: 'Kitchen & Dining' },
            { id: 'bedding', name: 'Bedding' },
            { id: 'storage-organization', name: 'Storage & Organization' },
            { id: 'home-appliances', name: 'Home Appliances' },
        ],
    },
    {
        id: 'beauty-personal-care',
        name: 'Beauty & Personal Care',
        subcategories: [
            { id: 'skincare', name: 'Skincare' },
            { id: 'hair-care', name: 'Hair Care' },
            { id: 'makeup', name: 'Makeup' },
            { id: 'fragrances', name: 'Fragrances' },
            { id: 'grooming', name: 'Grooming' },
            { id: 'personal-hygiene', name: 'Personal Hygiene' },
        ],
    },
    {
        id: 'health-wellness',
        name: 'Health & Wellness',
        subcategories: [
            { id: 'supplements', name: 'Supplements' },
            { id: 'medical-equipment', name: 'Medical Equipment' },
            { id: 'fitness-exercise', name: 'Fitness & Exercise' },
            { id: 'wellness-devices', name: 'Wellness Devices' },
            { id: 'health-monitoring', name: 'Health Monitoring' },
        ],
    },
    {
        id: 'sports-outdoors',
        name: 'Sports & Outdoors',
        subcategories: [
            { id: 'sports-equipment', name: 'Sports Equipment' },
            { id: 'outdoor-gear', name: 'Outdoor Gear' },
            { id: 'cycling', name: 'Cycling' },
            { id: 'camping-hiking', name: 'Camping & Hiking' },
            { id: 'fitness-accessories', name: 'Fitness Accessories' },
        ],
    },
    {
        id: 'grocery-essentials',
        name: 'Grocery & Essentials',
        subcategories: [
            { id: 'fresh-food', name: 'Fresh Food' },
            { id: 'packaged-food', name: 'Packaged Food' },
            { id: 'beverages', name: 'Beverages' },
            { id: 'household-supplies', name: 'Household Supplies' },
            { id: 'baby-essentials', name: 'Baby Essentials' },
            { id: 'pet-supplies', name: 'Pet Supplies' },
        ],
    },
    {
        id: 'books-stationery-media',
        name: 'Books, Stationery & Media',
        subcategories: [
            { id: 'books', name: 'Books' },
            { id: 'stationery', name: 'Stationery' },
            { id: 'magazines', name: 'Magazines' },
            { id: 'music', name: 'Music' },
            { id: 'movies', name: 'Movies' },
        ],
    },
    {
        id: 'automotive',
        name: 'Automotive',
        subcategories: [
            { id: 'car-accessories', name: 'Car Accessories' },
            { id: 'bike-accessories', name: 'Bike Accessories' },
            { id: 'tools-equipment', name: 'Tools & Equipment' },
            { id: 'oils-fluids', name: 'Oils & Fluids' },
            { id: 'safety-products', name: 'Safety Products' },
        ],
    },
    {
        id: 'toys-kids-baby-mother',
        name: 'Toys, Kids, Baby & Mother',
        subcategories: [
            { id: 'toys', name: 'Toys' },
            { id: 'kids-clothing', name: 'Kids Clothing' },
            { id: 'baby-care', name: 'Baby Care' },
            { id: 'baby-gear', name: 'Baby Gear' },
            { id: 'school-learning', name: 'School & Learning' },
        ],
    },
];
