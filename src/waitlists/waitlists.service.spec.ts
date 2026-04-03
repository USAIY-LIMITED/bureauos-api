import { Test, TestingModule } from '@nestjs/testing';
import { WaitlistsService } from './waitlists.service';
import { PrismaService } from '@app/core/database/prisma.service';
import { EmailManagementsService } from '@app/email-managements/email-managements.service';
import { ConflictException } from '@nestjs/common';
import { AccountType } from '@prisma/client';

const mockPrisma = {
  waitlist: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockEmail = {
  sendMail: jest.fn(),
};

describe('WaitlistsService', () => {
  let service: WaitlistsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WaitlistsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EmailManagementsService, useValue: mockEmail },
      ],
    }).compile();

    service = module.get<WaitlistsService>(WaitlistsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const dto = {
      email: 'test@bureauos.space',
      firstName: 'Joshua',
      lastName: 'Doe',
      userType: AccountType.BUSINESS,
    };

    it('should throw ConflictException if duplicate email', async () => {
      mockPrisma.waitlist.findUnique.mockResolvedValue({ id: 1 });

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });

    it('should create subscription and trigger welcome email', async () => {
      mockPrisma.waitlist.findUnique.mockResolvedValue(null);
      mockPrisma.waitlist.create.mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto);

      expect(mockPrisma.waitlist.create).toHaveBeenCalled();
      expect(mockEmail.sendMail).toHaveBeenCalledWith(
        'test@bureauos.space',
        'waitlist-welcome',
        { firstName: 'Joshua', lastName: 'Doe' },
      );
      expect(result.id).toBe(1);
    });
  });
});
