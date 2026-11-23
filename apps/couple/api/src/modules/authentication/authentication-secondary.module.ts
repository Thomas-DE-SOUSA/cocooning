import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import {
    AccountRepository,
    PasswordHasher,
    SessionTokenSigner,
} from '@cocooning/couple-server-business-logic/authentication';
import type { Environment } from '../../env';
import { SESSION_TOKEN_ALGORITHM } from './session-token-algorithm';
import {
    Argon2PasswordHasher,
    JwtSessionTokenSigner,
} from './secondary/providers';
import { AccountPrismaRepository } from './secondary/repositories';

const adapters = [
    { provide: AccountRepository, useClass: AccountPrismaRepository },
    { provide: PasswordHasher, useClass: Argon2PasswordHasher },
    { provide: SessionTokenSigner, useClass: JwtSessionTokenSigner },
];

@Module({
    imports: [
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService<Environment, true>) => ({
                secret: config.getOrThrow('AUTH_JWT_SECRET', { infer: true }),
                signOptions: { algorithm: SESSION_TOKEN_ALGORITHM },
                verifyOptions: { algorithms: [SESSION_TOKEN_ALGORITHM] },
            }),
        }),
    ],
    providers: adapters,
    exports: adapters.map(({ provide }) => provide),
})
export class AuthenticationSecondaryModule {}
