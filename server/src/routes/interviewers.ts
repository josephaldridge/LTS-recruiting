import express from 'express';
import pool from '../db';

const router = express.Router();

// Get all interviewers
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM interviewers ORDER BY name ASC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching interviewers:', error);
        res.status(500).json({ error: 'Failed to fetch interviewers' });
    }
});

export default router; 