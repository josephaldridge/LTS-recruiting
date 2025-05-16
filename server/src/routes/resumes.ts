import express, { Request, Response, RequestHandler } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import pool from '../db';
import onedriveService from '../services/onedrive';
import { config } from '../config';
import { authenticateUser } from '../middleware/auth';

// Define custom types
interface CandidateParams {
    candidateId: string;
}

interface ResumeParams {
    id: string;
}

const router = express.Router();

// Configure multer for resume uploads
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
        // Only allow PDF extension for security
        cb(null, uniqueSuffix + '.pdf');
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

// Get resume for a candidate
router.get('/candidate/:candidateId', authenticateUser, (req, res) => {
    (async () => {
        try {
            const { candidateId } = req.params;
            
            if (!candidateId || isNaN(Number(candidateId))) {
                return res.status(400).json({ error: 'Invalid candidate ID' });
            }

            const result = await pool.query(
                'SELECT * FROM resumes WHERE candidate_id = $1 ORDER BY uploaded_at DESC LIMIT 1',
                [candidateId]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'No resume found for this candidate' });
            }
            
            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error fetching resume:', error);
            res.status(500).json({ error: 'Failed to fetch resume' });
        }
    })();
});

// Upload new resume
router.post('/candidate/:candidateId', authenticateUser, upload.single('resume'), (req, res) => {
    (async () => {
        try {
            const { candidateId } = req.params;
            const file = req.file;
            
            if (!candidateId || isNaN(Number(candidateId))) {
                return res.status(400).json({ error: 'Invalid candidate ID' });
            }

            if (!file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            if (!req.user?.email) {
                return res.status(401).json({ error: 'User not authenticated' });
            }

            // Upload to OneDrive
            const onedriveUrl = await onedriveService.uploadResume(
                file.path,
                `${candidateId}-${file.filename}`
            );

            // Save to database
            const result = await pool.query(
                `INSERT INTO resumes 
                (candidate_id, file_name, file_path, file_size, mime_type, uploaded_by)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *`,
                [
                    candidateId,
                    file.originalname,
                    onedriveUrl,
                    file.size,
                    file.mimetype,
                    req.user.email
                ]
            );

            // Clean up temporary file
            try {
                fs.unlinkSync(file.path);
            } catch (cleanupError) {
                console.error('Error cleaning up temporary file:', cleanupError);
            }

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Error uploading resume:', error);
            res.status(500).json({ error: 'Failed to upload resume' });
        }
    })();
});

// Delete resume
router.delete('/:id', authenticateUser, (req, res) => {
    (async () => {
        try {
            const { id } = req.params;
            
            if (!id || isNaN(Number(id))) {
                return res.status(400).json({ error: 'Invalid resume ID' });
            }

            // Get resume info before deleting
            const resumeResult = await pool.query(
                'SELECT * FROM resumes WHERE id = $1',
                [id]
            );

            if (resumeResult.rows.length === 0) {
                return res.status(404).json({ error: 'Resume not found' });
            }

            // Delete from OneDrive
            await onedriveService.deleteResume(resumeResult.rows[0].file_name);

            // Delete from database
            await pool.query(
                'DELETE FROM resumes WHERE id = $1',
                [id]
            );

            res.json({ message: 'Resume deleted successfully' });
        } catch (error) {
            console.error('Error deleting resume:', error);
            res.status(500).json({ error: 'Failed to delete resume' });
        }
    })();
});

export default router; 