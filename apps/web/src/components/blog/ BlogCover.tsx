import Image from 'next/image';

export function BlogCover({
  title,
  coverImageUrl,
}: {
  title: string;
  coverImageUrl?: string | null;
}) {
  if (!coverImageUrl) return null;
  return (
    <div className="relative w-full aspect-[16/9] overflow-hidden rounded-xl">
      <Image
        src={coverImageUrl}
        alt={title}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 768px"
        priority
      />
    </div>
  );
}
