import { Global, Injectable, Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Logger } from '@cocooning/shared-kernel/ports';
import type { LoggerOptions } from './create-pino-logger';
import { LoggerModule } from './logger.module';
import { PinoLoggerAdapter } from './pino-logger.adapter';

@Injectable()
class FirstService {
    constructor(readonly logger: Logger) {}
}

@Injectable()
class SecondService {
    constructor(readonly logger: Logger) {}
}

const LOG_SETTINGS = Symbol('LOG_SETTINGS');

@Global()
@Module({
    providers: [
        {
            provide: LOG_SETTINGS,
            useValue: {
                level: 'silent',
                pretty: false,
            } satisfies LoggerOptions,
        },
    ],
    exports: [LOG_SETTINGS],
})
class LogSettingsModule {}

describe('Feature: provide the Logger port', () => {
    describe('Scenario: two classes inject the logger', () => {
        it('gives each its own pino adapter', async () => {
            const moduleRef = await Test.createTestingModule({
                imports: [
                    LoggerModule.forRoot({ level: 'silent', pretty: false }),
                ],
                providers: [FirstService, SecondService],
            }).compile();
            const first = moduleRef.get(FirstService).logger;
            const second = moduleRef.get(SecondService).logger;
            expect(first).toBeInstanceOf(PinoLoggerAdapter);
            expect(first).not.toBe(second);
        });
    });

    describe('Scenario: the options come from an injected provider', () => {
        it('builds the logger once the options are resolved', async () => {
            const moduleRef = await Test.createTestingModule({
                imports: [
                    LogSettingsModule,
                    LoggerModule.forRootAsync({
                        inject: [LOG_SETTINGS],
                        useFactory: (settings: LoggerOptions) => settings,
                    }),
                ],
                providers: [FirstService],
            }).compile();
            expect(moduleRef.get(FirstService).logger).toBeInstanceOf(
                PinoLoggerAdapter,
            );
        });
    });
});
