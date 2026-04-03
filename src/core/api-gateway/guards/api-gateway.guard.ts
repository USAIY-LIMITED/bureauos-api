import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ApiGatewayService } from '../api-gateway.service';

@Injectable()
export class ApiGatewayGuard implements CanActivate {
  constructor(private readonly gatewayService: ApiGatewayService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('API key is missing in X-API-KEY header');
    }

    const gateway = await this.gatewayService.validateKey(apiKey);
    request.gateway = gateway; // Attach gateway info to request
    return true;
  }
}
