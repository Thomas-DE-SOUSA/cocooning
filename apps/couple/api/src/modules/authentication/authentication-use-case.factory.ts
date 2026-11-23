import type { FactoryProvider, Type } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    AccountRepository,
    AuthenticationPreconditionService,
    PasswordHasher,
    SessionTokenSigner,
} from '@cocooning/couple-server-business-logic/authentication';
import { DateTimeProvider } from '@cocooning/shared-kernel/ports';
import type { Environment } from '../../env';

export type AuthenticationDependencies = {
    readonly repository: AccountRepository;
    readonly preconditions: AuthenticationPreconditionService;
    readonly signer: SessionTokenSigner;
    readonly clock: DateTimeProvider;
    readonly sessionLifetimeInDays: number;
};

const DEPENDENCIES = [
    AccountRepository,
    PasswordHasher,
    SessionTokenSigner,
    DateTimeProvider,
    ConfigService,
];

// The domain service is created inline, never a provider (decision 0005); the lifetime is read once at startup.
const collect = (
    repository: AccountRepository,
    hasher: PasswordHasher,
    signer: SessionTokenSigner,
    clock: DateTimeProvider,
    config: ConfigService<Environment, true>,
): AuthenticationDependencies => ({
    repository,
    preconditions: new AuthenticationPreconditionService(
        repository,
        hasher,
        signer,
    ),
    signer,
    clock,
    sessionLifetimeInDays: config.getOrThrow('AUTH_SESSION_TTL_DAYS', {
        infer: true,
    }),
});

// A typed token: pairing one use case's token with another's factory does not compile.
export const authenticationUseCase = <T>(
    provide: Type<T>,
    build: (dependencies: AuthenticationDependencies) => T,
): FactoryProvider<T> => ({
    provide,
    inject: DEPENDENCIES,
    useFactory: (...args: Parameters<typeof collect>) =>
        build(collect(...args)),
});
