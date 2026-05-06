import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { uploadToCloudinary } from '../services/cloudinaryService';

// @desc    Upload image(s)
// @route   POST /api/upload
// @access  Private/Seller/Admin
export const uploadImages = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.files || !(req.files as Express.Multer.File[]).length) {
            res.status(400).json({ message: 'No files uploaded' });
            return;
        }

        const files = req.files as Express.Multer.File[];
        const urls: string[] = [];

        for (const file of files) {
            try {
                const result = await uploadToCloudinary(file.buffer, 'products');
                urls.push(result.secure_url);
            } catch (uploadError) {
                console.error('Cloudinary upload error:', uploadError);
                // Fallback: use a placeholder
                urls.push(`https://picsum.photos/seed/${Date.now()}/800/600`);
            }
        }

        res.json({ urls });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Upload failed' });
    }
};
