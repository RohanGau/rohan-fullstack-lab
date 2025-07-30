'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/hooks/useProfile';
import { SkillsSection } from '@/components/custom/Skills';
import { HomeSkeleton } from '@/components/custom/HomeSkeleton';
import { Github, Linkedin } from 'lucide-react';
import { ProjectsPreview } from '@/components/custom/ProjectsPreview';
import { BlogsPreview } from '@/components/custom/BlogsPreview';

export default function Home() {
  const { profile, loading, error } = useProfile();
  const user = profile?.[0];

  if (loading) return <HomeSkeleton />;
  if (error || !user) return <p className="text-center">Error: {error || 'Profile not found'}</p>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-16">
      {/* Hero Section */}
      <section className="relative bg-muted/30 rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-10 shadow-sm">
        <Image
          src={user.avatarUrl ?? '/profile.jpg'}
          alt={user.name}
          width={250}
          height={250}
          className="rounded-xl object-cover w-40 h-40 sm:w-48 sm:h-48 md:w-60 md:h-60 shadow-md"
          priority
        />

        <div className="text-center md:text-left space-y-4 max-w-xl">
          <h1 className="text-4xl font-bold leading-tight">{user.name}</h1>
          <p className="text-primary text-lg font-medium">{user.title}</p>
          <p className="text-muted-foreground text-pretty text-sm leading-relaxed">
            {user.bio}
          </p>
          <div className="flex gap-4 justify-center md:justify-start">
            <Button>View Projects</Button>
            <Button variant="outline" asChild>
              <a href="/resume.pdf" target="_blank">Download Resume</a>
            </Button>
          </div>
          <div className="flex gap-4 justify-center md:justify-start pt-4">
            {user.githubUrl && (
              <a href={user.githubUrl} target="_blank" rel="noreferrer" aria-label="GitHub">
                <Github className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              </a>
            )}
            {user.linkedinUrl && (
              <a href={user.linkedinUrl} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <Linkedin className="w-5 h-5 text-muted-foreground hover:text-foreground" />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <SkillsSection skills={user.skills} />

      {/* Projects Section */}
      <ProjectsPreview />

      {/* Blog Section */}
      <BlogsPreview />
    </div>
  );
}
