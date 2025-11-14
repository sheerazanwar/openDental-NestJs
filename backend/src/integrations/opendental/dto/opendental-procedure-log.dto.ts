import { ApiPropertyOptional } from '@nestjs/swagger';

export class OpenDentalProcedureLogDto {
  @ApiPropertyOptional()
  ProcNum?: string;

  @ApiPropertyOptional()
  PatNum?: string;

  @ApiPropertyOptional()
  AptNum?: string;

  @ApiPropertyOptional()
  ProcCode?: string;

  @ApiPropertyOptional()
  ToothNum?: string;

  @ApiPropertyOptional()
  ProcFee?: number;
}
