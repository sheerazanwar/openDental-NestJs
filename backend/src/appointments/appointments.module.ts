import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './appointment.entity';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { ClinicsModule } from '../clinics/clinics.module';
import { PatientsModule } from '../patients/patients.module';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment]), ClinicsModule, PatientsModule],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
