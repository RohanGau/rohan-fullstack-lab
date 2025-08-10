import Image from 'next/image';

export function Cover({ src, alt }: { src?: string; alt: string }) {
  if (!src) return null;
  return (
    <div className="relative w-full aspect-[16/9] overflow-hidden rounded-t-xl">
      <Image src={src} alt={alt} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
    </div>
  );
}