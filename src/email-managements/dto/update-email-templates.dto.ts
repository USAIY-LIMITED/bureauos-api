import { PartialType } from '@nestjs/swagger';
import { CreateEmailTemplateDto } from '@app/email-managements/dto/create-email-template.dto';

export class UpdateEmailTemplatesDto extends PartialType(
  CreateEmailTemplateDto,
) {}
