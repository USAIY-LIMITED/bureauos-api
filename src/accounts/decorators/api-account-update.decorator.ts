import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  UpdateAdminDto,
  UpdateBusinessOwnerDto,
  UpdateLecturerDto,
  UpdateSchoolDto,
  UpdateStudentDto,
} from '@app/accounts/dto';

export const ApiAccountUpdate = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Update Authenticated Account Profile',
    }),
    ApiExtraModels(
      UpdateAdminDto,
      UpdateLecturerDto,
      UpdateStudentDto,
      UpdateSchoolDto,
      UpdateBusinessOwnerDto,
    ),
    ApiBody({
      schema: {
        oneOf: [
          {
            $ref: getSchemaPath(UpdateAdminDto),
          },
          {
            $ref: getSchemaPath(UpdateLecturerDto),
          },
          {
            $ref: getSchemaPath(UpdateStudentDto),
          },
          {
            $ref: getSchemaPath(UpdateSchoolDto),
          },
          {
            $ref: getSchemaPath(UpdateBusinessOwnerDto),
          },
        ],
      },
    }),
  );
