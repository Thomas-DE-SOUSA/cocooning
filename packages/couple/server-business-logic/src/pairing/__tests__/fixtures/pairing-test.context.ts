import { EventPublishingService } from '@cocooning/shared-kernel/application';
import {
    DeterministicDateTimeProvider,
    FakeEventPublisherAdapter,
    FakeLoggerAdapter,
    FakeSecureRandomGenerator,
    FakeUuidV7GeneratorProvider,
} from '@cocooning/shared-kernel/testing';
import { CancelCoupleUseCase } from '../../application/use-cases/cancel-couple.use-case';
import { CreateCoupleUseCase } from '../../application/use-cases/create-couple.use-case';
import { GetMyCoupleUseCase } from '../../application/use-cases/get-my-couple.use-case';
import { JoinCoupleUseCase } from '../../application/use-cases/join-couple.use-case';
import { RecordTogetherPeriodsUseCase } from '../../application/use-cases/record-together-periods.use-case';
import { RenewInvitationCodeUseCase } from '../../application/use-cases/renew-invitation-code.use-case';
import { Couple } from '../../domain/models/couple.aggregate';
import { PairingPreconditionService } from '../../domain/services/pairing-precondition.service';
import { CoupleId } from '../../domain/value-objects/couple-id.vo';
import { InvitationCode } from '../../domain/value-objects/invitation-code.vo';
import { CoupleInMemoryRepository } from '../secondary/adapters/couple-in-memory.repository';

export const NOW = new Date('2026-11-23T10:00:00.000Z');
export const INVITATION_CODE_LIFETIME_IN_HOURS = 48;
export const MILLISECONDS_PER_HOUR = 3_600_000;
export const PARTNER_A = 'a0000000-0000-7000-8000-00000000000a';
export const PARTNER_B = 'b0000000-0000-7000-8000-00000000000b';
export const PARTNER_C = 'c0000000-0000-7000-8000-00000000000c';

// Configures the process-wide UUID generator: call `CoupleId.resetForTests()` in afterEach.
export class PairingTestContext {
    readonly dateTimeProvider = new DeterministicDateTimeProvider(NOW);
    readonly secureRandomGenerator = new FakeSecureRandomGenerator();
    readonly coupleRepository = new CoupleInMemoryRepository();
    readonly eventPublisher = new FakeEventPublisherAdapter();
    readonly logger = new FakeLoggerAdapter();
    private readonly eventPublishingService = new EventPublishingService(
        this.eventPublisher,
        this.logger,
    );
    private readonly preconditions = new PairingPreconditionService(
        this.coupleRepository,
    );

    constructor() {
        CoupleId.configure(new FakeUuidV7GeneratorProvider());
    }

    createCoupleUseCase(): CreateCoupleUseCase {
        return new CreateCoupleUseCase(
            this.coupleRepository,
            this.preconditions,
            this.secureRandomGenerator,
            this.dateTimeProvider,
            this.eventPublishingService,
            INVITATION_CODE_LIFETIME_IN_HOURS,
        );
    }

    joinCoupleUseCase(): JoinCoupleUseCase {
        return new JoinCoupleUseCase(
            this.coupleRepository,
            this.preconditions,
            this.dateTimeProvider,
            this.eventPublishingService,
        );
    }

    renewInvitationCodeUseCase(): RenewInvitationCodeUseCase {
        return new RenewInvitationCodeUseCase(
            this.coupleRepository,
            this.preconditions,
            this.secureRandomGenerator,
            this.dateTimeProvider,
            this.eventPublishingService,
            INVITATION_CODE_LIFETIME_IN_HOURS,
        );
    }

    cancelCoupleUseCase(): CancelCoupleUseCase {
        return new CancelCoupleUseCase(
            this.coupleRepository,
            this.preconditions,
            this.dateTimeProvider,
            this.eventPublishingService,
        );
    }

    recordTogetherPeriodsUseCase(): RecordTogetherPeriodsUseCase {
        return new RecordTogetherPeriodsUseCase(
            this.coupleRepository,
            this.preconditions,
            this.dateTimeProvider,
            this.eventPublishingService,
        );
    }

    getMyCoupleUseCase(): GetMyCoupleUseCase {
        return new GetMyCoupleUseCase(this.preconditions);
    }

    // Builds a couple without recording any event, as if it were already in the database.
    givenPendingCoupleOf(
        creatorUserId: string,
        codeValue: string | null = null,
    ): Couple {
        const couple = Couple.create(
            { creatorUserId, invitationCode: this.invitationCode(codeValue) },
            this.dateTimeProvider.now(),
        );
        couple.clearDomainEvents();
        this.coupleRepository.seed(couple);
        return couple;
    }

    givenPairedCoupleOf(creatorUserId: string, joinerUserId: string): Couple {
        const couple = this.givenPendingCoupleOf(creatorUserId);
        const code = couple.invitationCode?.value ?? '';
        couple.join(joinerUserId, code, this.dateTimeProvider.now());
        couple.clearDomainEvents();
        this.coupleRepository.seed(couple);
        return couple;
    }

    advanceHours(hours: number): void {
        this.dateTimeProvider.advanceBy(hours * MILLISECONDS_PER_HOUR);
    }

    private invitationCode(codeValue: string | null): InvitationCode {
        const now = this.dateTimeProvider.now();
        return codeValue === null
            ? InvitationCode.generate(
                  this.secureRandomGenerator,
                  now,
                  INVITATION_CODE_LIFETIME_IN_HOURS,
              )
            : InvitationCode.from({
                  value: codeValue,
                  expiresAt: new Date(
                      now.getTime() +
                          INVITATION_CODE_LIFETIME_IN_HOURS *
                              MILLISECONDS_PER_HOUR,
                  ).toISOString(),
              });
    }
}
