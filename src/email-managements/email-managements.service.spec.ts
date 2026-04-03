import { Test, TestingModule } from '@nestjs/testing';
import { EmailManagementsService } from './email-managements.service';
import { PrismaService } from '@app/core/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrisma = {
  emailTemplate: {
    findUnique: jest.fn(),
  },
};

describe('EmailManagementsService', () => {
  let service: EmailManagementsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailManagementsService,
        { provide: PrismaService, useValue: mockPrisma },
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
      mockPrisma.emailTemplate.findUnique.mockResolvedValue(null);

      await expect(service.sendMail('test@example.com', 'non-existent', {}))
        .rejects.toThrow(NotFoundException);
    });

    it('should correctly fetch template and wrap in layout', async () => {
      const template = {
        slug: 'test-slug',
        subject: 'Hello World',
        body: '<p>Body for {{firstName}}</p>',
      };
      
      mockPrisma.emailTemplate.findUnique.mockResolvedValue(template);

      // We won't actually send a real email in unit tests (transporter is mocked by nature of this refactor if needed, but here it's instantiated in constructor)
      // We'll mock the transporter's sendMail internally or focus on compilation
      const spySend = jest.spyOn((service as any).transporter, 'sendMail').mockResolvedValue({});

      await service.sendMail('target@example.com', 'test-slug', { firstName: 'Joshua' });

      expect(mockPrisma.emailTemplate.findUnique).toHaveBeenCalledWith({
        where: { slug: 'test-slug' },
      });
      
      expect(spySend).toHaveBeenCalledWith(expect.objectContaining({
        to: 'target@example.com',
        subject: 'Hello World',
      }));
      
      const sentHtml = spySend.mock.calls[0][0].html;
      expect(sentHtml).toContain('Hello World'); // Title from layout
      expect(sentHtml).toContain('Body for Joshua'); // Compiled body
    });
  });
});
