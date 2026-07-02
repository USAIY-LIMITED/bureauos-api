import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WaitlistsDbService } from './waitlists.db.service';
import { EmailManagementsService } from '@app/email-managements/email-managements.service';

export interface SequenceStep {
  step: number;
  templateSlug: string;
  delayDays: number;
}

export const SEGMENT_SEQUENCES: Record<string, SequenceStep[]> = {
  ng_uk_founder: [
    { step: 1, templateSlug: 'ng-uk-founder-welcome', delayDays: 0 },
    { step: 2, templateSlug: 'ng-uk-founder-nurture-1', delayDays: 7 },
    { step: 3, templateSlug: 'ng-uk-founder-cta', delayDays: 7 },
  ],
  qatar_interested: [
    { step: 1, templateSlug: 'welcome-qatar-partnership', delayDays: 0 },
    { step: 2, templateSlug: 'qatar-application-open', delayDays: 7 },
    { step: 3, templateSlug: 'qatar-deadline-reminder', delayDays: 7 },
  ],
  ecosystem_partner: [
    { step: 1, templateSlug: 'ecosystem-partner-welcome', delayDays: 0 },
  ],
  local_focus: [
    { step: 1, templateSlug: 'local-focus-welcome', delayDays: 0 },
  ],
};

@Injectable()
export class WaitlistsOrchestrationService {
  private readonly logger = new Logger(WaitlistsOrchestrationService.name);

  constructor(
    private readonly waitlistsDbService: WaitlistsDbService,
    private readonly emailService: EmailManagementsService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    this.logger.log('Running scheduled hourly waitlist email orchestration...');
    const result = await this.orchestrate();
    this.logger.log(`Scheduled orchestration completed. Sent emails to ${result.processedCount} users.`);
  }

  async orchestrate(): Promise<{ processedCount: number }> {
    // 1. Query all active waitlist subscribers
    const [subscribers] = await this.waitlistsDbService.findAll({
      subscribed_for_waitlist: true,
    });

    let processedCount = 0;

    for (const user of subscribers) {
      // Ensure the user has segments assigned
      const userSegments: string[] = user.segments || [];
      if (userSegments.length === 0) {
        continue;
      }

      // 2. Find matching sequence steps at the user's current step number
      const matchingSteps: SequenceStep[] = [];
      for (const segment of userSegments) {
        const steps = SEGMENT_SEQUENCES[segment] || [];
        const stepConfig = steps.find((s) => s.step === user.step);
        if (stepConfig) {
          matchingSteps.push(stepConfig);
        }
      }

      // If no steps match, they have completed their sequence or have no sequence steps at this stage
      if (matchingSteps.length === 0) {
        continue;
      }

      // 3. Determine if enough time has passed since lastSent (or createdAt if lastSent is null)
      // We check if the time passed is >= delayDays for the matching steps.
      // If there are multiple segments, we take the maximum delay required.
      const maxDelayDays = Math.max(...matchingSteps.map((s) => s.delayDays));
      const referenceTime: Date = user.lastSent || user.createdAt;
      const delayMs = maxDelayDays * 24 * 60 * 60 * 1000;
      const timePassedMs = Date.now() - new Date(referenceTime).getTime();

      if (timePassedMs < delayMs) {
        // Not enough time has passed yet
        continue;
      }

      // 4. Send emails for all matching steps
      const [firstName = '', ...lastNameParts] = user.fullName.trim().split(/\s+/);
      const lastName = lastNameParts.join(' ') || '';

      const templateVariables = {
        fullName: user.fullName,
        firstName,
        lastName,
        partnerName: 'Startup Qatar',
        applicationUrl: 'https://bureauos.space/qatar-program',
        deadlineDate: 'July 15, 2026',
      };

      let sentAny = false;
      for (const stepConfig of matchingSteps) {
        try {
          await this.emailService.sendMail(user.email, stepConfig.templateSlug, templateVariables);
          sentAny = true;
        } catch (error) {
          this.logger.error(
            `Failed to send email template "${stepConfig.templateSlug}" to ${user.email}`,
            error instanceof Error ? error.stack : String(error),
          );
        }
      }

      // 5. Update user step counter and lastSent timestamp
      if (sentAny) {
        await this.waitlistsDbService.update(user.id, {
          step: user.step + 1,
          lastSent: new Date(),
        });
        processedCount++;
      }
    }

    return { processedCount };
  }
}
