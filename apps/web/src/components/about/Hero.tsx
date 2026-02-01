import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

export function Hero({
  title,
  description,
  heading,
}: {
  title: string;
  description: string;
  heading: string;
}) {
  return (
    <CardHeader>
      <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
        <Sparkles className="text-primary w-5 h-5 sm:w-6 sm:h-6" />
        {title}
      </CardTitle>
      <CardDescription className="text-base sm:text-lg mt-2">
        {description} <br />
        <span className="text-muted-foreground font-medium">{heading}</span>
      </CardDescription>
    </CardHeader>
  );
}
