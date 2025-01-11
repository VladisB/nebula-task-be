import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Readable } from 'stream';
import { FileEntity } from './entities/file.entity';
import { GoogleDriveService } from './google-drive.service';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { FileViewModel } from './view-models';
import { FileViewModelFactory } from './model-factories';

@Injectable()
export class FilesService implements IFilesService {
  private readonly logger: Logger = new Logger(FilesService.name);

  constructor(
    @InjectRepository(FileEntity)
    // TODO: Implement repository pattern
    private readonly fileRepository: Repository<FileEntity>,
    private readonly googleDriveService: GoogleDriveService,
    private readonly httpService: HttpService,

    private readonly fileViewModelFactory: FileViewModelFactory,
  ) { }

  /**
  * Handles multiple file uploads concurrently
  * @param urls Array of file URLs to process
  */
  public async uploadFiles(urls: string[]): Promise<FileViewModel[]> {
    try {
      const results = await Promise.all(urls.map((url) => this.handleFileProcessing(url)));

      return this.fileViewModelFactory.initRoleListViewModel(results);
    } catch (error) {
      this.logger.error('Error processing multiple files', error.stack);

      throw new HttpException('Failed to process files', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Retrieves all file records from the database
   * @returns A list of file entities
   */
  public async getAllFiles(): Promise<FileViewModel[]> {
    const files = await this.fileRepository.find();

    return this.fileViewModelFactory.initRoleListViewModel(files);
  }

  /**
  * Handles the complete processing of a single file URL
  * @param url The URL of the file to process
  */
  private async handleFileProcessing(url: string): Promise<FileEntity> {
    const { stream: downloadStream, size: fileSize  } = await this.downloadFileStream(url);

    let downloadedSize = 0;
    downloadStream.on('data', (chunk: Buffer) => {
      downloadedSize += chunk.length;
      const progress = (downloadedSize / fileSize) * 100;

      this.logger.debug(`Download progress: ${progress.toFixed(2)}%`);
    });

    downloadStream.on('end', () => {
      this.logger.log('File download completed.');
    });

    const metadata = await this.extractFileMetadata(url, downloadStream);
    const { gDriveId } = await this.googleDriveService.uploadFile(downloadStream, metadata.fileName);

    if (fileSize) {
      this.logger.log(`File size: ${(fileSize / (1024 * 1024)).toFixed(2)} MB`);
    } else {
      this.logger.warn('Unable to determine file size.');
    }

    const fileData = await this.saveFileMetadata(url, gDriveId, metadata);
    this.logger.log(`File metadata saved to database with ID: ${fileData.id}`);

    return fileData;
  }

  /**
 * Downloads a file from a URL as a readable stream
 * @param url The file URL
 */
  private async downloadFileStream(url: string): Promise<{ stream: Readable; size: number }> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(url, { responseType: 'stream' }),
      );

      const totalLength = parseInt(response.headers['content-length'], 10);

      if (isNaN(totalLength)) {
        this.logger.warn('Failed to retrieve file size from Content-Length header.');
      } else {
        this.logger.log(`Retrieved file size: ${(totalLength / (1024 * 1024)).toFixed(2)} MB`);
      }

      return { stream: response.data, size: totalLength };
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
      const fileName = url.split('/').pop()?.split('?')[0] || 'unknown_file';

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
  uploadFiles(urls: string[]): Promise<FileViewModel[]>;

  /**
   * Retrieve all file records from DB
   */
  getAllFiles():  Promise<FileViewModel[]>;
}
