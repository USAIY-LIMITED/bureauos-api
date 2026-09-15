import { PartialType } from '@nestjs/swagger';
import { CreateBusinessEntityDto } from './create-business-entity.dto';

export class UpdateBusinessEntityDto extends PartialType(CreateBusinessEntityDto) {}
