import { render } from '@testing-library/react';
import NoteListLoading from './loading';

describe('Feature: the page of a list while it loads', () => {
    it('shows skeletons in the shape of the page, hidden from screen readers', () => {
        const { container } = render(<NoteListLoading />);

        const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
        expect(skeletons).toHaveLength(4);
        for (const skeleton of skeletons) {
            expect(skeleton.getAttribute('aria-hidden')).toBe('true');
        }
    });
});
