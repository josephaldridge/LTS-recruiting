import express from 'express';
import pool from '../db';

const router = express.Router();

// Get all interviews
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM interviews ORDER BY date DESC, time DESC');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching interviews:', error);
        res.status(500).json({ error: 'Failed to fetch interviews' });
    }
});

// Create new interview
router.post('/', async (req, res) => {
    try {
        const { candidateId, interviewerId, date, time, type } = req.body;
        const result = await pool.query(
            `INSERT INTO interviews (candidate_id, interviewer_id, date, time, type)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [candidateId, interviewerId, date, time, type]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating interview:', error);
        res.status(500).json({ error: 'Failed to create interview' });
    }
});

export default router; 