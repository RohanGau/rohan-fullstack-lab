'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Github, Linkedin, Sparkles, Mail } from 'lucide-react';
import Link from 'next/link';

const TOP_SKILLS = [
  'React',
  'Typescript',
  'Redux',
  'Node.js',
  'Docker',
];

const ALL_TECH = [
  'React',
  'Typescript',
  'Redux',
  'React Router',
  'Node.js',
  'Express',
  'Ant Design',
  'Material UI',
  'MongoDB',
  'Firebase',
  'Docker',
  'Webpack',
  'Babel',
  'Jest',
  'Playwright',
  'SonarQube',
  'ESLint',
  'Prettier',
];

// Your deep know-how sections (covering your architecture, dev patterns, and vertical skills)
const KNOWLEDGE_AREAS = [
  {
    title: 'Frontend Architecture',
    topics: [
      'Server-side rendering (SSR)', 'Client-side rendering (CSR)', 'Serverless', 'Edge computing', 'Server components',
    ]
  },
  {
    title: 'State Management',
    topics: [
      'Event sourcing', 'Flux architecture', 'Normalized state',
    ]
  },
  {
    title: 'Backend APIs',
    topics: [
      'RESTful', 'GraphQL', 'Pagination', 'Authentication', 'Authorization',
    ]
  },
  {
    title: 'Real-time Updates',
    topics: [
      'Short polling', 'Long polling', 'Server-sent events', 'WebSockets'
    ]
  },
  {
    title: 'Component/System APIs',
    topics: [
      'Theming config', 'Event handlers', 'Render props', 'Composition',
    ]
  },
  {
    title: 'Networking Techniques',
    topics: [
      'Batching', 'Retries (exp backoff + jitter)', 'Debouncing updates', 'Optimistic updates',
      'Timeouts', 'Out-of-order/race conditions', 'Offline usage', 'Caching/expiry',
    ]
  },
  {
    title: 'Performance',
    topics: [
      'Bundle/code splitting', 'Lazy loading', 'Preload/prefetch', 'List virtualization', 'Compression (code/media)',
      'Optimize loading sequences', 'Above-the-fold prioritization', 'Memoization', 'Reducing reflows/repaints',
      'Adaptive loading', 'Core web vitals',
    ]
  },
  {
    title: 'Images',
    topics: [
      'CDN', 'WebP/SVG', 'Priority/lazy loading', 'Responsive images', 'Alt text', 'Adaptive loading',
    ]
  },
  {
    title: 'Accessibility (a11y)',
    topics: [
      'Keyboard navigation', 'ARIA roles', 'Semantic HTML', 'Color contrast', 'Focus management',
    ]
  },
  {
    title: 'SEO',
    topics: [
      '<title>, <meta>', 'Sitemap', 'JSON-LD', 'Semantic markup', 'SSR/SSG',
    ]
  },
  {
    title: 'User Experience',
    topics: [
      'Loading/error/success/empty states', 'Error handling', 'Infinite scroll', 'Mobile-friendliness',
    ]
  },
  {
    title: 'Security',
    topics: [
      'HTTPS', 'XSS', 'CSRF', 'CORS', 'CSP',
    ]
  },
  {
    title: 'Common Patterns',
    topics: [
      'Infinite scrolling', 'Event sourcing', 'Reducer / Flux', 'Undo/redo', 'Streaming', 'Conflict resolution',
    ]
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* Hero Card */}
      <Card className="mb-10 shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <Sparkles className="text-primary w-6 h-6" />
            About Me
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Systems-focused full stack engineer architecting for scale, reliability, and real business impact.<br />
            <span className="text-muted-foreground font-medium">5+ years | Web, Mobile, Backend | Team Lead & Architect at PhonePe</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-8 text-base leading-relaxed space-y-2">
            <p>
              I specialize in building robust web platforms, scaling systems, and leading high-impact teams across both frontend and backend. From mobile with React Native to web with React, Node, and massive infra, I deliver seamless solutions for millions of users.
            </p>
          </div>

          {/* Top Skills */}
          <h2 className="font-semibold mb-2 text-lg">Top Skills</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {TOP_SKILLS.map(skill => (
              <Badge key={skill} variant="secondary">{skill}</Badge>
            ))}
          </div>

          {/* Extended Stack */}
          <details className="mb-6">
            <summary className="cursor-pointer text-sm mb-2 text-muted-foreground">View my full stack & dev tools</summary>
            <div className="flex flex-wrap gap-2 mt-2">
              {ALL_TECH.map(skill => (
                <Badge key={skill} variant="outline">{skill}</Badge>
              ))}
            </div>
          </details>

          <Separator className="my-8" />

          {/* Deep Knowledge/Architecture Areas */}
          <h2 className="font-semibold text-lg mb-4">What I Know & Deliver</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {KNOWLEDGE_AREAS.map(area => (
              <div key={area.title} className="mb-2">
                <div className="font-bold text-primary mb-1">{area.title}</div>
                <ul className="flex flex-wrap gap-1">
                  {area.topics.map(t => (
                    <li key={t}>
                      <Badge className="mb-1" variant="outline">{t}</Badge>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Separator className="my-8" />

          {/* Philosophy */}
          <blockquote className="border-l-4 pl-3 italic text-muted-foreground mb-8">
            I build digital products and architectures that are robust, scalable, secure, and genuinely delightful to use. Every stack, every pattern, every project is backed by deep engineering rigor and a passion for business impact.
          </blockquote>
          {/* <div className="bg-muted/30 rounded-md p-5 mt-8 mb-6 border-l-4 border-primary">
            <ul className="list-disc list-inside text-sm ml-2 mb-1">
              <li>
                I deliver products that are <span className="text-primary">robust, scalable, performant, accessible, and maintainable from day 1</span>.
              </li>
              <li>
                My stack includes not just React/Node, but the <span className="font-semibold">infrastructure, validation, testing, security, and performance discipline</span> that set apart top 1% engineers.
              </li>
              <li>
                Every technique above I’ve <span className="font-semibold">learned, shipped—sometimes debugged in production!</span>
              </li>
            </ul>
          </div> */}

          {/* Social Links */}
          <div className="flex gap-4 pt-4">
            <Link href="https://github.com/RohanGau" target="_blank"><Github className="w-5 h-5" /></Link>
            <Link href="https://linkedin.com/in/rohan-gautam" target="_blank"><Linkedin className="w-5 h-5" /></Link>
            <Link href="/contact"><Mail className="w-5 h-5" /></Link>
            <Link href="/blog"><Badge variant="secondary">Read My Blogs</Badge></Link>
          </div>
        </CardContent>
      </Card>
      {/* Example: Optionally add a hero/diagram image */}
      <div className="flex justify-center">
        <img
          src="/profile.jpg"
          alt="Profile diagram: Rohan's engineering toolkit"
          className="rounded-xl drop-shadow w-full max-w-md border"
          style={{objectFit: 'cover'}}
        />
      </div>
    </div>
  );
}
