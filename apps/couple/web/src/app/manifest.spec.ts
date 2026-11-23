import { existsSync } from 'node:fs';
import { join } from 'node:path';
import manifest from './manifest';

const PUBLIC_DIR = join(__dirname, '..', '..', 'public');

describe('Feature: web app manifest', () => {
    it('names the app Cocooning and opens it standalone on the home page', async () => {
        const result = await manifest();

        expect(result.name).toBe('Cocooning');
        expect(result.start_url).toBe('/');
        expect(result.display).toBe('standalone');
    });

    it('lists only icons that exist on disk', async () => {
        const { icons } = await manifest();

        const missing = (icons ?? []).filter(
            (icon) => !existsSync(join(PUBLIC_DIR, icon.src)),
        );
        expect(icons).toHaveLength(3);
        expect(missing).toEqual([]);
    });

    it('offers a maskable icon for Android', async () => {
        const { icons } = await manifest();

        expect((icons ?? []).map((icon) => icon.purpose ?? null)).toContain(
            'maskable',
        );
    });
});
