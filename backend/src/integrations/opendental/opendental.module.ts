import { Module } from '@nestjs/common';
import { OpenDentalService } from './opendental.service';

@Module({
  providers: [OpenDentalService],
  exports: [OpenDentalService],
})
export class OpenDentalModule {}
