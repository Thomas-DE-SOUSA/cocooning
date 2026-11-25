import { htmlToText } from './html-to-text';

describe('Feature: the visible text of a page (decision 0054)', () => {
    it('keeps the text, one line per block, without scripts, styles nor comments', () => {
        const html = `<html><head><title>T</title><style>p{color:red}</style></head>
            <body><!-- menu --><script>var a = "<p>no</p>";</script>
            <h1>Chez  Paul</h1><p>11 rue Mercière,<br/>Lyon</p>
            <noscript>Activez JS</noscript><ul><li>Prix : 25&nbsp;&euro;</li></ul></body></html>`;
        expect(htmlToText(html)).toBe(
            'Chez Paul\n11 rue Mercière,\nLyon\nPrix : 25 €',
        );
    });

    it('decodes named and numeric entities, and leaves an unknown one', () => {
        expect(htmlToText('L&apos;Ami &amp; Cie &#233;t&#xE9; &copy;')).toBe(
            "L'Ami & Cie été &copy;",
        );
    });
});
