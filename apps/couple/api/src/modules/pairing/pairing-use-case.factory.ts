import type { FactoryProvider, Type } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    CoupleRepository,
    PairingPreconditionService,
} from '@cocooning/couple-server-business-logic/pairing';
import { EventPublishingService } from '@cocooning/shared-kernel/application';
import {
    DateTimeProvider,
    EventPublisher,
    Logger,
    SecureRandomGenerator,
} from '@cocooning/shared-kernel/ports';
import type { Environment } from '../../env';

export type PairingDependencies = {
    readonly repository: CoupleRepository;
    readonly preconditions: PairingPreconditionService;
    readonly random: SecureRandomGenerator;
    readonly clock: DateTimeProvider;
    readonly publishing: EventPublishingService;
    readonly invitationCodeLifetimeInHours: number;
};

const DEPENDENCIES = [
    CoupleRepository,
    SecureRandomGenerator,
    DateTimeProvider,
    EventPublisher,
    Logger,
    ConfigService,
];

// The domain service is created inline, never a provider (decision 0005); the lifetime is read once at startup.
const collect = (
    repository: CoupleRepository,
    random: SecureRandomGenerator,
    clock: DateTimeProvider,
    publisher: EventPublisher,
    logger: Logger,
    config: ConfigService<Environment, true>,
): PairingDependencies => {
    logger.setContext(EventPublishingService.name);
    return {
        repository,
        preconditions: new PairingPreconditionService(repository),
        random,
        clock,
        publishing: new EventPublishingService(publisher, logger),
        invitationCodeLifetimeInHours: config.getOrThrow(
            'PAIRING_INVITATION_CODE_TTL_HOURS',
            { infer: true },
        ),
    };
};

// A typed token: pairing one use case's token with another's factory does not compile.
export const pairingUseCase = <T>(
    provide: Type<T>,
    build: (dependencies: PairingDependencies) => T,
): FactoryProvider<T> => ({
    provide,
    inject: DEPENDENCIES,
    useFactory: (...args: Parameters<typeof collect>) =>
        build(collect(...args)),
});
