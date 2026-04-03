import {
  IntersectionType,
  OmitType,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import { UpdateAccountDto } from '@app/accounts/dto/update-account.dto';
import { CreateSchoolDto } from '@app/accounts/dto/school/create-school.dto';

export class UpdateSchoolDto extends IntersectionType(
  PickType(UpdateAccountDto, ['id']),
  PartialType(OmitType(CreateSchoolDto, ['accountType'])),
) {}
