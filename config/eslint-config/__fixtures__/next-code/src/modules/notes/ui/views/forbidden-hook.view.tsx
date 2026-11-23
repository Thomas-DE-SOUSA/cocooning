import { useState } from 'react';

export function ForbiddenHookView() {
    const [count] = useState(0);
    return <p>{count}</p>;
}
