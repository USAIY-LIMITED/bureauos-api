import { Test, TestingModule } from '@nestjs/testing';
import { EmailManagementsController } from './email-managements.controller';
import { EmailManagementsService } from './email-managements.service';

describe('EmailManagementsController', () => {
  let controller: EmailManagementsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailManagementsController],
      providers: [EmailManagementsService],
    }).compile();

    controller = module.get<EmailManagementsController>(
      EmailManagementsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
