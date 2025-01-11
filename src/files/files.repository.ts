import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseRepository, IBaseRepository } from '@common/db/base.repository';
import { FileEntity } from '@app/files/entities/file.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FilesRepository
  extends BaseRepository
  implements IFilesRepository
{
  constructor(
    @InjectRepository(FileEntity)
    private readonly entityRepository: Repository<FileEntity>,
  ) {
    super(entityRepository.manager.connection.createQueryRunner());
  }

  public async getAll(): Promise<FileEntity[]> {
    return await this.entityRepository.find();
  }

  public async create(entity: FileEntity): Promise<FileEntity> {
    return await this.entityRepository.save(entity);
  }
}

export abstract class IFilesRepository extends IBaseRepository {
  abstract create(entity: FileEntity): Promise<FileEntity>;
  abstract getAll(): Promise<FileEntity[]>;
}
