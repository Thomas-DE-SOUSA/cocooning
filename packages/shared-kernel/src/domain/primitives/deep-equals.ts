type Comparable = { equals(other: unknown): boolean };

const isComparable = (value: unknown): value is Comparable =>
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Comparable).equals === 'function';

const isPlainObject = (
    value: unknown,
): value is Readonly<Record<string, unknown>> =>
    typeof value === 'object' && value !== null;

const arraysEqual = (
    left: ReadonlyArray<unknown>,
    right: ReadonlyArray<unknown>,
): boolean =>
    left.length === right.length &&
    left.every((item, index) => deepEquals(item, right[index]));

const objectsEqual = (
    left: Readonly<Record<string, unknown>>,
    right: Readonly<Record<string, unknown>>,
): boolean => {
    const leftKeys = Object.keys(left);
    if (leftKeys.length !== Object.keys(right).length) return false;
    return leftKeys.every(
        (key) => Object.hasOwn(right, key) && deepEquals(left[key], right[key]),
    );
};

export function deepEquals(left: unknown, right: unknown): boolean {
    if (left === right) return true;
    if (left instanceof Date && right instanceof Date)
        return left.getTime() === right.getTime();
    if (Array.isArray(left) && Array.isArray(right))
        return arraysEqual(left, right);
    if (isComparable(left)) return left.equals(right);
    if (isPlainObject(left) && isPlainObject(right))
        return objectsEqual(left, right);
    return false;
}
