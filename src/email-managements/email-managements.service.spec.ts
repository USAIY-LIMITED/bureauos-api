import { Test, TestingModule } from '@nestjs/testing';
import { EmailManagementsService } from './email-managements.service';
import { EmailManagementDbService } from './email-management.db.service';
import { ConfigService } from '@nestjs/config';
import { NotFoundException } from '@nestjs/common';

const mockEmailDb = {
  findBySlug: jest.fn(),
  create: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

const mockConfig = {
  get: jest.fn().mockReturnValue({
    host: 'localhost',
    port: 587,
    secure: false,
    auth: { user: 'test', pass: 'test' },
    from: 'test@example.com',
  }),
};

describe('EmailManagementsService', () => {
  let service: EmailManagementsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailManagementsService,
        { provide: EmailManagementDbService, useValue: mockEmailDb },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<EmailManagementsService>(EmailManagementsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendMail', () => {
    it('should throw NotFoundException if template is missing', async () => {
      mockEmailDb.findBySlug.mockResolvedValue(null);

      await expect(service.sendMail('test@example.com', 'non-existent', {}))
        .rejects.toThrow(NotFoundException);
    });

    it('should correctly fetch template and wrap in layout', async () => {
      const template = {
        slug: 'test-slug',
        subject: 'Hello World',
        body: '<p>Body for {{firstName}}</p>',
      };
      
      mockEmailDb.findBySlug.mockResolvedValue(template);

      const spySend = jest.spyOn((service as any).transporter, 'sendMail').mockResolvedValue({});

      await service.sendMail('target@example.com', 'test-slug', { firstName: 'Joshua' });

      expect(mockEmailDb.findBySlug).toHaveBeenCalledWith('test-slug');
      
      expect(spySend).toHaveBeenCalledWith(expect.objectContaining({
        to: 'target@example.com',
        subject: 'Hello World',
      }));
      
      const sentHtml = (spySend.mock.calls[0][0] as any).html;
      expect(sentHtml).toContain('Body for Joshua'); // Compiled body
    });
  });
});
