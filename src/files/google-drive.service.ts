import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, drive_v3 } from 'googleapis';
import { Readable } from 'stream';

export interface GoogleDriveFile {
  name: string;
  mimeType: string;
  gDriveId: string;
  gDriveDownloadLink: string;
}

@Injectable()
export class GoogleDriveService implements IGoogleDriveService {
  private readonly logger: Logger = new Logger(GoogleDriveService.name);
  private readonly driveClient: drive_v3.Drive;

  private readonly googleDriveFolderId: string;
  private readonly keyFile: string;
  private readonly scopes: string[];

  constructor(private readonly configService: ConfigService) {
    this.keyFile = this.configService.get<string>('google.keyFile');
    this.scopes = this.configService.get<string[]>('google.scopes');
    this.googleDriveFolderId = this.configService.get<string>(
      'google.gDriveFolderId',
    );

    const auth = new google.auth.GoogleAuth({
      keyFile: this.keyFile,
      scopes: this.scopes,
    });

    this.driveClient = google.drive({ version: 'v3', auth });
  }

  public async listAllFiles(): Promise<GoogleDriveFile[]> {
    let files: drive_v3.Schema$File[] = [];
    let pageToken: string | undefined = undefined;

    try {
      do {
        const response = await this.driveClient.files.list({
          q: "trashed = false and mimeType != 'application/vnd.google-apps.folder'",
          fields: 'nextPageToken, files(id, name, mimeType)',
          spaces: 'drive',
          pageToken: pageToken,
        });

        files = files.concat(response.data.files || []);
        pageToken = response.data.nextPageToken;
      } while (pageToken);

      this.logger.log(`Total files found: ${files.length}`);

      const mappedFiles: GoogleDriveFile[] = files.map((file) => ({
        gDriveId: file.id,
        name: file.name,
        mimeType: file.mimeType,
        gDriveDownloadLink: `https://drive.google.com/uc?export=download&id=${file.id}`,
      }));

      return mappedFiles;
    } catch (error) {
      this.logger.error('Error retrieving files from Google Drive', error);

      throw new Error('Failed to list files from Google Drive');
    }
  }

  public async uploadFile(
    stream: Readable,
    fileName: string,
  ): Promise<GoogleDriveFile> {
    try {
      const response = await this.driveClient.files.create({
        requestBody: {
          name: fileName,
          parents: [this.googleDriveFolderId],
        },
        media: { body: stream },
      });

      const fileId: string = response.data.id!;

      this.logger.log(`File uploaded: [${fileName}] -> ID: ${fileId}`);

      // NOTE: Public by default since we don't have any specific requirements and it should be accessible by Google Drive link
      await this.setFilePublic(fileId);

      return {
        name: fileName,
        mimeType: response.data.mimeType,
        gDriveId: fileId,
        gDriveDownloadLink: `https://drive.google.com/uc?export=download&id=${fileId}`,
      };
    } catch (error) {
      this.logger.error('Google Drive upload failed', error);
      throw error;
    }
  }

  private async setFilePublic(
    fileId: string,
  ): Promise<drive_v3.Schema$Permission> {
    try {
      const permission = await this.driveClient.permissions.create({
        fileId: fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      this.logger.log(`File with ID: ${fileId} is now public.`);

      return permission.data;
    } catch (error) {
      this.logger.error(`Failed to set file public: ${error.message}`);
      throw new Error('Failed to set file public');
    }
  }
}

export interface IGoogleDriveService {
  /**
   * Upload a file stream to Google Drive, returning the file's Drive ID
   */
  uploadFile(stream: Readable, fileName: string): Promise<GoogleDriveFile>;

  /**
   * List all files in Google Drive
   */
  listAllFiles(): Promise<GoogleDriveFile[]>;
}
