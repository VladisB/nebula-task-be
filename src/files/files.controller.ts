import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { FileViewModel } from './view-models';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  // TODO: Add a return type for this method
  create(@Body() createFileDto: CreateFileDto) {
    return this.filesService.uploadFiles(createFileDto.urls);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(): Promise<FileViewModel[]> {
    return this.filesService.getAllFiles();
  }
}
