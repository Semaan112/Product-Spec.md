import { Module } from '@nestjs/common';
import { TicketsModule } from './tickets/tickets.module';
import { RequestIntakeModule } from './request-intake/request-intake.module';

@Module({
  imports: [TicketsModule, RequestIntakeModule],
})
export class AppModule {}