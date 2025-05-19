import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import admin from './config/firebase';
import { config } from './config';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const app = express();

// Middleware
app.use(cors({
  origin: [
    'https://lts-recruiting-6etcyb4sa-josephaldridges-projects.vercel.app',
    'https://lts-recruiting.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../client/public')));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = config.upload.tempDir;
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: config.upload.maxFileSize
    },
    fileFilter: (req, file, cb) => {
        if (config.upload.allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF files are allowed.'));
        }
    }
});

// Firebase Authentication Middleware
function authenticateUser(req: Request, res: Response, next: NextFunction) {
  (async () => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }
      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      (req as any).user = decodedToken;
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(401).json({ error: 'Invalid token' });
    }
  })();
}

// Test authentication endpoint (no auth required)
app.get('/api/auth/test', (req: Request, res: Response) => {
    res.json({ message: 'Auth test endpoint is accessible' });
});

// Protected test endpoint
app.get('/api/auth/protected', authenticateUser, (req: Request, res: Response) => {
    res.json({
        message: 'Authentication successful',
        user: {
            email: (req as any).user?.email,
            uid: (req as any).user?.uid
        }
    });
});

// Import routes
import candidateRoutes from './routes/candidates';
import noteRoutes from './routes/notes';
import resumeRoutes from './routes/resumes';
import interviewerRoutes from './routes/interviewers';
import interviewRoutes from './routes/interviews';

// Use routes with authentication
app.use('/api/candidates', authenticateUser, candidateRoutes);
app.use('/api/notes', authenticateUser, noteRoutes);
app.use('/api/resumes', authenticateUser, resumeRoutes);
app.use('/api/interviewers', authenticateUser, interviewerRoutes);
app.use('/api/interviews', authenticateUser, interviewRoutes);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
}); 