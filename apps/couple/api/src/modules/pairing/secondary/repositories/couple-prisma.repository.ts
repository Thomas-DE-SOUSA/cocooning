import { Injectable } from '@nestjs/common';
import type { Prisma } from '@cocooning/couple-prisma/client';
import { PrismaService } from '@cocooning/couple-prisma/nest';
import {
    Couple,
    CoupleRepository,
    PairingException,
} from '@cocooning/couple-server-business-logic/pairing';
import { Logger, UnitOfWork } from '@cocooning/shared-kernel/ports';
import { COUPLE_INCLUDE, toCoupleSnapshot } from '../mappers';
import { writeCouple, writePartners } from './couple-prisma.writer';
import { toCoupleConflict } from './couple-unique-constraints';
import { appendPairingEvents } from './pairing-event-prisma.writer';

@Injectable()
export class CouplePrismaRepository extends CoupleRepository {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly unitOfWork: UnitOfWork,
        private readonly logger: Logger,
    ) {
        super();
        this.logger.setContext(CouplePrismaRepository.name);
    }

    // State, partners and events in one transaction, joined by an open unit of work (concurrency.md rule 2).
    override async save(couple: Couple): Promise<void> {
        const snapshot = couple.toSnapshot();
        const events = couple.getDomainEvents();
        try {
            await this.unitOfWork.run(async () => {
                const tx = this.prismaService.current;
                await writeCouple(tx, snapshot);
                await writePartners(tx, snapshot);
                await appendPairingEvents(tx, snapshot.id, events);
            });
        } catch (error) {
            if (error instanceof PairingException) throw error;
            const conflict = toCoupleConflict(error);
            if (conflict !== null) throw conflict;
            this.logger.error('Failed to save couple', {
                coupleId: snapshot.id,
                error,
            });
            throw error;
        }
    }

    // Decision 0029: one of the two lookups without a coupleId, served by the unique partner index.
    override findByPartner(userId: string): Promise<Couple | null> {
        return this.findOne({ partners: { some: { userId } } }, 'partner');
    }

    // Decision 0029: an expired code is still found, the aggregate decides (R4, R6).
    override findByInvitationCode(code: string): Promise<Couple | null> {
        return this.findOne({ invitationCode: code }, 'invitationCode');
    }

    // Logged by the kind of lookup only: the invitation code is a secret (core.md rule 30).
    private async findOne(
        where: Prisma.CoupleWhereInput,
        lookup: string,
    ): Promise<Couple | null> {
        try {
            const raw = await this.prismaService.current.couple.findFirst({
                where,
                include: COUPLE_INCLUDE,
            });
            return raw === null
                ? null
                : Couple.fromSnapshot(toCoupleSnapshot(raw));
        } catch (error) {
            if (error instanceof PairingException) throw error;
            this.logger.error('Failed to load couple', { lookup, error });
            throw error;
        }
    }
}
