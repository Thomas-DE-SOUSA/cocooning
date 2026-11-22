import {
    type DynamicModule,
    type FactoryProvider,
    Global,
    Module,
    Scope,
} from '@nestjs/common';
import { Logger } from '@cocooning/shared-kernel/ports';
import type { Logger as PinoLogger } from 'pino';
import { createPinoLogger, type LoggerOptions } from './create-pino-logger';
import { PinoLoggerAdapter } from './pino-logger.adapter';

const LOGGER_OPTIONS = Symbol('LOGGER_OPTIONS');
const PINO_ROOT_LOGGER = Symbol('PINO_ROOT_LOGGER');

export type LoggerModuleAsyncOptions = Pick<
    FactoryProvider<LoggerOptions>,
    'inject' | 'useFactory'
>;

// Transient: every consumer gets its own adapter, so setContext() never leaks from one class to another.
@Global()
@Module({})
export class LoggerModule {
    static forRoot(options: LoggerOptions): DynamicModule {
        return LoggerModule.forRootAsync({ useFactory: () => options });
    }

    static forRootAsync(options: LoggerModuleAsyncOptions): DynamicModule {
        return {
            module: LoggerModule,
            providers: [
                { provide: LOGGER_OPTIONS, ...options },
                {
                    provide: PINO_ROOT_LOGGER,
                    inject: [LOGGER_OPTIONS],
                    useFactory: (loggerOptions: LoggerOptions) =>
                        createPinoLogger(loggerOptions),
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
