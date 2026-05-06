import express from 'express';
import { uploadImages } from '../controllers/uploadController';
import { protect, seller } from '../middleware/auth';
import upload from '../middleware/upload';

const router = express.Router();

router.post('/', protect, seller, upload.array('images', 5), uploadImages);

export default router;
