import { Injectable } from '@nestjs/common';
import { PrismaService } from '@cocooning/couple-prisma/nest';
import { PairedCoupleProvider } from '@cocooning/couple-server-business-logic/messaging';
import { CouplePairingStatusEnum } from '@cocooning/couple-shared-kernel/enums';
import { Logger } from '@cocooning/shared-kernel/ports';

// Decision 0041: a read-only look at the tables of pairing, served by the unique partner index; a cancelled couple is soft-deleted.
@Injectable()
export class PairedCouplePrismaProvider extends PairedCoupleProvider {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly logger: Logger,
    ) {
        super();
        this.logger.setContext(PairedCouplePrismaProvider.name);
    }

    override async findPairedCoupleIdOf(
        userId: string,
    ): Promise<string | null> {
        try {
            const couple = await this.prismaService.current.couple.findFirst({
                where: {
                    pairingStatus: CouplePairingStatusEnum.PAIRED,
                    partners: { some: { userId } },
                },
                select: { id: true },
            });
            return couple === null ? null : couple.id;
        } catch (error) {
            this.logger.error('Failed to read the couple of a partner', {
                error,
            });
            throw error;
        }
    }

    // R7: the scheduled task's only read across couples; a cancelled couple is soft-deleted, a pending one is not formed.
    override async findPairedCoupleIds(): Promise<ReadonlyArray<string>> {
        try {
            const couples = await this.prismaService.current.couple.findMany({
                where: { pairingStatus: CouplePairingStatusEnum.PAIRED },
                select: { id: true },
                orderBy: { id: 'asc' },
            });
            return couples.map(({ id }) => id);
        } catch (error) {
            this.logger.error('Failed to read the formed couples', { error });
            throw error;
        }
    }
}
