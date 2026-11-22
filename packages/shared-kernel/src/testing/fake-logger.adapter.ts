import { type LogContext, Logger } from '../ports/logging/logger';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogEntry = {
    readonly level: LogLevel;
    readonly message: string;
    readonly context: LogContext;
};

export class FakeLoggerAdapter extends Logger {
    private recorded: ReadonlyArray<LogEntry> = [];

    get entries(): ReadonlyArray<LogEntry> {
        return this.recorded;
    }

    override setContext(): void {}

    override debug(message: string, context: LogContext): void {
        this.record('debug', message, context);
    }

    override info(message: string, context: LogContext): void {
        this.record('info', message, context);
    }

    override warn(message: string, context: LogContext): void {
        this.record('warn', message, context);
    }

    override error(message: string, context: LogContext): void {
        this.record('error', message, context);
    }

    private record(
        level: LogLevel,
        message: string,
        context: LogContext,
    ): void {
        this.recorded = [...this.recorded, { level, message, context }];
    }
}
