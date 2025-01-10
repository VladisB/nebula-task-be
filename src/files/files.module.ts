import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from './entities/file.entity';
import { GoogleDriveService } from './google-drive.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity]), // Register FileEntity here
  ],
  controllers: [FilesController],
  providers: [FilesService, GoogleDriveService],
})
export class FilesModule { }
