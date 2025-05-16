import { Pool } from 'pg';
import { config } from '../config';

const pool = new Pool(config.db);

// Test the connection
pool.connect()
    .then(() => console.log('Connected to PostgreSQL database'))
    .catch(err => console.error('Error connecting to PostgreSQL:', err));

export default pool; 