import { type LogContext, Logger } from '@cocooning/shared-kernel/ports';
import type { Logger as PinoLogger } from 'pino';

export class PinoLoggerAdapter extends Logger {
    private context: string | null = null;

    constructor(private readonly pino: PinoLogger) {
        super();
    }

    override setContext(context: string): void {
        this.context = context;
    }

    override debug(message: string, context: LogContext): void {
        this.pino.debug(this.withContext(context), message);
    }

    override info(message: string, context: LogContext): void {
        this.pino.info(this.withContext(context), message);
    }

    override warn(message: string, context: LogContext): void {
        this.pino.warn(this.withContext(context), message);
    }

    override error(message: string, context: LogContext): void {
        this.pino.error(this.withContext(context), message);
    }

    private withContext(context: LogContext): LogContext {
        return { ...context, context: this.context };
    }
}
