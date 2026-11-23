// Fixture: a list keyed by the array index. ESLint must reject this file.
export function NoteTitles({ titles }: { readonly titles: readonly string[] }) {
    return (
        <ul>
            {titles.map((title, index) => (
                <li key={index}>{title}</li>
            ))}
        </ul>
    );
}
