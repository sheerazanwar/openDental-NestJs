import { ApiPropertyOptional } from '@nestjs/swagger';

export class OpenDentalPatientDto {
  @ApiPropertyOptional()
  PatNum!: string;

  @ApiPropertyOptional()
  LName?: string;

  @ApiPropertyOptional()
  FName?: string;

  @ApiPropertyOptional()
  Birthdate?: string;

  @ApiPropertyOptional()
  ClinicNum?: string;

  @ApiPropertyOptional()
  Email?: string;

  @ApiPropertyOptional()
  Phone?: string;
}
