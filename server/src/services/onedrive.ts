import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';
import { config } from '../config';
import fs from 'fs';
import path from 'path';

class OneDriveService {
    private client: Client;

    constructor() {
        this.client = Client.init({
            authProvider: async (done) => {
                try {
                    const credential = new ClientSecretCredential(
                        process.env.ONEDRIVE_TENANT_ID!,
                        process.env.ONEDRIVE_CLIENT_ID!,
                        process.env.ONEDRIVE_CLIENT_SECRET!
                    );
                    const token = await credential.getToken('https://graph.microsoft.com/.default');
                    done(null, token?.token);
                } catch (error) {
                    done(error, null);
                }
            }
        });
    }

    async uploadResume(filePath: string, fileName: string): Promise<string> {
        try {
            const driveId = process.env.ONEDRIVE_DRIVE_ID!;
            const folderId = process.env.ONEDRIVE_FOLDER_ID!;
            const uploadSessionEndpoint = `/drives/${driveId}/items/${folderId}:/${fileName}:/createUploadSession`;
            console.log('OneDrive uploadResume called - code version:', new Date().toISOString());
            console.log('Using driveId:', driveId);
            console.log('Using folderId:', folderId);
            console.log('Creating upload session at endpoint:', uploadSessionEndpoint);
            const fileStream = fs.createReadStream(filePath);
            const uploadSession = await this.client
                .api(uploadSessionEndpoint)
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
            const fileEndpoint = `/drives/${driveId}/items/${folderId}:/${fileName}`;
            console.log('Retrieving file at endpoint:', fileEndpoint);
            const file = await this.client
                .api(fileEndpoint)
                .get();

            return file.webUrl;
        } catch (error) {
            console.error('Error uploading to OneDrive:', error);
            throw new Error('Failed to upload resume to OneDrive');
        }
    }

    async deleteResume(fileName: string): Promise<void> {
        try {
            const driveId = process.env.ONEDRIVE_DRIVE_ID!;
            const folderId = process.env.ONEDRIVE_FOLDER_ID!;
            await this.client
                .api(`/drives/${driveId}/items/${folderId}:/${fileName}`)
                .delete();
        } catch (error) {
            console.error('Error deleting from OneDrive:', error);
            throw new Error('Failed to delete resume from OneDrive');
        }
    }
}

export default new OneDriveService(); 