export function CompanyRole({ company, role }: { company?: string; role?: string }) {
  if (!company && !role) return null;
  return (
    <p className="text-sm text-muted-foreground">
      {company ? <span className="capitalize">{company}</span> : null}
      {company && role ? ' • ' : null}
      {role ? <span className="capitalize">{role}</span> : null}
    </p>
  );
}
