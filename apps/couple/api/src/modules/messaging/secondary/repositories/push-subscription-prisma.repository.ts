import { Injectable } from '@nestjs/common';
import type { Prisma } from '@cocooning/couple-prisma/client';
import { PrismaService } from '@cocooning/couple-prisma/nest';
import {
    MessagingException,
    PushSubscription,
    PushSubscriptionRepository,
} from '@cocooning/couple-server-business-logic/messaging';
import { Logger, UnitOfWork } from '@cocooning/shared-kernel/ports';
import {
    type PushSubscriptionRow,
    toPushSubscriptionSnapshot,
} from '../mappers';
import {
    pushSubscriptionVersionConflict,
    toPushSubscriptionVersionConflict,
} from './messaging-version-conflict';
import { writePushSubscription } from './push-subscription-prisma.writer';

type PushSubscriptions = PrismaService['current']['pushSubscription'];

const toPushSubscription = (row: PushSubscriptionRow): PushSubscription =>
    PushSubscription.fromSnapshot(toPushSubscriptionSnapshot(row));

// coupleId leads every where (core-backend.md rule 12); logged by id only, the endpoint and keys are secrets of the phone.
@Injectable()
export class PushSubscriptionPrismaRepository extends PushSubscriptionRepository {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly unitOfWork: UnitOfWork,
        private readonly logger: Logger,
    ) {
        super();
        this.logger.setContext(PushSubscriptionPrismaRepository.name);
    }

    override async save(pushSubscription: PushSubscription): Promise<void> {
        const snapshot = pushSubscription.toSnapshot();
        try {
            await this.unitOfWork.run(() =>
                writePushSubscription(
                    this.prismaService.current,
                    snapshot,
                    pushSubscriptionVersionConflict,
                ),
            );
        } catch (error) {
            if (error instanceof MessagingException) throw error;
            const conflict = toPushSubscriptionVersionConflict(error);
            if (conflict !== null) throw conflict;
            this.logger.error('Failed to save push subscription', {
                pushSubscriptionId: snapshot.id,
                error,
            });
            throw error;
        }
    }

    override findByEndpoint(
        coupleId: string,
        endpoint: string,
    ): Promise<PushSubscription | null> {
        return this.findOne({ coupleId, endpoint });
    }

    override findOfOwner(
        coupleId: string,
        ownerId: string,
        endpoint: string,
    ): Promise<PushSubscription | null> {
        return this.findOne({ coupleId, ownerId, endpoint });
    }

    override findOfCouples(
        coupleIds: ReadonlyArray<string>,
    ): Promise<ReadonlyArray<PushSubscription>> {
        return this.run(async (subscriptions) => {
            const rows = await subscriptions.findMany({
                where: { coupleId: { in: [...coupleIds] } },
                orderBy: [{ coupleId: 'asc' }, { id: 'asc' }],
            });
            return rows.map(toPushSubscription);
        });
    }

    // One statement; each subscription filtered by its own couple.
    override async forget(
        pushSubscriptions: ReadonlyArray<PushSubscription>,
    ): Promise<void> {
        await this.run((subscriptions) =>
            subscriptions.deleteMany({
                where: {
                    OR: pushSubscriptions.map((s) => ({
                        coupleId: s.coupleId,
                        id: s.id.getValue(),
                    })),
                },
            }),
        );
    }

    private findOne(
        where: Prisma.PushSubscriptionWhereInput,
    ): Promise<PushSubscription | null> {
        return this.run(async (subscriptions) => {
            const row = await subscriptions.findFirst({ where });
            return row === null ? null : toPushSubscription(row);
        });
    }

    private async run<T>(
        work: (subscriptions: PushSubscriptions) => Promise<T>,
    ): Promise<T> {
        try {
            return await work(this.prismaService.current.pushSubscription);
        } catch (error) {
            this.logger.error('Failed to use push subscriptions', { error });
            throw error;
        }
    }
}
