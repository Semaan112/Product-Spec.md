import { Module } from '@nestjs/common';
import { RequestIntakeController } from './request-intake.controller';
import { DeterministicIntakeProvider } from './providers/deterministic-intake.provider';
import { INTAKE_PROVIDER, RequestIntakeService } from './request-intake.service';

@Module({
  controllers: [RequestIntakeController],
  providers: [
    RequestIntakeService,
    DeterministicIntakeProvider,
    { provide: INTAKE_PROVIDER, useExisting: DeterministicIntakeProvider },
  ],
})
export class RequestIntakeModule {}