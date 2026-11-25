import { useState } from 'react';

const sameField = (left: string, right: string): boolean =>
    left.toLocaleLowerCase('fr') === right.toLocaleLowerCase('fr');

// R17: the field being typed before it joins the card template; the template itself stays in the form. A name the
// template already has, whatever its case, is not added: isDuplicate says why.
export function useCardFieldsDraft(
    fields: readonly string[],
    setFields: (next: string[]) => void,
) {
    const [newField, setNewField] = useState('');
    const field = newField.trim();
    const isDuplicate = fields.some((existing) => sameField(existing, field));
    const addField = () => {
        if (field === '' || isDuplicate) return;
        setFields([...fields, field]);
        setNewField('');
    };
    const removeField = (index: number) =>
        setFields(fields.filter((_, position) => position !== index));
    return { newField, setNewField, isDuplicate, addField, removeField };
}
