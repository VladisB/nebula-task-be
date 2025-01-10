import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Readable } from 'stream';

import { FileEntity } from './entities/file.entity';
import { GoogleDriveService } from './google-drive.service';

@Injectable()
export class FilesService implements IFilesService {
  private readonly logger: Logger = new Logger(FilesService.name);

  constructor(
    @InjectRepository(FileEntity)
    // TODO: Implement repository pattern for FileEntity
    private readonly fileRepository: Repository<FileEntity>,
    private readonly googleDriveService: GoogleDriveService, // Dependency for Google Drive operations
  ) { }

  /**
  * Handles multiple file uploads concurrently
  * @param urls Array of file URLs to process
  */
  public async processMultipleFiles(urls: string[]): Promise<FileEntity[]> {
    try {
      const results = await Promise.all(urls.map((url) => this.handleFileProcessing(url)));

      return results;
    } catch (error) {
      this.logger.error('Error processing multiple files', error.stack);
      throw new HttpException('Failed to process files', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Retrieves all file records from the database
   * @returns A list of file entities
   */
  public async getAllFiles(): Promise<FileEntity[]> {
    return this.fileRepository.find();
  }

  /**
  * Handles the complete processing of a single file URL
  * @param url The URL of the file to process
  */
  private async handleFileProcessing(url: string): Promise<FileEntity> {
    const fileStream = await this.downloadFileStream(url);
    const metadata = await this.extractFileMetadata(url, fileStream);
    const driveFileId = await this.uploadToGoogleDrive(fileStream, metadata.fileName);

    return this.saveFileMetadata(url, driveFileId, metadata);
  }

  /**
 * Downloads a file from a URL as a readable stream
 * @param url The file URL
 */
  private async downloadFileStream(url: string): Promise<Readable> {
    try {
      const response = await axios.get(url, { responseType: 'stream' });

      return response.data as Readable;
    } catch (error) {
      this.logger.error(`Failed to download file from URL: ${url}`, error.stack);
      throw new HttpException('Failed to download file', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Extracts file metadata from the response headers and URL
   * @param url The file URL
   * @param fileStream The file stream
   */
  private async extractFileMetadata(url: string, fileStream: Readable): Promise<{
    fileName: string;
    mimeType: string;
    size: number;
  }> {
    try {
      const contentType = (fileStream as any).headers?.['content-type'] || '';
      const contentLength = parseInt((fileStream as any).headers?.['content-length'] || '0', 10);
      const fileName = url.split('/').pop() || 'unknown_file';

      return {
        fileName,
        mimeType: contentType,
        size: contentLength,
      };
    } catch (error) {
      this.logger.error(`Failed to extract file metadata from URL: ${url}`, error.stack);
      throw new HttpException('Failed to extract file metadata', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Uploads a file stream to Google Drive
   * @param fileStream The file stream
   * @param fileName The name of the file
   */
  // TODO: try get rid of this wrapper
  private async uploadToGoogleDrive(fileStream: Readable, fileName: string): Promise<string> {
    try {
      return await this.googleDriveService.uploadFile(fileStream, fileName);

    } catch (error) {
      this.logger.error(`Failed to upload file to Google Drive: ${fileName}`, error.stack);
      throw new HttpException('Failed to upload file to Google Drive', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Saves file metadata to the database
   * @param url The file's original URL
   * @param driveFileId The Google Drive file ID
   * @param metadata The file's metadata (name, type, size)
   */
  private async saveFileMetadata(
    url: string,
    driveFileId: string,
    metadata: { fileName: string; mimeType: string; size: number },
  ): Promise<FileEntity> {
    try {
      const fileEntity = this.fileRepository.create({
        originalUrl: url,
        driveFileId,
        fileName: metadata.fileName,
        mimeType: metadata.mimeType,
        size: metadata.size,
      });

      return await this.fileRepository.save(fileEntity);
    } catch (error) {
      this.logger.error(`Failed to save file metadata for URL: ${url}`, error.stack);
      throw new HttpException('Failed to save file metadata', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}


export interface IFilesService {
  /**
   * Process multiple file URLs
   */
  processMultipleFiles(urls: string[]): Promise<FileEntity[]>;

  /**
   * Retrieve all file records from DB
   */
  getAllFiles(): Promise<FileEntity[]>;
}
