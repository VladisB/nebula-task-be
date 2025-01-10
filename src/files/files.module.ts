import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from './entities/file.entity';
import { GoogleDriveService } from './google-drive.service';
import { HttpModule } from '@nestjs/axios';
import { FileViewModelFactory } from './model-factories';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity]), // Register FileEntity here
    HttpModule,
  ],
  controllers: [FilesController],
  providers: [FilesService, GoogleDriveService, FileViewModelFactory],
})
export class FilesModule { }
