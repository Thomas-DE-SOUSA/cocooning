import type { WebPageText } from '../models/note-card-writing';

// The text of the first pages found, read in parallel, bounded in size and time (decision 0054).
// A page that cannot be read is left out; the reader never fails as a whole.
export abstract class WebPageReader {
    abstract read(
        urls: ReadonlyArray<string>,
    ): Promise<ReadonlyArray<WebPageText>>;
}
