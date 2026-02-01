import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export function Knowledge({ areas }: { areas: { title: string; topics: string[] }[] | undefined }) {
  return (
    <>
      <Separator className="my-6 sm:my-8" />
      <h2 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">What I Know & Deliver</h2>
      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        {(areas || []).map((area) => (
          <div key={area.title} className="mb-2">
            <div className="font-bold text-primary text-sm sm:text-base mb-1">{area.title}</div>
            <ul className="flex flex-wrap gap-1">
              {area.topics.map((topic) => (
                <Badge key={topic} variant="outline" className="text-xs sm:text-sm">
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
