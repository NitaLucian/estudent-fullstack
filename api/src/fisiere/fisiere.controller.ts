import {
  Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, UploadedFile, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiTags, type ApiBodyOptions } from '@nestjs/swagger';
import { UtilizatorCurent, type UtilizatorJwt } from '../auth/auth.decorators.js';
import { AdresaFisier, DocumentStudent } from './fisier.entity.js';
import { FisiereService } from './fisiere.service.js';

// descrierea corpului multipart/form-data pentru documentația OpenAPI
const CORP_FISIER: ApiBodyOptions = {
  schema: { type: 'object', properties: { fisier: { type: 'string', format: 'binary' } }, required: ['fisier'] },
};

// FileInterceptor citește câmpul „fisier” din cererea multipart (cu biblioteca multer)
// și îl păstrează în memorie. Limita de mărime este verificată ÎNAINTE de a citi tot fișierul:
// o cerere prea mare primește 413 Payload Too Large.
const fisierDeMaxim = (mb: number) => FileInterceptor('fisier', { limits: { fileSize: mb * 1024 * 1024, files: 1 } });

@ApiTags('fisiere')
@Controller()
export class FisiereController {
  constructor(private readonly service: FisiereService) {}

  @Post('studenti/:id/fotografie')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseInterceptors(fisierDeMaxim(2))
  @ApiConsumes('multipart/form-data')
  @ApiBody(CORP_FISIER)
  incarcaFotografie(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() fisier: Express.Multer.File | undefined,
    @UtilizatorCurent() u: UtilizatorJwt,
  ): Promise<void> {
    return this.service.incarcaFotografie(id, fisier, u);
  }

  @Get('studenti/:id/fotografie')
  urlFotografie(@Param('id', ParseIntPipe) id: number, @UtilizatorCurent() u: UtilizatorJwt): Promise<AdresaFisier> {
    return this.service.urlFotografie(id, u);
  }

  @Get('studenti/:id/documente')
  documente(@Param('id', ParseIntPipe) id: number, @UtilizatorCurent() u: UtilizatorJwt): Promise<DocumentStudent[]> {
    return this.service.documente(id, u);
  }

  @Post('studenti/:id/documente')
  @UseInterceptors(fisierDeMaxim(5))
  @ApiConsumes('multipart/form-data')
  @ApiBody(CORP_FISIER)
  incarcaDocument(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() fisier: Express.Multer.File | undefined,
    @UtilizatorCurent() u: UtilizatorJwt,
  ): Promise<DocumentStudent> {
    return this.service.incarcaDocument(id, fisier, u);
  }

  @Get('documente/:id/url')
  urlDocument(@Param('id', ParseIntPipe) id: number, @UtilizatorCurent() u: UtilizatorJwt): Promise<AdresaFisier> {
    return this.service.urlDocument(id, u);
  }

  @Delete('documente/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  stergeDocument(@Param('id', ParseIntPipe) id: number, @UtilizatorCurent() u: UtilizatorJwt): Promise<void> {
    return this.service.stergeDocument(id, u);
  }
}
