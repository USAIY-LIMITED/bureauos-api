import { Injectable } from "@nestjs/common";
import { BaseDatabaseService } from "@app/core/database/base.db.service";
import { PrismaService } from "@app/core/database/prisma.service";

@Injectable()
export class WaitlistsDbService extends BaseDatabaseService {
    public searchable = ['fullName', 'email', 'country', 'accountType', 'founderStage', 'professionalCategory', 'biggestChallenge', 'challengeArea'];
    public fillable = ['fullName', 'email', 'country', 'accountType', 'founderStage', 'professionalCategory', 'companyName', 'rolePosition', 'expansionTarget', 'segments', 'step', 'lastSent', 'biggestChallenge', 'challengeArea', 'bosHelp', 'wantsNewsletter'];
    constructor(prisma: PrismaService) {
        super(prisma.waitlist);
    }
}