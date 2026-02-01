export function Philosophy({
  text,
  impact,
}: {
  text: string | undefined;
  impact: string[] | undefined;
}) {
  return (
    <div className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
      <blockquote className="border-l-4 pl-2 sm:pl-3 italic text-muted-foreground text-sm sm:text-base">
        {text || ''}
      </blockquote>
      <div className="bg-muted/30 rounded-md p-3 sm:p-5 border-l-4 border-primary">
        <ul className="list-disc list-inside text-xs sm:text-sm ml-1 sm:ml-2 space-y-1">
          {(impact || []).map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
