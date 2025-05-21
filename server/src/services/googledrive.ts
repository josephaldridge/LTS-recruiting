import { google } from 'googleapis';
import { config } from '../config';
import fs from 'fs';
import path from 'path';

class GoogleDriveService {
    private drive;
    private folderId: string;

    constructor() {
        // Initialize the Google Drive client
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/drive.file'],
        });

        this.drive = google.drive({ version: 'v3', auth });
        this.folderId = process.env.GOOGLE_DRIVE_FOLDER_ID!;
    }

    async uploadResume(filePath: string, fileName: string): Promise<string> {
        try {
            console.log('Google Drive uploadResume called - code version:', new Date().toISOString());
            console.log('Using folderId:', this.folderId);

            const fileMetadata = {
                name: fileName,
                parents: [this.folderId],
            };

            const media = {
                mimeType: 'application/pdf',
                body: fs.createReadStream(filePath),
            };

            const response = await this.drive.files.create({
                requestBody: fileMetadata,
                media: media,
                fields: 'id, webViewLink',
            });

            if (!response.data.webViewLink) {
                throw new Error('Failed to get file URL');
            }

            return response.data.webViewLink;
        } catch (error) {
            console.error('Error uploading to Google Drive:', error);
            throw new Error('Failed to upload resume to Google Drive');
        }
    }

    async deleteResume(fileName: string): Promise<void> {
        try {
            // First, find the file by name in the specified folder
            const response = await this.drive.files.list({
                q: `name = '${fileName}' and '${this.folderId}' in parents and trashed = false`,
                fields: 'files(id)',
            });

            if (response.data.files && response.data.files.length > 0) {
                const fileId = response.data.files[0].id;
                await this.drive.files.delete({
                    fileId: fileId!,
                });
            } else {
                console.warn(`File ${fileName} not found in Google Drive`);
            }
        } catch (error) {
            console.error('Error deleting from Google Drive:', error);
            throw new Error('Failed to delete resume from Google Drive');
        }
    }
}

export default new GoogleDriveService(); 