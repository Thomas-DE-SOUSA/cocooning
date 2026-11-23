import pino, {
    type DestinationStream,
    type LevelWithSilent,
    type Logger as PinoLogger,
} from 'pino';
import { getRequestId } from '../nest/middleware/request-context';

export type LoggerOptions = {
    readonly level: LevelWithSilent;
    readonly pretty: boolean;
};

const PRETTY_TRANSPORT = { target: 'pino-pretty', options: { colorize: true } };

export function createPinoLogger(
    options: LoggerOptions,
    destination: DestinationStream | null = null,
): PinoLogger {
    const settings = {
        level: options.level,
        mixin: () => ({ requestId: getRequestId() }),
        serializers: { error: pino.stdSerializers.err },
        ...(options.pretty && destination === null
            ? { transport: PRETTY_TRANSPORT }
            : {}),
    };
    return destination === null ? pino(settings) : pino(settings, destination);
}
