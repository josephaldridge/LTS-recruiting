import { Request, Response, NextFunction } from 'express';
import admin from '../config/firebase';

// Extend Express Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: admin.auth.DecodedIdToken;
        }
    }
}

export function authenticateUser(req: Request, res: Response, next: NextFunction) {
    (async () => {
        try {
            const authHeader = req.headers.authorization;
            
            if (!authHeader?.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'No token provided' });
            }

            const token = authHeader.split('Bearer ')[1];
            const decodedToken = await admin.auth().verifyIdToken(token);
            
            req.user = decodedToken;
            next();
        } catch (error) {
            console.error('Error authenticating user:', error);
            res.status(401).json({ error: 'Invalid token' });
        }
    })();
} 