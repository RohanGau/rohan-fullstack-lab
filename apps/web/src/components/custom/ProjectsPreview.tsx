import Image from 'next/image';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import Link from 'next/link';

export function ProjectsPreview() {
  return (
     <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Featured Projects</h2>
          <Link href="/projects" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 space-y-3">
              <Image
                src="/project-alpha.png"
                alt="Project Alpha"
                width={600}
                height={400}
                className="w-full h-auto rounded"
              />
              <h3 className="text-lg font-semibold">Project Alpha</h3>
              <p className="text-sm text-muted-foreground">
                A dynamic web application built with React.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 space-y-3">
              <Image
                src="/project-beta.png"
                alt="Project Beta"
                width={600}
                height={400}
                className="w-full h-auto rounded"
              />
              <h3 className="text-lg font-semibold">Project Beta</h3>
              <p className="text-sm text-muted-foreground">
                An e-commerce platform using Angular.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    );
}
