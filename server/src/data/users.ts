import bcrypt from 'bcryptjs';

const users = [
    {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123', // will be hashed by pre-save hook
        role: 'admin',
    },
    {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'customer',
    },
    {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
        role: 'customer',
    },
];

export default users;
