import { FileEntity } from '../entities/file.entity';
import { FileViewModel } from '../view-models';

export class FileViewModelFactory implements IFileViewModelFactory {
  public initRoleListViewModel(files: FileEntity[]): FileViewModel[] {
    const model: FileViewModel[] = [];

    return this.setRoleListViewModel(model, files);
  }

  private setRoleListViewModel(
    model: FileViewModel[],
    files: FileEntity[],
  ): FileViewModel[] {
    if (files.length) {
      const fileList = files.map<FileViewModel>((role) => ({
        id: role.id,
        name: role.fileName,
        link: this.setGoogleDriveDownloadLink(role.driveFileId),
        size: this.setHumanReadableFileSize(role.size),
        mimeType: role.mimeType,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      }));

      model.push(...fileList);
    }

    return model;
  }

  private setGoogleDriveDownloadLink(fileId: string): string {
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  private setHumanReadableFileSize(size: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];

    let i = 0;
    let bytes = Number(size);
    while (bytes >= 1024) {
      bytes /= 1024;
      i++;
    }

    return `${bytes.toFixed(2)} ${units[i]}`;
  }
}

export interface IFileViewModelFactory {
  initRoleListViewModel(files: FileEntity[]): FileViewModel[];
}
