import { Test, TestingModule } from '@nestjs/testing';
import { WaitlistsOrchestrationService } from './waitlists.orchestration.service';
import { WaitlistsDbService } from './waitlists.db.service';
import { EmailManagementsService } from '@app/email-managements/email-managements.service';

const mockWaitlistsDb = {
  findAll: jest.fn(),
  update: jest.fn(),
};

const mockEmail = {
  sendMail: jest.fn().mockResolvedValue({}),
};

describe('WaitlistsOrchestrationService', () => {
  let service: WaitlistsOrchestrationService;

  beforeEach(async () => {
    mockWaitlistsDb.findAll.mockReset();
    mockWaitlistsDb.update.mockReset();
    mockEmail.sendMail.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WaitlistsOrchestrationService,
        { provide: WaitlistsDbService, useValue: mockWaitlistsDb },
        { provide: EmailManagementsService, useValue: mockEmail },
      ],
    }).compile();

    service = module.get<WaitlistsOrchestrationService>(WaitlistsOrchestrationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should process pending users and send emails', async () => {
    const mockUsers = [
      {
        id: 1,
        email: 'founder@example.com',
        fullName: 'John Founder',
        segments: ['ng_uk_founder'],
        step: 1,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // joined 1 day ago
        lastSent: null,
      },
    ];

    mockWaitlistsDb.findAll.mockResolvedValue([mockUsers, 1]);

    const result = await service.orchestrate();

    expect(result.processedCount).toBe(1);
    expect(mockEmail.sendMail).toHaveBeenCalledWith(
      'founder@example.com',
      'ng-uk-founder-welcome',
      expect.any(Object),
    );
    expect(mockWaitlistsDb.update).toHaveBeenCalledWith(1, {
      step: 2,
      lastSent: expect.any(Date),
    });
  });

  it('should respect step delays and not process users too early', async () => {
    const mockUsers = [
      {
        id: 2,
        email: 'founder@example.com',
        fullName: 'John Founder',
        segments: ['ng_uk_founder'],
        step: 2, // step 2 needs 7 days delay
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        lastSent: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // sent 2 days ago (needs 7 days!)
      },
    ];

    mockWaitlistsDb.findAll.mockResolvedValue([mockUsers, 1]);

    const result = await service.orchestrate();

    expect(result.processedCount).toBe(0);
    expect(mockEmail.sendMail).not.toHaveBeenCalled();
    expect(mockWaitlistsDb.update).not.toHaveBeenCalled();
  });

  it('should process users if delay time has passed', async () => {
    const mockUsers = [
      {
        id: 3,
        email: 'founder@example.com',
        fullName: 'John Founder',
        segments: ['ng_uk_founder'],
        step: 2, // step 2 needs 7 days delay
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        lastSent: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // sent 8 days ago (more than 7 days!)
      },
    ];

    mockWaitlistsDb.findAll.mockResolvedValue([mockUsers, 1]);

    const result = await service.orchestrate();

    expect(result.processedCount).toBe(1);
    expect(mockEmail.sendMail).toHaveBeenCalledWith(
      'founder@example.com',
      'ng-uk-founder-nurture-1',
      expect.any(Object),
    );
    expect(mockWaitlistsDb.update).toHaveBeenCalledWith(3, {
      step: 3,
      lastSent: expect.any(Date),
    });
  });
});
