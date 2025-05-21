import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // Database
    db: {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    },
    
    // Firebase Auth
    firebase: {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    
    // Google Drive
    googleDrive: {
        clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
        privateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        folderId: process.env.GOOGLE_DRIVE_FOLDER_ID,
    },
    
    // File upload
    upload: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedMimeTypes: ['application/pdf'],
        tempDir: path.join(__dirname, '../temp'),
    },
}; 