import { FileEntity } from '../entities/file.entity';

export abstract class FileModelFactory {
  public static create({
    fileName,
    originalUrl,
    driveFileId,
    mimeType,
    size,
    createdAt,
    updatedAt = createdAt,
  }: {
    fileName: string;
    originalUrl: string;
    driveFileId: string;
    mimeType: string;
    size: number;
    createdAt: Date;
    updatedAt?: Date;
  }): FileEntity {
    const file = new FileEntity();

    file.fileName = fileName;
    file.originalUrl = originalUrl;
    file.driveFileId = driveFileId;
    file.mimeType = mimeType;
    file.size = size;
    file.createdAt = createdAt;
    file.updatedAt = updatedAt ?? createdAt;

    return file;
  }
}
