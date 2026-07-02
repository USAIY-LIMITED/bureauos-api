import { Injectable } from '@nestjs/common';
import { WaitlistAccountType } from '@prisma/client';
import { CreateWaitlistDto } from './dto/waitlist.dto';

@Injectable()
export class WaitlistsSegmentationService {
  /**
   * Evaluates the segments a waitlist submission qualifies for.
   */
  evaluateSegments(dto: CreateWaitlistDto): string[] {
    const segments: string[] = [];
    const country = dto.country?.trim() || '';
    const accountType = dto.accountType;
    const expansionTargets = dto.expansionTarget || [];

    // Helper: Case-insensitive array contains check
    const hasTarget = (targetSubstr: string): boolean => {
      const lowerSubstr = targetSubstr.toLowerCase();
      return expansionTargets.some(
        (target) => target.toLowerCase().includes(lowerSubstr)
      );
    };

    // 1. ng_uk_founder: Nigeria + Founder + UK target
    const isNigeria = country.toLowerCase() === 'nigeria';
    const isFounder = accountType === WaitlistAccountType.Founder;
    const targetsUk = hasTarget('uk') || hasTarget('united kingdom');

    if (isNigeria && isFounder && targetsUk) {
      segments.push('ng_uk_founder');
    }

    // 2. qatar_interested: Any user + Qatar target
    const targetsQatar = hasTarget('qatar');
    if (targetsQatar) {
      segments.push('qatar_interested');
    }

    // 3. ecosystem_partner: AccountType = Professional
    const isProfessional = accountType === WaitlistAccountType.Professional;
    if (isProfessional) {
      segments.push('ecosystem_partner');
    }

    // 4. local_focus: No expansion target
    const hasNoExpansionTarget = expansionTargets.length === 0;
    if (hasNoExpansionTarget) {
      segments.push('local_focus');
    }

    return segments;
  }
}
