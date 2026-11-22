import { Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Logger } from '@cocooning/shared-kernel/ports';
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
});
