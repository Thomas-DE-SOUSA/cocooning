import { render } from '@testing-library/react';
import NoteListsLoading from './loading';

describe('Feature: the Lists tab while it loads', () => {
    it('shows skeletons in the shape of the page, hidden from screen readers', () => {
        const { container } = render(<NoteListsLoading />);

        const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
        expect(skeletons).toHaveLength(5);
        for (const skeleton of skeletons) {
            expect(skeleton.getAttribute('aria-hidden')).toBe('true');
        }
    });
});
