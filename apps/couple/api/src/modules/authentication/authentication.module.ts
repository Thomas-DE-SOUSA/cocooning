import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import type { Environment } from '../../env';
import { SESSION_TOKEN_ALGORITHM } from './session-token-algorithm';

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
    exports: [JwtModule],
})
export class AuthenticationModule {}
