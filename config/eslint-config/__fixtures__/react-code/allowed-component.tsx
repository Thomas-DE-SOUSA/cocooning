// Fixture: a small component that follows the React rules.
type Partner = { readonly id: string; readonly name: string };

export function PartnerList({
    partners,
}: {
    readonly partners: readonly Partner[];
}) {
    return (
        <ul>
            {partners.map((partner) => (
                <li key={partner.id}>{partner.name}</li>
            ))}
        </ul>
    );
}
