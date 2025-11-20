import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ClaimsService } from './claims.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { ClaimResponseDto } from './dto/claim-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AppointmentResponseDto } from '../appointments/dto/appointment-response.dto';
import { PatientResponseDto } from '../patients/dto/patient-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';

@ApiTags('Claims')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('claims')
export class ClaimsController {
  constructor(private readonly claimsService: ClaimsService) {}

  @Post()
  @ApiOperation({ summary: 'Create or update claim information received from OpenDental or AI pipeline' })
  @ApiOkResponse({ type: ClaimResponseDto })
  async upsert(@Body() dto: CreateClaimDto, @CurrentUser() user: AuthenticatedUser) {
    const claim = await this.claimsService.upsert(dto, user);
    return this.toDto(claim);
  }

  @Get()
  @ApiOperation({ summary: 'List claims, optionally filtered by clinic' })
  @ApiQuery({ name: 'clinicId', required: false })
  @ApiOkResponse({ type: ClaimResponseDto, isArray: true })
  async findAll(@Query('clinicId') clinicId: string | undefined, @CurrentUser() user: AuthenticatedUser) {
    const claims = await this.claimsService.list(clinicId, user);
    return claims.map((claim) => this.toDto(claim));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve claim details, including appointment and patient context' })
  @ApiOkResponse({ type: ClaimResponseDto })
  async findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    const claim = await this.claimsService.findOne(id, user);
    return this.toDto(claim);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update claim status and metadata' })
  @ApiOkResponse({ type: ClaimResponseDto })
  async update(@Param('id') id: string, @Body() dto: UpdateClaimDto, @CurrentUser() user: AuthenticatedUser) {
    const claim = await this.claimsService.update(id, dto, user);
    return this.toDto(claim);
  }

  private toDto(claim: any): ClaimResponseDto {
    const appointment: AppointmentResponseDto | undefined = claim.appointment
      ? {
          id: claim.appointment.id,
          externalAptId: claim.appointment.externalAptId,
          status: claim.appointment.status,
          eligibilityStatus: claim.appointment.eligibilityStatus,
          eligibilityDetails: claim.appointment.eligibilityDetails,
          scheduledStart: claim.appointment.scheduledStart,
          scheduledEnd: claim.appointment.scheduledEnd,
          reason: claim.appointment.reason,
          notes: claim.appointment.notes,
          insuranceCoverageAmount: claim.appointment.insuranceCoverageAmount,
          patientResponsibilityAmount: claim.appointment.patientResponsibilityAmount,
          discountAmount: claim.appointment.discountAmount,
          operatory: claim.appointment.operatory,
          providerName: claim.appointment.providerName,
          patient: this.toPatientDto(claim.appointment.patient),
          clinicId: claim.appointment.clinic?.id,
          createdAt: claim.appointment.createdAt,
          updatedAt: claim.appointment.updatedAt,
        }
      : undefined;

    return {
      id: claim.id,
      externalClaimId: claim.externalClaimId,
      status: claim.status,
      amountBilled: claim.amountBilled,
      amountApproved: claim.amountApproved,
      rejectionReason: claim.rejectionReason,
      notes: claim.notes,
      metadata: claim.metadata,
      lastPolledAt: claim.lastPolledAt,
      appointment,
      patient: this.toPatientDto(claim.patient),
      clinicId: claim.clinic?.id,
      createdAt: claim.createdAt,
      updatedAt: claim.updatedAt,
    } as ClaimResponseDto;
  }

  private toPatientDto(patient: any): PatientResponseDto | undefined {
    if (!patient) {
      return undefined;
    }
    return {
      id: patient.id,
      externalId: patient.externalId,
      firstName: patient.firstName,
      lastName: patient.lastName,
      birthDate: patient.birthDate,
      email: patient.email,
      phoneNumber: patient.phoneNumber,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    } as PatientResponseDto;
  }
}
