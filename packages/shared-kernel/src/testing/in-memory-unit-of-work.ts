import { UnitOfWork } from '../ports/unit-of-work/unit-of-work';

export class InMemoryUnitOfWork extends UnitOfWork {
    private runs = 0;

    get runCount(): number {
        return this.runs;
    }

    override async run<T>(work: () => Promise<T>): Promise<T> {
        this.runs += 1;
        return work();
    }
}
