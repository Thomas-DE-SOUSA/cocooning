import { spawnSync } from 'node:child_process';
import path from 'node:path';

const packageRoot = path.resolve(__dirname, '..');

describe('shared configs', () => {
    it.each([
        'base.js',
        'nest.js',
        'boundaries.js',
        'business-logic.js',
        'react.js',
        'next.js',
    ])('%s loads as an ES module', (file) => {
        const run = spawnSync(
            process.execPath,
            [
                '--input-type=module',
                '--eval',
                `await import(${JSON.stringify(path.join(packageRoot, file))});`,
            ],
            { cwd: packageRoot, encoding: 'utf8' },
        );
        expect(run.stderr).toBe('');
        expect(run.status).toBe(0);
    });
});
