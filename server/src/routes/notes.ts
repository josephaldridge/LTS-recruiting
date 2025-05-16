import express from 'express';
import pool from '../db';

const router = express.Router();

// Get all notes for a candidate
router.get('/candidate/:candidateId', (req, res) => {
    (async () => {
        try {
            const { candidateId } = req.params;
            const result = await pool.query(
                'SELECT * FROM notes WHERE candidate_id = $1 ORDER BY created_at DESC',
                [candidateId]
            );
            res.json(result.rows);
        } catch (error) {
            console.error('Error fetching notes:', error);
            res.status(500).json({ error: 'Failed to fetch notes' });
        }
    })();
});

// Add a new note
router.post('/', (req, res) => {
    (async () => {
        try {
            const { candidateId, text } = req.body;
            const authorEmail = (req as any).user.email;

            const result = await pool.query(
                `INSERT INTO notes (candidate_id, text, author_email)
                VALUES ($1, $2, $3)
                RETURNING *`,
                [candidateId, text, authorEmail]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Error creating note:', error);
            res.status(500).json({ error: 'Failed to create note' });
        }
    })();
});

// Delete a note
router.delete('/:id', (req, res) => {
    (async () => {
        try {
            const { id } = req.params;
            const result = await pool.query(
                'DELETE FROM notes WHERE id = $1 RETURNING *',
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Note not found' });
            }

            res.json({ message: 'Note deleted successfully' });
        } catch (error) {
            console.error('Error deleting note:', error);
            res.status(500).json({ error: 'Failed to delete note' });
        }
    })();
});

export default router; 