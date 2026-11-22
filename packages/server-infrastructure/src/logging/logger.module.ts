import { type DynamicModule, Global, Module, Scope } from '@nestjs/common';
import { Logger } from '@cocooning/shared-kernel/ports';
import type { Logger as PinoLogger } from 'pino';
import { createPinoLogger, type LoggerOptions } from './create-pino-logger';
import { PinoLoggerAdapter } from './pino-logger.adapter';

const PINO_ROOT_LOGGER = Symbol('PINO_ROOT_LOGGER');

// Transient: every consumer gets its own adapter, so setContext() never leaks from one class to another.
@Global()
@Module({})
export class LoggerModule {
    static forRoot(options: LoggerOptions): DynamicModule {
        return {
            module: LoggerModule,
            providers: [
                {
                    provide: PINO_ROOT_LOGGER,
                    useValue: createPinoLogger(options),
                },
                {
                    provide: Logger,
                    scope: Scope.TRANSIENT,
                    inject: [PINO_ROOT_LOGGER],
                    useFactory: (root: PinoLogger) =>
                        new PinoLoggerAdapter(root),
                },
            ],
            exports: [Logger],
        };
    }
}
