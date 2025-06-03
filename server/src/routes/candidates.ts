import express from 'express';
import pool from '../db';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import googledriveService from '../services/googledrive';

const router = express.Router();

// Configure multer for candidate resume uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../temp');
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
const upload = multer({ storage });

// Get all candidates
router.get('/', (req, res) => {
    (async () => {
        try {
            const result = await pool.query(
                'SELECT * FROM candidates ORDER BY created_at DESC'
            );
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching candidates:', error);
            res.status(500).json({ error: 'Failed to fetch candidates' });
        }
    })();
});

// Get candidate by ID
router.get('/:id', (req, res) => {
    (async () => {
        try {
            const { id } = req.params;
            const result = await pool.query(
                'SELECT * FROM candidates WHERE id = $1',
                [id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Candidate not found' });
            }
            
            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error fetching candidate:', error);
            res.status(500).json({ error: 'Failed to fetch candidate' });
        }
    })();
});

// Create new candidate
router.post('/', upload.single('resume'), (req, res) => {
    (async () => {
        try {
            // Support both JSON and multipart/form-data
            const body = req.body || {};
            const {
                name,
                email,
                phone,
                position,
                department,
                hiring_location
            } = body;

            // Check for duplicate email
            const existing = await pool.query('SELECT id FROM candidates WHERE email = $1', [email]);
            if (existing.rows.length > 0) {
                return res.status(409).json({ error: 'Email already exists' });
            }

            // Optionally handle resume file
            let resumeFileInfo = null;
            let resumeDbRow = null;
            const clientEmail = (req as any).user?.email || email;

            const result = await pool.query(
                `INSERT INTO candidates 
                (name, email, phone, position, department, hiring_location)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *`,
                [name, email, phone, position, department, hiring_location]
            );
            const candidate = result.rows[0];

            if (req.file) {
                // Check if a resume already exists for this candidate
                const existingResume = await pool.query(
                  'SELECT id FROM resumes WHERE candidate_id = $1',
                  [candidate.id]
                );
                if (existingResume.rows.length === 0) {
                    // Upload to Google Drive
                    const driveUrl = await googledriveService.uploadResume(
                        req.file.path,
                        `${candidate.id}-${req.file.filename}`
                    );
                    // Save to database
                    const resumeResult = await pool.query(
                        `INSERT INTO resumes 
                        (candidate_id, file_name, file_path, file_size, mime_type, uploaded_by)
                        VALUES ($1, $2, $3, $4, $5, $6)
                        RETURNING *`,
                        [
                            candidate.id,
                            req.file.originalname,
                            driveUrl,
                            req.file.size,
                            req.file.mimetype,
                            clientEmail
                        ]
                    );
                    resumeDbRow = resumeResult.rows[0];
                    // Clean up temporary file
                    try { fs.unlinkSync(req.file.path); } catch (cleanupError) { console.error('Error cleaning up temporary file:', cleanupError); }
                }
            }

            res.status(201).json({ ...candidate, resume: resumeDbRow });
        } catch (error) {
            console.error('Error creating candidate:', error);
            res.status(500).json({ error: 'Failed to create candidate' });
        }
    })();
});

// Update candidate
router.put('/:id', (req, res) => {
    (async () => {
        try {
            const { id } = req.params;
            const {
                name,
                email,
                phone,
                status,
                position,
                department,
                hiring_location
            } = req.body;

            const result = await pool.query(
                `UPDATE candidates 
                SET name = $1, email = $2, phone = $3, status = $4,
                    position = $5, department = $6, hiring_location = $7
                WHERE id = $8
                RETURNING *`,
                [name, email, phone, status, position, department, hiring_location, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Candidate not found' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error updating candidate:', error);
            res.status(500).json({ error: 'Failed to update candidate' });
        }
    })();
});

// Delete candidate
router.delete('/:id', (req, res) => {
    (async () => {
        try {
            const { id } = req.params;
            const result = await pool.query(
                'DELETE FROM candidates WHERE id = $1 RETURNING *',
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Candidate not found' });
            }

            res.json({ message: 'Candidate deleted successfully' });
        } catch (error) {
            console.error('Error deleting candidate:', error);
            res.status(500).json({ error: 'Failed to delete candidate' });
        }
    })();
});

export default router; 