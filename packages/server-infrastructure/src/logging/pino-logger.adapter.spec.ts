import { Writable } from 'node:stream';
import { requestContext } from '../nest/middleware/request-context';
import { createPinoLogger } from './create-pino-logger';
import { PinoLoggerAdapter } from './pino-logger.adapter';

const capture = (): {
    lines: Array<Record<string, unknown>>;
    stream: Writable;
} => {
    const lines: Array<Record<string, unknown>> = [];
    const stream = new Writable({
        write(chunk: Buffer, _encoding, done) {
            lines.push(JSON.parse(chunk.toString()) as Record<string, unknown>);
            done();
        },
    });
    return { lines, stream };
};

describe('Feature: structured logs through pino', () => {
    describe('Scenario: a log inside a request', () => {
        it('writes the message, the structured context, the class and the request id', () => {
            const { lines, stream } = capture();
            const logger = new PinoLoggerAdapter(
                createPinoLogger({ level: 'debug', pretty: false }, stream),
            );
            logger.setContext('ShareNoteUseCase');
            requestContext.run({ requestId: 'request-1' }, () =>
                logger.debug('Sharing note', {
                    noteId: 'note-1',
                    coupleId: 'couple-1',
                }),
            );
            expect(lines).toEqual([
                expect.objectContaining({
                    msg: 'Sharing note',
                    noteId: 'note-1',
                    coupleId: 'couple-1',
                    context: 'ShareNoteUseCase',
                    requestId: 'request-1',
                }),
            ]);
        });
    });

    describe('Scenario: an error is logged', () => {
        it('serializes the error with its stack', () => {
            const { lines, stream } = capture();
            const logger = new PinoLoggerAdapter(
                createPinoLogger({ level: 'info', pretty: false }, stream),
            );
            logger.error('Failed to save note', { error: new Error('boom') });
            expect(lines[0]).toEqual(
                expect.objectContaining({
                    error: expect.objectContaining({
                        message: 'boom',
                        stack: expect.any(String),
                    }),
                    requestId: null,
                }),
            );
        });
    });

    describe('Scenario: a level below the threshold', () => {
        it('writes nothing', () => {
            const { lines, stream } = capture();
            const logger = new PinoLoggerAdapter(
                createPinoLogger({ level: 'warn', pretty: false }, stream),
            );
            logger.info('Ignored', {});
            expect(lines).toEqual([]);
        });
    });
});
