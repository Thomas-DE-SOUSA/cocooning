import { couplePrismaEnvSchema } from './env';

describe('Feature: validate the database configuration', () => {
    describe('Scenario: a Postgres URL', () => {
        it.each(['postgresql://u:p@localhost:5432/db', 'postgres://u:p@db/db'])(
            'accepts %s',
            (url) => {
                expect(
                    couplePrismaEnvSchema.parse({ DATABASE_POSTGRES_URL: url }),
                ).toEqual({ DATABASE_POSTGRES_URL: url });
            },
        );
    });

    describe('Scenario: a missing or foreign URL', () => {
        it.each([
            {},
            { DATABASE_POSTGRES_URL: 'mysql://u:p@db/db' },
            { DATABASE_POSTGRES_URL: 'not a url' },
        ])('refuses %p', (env) => {
            expect(couplePrismaEnvSchema.safeParse(env).success).toBe(false);
        });
    });
});
