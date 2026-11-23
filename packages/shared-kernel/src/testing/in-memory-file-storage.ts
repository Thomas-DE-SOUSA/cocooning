import { FileStorage, type StoredFile } from '../ports/storage/file-storage';

export class InMemoryFileStorage extends FileStorage {
    private files: ReadonlyMap<string, StoredFile> = new Map();

    override async store(file: StoredFile): Promise<void> {
        this.files = new Map([...this.files, [file.key, file]]);
    }

    override async read(key: string): Promise<StoredFile | null> {
        return this.files.get(key) ?? null;
    }

    override async delete(key: string): Promise<void> {
        this.files = new Map(
            [...this.files].filter(([storedKey]) => storedKey !== key),
        );
    }
}
