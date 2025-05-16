import { Client } from '@microsoft/microsoft-graph-client';
import { config } from '../config';
import fs from 'fs';
import path from 'path';

class OneDriveService {
    private client: Client;

    constructor() {
        this.client = Client.init({
            authProvider: async (done) => {
                try {
                    // TODO: Implement proper OAuth2 flow with Microsoft Graph
                    // For now, we'll use a placeholder token
                    done(null, 'YOUR_ACCESS_TOKEN');
                } catch (error) {
                    done(error, null);
                }
            }
        });
    }

    async uploadResume(filePath: string, fileName: string): Promise<string> {
        try {
            const fileStream = fs.createReadStream(filePath);
            const uploadSession = await this.client
                .api(`/me/drive/items/${config.onedrive.folderId}:/${fileName}:/createUploadSession`)
                .post({});

            const maxSliceSize = 320 * 1024; // 320KB chunks
            const fileSize = fs.statSync(filePath).size;
            let offset = 0;

            while (offset < fileSize) {
                const chunk = Buffer.alloc(Math.min(maxSliceSize, fileSize - offset));
                fs.readSync(fs.openSync(filePath, 'r'), chunk, 0, chunk.length, offset);

                await this.client
                    .api(uploadSession.uploadUrl)
                    .put(chunk);

                offset += chunk.length;
            }

            // Get the file's web URL
            const file = await this.client
                .api(`/me/drive/items/${config.onedrive.folderId}:/${fileName}`)
                .get();

            return file.webUrl;
        } catch (error) {
            console.error('Error uploading to OneDrive:', error);
            throw new Error('Failed to upload resume to OneDrive');
        }
    }

    async deleteResume(fileName: string): Promise<void> {
        try {
            await this.client
                .api(`/me/drive/items/${config.onedrive.folderId}:/${fileName}`)
                .delete();
        } catch (error) {
            console.error('Error deleting from OneDrive:', error);
            throw new Error('Failed to delete resume from OneDrive');
        }
    }
}

export default new OneDriveService(); 