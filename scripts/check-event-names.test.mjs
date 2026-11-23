import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';
import { findEventNameViolations } from './check-event-names.mjs';

const EVENT_PATH =
    'packages/couple/server-business-logic/src/pairing/domain/events/couple-paired.event.ts';
const EVENT_SOURCE = `export class CouplePairedEvent extends DomainEventBase<null> {
    static readonly EVENT_NAME = 'pairing.couple.paired' as const;
}`;
const event = { path: EVENT_PATH, source: EVENT_SOURCE };

describe('findEventNameViolations (decision 0004)', () => {
    it('accepts an event and a reference to its EVENT_NAME', () => {
        const consumer = {
            path: 'apps/couple/api/src/relay.ts',
            source: 'export const name = CouplePairedEvent.EVENT_NAME;',
        };
        assert.deepEqual(findEventNameViolations([event, consumer]), []);
    });

    it('rejects an event class without its EVENT_NAME', () => {
        const unnamed = {
            path: EVENT_PATH,
            source: 'export class CouplePairedEvent {}',
        };
        assert.deepEqual(findEventNameViolations([unnamed]), [
            `${EVENT_PATH}: missing static readonly EVENT_NAME = '<context>.<object>.<fact>' as const`,
        ]);
    });

    it('rejects an EVENT_NAME that is not typed as const', () => {
        const loose = {
            path: EVENT_PATH,
            source: "class CouplePairedEvent { static readonly EVENT_NAME = 'pairing.couple.paired'; }",
        };
        assert.equal(findEventNameViolations([loose]).length, 1);
    });

    it('rejects an event file without a class', () => {
        const empty = {
            path: EVENT_PATH,
            source: 'export const nothing = null;',
        };
        assert.deepEqual(findEventNameViolations([empty]), [
            `${EVENT_PATH}: no event class in domain/events/`,
        ]);
    });

    it('rejects a name retyped as a string outside its class, with its line', () => {
        const handler = {
            path: 'apps/couple/api/src/push.ts',
            source: "// push\nif (name === `pairing.couple.paired`) {}\nconst other = 'pairing.couple.paired';",
        };
        assert.deepEqual(findEventNameViolations([event, handler]), [
            `apps/couple/api/src/push.ts:2: 'pairing.couple.paired' is retyped; reference the EVENT_NAME of ${EVENT_PATH}`,
            `apps/couple/api/src/push.ts:3: 'pairing.couple.paired' is retyped; reference the EVENT_NAME of ${EVENT_PATH}`,
        ]);
    });

    it('ignores a longer name that only starts like an event name', () => {
        const other = {
            path: 'apps/couple/api/src/a.ts',
            source: "'pairing.couple.paired.v2'",
        };
        assert.deepEqual(findEventNameViolations([event, other]), []);
    });
});

describe('check-event-names.mjs', () => {
    const runOn = (files) => {
        const root = mkdtempSync(path.join(tmpdir(), 'check-event-names-'));
        for (const [file, source] of Object.entries(files)) {
            mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
            writeFileSync(path.join(root, file), source);
        }
        const run = spawnSync(
            process.execPath,
            [path.join(import.meta.dirname, 'check-event-names.mjs'), root],
            { encoding: 'utf8' },
        );
        rmSync(root, { recursive: true });
        return run;
    };

    it('exits 0 on a repository that follows the rule', () => {
        const run = runOn({ [EVENT_PATH]: EVENT_SOURCE });
        assert.equal(run.stderr, '');
        assert.equal(run.status, 0);
    });

    it('exits 1 and skips node_modules when a name is retyped', () => {
        const run = runOn({
            [EVENT_PATH]: EVENT_SOURCE,
            'apps/couple/api/src/push.ts':
                "export const name = 'pairing.couple.paired';",
            'apps/couple/api/node_modules/lib/index.ts':
                "'pairing.couple.paired'",
        });
        assert.equal(run.status, 1);
        assert.match(run.stderr, /apps\/couple\/api\/src\/push\.ts:1:/);
        assert.doesNotMatch(run.stderr, /node_modules/);
    });
});
