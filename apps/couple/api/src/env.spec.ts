import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseEnv } from 'node:util';
import { environmentSchema } from './env';

const readEnvExample = (): Record<string, string> => {
    const content = readFileSync(join(__dirname, '..', '.env.example'), 'utf8');
    return parseEnv(content) as Record<string, string>;
};

describe('Feature: validate the API environment at startup', () => {
    describe('Scenario: the values of .env.example', () => {
        it('starts the API, so the example never drifts from the schema', () => {
            expect(environmentSchema.safeParse(readEnvExample()).success).toBe(
                true,
            );
        });

        it('reads numbers and booleans from their string form', () => {
            const env = environmentSchema.parse(readEnvExample());
            expect(env.PORT).toBe(3100);
            expect(env.LOG_PRETTY).toBe(true);
        });
    });

    describe.each(Object.keys(readEnvExample()))(
        'Scenario: %s is missing',
        (name) => {
            it('refuses to start', () => {
                const env: Record<string, string> = { ...readEnvExample() };
                delete env[name];
                expect(environmentSchema.safeParse(env).success).toBe(false);
            });
        },
    );

    describe('Scenario: a value out of its bounds', () => {
        it.each([
            { PORT: '0' },
            { LOG_LEVEL: 'verbose' },
            { LOG_PRETTY: 'maybe' },
            { DB_TX_TIMEOUT_MS: '-1' },
        ])('refuses %p', (override) => {
            const env = { ...readEnvExample(), ...override };
            expect(environmentSchema.safeParse(env).success).toBe(false);
        });
    });
});
