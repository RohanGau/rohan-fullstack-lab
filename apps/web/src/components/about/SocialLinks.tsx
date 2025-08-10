import Link from 'next/link';
import { Github, Linkedin, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SocialLinks } from '../custom/SocialLinks';
import { IProfileDto } from '@fullstack-lab/types';
import { CONTACTS } from '@/lib/constant';

export function SocialLinksContainer({ user }: { user: IProfileDto | undefined }) {
  return (
    <div className="flex gap-4 pt-4">
      <SocialLinks user={{ ...user, ...CONTACTS }} ariaLabel="Social links" />
      <Link href="/contact">
        <Mail className="w-5 h-5" />
      </Link>
      <Link href="/blog">
        <Badge variant="secondary">Read My Blogs</Badge>
      </Link>
    </div>
  );
}
