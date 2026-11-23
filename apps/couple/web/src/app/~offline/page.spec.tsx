import { render, screen } from '@testing-library/react';
import OfflinePage from './page';

describe('Feature: offline fallback page', () => {
    it('tells the couple the connection is lost, in French', async () => {
        render(await OfflinePage());

        expect(screen.getByRole('heading', { level: 1 }).textContent).toBe(
            'Hors ligne',
        );
    });
});
