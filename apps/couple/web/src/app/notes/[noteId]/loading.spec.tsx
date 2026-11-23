import { render } from '@testing-library/react';
import NoteLoading from './loading';

describe('Feature: the page of a note while it loads', () => {
    it('shows skeletons in the shape of the page, hidden from screen readers', () => {
        const { container } = render(<NoteLoading />);

        const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
        expect(skeletons).toHaveLength(3);
        for (const skeleton of skeletons) {
            expect(skeleton.getAttribute('aria-hidden')).toBe('true');
        }
    });
});
