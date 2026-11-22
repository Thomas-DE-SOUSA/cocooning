export type LogContext = Readonly<Record<string, unknown>>;

export abstract class Logger {
    abstract setContext(context: string): void;
    abstract debug(message: string, context: LogContext): void;
    abstract info(message: string, context: LogContext): void;
    abstract warn(message: string, context: LogContext): void;
    abstract error(message: string, context: LogContext): void;
}
