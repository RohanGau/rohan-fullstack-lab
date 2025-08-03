import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

export function Hero({ title, description, heading }: { title: string; description: string, heading: string }) {
  return (
    <CardHeader>
    <CardTitle className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
        <Sparkles className="text-primary w-6 h-6" />
        {title}
    </CardTitle>
    <CardDescription className="text-lg mt-2">
        {description} <br />
        <span className="text-muted-foreground font-medium">{heading}</span>
    </CardDescription>
    </CardHeader>
  );
}
