import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@cocooning/couple-prisma/nest';
import { RecordTogetherPeriodsUseCase } from '@cocooning/couple-server-business-logic/pairing';
import { CryptoModule } from '@cocooning/server-infrastructure/crypto';
import { ClockModule } from '@cocooning/server-infrastructure/date-time';
import { LoggerModule } from '@cocooning/server-infrastructure/logging';
import { MessagingModule } from '@cocooning/server-infrastructure/messaging';
import { loggerOptionsFactory } from '../../config/logger-options.factory';
import { prismaOptionsFactory } from '../../config/prisma-options.factory';
import { validateEnvironment } from '../../env';
import { AuthenticationSecondaryModule } from '../../modules/authentication';
import { PairingSecondaryModule, pairingUseCase } from '../../modules/pairing';

// R9: the only provider of RecordTogetherPeriodsUseCase; AppModule never imports this module, so no endpoint reaches it.
@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
        LoggerModule.forRootAsync(loggerOptionsFactory),
        PrismaModule.forRootAsync(prismaOptionsFactory),
        ClockModule,
        CryptoModule,
        MessagingModule,
        AuthenticationSecondaryModule,
        PairingSecondaryModule,
    ],
    providers: [
        pairingUseCase(
            RecordTogetherPeriodsUseCase,
            (d) =>
                new RecordTogetherPeriodsUseCase(
                    d.repository,
                    d.preconditions,
                    d.clock,
                    d.publishing,
                ),
        ),
    ],
})
export class RecordTogetherPeriodsCommandModule {}
