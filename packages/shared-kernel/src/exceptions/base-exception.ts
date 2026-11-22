export type ExceptionContext = Readonly<Record<string, number | string>> | null;

export type ExceptionParams<TCode extends string> = {
    readonly code: TCode;
    readonly message: string;
    readonly context?: ExceptionContext;
};

export class BaseException<TCode extends string = string> extends Error {
    readonly code: TCode;
    readonly context: ExceptionContext;

    constructor({ code, message, context = null }: ExceptionParams<TCode>) {
        super(message);
        this.name = new.target.name;
        this.code = code;
        this.context = context;
    }
}
