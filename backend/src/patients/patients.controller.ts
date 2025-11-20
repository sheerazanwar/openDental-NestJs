import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientResponseDto } from './dto/patient-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../common/decorators/current-user.decorator';

@ApiTags('Patients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post(':clinicId')
  @ApiOperation({ summary: 'Create or update a patient for a clinic' })
  @ApiOkResponse({ type: PatientResponseDto })
  upsert(
    @Param('clinicId') clinicId: string,
    @Body() dto: CreatePatientDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.patientsService.upsert(clinicId, dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'List patients, optionally filtered by clinic' })
  @ApiQuery({ name: 'clinicId', required: false })
  @ApiOkResponse({ type: PatientResponseDto, isArray: true })
  findAll(@Query('clinicId') clinicId: string | undefined, @CurrentUser() user: AuthenticatedUser) {
    return this.patientsService.findAll(clinicId, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific patient' })
  @ApiOkResponse({ type: PatientResponseDto })
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.patientsService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update patient demographics' })
  @ApiOkResponse({ type: PatientResponseDto })
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePatientDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.patientsService.update(id, dto, user);
  }
}
