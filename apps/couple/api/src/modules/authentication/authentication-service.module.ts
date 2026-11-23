import { Module } from '@nestjs/common';
import {
    ResolveSessionUseCase,
    SignInUseCase,
    SignOutUseCase,
} from '@cocooning/couple-server-business-logic/authentication';
import { AuthenticationSecondaryModule } from './authentication-secondary.module';
import { authenticationUseCase } from './authentication-use-case.factory';

const useCases = [
    authenticationUseCase(
        SignInUseCase,
        (d) =>
            new SignInUseCase(
                d.preconditions,
                d.signer,
                d.clock,
                d.sessionLifetimeInDays,
            ),
    ),
    authenticationUseCase(
        ResolveSessionUseCase,
        (d) => new ResolveSessionUseCase(d.preconditions, d.clock),
    ),
    authenticationUseCase(
        SignOutUseCase,
        (d) => new SignOutUseCase(d.repository, d.preconditions, d.clock),
    ),
];

@Module({
    imports: [AuthenticationSecondaryModule],
    providers: useCases,
    exports: useCases.map(({ provide }) => provide),
})
export class AuthenticationServiceModule {}
