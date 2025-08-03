import { Hero } from "./Hero";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent} from '@/components/ui/card';
import { SkillsSection } from "../custom/Skills";
import { Knowledge } from "./Knowledge";
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
            </CardContent>
        </Card>
        {/* <p className="text-base mb-6">{user.bio}</p>
        <Knowledge areas={KNOWLEDGE_AREAS} />
        <Philosophy text={user.philosophy} impact={user.impact} />
        <SocialLinks githubUrl={user.githubUrl} linkedinUrl={user.linkedinUrl} /> */}
    </div>
    );
}