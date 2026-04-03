import {
  IntersectionType,
  OmitType,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import { UpdateAccountDto } from '@app/accounts/dto/update-account.dto';
import { CreateStudentDto } from '@app/accounts/dto/student/create-student.dto';

export class UpdateStudentDto extends IntersectionType(
  PickType(UpdateAccountDto, ['id']),
  PartialType(OmitType(CreateStudentDto, ['accountType'])),
) {}
