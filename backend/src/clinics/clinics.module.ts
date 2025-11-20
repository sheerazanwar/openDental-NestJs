import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clinic } from './clinic.entity';
import { ClinicsService } from './clinics.service';
import { ClinicsController } from './clinics.controller';
import { AdminsModule } from '../admins/admins.module';
import { OpenDentalModule } from '../integrations/opendental/opendental.module';

@Module({
  imports: [TypeOrmModule.forFeature([Clinic]), AdminsModule, OpenDentalModule],
  controllers: [ClinicsController],
  providers: [ClinicsService],
  exports: [ClinicsService],
})
export class ClinicsModule {}
