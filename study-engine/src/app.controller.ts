import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  health() {
    return { status: 'healthy', service: 'study-engine', timestamp: new Date().toISOString() };
  }
}
