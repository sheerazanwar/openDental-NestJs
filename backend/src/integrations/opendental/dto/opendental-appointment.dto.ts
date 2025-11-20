import { ApiProperty } from '@nestjs/swagger';

export class OpenDentalAppointmentDto {
  @ApiProperty()
  AptNum!: string;

  @ApiProperty()
  PatNum!: string;

  @ApiProperty()
  ClinicNum!: string;

  @ApiProperty()
  AptStatus!: string;

  @ApiProperty()
  AptDateTime!: string;

  @ApiProperty()
  AptLength!: number;

  @ApiProperty()
  ProviderNum!: string;

  @ApiProperty({ required: false })
  Note?: string;
}
