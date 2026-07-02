import { Test, TestingModule } from '@nestjs/testing';
import { WaitlistsSegmentationService } from './waitlists.segmentation.service';
import { WaitlistAccountType } from '@prisma/client';

describe('WaitlistsSegmentationService', () => {
  let service: WaitlistsSegmentationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WaitlistsSegmentationService],
    }).compile();

    service = module.get<WaitlistsSegmentationService>(WaitlistsSegmentationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should segment Nigeria + Founder + UK expansion target as ng_uk_founder', () => {
    const segments = service.evaluateSegments({
      email: 'founder@example.com',
      fullName: 'John Founder',
      country: 'Nigeria',
      accountType: WaitlistAccountType.Founder,
      expansionTarget: ['UK', 'United States'],
      biggestChallenge: 'None',
      challengeArea: 'None',
      wantsNewsletter: true,
    });
    expect(segments).toContain('ng_uk_founder');
  });

  it('should segment Qatar expansion target as qatar_interested', () => {
    const segments = service.evaluateSegments({
      email: 'qatar@example.com',
      fullName: 'Qatar Fan',
      country: 'Ghana',
      accountType: WaitlistAccountType.Founder,
      expansionTarget: ['Qatar'],
      biggestChallenge: 'None',
      challengeArea: 'None',
      wantsNewsletter: true,
    });
    expect(segments).toContain('qatar_interested');
    expect(segments).not.toContain('ng_uk_founder');
  });

  it('should segment Professional accountType as ecosystem_partner', () => {
    const segments = service.evaluateSegments({
      email: 'professional@example.com',
      fullName: 'Jane Pro',
      country: 'Nigeria',
      accountType: WaitlistAccountType.Professional,
      expansionTarget: ['UK'],
      biggestChallenge: 'None',
      challengeArea: 'None',
      wantsNewsletter: true,
    });
    expect(segments).toContain('ecosystem_partner');
    expect(segments).not.toContain('ng_uk_founder'); // since it is Professional, not Founder
  });

  it('should segment empty expansionTarget as local_focus', () => {
    const segments = service.evaluateSegments({
      email: 'local@example.com',
      fullName: 'Local Hero',
      country: 'Nigeria',
      accountType: WaitlistAccountType.Founder,
      expansionTarget: [],
      biggestChallenge: 'None',
      challengeArea: 'None',
      wantsNewsletter: true,
    });
    expect(segments).toContain('local_focus');
  });
});
