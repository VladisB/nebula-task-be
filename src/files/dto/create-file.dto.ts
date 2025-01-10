import { IsArray, IsUrl } from 'class-validator';

export class CreateFileDto {
    @IsArray()
    @IsUrl({}, { each: true })
    urls: string[];
}