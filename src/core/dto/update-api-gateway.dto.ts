import { PartialType } from '@nestjs/swagger';
import { ApiGatewayDto } from './api-gateway.dto';

export class UpdateApiGatewayDto extends PartialType(ApiGatewayDto) {}
