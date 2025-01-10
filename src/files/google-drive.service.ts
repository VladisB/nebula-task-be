import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, drive_v3 } from 'googleapis';
import { Readable } from 'stream';

@Injectable()
export class GoogleDriveService implements IGoogleDriveService {
    private readonly logger: Logger = new Logger(GoogleDriveService.name);
    private readonly driveClient: drive_v3.Drive;

    constructor(private readonly configService: ConfigService) {
        const keyFile: string = this.configService.get<string>('google.keyFile');
        const scopes: string[] = this.configService.get<string[]>('google.scopes');

        const auth = new google.auth.GoogleAuth({
            keyFile,
            scopes,
        });

        this.driveClient = google.drive({ version: 'v3', auth });
    }

    public async uploadFile(stream: Readable, fileName: string): Promise<string> {
        try {
            const response = await this.driveClient.files.create({
                requestBody: {
                    name: fileName,
                    parents: ["1SkDA9-BzKufJgqkecg8fRY1LrGKjL2YW"] // TODO: set in environment variable
                },
                media: { body: stream }
            });

            const fileId: string = response.data.id!;
            this.logger.log(`File uploaded: [${fileName}] -> ID: ${fileId}`);
            return fileId;
        } catch (error) {
            this.logger.error('Google Drive upload failed', error);
            throw error;
        }
    }
}

export interface IGoogleDriveService {
    /**
     * Upload a file stream to Google Drive, returning the file's Drive ID
     */
    uploadFile(stream: Readable, fileName: string): Promise<string>;
}