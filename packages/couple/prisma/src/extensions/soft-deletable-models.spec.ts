import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SOFT_DELETABLE_MODELS } from './soft-deletable-models';

const MODELS_DIRECTORY = join(__dirname, '..', '..', 'prisma', 'models');
const MODEL_BLOCK = /model\s+(\w+)\s*\{([^}]*)\}/g;
const DELETED_AT_FIELD = /^\s*deletedAt\s/m;

const modelsWithDeletedAt = (): ReadonlyArray<string> =>
    readdirSync(MODELS_DIRECTORY)
        .filter((file) => file.endsWith('.prisma'))
        .flatMap((file) => [
            ...readFileSync(join(MODELS_DIRECTORY, file), 'utf8').matchAll(
                MODEL_BLOCK,
            ),
        ])
        .filter(
            ([, , body]) => body !== undefined && DELETED_AT_FIELD.test(body),
        )
        .map(([, name]) => String(name))
        .sort();

describe('Feature: the soft-deletable models match the schema', () => {
    describe('Scenario: the declared list', () => {
        it('is exactly the models that have a deletedAt field', () => {
            expect([...SOFT_DELETABLE_MODELS].sort()).toEqual(
                modelsWithDeletedAt(),
            );
        });
    });
});
