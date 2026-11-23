import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@cocooning/couple-prisma/nest';
import { CreateAccountUseCase } from '@cocooning/couple-server-business-logic/authentication';
import { ClockModule } from '@cocooning/server-infrastructure/date-time';
import { LoggerModule } from '@cocooning/server-infrastructure/logging';
import { loggerOptionsFactory } from '../../config/logger-options.factory';
import { prismaOptionsFactory } from '../../config/prisma-options.factory';
import { validateEnvironment } from '../../env';
import {
    AuthenticationSecondaryModule,
    authenticationUseCase,
} from '../../modules/authentication';

// R6: the only provider of CreateAccountUseCase; AppModule never imports this module, so no endpoint reaches it.
@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
        LoggerModule.forRootAsync(loggerOptionsFactory),
        PrismaModule.forRootAsync(prismaOptionsFactory),
        ClockModule,
        AuthenticationSecondaryModule,
    ],
    providers: [
        authenticationUseCase(
            CreateAccountUseCase,
            (d) =>
                new CreateAccountUseCase(
                    d.repository,
                    d.preconditions,
                    d.hasher,
                    d.clock,
                ),
        ),
    ],
})
export class CreateAccountCommandModule {}
