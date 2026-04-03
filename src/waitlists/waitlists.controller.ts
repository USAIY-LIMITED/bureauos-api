import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WaitlistsService } from './waitlists.service';
import { CreateWaitlistDto } from './dto/waitlist.dto';
import { ApiGatewayGuard } from '@app/core/api-gateway/guards/api-gateway.guard';

@ApiTags('Waitlists')
@Controller('waitlists')
export class WaitlistsController {
  constructor(private readonly waitlistsService: WaitlistsService) {}

  @Post()
  @ApiOperation({ summary: 'Join the BureauOS waitlist' })
  create(@Body() createWaitlistDto: CreateWaitlistDto) {
    return this.waitlistsService.create(createWaitlistDto);
  }

  @Get()
  @UseGuards(ApiGatewayGuard)
  @ApiOperation({ summary: 'Get all waitlist subscribers' })
  findAll() {
    return this.waitlistsService.findAll();
  }

  @Get(':email')
  @UseGuards(ApiGatewayGuard)
  @ApiOperation({ summary: 'Find a subscriber by email' })
  findOne(@Param('email') email: string) {
    return this.waitlistsService.findByEmail(email);
  }

  @Delete(':email')
  @ApiOperation({ summary: 'Unsubscribe from waitlist' })
  remove(@Param('email') email: string) {
    return this.waitlistsService.unsubscribe(email);
  }
}
