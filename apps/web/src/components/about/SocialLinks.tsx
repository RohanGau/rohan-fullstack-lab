import Link from 'next/link';
import { Github, Linkedin, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function SocialLinks({ githubUrl, linkedinUrl }: { githubUrl: string; linkedinUrl: string }) {
  return (
    <div className="flex gap-4 pt-4">
      <Link href={githubUrl} target="_blank"><Github className="w-5 h-5" /></Link>
      <Link href={linkedinUrl} target="_blank"><Linkedin className="w-5 h-5" /></Link>
      <Link href="/contact"><Mail className="w-5 h-5" /></Link>
      <Link href="/blog"><Badge variant="secondary">Read My Blogs</Badge></Link>
    </div>
  );
}
