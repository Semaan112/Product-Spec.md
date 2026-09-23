import { Body, Controller, Post } from '@nestjs/common';
import { IntakeRequestDto } from './dto/intake-request.dto';
import { RequestIntakeService } from './request-intake.service';

@Controller('request-intake')
export class RequestIntakeController {
  constructor(private readonly requestIntakeService: RequestIntakeService) {}

  @Post('classify')
  classify(@Body() request: IntakeRequestDto) {
    return this.requestIntakeService.classify(request);
  }
}