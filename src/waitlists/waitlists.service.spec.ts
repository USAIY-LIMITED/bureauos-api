import { Test, TestingModule } from '@nestjs/testing';
import { WaitlistsService } from './waitlists.service';
import { WaitlistsDbService } from './waitlists.db.service';
import { EmailManagementsService } from '@app/email-managements/email-managements.service';
import { AuditLogsService } from '@app/core/audit-logs/audit-logs.service';
import { ConflictException } from '@nestjs/common';
import { WaitlistAccountType } from '@prisma/client';
import { WaitlistsSegmentationService } from './waitlists.segmentation.service';

const mockWaitlistsDb = {
  findFirst: jest.fn(),
  create: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
};

const mockEmail = {
  sendMail: jest.fn().mockResolvedValue({}),
};

const mockAuditLogs = {
  log: jest.fn().mockResolvedValue({}),
};

const mockSegmentation = {
  evaluateSegments: jest.fn().mockReturnValue([]),
};

describe('WaitlistsService', () => {
  let service: WaitlistsService;

  beforeEach(async () => {
    mockEmail.sendMail.mockResolvedValue({});
    mockAuditLogs.log.mockResolvedValue({});
    mockWaitlistsDb.findFirst.mockReset();
    mockWaitlistsDb.create.mockReset();
    mockWaitlistsDb.findAll.mockReset();
    mockWaitlistsDb.update.mockReset();
    mockSegmentation.evaluateSegments.mockReset().mockReturnValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WaitlistsService,
        { provide: WaitlistsDbService, useValue: mockWaitlistsDb },
        { provide: EmailManagementsService, useValue: mockEmail },
        { provide: AuditLogsService, useValue: mockAuditLogs },
        { provide: WaitlistsSegmentationService, useValue: mockSegmentation },
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
      fullName: 'Joshua Doe',
      country: 'Nigeria',
      accountType: WaitlistAccountType.Founder,
      biggestChallenge: 'Finding early customers',
      challengeArea: 'Business Development',
      expansionTarget: ['United Kingdom', 'Saudi Arabia'],
    };

    it('should throw ConflictException if duplicate email', async () => {
      mockWaitlistsDb.findFirst.mockResolvedValue({ id: 1 });

      await expect(service.create(dto as any)).rejects.toThrow(ConflictException);
    });

    it('should create subscription and trigger welcome email', async () => {
      mockWaitlistsDb.findFirst.mockResolvedValue(null);
      mockWaitlistsDb.create.mockResolvedValue({ id: 1, ...dto });

      const result = await service.create(dto as any);

      expect(mockWaitlistsDb.create).toHaveBeenCalled();
      expect(mockEmail.sendMail).toHaveBeenCalledWith(
        'test@bureauos.space',
        'waitlist-welcome',
        { firstName: 'Joshua', lastName: 'Doe' },
      );
      expect(result.id).toBe(1);
    });
  });
});
