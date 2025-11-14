import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientResponseDto } from './dto/patient-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Patients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post(':clinicId')
  @ApiOperation({ summary: 'Create or update a patient for a clinic' })
  @ApiOkResponse({ type: PatientResponseDto })
  upsert(@Param('clinicId') clinicId: string, @Body() dto: CreatePatientDto) {
    return this.patientsService.upsert(clinicId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List patients, optionally filtered by clinic' })
  @ApiQuery({ name: 'clinicId', required: false })
  @ApiOkResponse({ type: PatientResponseDto, isArray: true })
  findAll(@Query('clinicId') clinicId?: string) {
    return this.patientsService.findAll(clinicId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific patient' })
  @ApiOkResponse({ type: PatientResponseDto })
  findOne(@Param('id') id: string) {
    return this.patientsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update patient demographics' })
  @ApiOkResponse({ type: PatientResponseDto })
  update(@Param('id') id: string, @Body() dto: UpdatePatientDto) {
    return this.patientsService.update(id, dto);
  }
}
