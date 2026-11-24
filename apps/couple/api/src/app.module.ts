import {
    type MiddlewareConsumer,
    Module,
    type NestModule,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { PrismaModule } from '@cocooning/couple-prisma/nest';
import { CryptoModule } from '@cocooning/server-infrastructure/crypto';
import { ClockModule } from '@cocooning/server-infrastructure/date-time';
import { IdentifierModule } from '@cocooning/server-infrastructure/identifier';
import { LoggerModule } from '@cocooning/server-infrastructure/logging';
import { MessagingModule } from '@cocooning/server-infrastructure/messaging';
import {
    EXCEPTION_STATUS_TABLE,
    type ExceptionStatusTable,
    HttpExceptionFilter,
    RequestIdMiddleware,
} from '@cocooning/server-infrastructure/nest';
import { Logger } from '@cocooning/shared-kernel/ports';
import cookieParser from 'cookie-parser';
import { loggerOptionsFactory } from './config/logger-options.factory';
import { prismaOptionsFactory } from './config/prisma-options.factory';
import { validateEnvironment } from './env';
import { EXCEPTION_STATUSES } from './exception-statuses';
import { HealthModule } from './health/health.module';
import { AgendaModule } from './modules/agenda';
import { AuthenticationModule, SessionGuard } from './modules/authentication';
import { NotesModule } from './modules/notes';
import { PairingModule } from './modules/pairing';

const EVERY_ROUTE = '{*path}';

// Guards, filter and middleware are declared here, never in main.ts: the E2E app imports this module and runs the production chain.
@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
        LoggerModule.forRootAsync(loggerOptionsFactory),
        PrismaModule.forRootAsync(prismaOptionsFactory),
        ClockModule,
        IdentifierModule,
        CryptoModule,
        MessagingModule,
        AuthenticationModule,
        HealthModule,
        PairingModule,
        NotesModule,
        AgendaModule,
    ],
    providers: [
        { provide: APP_GUARD, useClass: SessionGuard },
        { provide: EXCEPTION_STATUS_TABLE, useValue: EXCEPTION_STATUSES },
        {
            provide: APP_FILTER,
            inject: [EXCEPTION_STATUS_TABLE, Logger],
            useFactory: (table: ExceptionStatusTable, logger: Logger) =>
                new HttpExceptionFilter(table, logger),
        },
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer
            .apply(cookieParser(), RequestIdMiddleware)
            .forRoutes(EVERY_ROUTE);
    }
}
