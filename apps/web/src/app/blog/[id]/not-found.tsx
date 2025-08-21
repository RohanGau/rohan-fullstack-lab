import { BlogErrorMessage } from '@/components/blog/BlogErrorMessage';

export default function NotFound() {
  return <BlogErrorMessage message="Blog not found" onRetry={undefined} />;
}
