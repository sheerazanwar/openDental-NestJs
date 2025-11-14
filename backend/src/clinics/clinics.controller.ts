import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClinicsService } from './clinics.service';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';
import { ClinicResponseDto } from './dto/clinic-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, AuthenticatedUser } from '../common/decorators/current-user.decorator';

@ApiTags('Clinics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('clinics')
export class ClinicsController {
  constructor(private readonly clinicsService: ClinicsService) {}

  @Post()
  @ApiOperation({ summary: 'Onboard a new clinic under the authenticated administrator' })
  @ApiCreatedResponse({ type: ClinicResponseDto })
  async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateClinicDto) {
    const clinic = await this.clinicsService.create(user.userId, dto);
    return this.toDto(clinic);
  }

  @Get()
  @ApiOperation({ summary: 'List all onboarded clinics' })
  @ApiOkResponse({ type: ClinicResponseDto, isArray: true })
  async findAll() {
    const clinics = await this.clinicsService.findAll();
    return clinics.map((clinic) => this.toDto(clinic));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve details for a specific clinic' })
  @ApiOkResponse({ type: ClinicResponseDto })
  async findOne(@Param('id') id: string) {
    const clinic = await this.clinicsService.findOne(id);
    return this.toDto(clinic);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a clinic configuration, including OpenDental credentials' })
  @ApiOkResponse({ type: ClinicResponseDto })
  async update(@Param('id') id: string, @Body() dto: UpdateClinicDto) {
    const clinic = await this.clinicsService.update(id, dto);
    return this.toDto(clinic);
  }

  private toDto(clinic: any): ClinicResponseDto {
    return {
      id: clinic.id,
      name: clinic.name,
      addressLine1: clinic.addressLine1,
      addressLine2: clinic.addressLine2,
      city: clinic.city,
      state: clinic.state,
      postalCode: clinic.postalCode,
      country: clinic.country,
      contactEmail: clinic.contactEmail,
      contactPhone: clinic.contactPhone,
      timezone: clinic.timezone,
      openDentalApiKey: clinic.openDentalApiKey,
      openDentalApiSecret: clinic.openDentalApiSecret,
      admin: {
        id: clinic.admin?.id,
        email: clinic.admin?.email,
        fullName: clinic.admin?.fullName,
        createdAt: clinic.admin?.createdAt,
        updatedAt: clinic.admin?.updatedAt,
      },
      createdAt: clinic.createdAt,
      updatedAt: clinic.updatedAt,
    } as ClinicResponseDto;
  }
}
