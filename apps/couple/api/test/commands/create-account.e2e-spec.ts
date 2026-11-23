import { AuthenticationTestApp } from '../authentication/authentication-test-app';
import {
    EMAIL_ADDRESS_A,
    PASSWORD,
} from '../authentication/authentication-test-data';
import { runCreateAccount } from './create-account-test-data';

// The command boots its own Nest context on the test database; the API proves the account signs in.
describe('Feature: the owner creates an account on the VM (R6)', () => {
    const auth = new AuthenticationTestApp();

    beforeAll(() => auth.start());
    afterAll(() => auth.stop());
    beforeEach(() => auth.reset());

    describe('Scenario: R1, R2, a valid address and password', () => {
        it('exits 0 and opens an account that signs in', async () => {
            const run = await runCreateAccount(
                ['  Thomas@Cocooning.TEST '],
                [PASSWORD, PASSWORD],
            );
            expect(run.exitCode).toBe(0);
            expect(run.errorOutput).toBe('');
            expect(run.output).toMatch(
                /^Password: \nPassword again: \nAccount created: thomas@cocooning\.test, userId [0-9a-f-]{36}\n$/,
            );
            await expect(auth.signIn(EMAIL_ADDRESS_A)).resolves.toMatchObject({
                status: 200,
            });
        });
    });

    describe('Scenario: core.md rules 30 and 33, secrets stay hidden', () => {
        it('never prints the password, even on a refusal', async () => {
            const created = await runCreateAccount(
                [EMAIL_ADDRESS_A],
                [PASSWORD, PASSWORD],
            );
            const taken = await runCreateAccount(
                [EMAIL_ADDRESS_A],
                [PASSWORD, PASSWORD],
            );
            const printed = [created, taken]
                .map((run) => run.output + run.errorOutput)
                .join('');
            expect(printed).not.toContain(PASSWORD);
            expect(printed).not.toContain('$argon2');
        });
    });
});
