import { createInterface, type Interface } from 'node:readline';
import { type Readable, Writable } from 'node:stream';

const DISCARDED_ECHO = new Writable({
    write: (_chunk, _encoding, done) => done(),
});

// readline in terminal mode echoes into DISCARDED_ECHO: the password never reaches the screen nor the shell history.
export class MaskedPrompt {
    private readonly reader: Interface;
    private readonly lines: AsyncIterator<string>;

    constructor(
        input: Readable,
        private readonly output: Writable,
    ) {
        this.reader = createInterface({
            input,
            output: DISCARDED_ECHO,
            terminal: true,
        });
        this.reader.on('SIGINT', () => this.reader.close());
        this.lines = this.reader[Symbol.asyncIterator]();
    }

    async ask(question: string): Promise<string | null> {
        this.output.write(question);
        const line = await this.lines.next();
        this.output.write('\n');
        return line.done === true ? null : line.value;
    }

    close(): void {
        this.reader.close();
    }
}
