import {
  Controller,
  HttpCode,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ObjectStorageService } from './object-storage.service';
@Controller('object-storage')
export class ObjectStorageController {
  constructor(private readonly objectStorageService: ObjectStorageService) {}

  @Post('upload-file')
  @HttpCode(200)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'file', maxCount: 1 }], {
      limits: {
        fileSize: 50 * 1024 * 1024, // ✅ 50MB
      },
    }),
  )
  async uploadDocs(
    @Query() input: any,
    @UploadedFiles()
    files: {
      file: Express.Multer.File[];
    },
  ): Promise<any> {
    const result = this.objectStorageService.uploadFile(files);
    return result;
  }

  @Post('upload-slip')
  @HttpCode(200)
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'file', maxCount: 1 }], {
      limits: {
        fileSize: 50 * 1024 * 1024, // ✅ 50MB
      },
    }),
  )
  async uploadSlip(
    @Query() input: any,
    @UploadedFiles()
    files: {
      file: Express.Multer.File[];
    },
  ): Promise<any> {
    const result = this.objectStorageService.uploadSlip(files);
    return result;
  }
}
