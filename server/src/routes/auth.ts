import express, { Request, Response } from 'express';
import { authenticateUser } from '../middleware/auth';

const router = express.Router();

// Test endpoint to verify authentication
router.get('/test', authenticateUser, (req: Request, res: Response) => {
    res.json({
        message: 'Authentication successful',
        user: {
            email: req.user?.email,
            uid: req.user?.uid
        }
    });
});

export default router; 