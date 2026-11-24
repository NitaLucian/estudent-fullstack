import { Controller, Get, Header, Query } from '@nestjs/common';
import { ApiOkResponse, ApiProduces, ApiTags } from '@nestjs/swagger';
import { Roluri } from '../auth/roluri.guard.js';
import { FiltreRaportDto } from './dto/filtre-raport.dto.js';
import { LocClasament, NumarNote, PromovabilitateDisciplina } from './raport.entity.js';
import { RapoarteService } from './rapoarte.service.js';

// /api/rapoarte – doar pentru administrator
@ApiTags('rapoarte')
@Roluri('ADMIN')
@Controller('rapoarte')
export class RapoarteController {
  constructor(private readonly service: RapoarteService) {}

  @Get('distributie-note')
  distributie(@Query() f: FiltreRaportDto): Promise<NumarNote[]> {
    return this.service.distributie(f);
  }

  @Get('promovabilitate')
  promovabilitate(@Query() f: FiltreRaportDto): Promise<PromovabilitateDisciplina[]> {
    return this.service.promovabilitate(f);
  }

  @Get('clasament')
  clasament(@Query() f: FiltreRaportDto): Promise<LocClasament[]> {
    return this.service.clasament(f);
  }

  @Get('clasament.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="clasament.csv"')
  @ApiProduces('text/csv')
  @ApiOkResponse({ schema: { type: 'string' } })
  clasamentCsv(@Query() f: FiltreRaportDto): Promise<string> {
    return this.service.clasamentCsv(f);
  }

  // Răspunsul nu este JSON, ci un fișier text CSV. Content-Disposition: attachment
  // îi spune browserului să îl salveze ca fișier, cu numele dat.
  @Get('grupe.csv')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @Header('Content-Disposition', 'attachment; filename="grupe.csv"')
  @ApiProduces('text/csv')
  @ApiOkResponse({ schema: { type: 'string' } })
  grupeCsv(@Query() f: FiltreRaportDto): Promise<string> {
    return this.service.grupeCsv(f);
  }
}
