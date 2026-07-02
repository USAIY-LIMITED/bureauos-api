import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { WaitlistsService } from './waitlists.service';
import { CreateWaitlistDto } from './dto/waitlist.dto';
import { Public } from '@app/iam/decorators/public.decorator';
import { Accounts } from '@app/accounts/decorators/accounts.decorator';
import { AccountType } from '@prisma/client';
import { ApiGatewayGuard } from '@app/core/api-gateway/guards/api-gateway.guard';

import { WaitlistsOrchestrationService } from './waitlists.orchestration.service';

@ApiTags('Waitlists')
@ApiSecurity('X-API-KEY')
@UseGuards(ApiGatewayGuard)
@Controller({ path: 'waitlists', version: '1' })
export class WaitlistsController {
  constructor(
    private readonly waitlistsService: WaitlistsService,
    private readonly orchestrationService: WaitlistsOrchestrationService,
  ) {}

  @Post('orchestrate')
  @Accounts(AccountType.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Manually trigger waitlist email orchestration' })
  orchestrate() {
    return this.orchestrationService.orchestrate();
  }

  @Public()
  @Post()
  @ApiOperation({ summary: 'Join the BureauOS waitlist' })
  create(@Body() createWaitlistDto: CreateWaitlistDto) {
    return this.waitlistsService.create(createWaitlistDto);
  }

  @Get()
  @Accounts(AccountType.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all waitlist subscribers' })
  findAll() {
    return this.waitlistsService.findAll();
  }

  @Get(':email')
  @Accounts(AccountType.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Find a subscriber by email' })
  findOne(@Param('email') email: string) {
    return this.waitlistsService.findByEmail(email);
  }

  @Delete(':email')
  @Accounts(AccountType.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unsubscribe from waitlist' })
  remove(@Param('email') email: string) {
    return this.waitlistsService.unsubscribe(email);
  }
}
