import { ApiProperty } from '@nestjs/swagger';

export class PatientResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  externalId!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;

  @ApiProperty({ required: false })
  birthDate?: string;

  @ApiProperty({ required: false })
  email?: string;

  @ApiProperty({ required: false })
  phoneNumber?: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
