import express from 'express';
import pool from '../db';

const router = express.Router();

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
router.post('/', (req, res) => {
    (async () => {
        try {
            const {
                name,
                email,
                phone,
                position,
                department,
                city,
                state
            } = req.body;

            const result = await pool.query(
                `INSERT INTO candidates 
                (name, email, phone, position, department, city, state)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *`,
                [name, email, phone, position, department, city, state]
            );

            res.status(201).json(result.rows[0]);
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
                city,
                state
            } = req.body;

            const result = await pool.query(
                `UPDATE candidates 
                SET name = $1, email = $2, phone = $3, status = $4,
                    position = $5, department = $6, city = $7, state = $8
                WHERE id = $9
                RETURNING *`,
                [name, email, phone, status, position, department, city, state, id]
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