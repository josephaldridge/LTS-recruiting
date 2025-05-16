import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // Database
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'liberty_tax_hiring',
        user: process.env.DB_USER || 'postgres',
        password: 'L1b3rty$',
    },
    
    // Firebase Auth
    firebase: {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    
    // OneDrive for Business
    onedrive: {
        clientId: process.env.ONEDRIVE_CLIENT_ID,
        clientSecret: process.env.ONEDRIVE_CLIENT_SECRET,
        tenantId: process.env.ONEDRIVE_TENANT_ID,
        folderId: process.env.ONEDRIVE_FOLDER_ID,
    },
    
    // File upload
    upload: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedMimeTypes: ['application/pdf'],
        tempDir: path.join(__dirname, '../temp'),
    },
}; 