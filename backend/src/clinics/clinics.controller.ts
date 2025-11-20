import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClinicsService } from './clinics.service';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';
import { ClinicResponseDto } from './dto/clinic-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';
import { ManageSubscriptionDto } from './dto/manage-subscription.dto';

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
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    const clinics = await this.clinicsService.findAllForUser(user);
    return clinics.map((clinic) => this.toDto(clinic));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve details for a specific clinic' })
  @ApiOkResponse({ type: ClinicResponseDto })
  async findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const clinic = await this.clinicsService.findOneForUser(id, user);
    return this.toDto(clinic);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a clinic configuration, including OpenDental credentials' })
  @ApiOkResponse({ type: ClinicResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateClinicDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const clinic = await this.clinicsService.updateForUser(id, dto, user);
    return this.toDto(clinic);
  }

  @Post(':id/subscription/revoke')
  @ApiOperation({ summary: 'Revoke the subscription for a clinic' })
  @ApiOkResponse({ description: 'Subscription revoked' })
  async revokeSubscription(
    @Param('id') id: string,
    @Body() dto: ManageSubscriptionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.clinicsService.revokeSubscription(id, dto, user);
  }

  @Post(':id/subscription/restart')
  @ApiOperation({ summary: 'Restart or reactivate a clinic subscription' })
  @ApiOkResponse({ description: 'Subscription restarted' })
  async restartSubscription(
    @Param('id') id: string,
    @Body() dto: ManageSubscriptionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.clinicsService.restartSubscription(id, dto, user);
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
