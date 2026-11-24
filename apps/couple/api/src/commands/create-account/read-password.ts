import type { CommandTerminal } from '../command-terminal';
import { MaskedPrompt } from './masked-prompt';

// Asked twice: a typing mistake on a hidden input would otherwise leave an account nobody can sign in to.
export async function readPassword(
    terminal: CommandTerminal,
): Promise<string | null> {
    const prompt = new MaskedPrompt(terminal.input, terminal.output);
    try {
        const password = await prompt.ask('Password: ');
        const confirmation = await prompt.ask('Password again: ');
        if (password === null || confirmation === null) {
            terminal.errorOutput.write('Password input closed\n');
            return null;
        }
        if (password !== confirmation) {
            terminal.errorOutput.write('The two passwords differ\n');
            return null;
        }
        return password;
    } finally {
        prompt.close();
    }
}
