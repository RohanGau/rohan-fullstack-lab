import { Hero } from "./Hero";
import { useProfile } from "@/hooks/useProfile";
import Image from 'next/image';
import { Card, CardContent} from '@/components/ui/card';
import { SkillsSection } from "../custom/Skills";
import { Knowledge } from "./Knowledge";
import { Separator } from "../ui/separator";
import { Philosophy } from "./Philosophy";
// import { SocialLinks } from "../custom/SocialLinks";
import { SocialLinksContainer } from "./SocialLinks";
import { CONTACTS } from "@/lib/constant";
export default function AboutContent() {
  const { profile } = useProfile();
  const user = profile?.find((item) => item.id !== "688a63c9e76b322b8c0b5814") ?? null;
  if (!user) return null;

    return (
    <div className="max-w-4xl mx-auto px-4 py-16">
        <Card className="mb-10 shadow-lg">
            <Hero title="About Me" description={user.title} heading={user.name} />
            <CardContent>
                <div className="mb-8 text-base leading-relaxed space-y-2">
                    <p>
                        {user.bio}
                    </p>
                </div>
                <SkillsSection skills={user.skills} fullStack={user.allTechStack} />
                <Knowledge areas={user.architectureAreas} />
                <Separator className="my-8" />
                <Philosophy text={user.philosophy} impact={user.impact} />
                <SocialLinksContainer user={user} />
            </CardContent>
        </Card>
        <div className="flex justify-center">
            <Image
                src={user.avatarUrl ?? '/profile.jpg'}
                alt={user.name}
                width={250}
                height={250}
                className="rounded-xl drop-shadow w-full max-w-md border"
                style={{objectFit: 'cover'}}
                priority
            />
        </div>
    </div>
    );
}