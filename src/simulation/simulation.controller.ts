import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/jwt.guard';
import { SimulationStatusDto } from './dto/simulation-status.dto';
import { UpdateSimulationConfigDto } from './dto/update-simulation-config.dto';
import { SimulationService } from './simulation.service';

@ApiTags('Simulation')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('simulation')
export class SimulationController {
  constructor(private readonly simulationService: SimulationService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get simulation status and config' })
  @ApiResponse({ status: 200, type: SimulationStatusDto })
  getStatus() {
    return this.simulationService.getStatus();
  }

  @Patch('config')
  @ApiOperation({ summary: 'Update simulation config' })
  @ApiResponse({ status: 200, type: SimulationStatusDto })
  updateConfig(@Body() dto: UpdateSimulationConfigDto) {
    return this.simulationService.updateConfig(dto);
  }

  @Post('start')
  @ApiOperation({ summary: 'Start simulation' })
  @ApiResponse({ status: 200, type: SimulationStatusDto })
  start() {
    return this.simulationService.start();
  }

  @Post('stop')
  @ApiOperation({ summary: 'Stop simulation' })
  @ApiResponse({ status: 200, type: SimulationStatusDto })
  stop() {
    return this.simulationService.stop();
  }
}
