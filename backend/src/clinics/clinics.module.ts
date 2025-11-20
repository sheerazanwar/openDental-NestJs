import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clinic } from './clinic.entity';
import { ClinicsService } from './clinics.service';
import { ClinicsController } from './clinics.controller';
import { AdminsModule } from '../admins/admins.module';

@Module({
  imports: [TypeOrmModule.forFeature([Clinic]), AdminsModule],
  controllers: [ClinicsController],
  providers: [ClinicsService],
  exports: [ClinicsService],
})
export class ClinicsModule {}
