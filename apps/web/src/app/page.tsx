'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  const { profile, loading, error } = useProfile();

  if (loading) return <p className="text-center">Loading...</p>;
  if (error || !profile) return <p className="text-center">Error: {error || 'Profile not found'}</p>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-20">
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-10">
        <Image
          src="/profile.jpg"
          alt={profile[0]?.name || ""}
          width={250}
          height={250}
          className="rounded-xl object-cover w-40 h-40 sm:w-48 sm:h-48 md:w-60 md:h-60 shadow-md"
        />
        <div className="text-center md:text-left space-y-4 max-w-xl">
          <h1 className="text-4xl font-bold">{profile[0]?.name || ""}</h1>
          <p className="text-muted-foreground text-lg">{profile[0]?.title || ""}</p>
          <p className="text-muted-foreground text-sm">{profile[0]?.bio || ""}</p>
          <Button className="mt-4">View Projects</Button>
        </div>
      </section>

      {/* Skills */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Skills</h2>
        <Card>
          <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-6">
            {(profile[0]?.skills || []).map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="py-2 text-center w-full font-medium"
              >
                {skill}
              </Badge>
            ))}
          </CardContent>
        </Card>
      </section>

      {/* Projects */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Featured Projects</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Project Card 1 */}
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

          {/* Project Card 2 */}
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
    </div>
  );
}
