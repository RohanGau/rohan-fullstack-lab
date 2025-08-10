export function Philosophy({
  text,
  impact,
}: {
  text: string | undefined;
  impact: string[] | undefined;
}) {
  return (
    <div className="space-y-4 mt-6">
      <blockquote className="border-l-4 pl-3 italic text-muted-foreground">{text || ''}</blockquote>
      <div className="bg-muted/30 rounded-md p-5 border-l-4 border-primary">
        <ul className="list-disc list-inside text-sm ml-2">
          {(impact || []).map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
