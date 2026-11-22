import { deepEquals } from './deep-equals';

export abstract class ValueObject<T> {
    protected readonly props: Readonly<T>;

    protected constructor(props: T) {
        this.props = Object.freeze(props);
    }

    equals(other: ValueObject<T> | null): boolean {
        if (other === null) return false;
        if (this === other) return true;
        if (other.constructor !== this.constructor) return false;
        return deepEquals(this.props, other.props);
    }
}
