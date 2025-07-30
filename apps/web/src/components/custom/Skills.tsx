import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Profile } from '@/types/profile';
import * as simpleIcons from 'simple-icons';
import { getSimpleIconSlug } from '@/lib/utils';

export function SkillsSection({ skills }: { skills: Profile['skills'] }) {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-6">Skills</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {skills.map((skill) => {
          const slug = getSimpleIconSlug(skill.name);
          const iconKey = 'si' + slug.charAt(0).toUpperCase() + slug.slice(1);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const icon = (simpleIcons as any)[iconKey];

          const svg = icon?.svg
            ? icon.svg.replace(/fill="[^"]*"/g, `fill="#${icon.hex}"`)
            : null;

            console.log(`Rendering skill: ${skill.name} with icon: ${iconKey}`, { svg });   

          return (
            <Card key={skill.name} className="shadow-sm">
              <CardHeader className="flex items-center gap-3">
                {svg && (
                    <span
                        className="w-5 h-5 flex items-center justify-center"
                        dangerouslySetInnerHTML={{ __html: svg }}
                    />
                )}
                <CardTitle className="text-base">{skill.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Rating</span>
                  <span>{skill.rating}/10</span>
                </div>
                <Progress value={(skill.rating / 10) * 100} />
                <div className="text-xs text-muted-foreground pt-1">
                  {skill.yearsOfExperience} year{skill.yearsOfExperience > 1 ? 's' : ''} experience
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}