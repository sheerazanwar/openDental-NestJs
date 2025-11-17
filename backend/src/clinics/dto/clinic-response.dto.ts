import { ApiProperty } from '@nestjs/swagger';
import { AdminResponseDto } from '../../admins/dto/admin-response.dto';

export class ClinicResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  addressLine1!: string;

  @ApiProperty({ required: false })
  addressLine2?: string;

  @ApiProperty()
  city!: string;

  @ApiProperty()
  state!: string;

  @ApiProperty()
  postalCode!: string;

  @ApiProperty()
  country!: string;

  @ApiProperty()
  contactEmail!: string;

  @ApiProperty()
  contactPhone!: string;

  @ApiProperty()
  timezone!: string;

  @ApiProperty({ required: false })
  openDentalApiKey?: string;

  @ApiProperty({ required: false })
  openDentalApiSecret?: string;

  @ApiProperty({ type: () => AdminResponseDto })
  admin!: AdminResponseDto;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
