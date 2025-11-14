import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateClinicDto {
  @ApiProperty({ description: 'Human friendly clinic name', example: 'Bright Smiles Dental' })
  @IsString()
  name!: string;

  @ApiProperty({ example: '123 Main St' })
  @IsString()
  addressLine1!: string;

  @ApiProperty({ example: 'Suite 200', required: false })
  @IsOptional()
  @IsString()
  addressLine2?: string;

  @ApiProperty({ example: 'Austin' })
  @IsString()
  city!: string;

  @ApiProperty({ example: 'TX' })
  @IsString()
  state!: string;

  @ApiProperty({ example: '73301' })
  @IsString()
  postalCode!: string;

  @ApiProperty({ example: 'USA' })
  @IsString()
  country!: string;

  @ApiProperty({ example: 'ops@brightsmiles.com' })
  @IsEmail()
  contactEmail!: string;

  @ApiProperty({ example: '+1-555-0100' })
  @IsString()
  contactPhone!: string;

  @ApiProperty({ description: 'Timezone identifier', example: 'America/Chicago', required: false })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({ description: 'OpenDental API key', required: false })
  @IsOptional()
  @IsString()
  openDentalApiKey?: string;

  @ApiProperty({ description: 'OpenDental API secret', required: false })
  @IsOptional()
  @IsString()
  openDentalApiSecret?: string;
}
