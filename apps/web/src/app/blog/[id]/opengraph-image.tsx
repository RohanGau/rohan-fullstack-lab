import { ImageResponse } from 'next/og';
import { getBlogDetailCached } from '@/lib/server/blogApi';
import { BlogDetailPageProps } from '@/types/blog';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const revalidate = 300;

function truncate(s: string, max = 90) {
  if (!s) return '';
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}

export default async function OG(props: BlogDetailPageProps) {
  const { id } = await props.params;

  const raw = Array.isArray(id) ? id[0] : (id ?? '');
  const param = raw.trim();

  if (!param) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#0b0f1a',
            color: '#fff',
            fontSize: 56,
            padding: 80,
          }}
        >
          Rohan Kumar · Blog
        </div>
      ),
      { ...size }
    );
  }

  const blog = await getBlogDetailCached(param);

  const title = truncate(blog?.title || 'Rohan Kumar · Blog', 100);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 64,
          background: '#0b0f1a',
          color: '#e6edf3',
        }}
      >
        <div style={{ fontSize: 20, opacity: 0.8 }}>rohangautam.dev</div>

        <div style={{ fontSize: 64, lineHeight: 1.2, fontWeight: 700, letterSpacing: -0.5 }}>
          {title}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              background: '#4f46e5',
              boxShadow: '0 0 24px rgba(79,70,229,.7)',
            }}
          />
          <div style={{ fontSize: 28, opacity: 0.9 }}>
            {blog?.author ? `By ${blog.author}` : 'Rohan Kumar'}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
