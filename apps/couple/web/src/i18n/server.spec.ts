import { getServerTranslation } from './server';

describe('Feature: translate on the server', () => {
    it('reads a key of the namespace in French', async () => {
        const t = await getServerTranslation('generic');

        expect(t('notFound.title')).toBe('Page introuvable');
    });

    it('gives each call its own instance', async () => {
        const [first, second] = await Promise.all([
            getServerTranslation('generic'),
            getServerTranslation('generic'),
        ]);

        expect(first).not.toBe(second);
    });
});
