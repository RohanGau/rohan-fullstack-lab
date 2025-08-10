import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export function Knowledge({ areas }: { areas: { title: string; topics: string[] }[] | undefined }) {
  return (
    <>
      <Separator className="my-8" />
      <h2 className="font-semibold text-lg mb-4">What I Know & Deliver</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {(areas || []).map((area) => (
          <div key={area.title} className="mb-2">
            <div className="font-bold text-primary mb-1">{area.title}</div>
            <ul className="flex flex-wrap gap-1">
              {area.topics.map((topic) => (
                <Badge key={topic} variant="outline">
                  {topic}
                </Badge>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}
