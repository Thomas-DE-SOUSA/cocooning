// R17, R25: two field names are the same field whatever their case (« Prix » and « prix »).
export const sameFieldName = (left: string, right: string): boolean =>
    left.toLocaleLowerCase('fr') === right.toLocaleLowerCase('fr');
