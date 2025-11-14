import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentResponseDto } from './dto/appointment-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create or update an appointment sourced from OpenDental polling' })
  @ApiOkResponse({ type: AppointmentResponseDto })
  async upsert(@Body() dto: CreateAppointmentDto) {
    const appointment = await this.appointmentsService.upsert(dto);
    return this.toDto(appointment);
  }

  @Get()
  @ApiOperation({ summary: 'List appointments, optionally filtered by clinic' })
  @ApiQuery({ name: 'clinicId', required: false })
  @ApiOkResponse({ type: AppointmentResponseDto, isArray: true })
  async findAll(@Query('clinicId') clinicId?: string) {
    const appointments = await this.appointmentsService.list(clinicId);
    return appointments.map((appointment) => this.toDto(appointment));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve appointment details' })
  @ApiOkResponse({ type: AppointmentResponseDto })
  async findOne(@Param('id') id: string) {
    const appointment = await this.appointmentsService.findOne(id);
    return this.toDto(appointment);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update appointment metadata' })
  @ApiOkResponse({ type: AppointmentResponseDto })
  async update(@Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
    const appointment = await this.appointmentsService.update(id, dto);
    return this.toDto(appointment);
  }

  private toDto(appointment: any): AppointmentResponseDto {
    return {
      id: appointment.id,
      externalAptId: appointment.externalAptId,
      status: appointment.status,
      eligibilityStatus: appointment.eligibilityStatus,
      eligibilityDetails: appointment.eligibilityDetails,
      scheduledStart: appointment.scheduledStart,
      scheduledEnd: appointment.scheduledEnd,
      reason: appointment.reason,
      notes: appointment.notes,
      insuranceCoverageAmount: appointment.insuranceCoverageAmount,
      patientResponsibilityAmount: appointment.patientResponsibilityAmount,
      discountAmount: appointment.discountAmount,
      operatory: appointment.operatory,
      providerName: appointment.providerName,
      patient: {
        id: appointment.patient?.id,
        externalId: appointment.patient?.externalId,
        firstName: appointment.patient?.firstName,
        lastName: appointment.patient?.lastName,
        birthDate: appointment.patient?.birthDate,
        email: appointment.patient?.email,
        phoneNumber: appointment.patient?.phoneNumber,
        createdAt: appointment.patient?.createdAt,
        updatedAt: appointment.patient?.updatedAt,
      },
      clinicId: appointment.clinic?.id,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    } as AppointmentResponseDto;
  }
}
