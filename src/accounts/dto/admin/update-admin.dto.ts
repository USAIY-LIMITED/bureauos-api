import {
  IntersectionType,
  OmitType,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import { UpdateAccountDto } from '@app/accounts/dto/update-account.dto';
import { CreateAdminDto } from '@app/accounts/dto/admin/create-admin.dto';

export class UpdateAdminDto extends IntersectionType(
  PickType(UpdateAccountDto, ['id']),
  PartialType(OmitType(CreateAdminDto, ['accountType'])),
) {}
